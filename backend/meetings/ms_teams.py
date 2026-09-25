import os
import msal
import requests
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
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
USER_SCOPES = [
    "https://graph.microsoft.com/User.Read",
    "https://graph.microsoft.com/Calendars.Read",
    "https://graph.microsoft.com/OnlineMeetings.Read",
]


LOCAL_TZ = ZoneInfo("Asia/Kolkata")
TIMEZONE_PREFERENCE = os.getenv('MS_TIMEZONE', 'India Standard Time')

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

def get_user_auth_url(redirect_uri):
    """
    Generates the Microsoft OAuth 2.0 Login URL triggering fresh Microsoft Authenticator approval.
    """
    app = get_msal_app()
    if not app:
        return None
    return app.get_authorization_request_url(
        scopes=USER_SCOPES,
        redirect_uri=redirect_uri,
        prompt="login"
    )


def acquire_tokens_from_code(code, redirect_uri):
    """
    Exchanges Microsoft OAuth authorization code for delegated access & refresh tokens.
    """
    app = get_msal_app()
    if not app or not code:
        return None
    result = app.acquire_token_by_authorization_code(
        code=code,
        scopes=USER_SCOPES,
        redirect_uri=redirect_uri
    )
    if "access_token" in result:
        access_token = result["access_token"]
        refresh_token = result.get("refresh_token", "")
        expires_in = result.get("expires_in", 3600)
        
        # Fetch authenticated user profile from Graph /me
        user_info = {}
        try:
            me_res = requests.get(
                "https://graph.microsoft.com/v1.0/me",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=8
            )
            if me_res.status_code == 200:
                user_info = me_res.json()
        except Exception:
            pass

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": expires_in,
            "email": user_info.get("mail") or user_info.get("userPrincipalName") or "",
            "name": user_info.get("displayName") or "",
        }
    print("[MSAL Token Exchange Error]:", result.get("error_description", result))
    return None

def fetch_user_delegated_teams_meetings(access_token):
    """
    Fetches real Teams calendar events using the user's delegated access token.
    Enforces user isolation & Microsoft Authenticator verified sessions.
    """
    if not access_token:
        return []
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Prefer': f'outlook.timezone="{TIMEZONE_PREFERENCE}"'
    }
    url = "https://graph.microsoft.com/v1.0/me/calendar/events?$select=id,subject,start,end,attendees,isOnlineMeeting,onlineMeeting,isCancelled,organizer&$orderby=start/dateTime desc&$top=50"
    try:
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code == 200:
            events = res.json().get('value', [])
            return [parse_graph_event(e) for e in events]
        else:
            print("[Delegated Graph Error]:", res.status_code, res.text)
            return []
    except Exception as exc:
        print("[Delegated Graph Exception]:", exc)
        return []


