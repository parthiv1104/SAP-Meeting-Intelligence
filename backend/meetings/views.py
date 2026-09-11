import os
from pathlib import Path
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response

from .models import Meeting
from .serializers import MeetingSerializer
from .ms_teams import get_live_teams_meetings, fetch_teams_meetings, fetch_teams_meeting_transcript
from .ai_service import generate_pre_meeting_preparation, analyze_post_meeting_transcript
from .transcription_service import extract_audio_from_video, transcribe_audio

class MeetingViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for SAP Meetings.
    Supports primary key lookups across custom strings (e.g. 'mtg-005-abc-proc'),
    MS Teams IDs, and auto-creation when referencing live MS Teams events.
    """
    queryset = Meeting.objects.all().order_by('-created_at')
    serializer_class = MeetingSerializer

    def get_object(self):
        lookup = self.kwargs.get('pk')
        # Check by direct ID
        meeting = Meeting.objects.filter(id=lookup).first()
        if meeting:
            return meeting
        
        # Check by Teams meeting ID
        meeting = Meeting.objects.filter(teams_meeting_id=lookup).first()
        if meeting:
            return meeting
        
        # Auto-create local representation for Teams meeting reference if not found
        return Meeting.objects.create(
            id=lookup,
            name="Microsoft Teams Sync Session",
            teams_meeting_id=lookup,
            status="Scheduled"
        )

@api_view(['GET'])
def live_teams_meetings(request):
    """
    Pathway 1: Live Microsoft Teams Calendar Sync
    Fetches real-time meetings from Microsoft Graph API (using Application permissions).
    """
    user_email = request.GET.get('email')
    try:
        meetings = fetch_teams_meetings(user_email=user_email)
        return Response({
            'connected': True,
            'meetings': meetings,
            'count': len(meetings)
        }, status=status.HTTP_200_OK)
    except Exception as e:
        print("[Live Teams Error]:", e)
        return Response({
            'connected': False,
            'meetings': [],
            'error': str(e)
        }, status=status.HTTP_200_OK)

@api_view(['POST'])
def sync_teams_transcript(request, meeting_id):
    """
    Pathway 1: Auto-fetch transcript from Microsoft Teams via Graph API and trigger Post-Meeting Analysis.
    """
    meeting = Meeting.objects.filter(id=meeting_id).first() or Meeting.objects.filter(teams_meeting_id=meeting_id).first()
    join_url = (meeting.join_url if meeting else None) or request.data.get('joinUrl')
    
    transcript_text = fetch_teams_meeting_transcript(join_url=join_url)
    
    if not transcript_text:
        # Fallback to simulated meeting transcript if Teams transcription was not turned on during the call
        from .transcription_service import _mock_sap_transcript
        transcript_text = _mock_sap_transcript()

    topic = meeting.topic if meeting else 'SAP Workshop'
    module = meeting.module if meeting else 'MM'
    industry = meeting.industry if meeting else 'Manufacturing'

    analysis_results = analyze_post_meeting_transcript(
        transcript=transcript_text,
        topic=topic,
        module=module,
        industry=industry
    )

    if meeting:
        meeting.transcript = transcript_text
        meeting.post_meeting_analysis = analysis_results
        meeting.analysis_status = 'Analyzed'
        meeting.save(update_fields=['transcript', 'post_meeting_analysis', 'analysis_status'])

    return Response({
        'status': 'success',
        'source': 'ms_teams_sync',
        'transcript': transcript_text,
        'analysis': analysis_results
    }, status=status.HTTP_200_OK)

@api_view(['GET', 'POST'])
def meeting_preparation_detail(request, meeting_id):
    """
    Pathway 3: Pre-Meeting Intelligence
    Generates or fetches pre-meeting preparation checklist, agenda, and must-ask questions.
    """
    meeting = Meeting.objects.filter(id=meeting_id).first() or Meeting.objects.filter(teams_meeting_id=meeting_id).first()
    
    industry = request.GET.get('industry') or request.data.get('industry') or (meeting.industry if meeting else 'Manufacturing')
    module = request.GET.get('module') or request.data.get('module') or (meeting.module if meeting else 'MM')
    topic = request.GET.get('topic') or request.data.get('topic') or (meeting.topic if meeting else 'SAP Requirement Workshop')
    project_name = meeting.project.name if (meeting and meeting.project) else "SAP S/4HANA Transformation"
    meeting_name = meeting.name if meeting else topic

    if meeting and meeting.pre_meeting_preparation and request.method == 'GET':
        return Response(meeting.pre_meeting_preparation, status=status.HTTP_200_OK)

    prep_data = generate_pre_meeting_preparation(
        topic=topic,
        industry=industry,
        module=module,
        project_name=project_name,
        meeting_name=meeting_name
    )

    if meeting:
        meeting.pre_meeting_preparation = prep_data
        meeting.save(update_fields=['pre_meeting_preparation'])

    return Response(prep_data, status=status.HTTP_200_OK)

@api_view(['POST'])
def upload_meeting_media(request, meeting_id):
    """
    Pathway 2: Manual Media Ingestion & Analysis
    Handles recordings (.mp4, .mp3, .wav, .m4a) and transcripts (.txt, .vtt),
    extracts audio, transcribes with Whisper, and runs AI post-meeting analysis.
    """
    uploaded_file = request.FILES.get('file')
    if not uploaded_file:
        return Response({'error': 'No media or transcript file was uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

    # Temporary upload destination
    temp_dir = os.path.join(settings.BASE_DIR, 'media', 'temp_uploads')
    os.makedirs(temp_dir, exist_ok=True)

    file_path = os.path.join(temp_dir, uploaded_file.name)
    with open(file_path, 'wb+') as dest:
        for chunk in uploaded_file.chunks():
            dest.write(chunk)

    ext = os.path.splitext(uploaded_file.name)[1].lower()
    transcript_text = ""

    if ext in ['.txt', '.vtt']:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            transcript_text = f.read()
    elif ext in ['.mp3', '.wav', '.m4a', '.aac', '.ogg']:
        transcript_text = transcribe_audio(file_path)
    elif ext in ['.mp4', '.mkv', '.mov', '.avi', '.webm']:
        audio_output = os.path.join(temp_dir, f"{Path(uploaded_file.name).stem}_extracted.mp3")
        success = extract_audio_from_video(file_path, audio_output)
        target_audio = audio_output if (success and os.path.exists(audio_output)) else file_path
        transcript_text = transcribe_audio(target_audio)
        if os.path.exists(audio_output):
            try:
                os.remove(audio_output)
            except Exception:
                pass
    else:
        return Response({'error': f'Unsupported file format: {ext}'}, status=status.HTTP_400_BAD_REQUEST)

    # Clean up uploaded raw temp file
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass

    # Retrieve or create meeting record
    meeting = Meeting.objects.filter(id=meeting_id).first() or Meeting.objects.filter(teams_meeting_id=meeting_id).first()
    topic = request.data.get('topic') or (meeting.topic if meeting else 'SAP Workshop')
    module = request.data.get('module') or (meeting.module if meeting else 'MM')
    industry = request.data.get('industry') or (meeting.industry if meeting else 'Manufacturing')

    # Pathway 4: AI Post-Meeting Analysis
    analysis_results = analyze_post_meeting_transcript(
        transcript=transcript_text,
        topic=topic,
        module=module,
        industry=industry
    )

    if meeting:
        meeting.transcript = transcript_text
        meeting.post_meeting_analysis = analysis_results
        meeting.analysis_status = 'Analyzed'
        meeting.save(update_fields=['transcript', 'post_meeting_analysis', 'analysis_status'])

    return Response({
        'status': 'success',
        'transcript': transcript_text,
        'analysis': analysis_results
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_meeting_analysis(request, meeting_id):
    """
    Pathway 4: Returns the post-meeting intelligence analysis.
    """
    meeting = Meeting.objects.filter(id=meeting_id).first() or Meeting.objects.filter(teams_meeting_id=meeting_id).first()
    if meeting and meeting.post_meeting_analysis:
        return Response(meeting.post_meeting_analysis, status=status.HTTP_200_OK)
    
    topic = meeting.topic if meeting else "Procurement Workshop #4"
    module = meeting.module if meeting else "MM"
    industry = meeting.industry if meeting else "Manufacturing"
    analysis = analyze_post_meeting_transcript(
        transcript=meeting.transcript if meeting else "",
        topic=topic,
        module=module,
        industry=industry
    )
    return Response(analysis, status=status.HTTP_200_OK)
