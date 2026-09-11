import os
import msal
import requests
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

CLIENT_ID = os.getenv('MS_CLIENT_ID', '').strip()
CLIENT_SECRET = os.getenv('MS_CLIENT_SECRET', '').strip()
TENANT_ID = os.getenv('MS_TENANT_ID', '').strip()
AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
# Application permissions use Microsoft Graph default scope
SCOPES = ["https://graph.microsoft.com/.default"]

def get_msal_app():
    if not CLIENT_ID or not CLIENT_SECRET or not TENANT_ID:
        return None
    return msal.ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET
    )

def get_app_access_token():
    """Acquires token using approved Application permissions (Client Credentials)."""
    app = get_msal_app()
    if not app:
        return None
    result = app.acquire_token_for_client(scopes=SCOPES)
    if "access_token" in result:
        return result["access_token"]
    print("[MSAL Error]:", result.get("error_description", result))
    return None

def fetch_teams_meetings(user_email=None):
    """
    Pathway 1: Live Calendar Sync
    Fetches real Teams meetings directly from Microsoft Graph API with dynamic status.
    """
    token = get_app_access_token()
    if not token:
        print("[MS Teams Sync]: No access token available or credentials not configured.")
        return []

    headers = {'Authorization': f'Bearer {token}'}
    email = user_email or os.getenv('MS_USER_EMAIL', 'parthiv.dudhrejiya@vc-erp.com')
    
    url = f"https://graph.microsoft.com/v1.0/users/{email}/calendar/events?$select=id,subject,start,end,attendees,isOnlineMeeting,onlineMeeting,isCancelled,organizer&$orderby=start/dateTime desc&$top=50"
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            events = response.json().get('value', [])
            meetings = []
            now = datetime.now(timezone.utc)
            
            for e in events:
                online_meeting = e.get('onlineMeeting') or {}
                join_url = online_meeting.get('joinUrl') or e.get('onlineMeetingUrl') or ''
                subject = e.get('subject') or 'SAP Meeting Session'
                
                # Parse start and end timestamps
                start_obj = e.get('start') or {}
                end_obj = e.get('end') or {}
                start_str = start_obj.get('dateTime', '')
                end_str = end_obj.get('dateTime', '')
                
                # Dynamic Status Calculation
                is_cancelled = e.get('isCancelled', False) or subject.lower().startswith('canceled:') or subject.lower().startswith('cancelled:')
                
                if is_cancelled:
                    status = 'Cancelled'
                elif end_str:
                    try:
                        end_dt = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
                        start_dt = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
                        
                        if end_dt.tzinfo is None:
                            end_dt = end_dt.replace(tzinfo=timezone.utc)
                        if start_dt.tzinfo is None:
                            start_dt = start_dt.replace(tzinfo=timezone.utc)

                        if now > end_dt:
                            status = 'Completed'
                        elif start_dt <= now <= end_dt:
                            status = 'In Progress'
                        else:
                            status = 'Scheduled'
                    except Exception:
                        status = 'Completed' if start_str[:10] < now.strftime('%Y-%m-%d') else 'Scheduled'
                else:
                    status = 'Scheduled'

                # Infer SAP module from subject if available
                subject_upper = subject.upper()
                module = 'Cross-Module'
                for mod in ['MM', 'FI', 'CO', 'SD', 'PP', 'QM', 'PM', 'EWM', 'HCM', 'PS']:
                    if f" {mod} " in f" {subject_upper} " or f"({mod})" in subject_upper or f"[{mod}]" in subject_upper or f"/{mod}" in subject_upper or f"-{mod}" in subject_upper:
                        module = mod
                        break

                organizer_data = (e.get('organizer') or {}).get('emailAddress') or {}
                organizer_name = organizer_data.get('name') or organizer_data.get('address') or ''

                meetings.append({
                    'id': e.get('id', ''),
                    'name': subject,
                    'title': subject,
                    'date': start_str[:10] if start_str else '',
                    'time': start_str[11:16] if len(start_str) >= 16 else '',
                    'start_time': start_str,
                    'end_time': end_str,
                    'joinUrl': join_url,
                    'join_url': join_url,
                    'participants': len(e.get('attendees') or []),
                    'status': status,
                    'topic': subject,
                    'module': module,
                    'organizer': organizer_name,
                    'preparationScore': 88,
                    'analysisStatus': 'Analyzed' if status == 'Completed' else 'Pending',
                })
            return meetings
        else:
            print("[MS Teams Graph API Error]:", response.status_code, response.text)
            return []
    except Exception as exc:
        print("[MS Teams Fetch Exception]:", exc)
        return []

def fetch_teams_meeting_transcript(join_url=None, user_email=None):
    """
    Attempts to fetch recording transcript for a completed Teams online meeting via Graph API.
    """
    token = get_app_access_token()
    if not token or not join_url:
        return None

    headers = {'Authorization': f'Bearer {token}'}
    email = user_email or os.getenv('MS_USER_EMAIL', 'parthiv.dudhrejiya@vc-erp.com')

    try:
        # 1. Lookup online meeting by JoinWebUrl
        lookup_url = f"https://graph.microsoft.com/v1.0/users/{email}/onlineMeetings?$filter=JoinWebUrl eq '{join_url}'"
        res = requests.get(lookup_url, headers=headers, timeout=10)
        if res.status_code == 200:
            online_meetings = res.json().get('value', [])
            if online_meetings:
                meeting_id = online_meetings[0].get('id')
                
                # 2. Get transcripts for this online meeting
                transcripts_url = f"https://graph.microsoft.com/v1.0/users/{email}/onlineMeetings/{meeting_id}/transcripts"
                t_res = requests.get(transcripts_url, headers=headers, timeout=10)
                if t_res.status_code == 200:
                    transcripts = t_res.json().get('value', [])
                    if transcripts:
                        t_id = transcripts[0].get('id')
                        
                        # 3. Get transcript content in text/vtt format
                        content_url = f"https://graph.microsoft.com/v1.0/users/{email}/onlineMeetings/{meeting_id}/transcripts/{t_id}/content?$format=text/vtt"
                        c_res = requests.get(content_url, headers=headers, timeout=10)
                        if c_res.status_code == 200:
                            return c_res.text
    except Exception as exc:
        print("[MS Teams Transcript Fetch Error]:", exc)
    return None

# Alias for backwards compatibility
get_live_teams_meetings = fetch_teams_meetings