def parse_graph_event(e):
    online_meeting = e.get('onlineMeeting') or {}
    join_url = online_meeting.get('joinUrl') or e.get('onlineMeetingUrl') or ''
    subject = e.get('subject') or 'SAP Meeting Session'
    
    # Parse start and end timestamps in local timezone
    start_obj = e.get('start') or {}
    end_obj = e.get('end') or {}
    start_str = start_obj.get('dateTime', '')
    end_str = end_obj.get('dateTime', '')
    start_tz_name = (start_obj.get('timeZone') or 'UTC').lower()
    end_tz_name = (end_obj.get('timeZone') or 'UTC').lower()
    
    now_local = datetime.now(LOCAL_TZ)
    date_display = ''
    time_display = ''
    start_dt = None
    end_dt = None

    if start_str:
        try:
            clean_start = start_str.split('.')[0].replace('Z', '')
            if start_tz_name in ['utc', 'coordinated universal time']:
                raw_dt = datetime.fromisoformat(clean_start).replace(tzinfo=timezone.utc)
                start_dt = raw_dt.astimezone(LOCAL_TZ)
            else:
                naive_dt = datetime.fromisoformat(clean_start)
                start_dt = naive_dt.replace(tzinfo=LOCAL_TZ)
            
            date_display = start_dt.strftime('%Y-%m-%d')
            time_display = start_dt.strftime('%H:%M') # e.g. "10:30"
        except Exception:
            date_display = start_str[:10]
            time_display = start_str[11:16]

    if end_str:
        try:
            clean_end = end_str.split('.')[0].replace('Z', '')
            if end_tz_name in ['utc', 'coordinated universal time']:
                raw_end = datetime.fromisoformat(clean_end).replace(tzinfo=timezone.utc)
                end_dt = raw_end.astimezone(LOCAL_TZ)
            else:
                naive_end = datetime.fromisoformat(clean_end)
                end_dt = naive_end.replace(tzinfo=LOCAL_TZ)
        except Exception:
            pass

    # Dynamic Status Calculation based on local time
    is_cancelled = e.get('isCancelled', False) or subject.lower().startswith('canceled:') or subject.lower().startswith('cancelled:')
    
    if is_cancelled:
        status = 'Cancelled'
    elif start_dt and end_dt:
        if now_local > end_dt:
            status = 'Completed'
        elif start_dt <= now_local <= end_dt:
            status = 'In Progress'
        else:
            status = 'Scheduled'
    elif start_dt:
        if now_local > start_dt:
            status = 'Completed'
        else:
            status = 'Scheduled'
    else:
        status = 'Scheduled'

    # Dynamic Domain / Module Inference
    subject_upper = subject.upper()
    module = None

    for mod in ['MM', 'FI', 'CO', 'SD', 'PP', 'QM', 'PM', 'EWM', 'HCM', 'PS', 'FICO', 'ABAP']:
        if f" {mod} " in f" {subject_upper} " or f"({mod})" in subject_upper or f"[{mod}]" in subject_upper or f"/{mod}" in subject_upper or f"-{mod}" in subject_upper or subject_upper.startswith(f"{mod} "):
            module = f"SAP {mod}"
            break

    if not module:
        if 'BTP' in subject_upper:
            module = 'SAP BTP'
        elif 'B1' in subject_upper or 'BUSINESS ONE' in subject_upper:
            module = 'SAP B1'
        elif 'PROCUREMENT' in subject_upper or 'COSTING' in subject_upper:
            module = 'SAP MM / Costing'
        elif 'S/4HANA' in subject_upper or 'S4HANA' in subject_upper:
            module = 'SAP S/4HANA'
        elif any(k in subject_upper for k in ['AI', 'INTELLIGENCE', 'LLM', 'GPT', 'ML', 'MACHINE LEARNING', 'MODEL', 'NLP', 'VISION']):
            module = 'Artificial Intelligence'
        elif any(k in subject_upper for k in ['COMPLIANCE', 'EY', 'AUDIT', 'GOVERNANCE', 'LEGAL', 'TAX']):
            module = 'Compliance & Tech'
        elif any(k in subject_upper for k in ['VIBE CODING', 'CODING', 'DEV', 'ENGINEERING', 'SOFTWARE', 'APP', 'PLATFORM']):
            module = 'Software Dev'
        elif any(k in subject_upper for k in ['CERTIFICATION', 'ENABLEMENT', 'TRAINING', 'DRIVE']):
            module = 'Enablement'
        elif any(k in subject_upper for k in ['DEMO', 'SOLUTIONS']):
            module = 'Solutions Demo'
        elif 'SAP' in subject_upper:
            module = 'SAP Enterprise'
        else:
            module = 'Strategy & Operations'

    # Infer Industry if available in subject
    industry = 'Technology' if module in ['Artificial Intelligence', 'Software Dev', 'Compliance & Tech'] else 'Manufacturing'
    for ind in ['Pharma', 'Pharmaceutical', 'Retail', 'Automotive', 'Logistics', 'Energy', 'Chemical', 'Healthcare']:
        if ind.lower() in subject.lower():
            industry = ind.capitalize()
            break

    organizer_data = (e.get('organizer') or {}).get('emailAddress') or {}
    organizer_name = organizer_data.get('name') or organizer_data.get('address') or ''
    attendees_list = [(a.get('emailAddress') or {}).get('name') or (a.get('emailAddress') or {}).get('address') for a in (e.get('attendees') or [])]

    return {
        'id': e.get('id', ''),
        'name': subject,
        'title': subject,
        'date': date_display or (start_str[:10] if start_str else ''),
        'time': time_display or (start_str[11:16] if len(start_str) >= 16 else ''),
        'start_time': start_str,
        'end_time': end_str,
        'joinUrl': join_url,
        'join_url': join_url,
        'participants': len(e.get('attendees') or []),
        'attendees': attendees_list,
        'status': status,
        'topic': subject,
        'module': module,
        'industry': industry,
        'organizer': organizer_name,
        'preparationScore': 88,
        'analysisStatus': 'Analyzed' if status == 'Completed' else 'Pending',
    }

def fetch_teams_meetings(user_email=None):
    """
    Pathway 1: Live Calendar Sync
    Fetches real Teams meetings directly from Microsoft Graph API with dynamic status.
    """
    token = get_app_access_token()
    if not token:
        print("[MS Teams Sync]: No access token available or credentials not configured.")
        return []

    headers = {
        'Authorization': f'Bearer {token}',
        'Prefer': f'outlook.timezone="{TIMEZONE_PREFERENCE}"'
    }
    email = user_email or os.getenv('MS_USER_EMAIL')
    
    url = f"https://graph.microsoft.com/v1.0/users/{email}/calendar/events?$select=id,subject,start,end,attendees,isOnlineMeeting,onlineMeeting,isCancelled,organizer&$orderby=start/dateTime desc&$top=50"
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            events = response.json().get('value', [])
            return [parse_graph_event(e) for e in events]
        else:
            print("[MS Teams Graph API Error]:", response.status_code, response.text)
            return []
    except Exception as exc:
        print("[MS Teams Fetch Exception]:", exc)
        return []

def fetch_single_teams_meeting(event_id, user_email=None):
    """
    Fetches details for a single calendar event by its Microsoft Graph event ID.
    """
    token = get_app_access_token()
    if not token or not event_id:
        return None

    headers = {
        'Authorization': f'Bearer {token}',
        'Prefer': f'outlook.timezone="{TIMEZONE_PREFERENCE}"'
    }
    email = user_email or os.getenv('MS_USER_EMAIL')
    url = f"https://graph.microsoft.com/v1.0/users/{email}/calendar/events/{event_id}"

    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            return parse_graph_event(response.json())
    except Exception as exc:
        print(f"[MS Teams Fetch Single Event Error]: {exc}")
    return None

def fetch_teams_meeting_transcript(join_url=None, user_email=None):
    """
    Attempts to fetch recording transcript for a completed Teams online meeting via Graph API.
    """
    token = get_app_access_token()
    if not token or not join_url:
        return None

    headers = {'Authorization': f'Bearer {token}'}
    email = user_email or os.getenv('MS_USER_EMAIL')

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
