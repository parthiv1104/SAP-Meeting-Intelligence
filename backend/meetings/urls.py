from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MeetingViewSet,
    live_teams_meetings,
    sync_teams_transcript,
    meeting_preparation_detail,
    upload_meeting_media,
    get_meeting_analysis,
    get_all_questions,
    get_knowledge_items,
    get_dashboard_summary
)

router = DefaultRouter()
router.register(r'', MeetingViewSet, basename='meetings')

urlpatterns = [
    path('live-teams/', live_teams_meetings, name='live_teams_meetings'),
    path('questions-library/', get_all_questions, name='get_all_questions'),
    path('knowledge-library/', get_knowledge_items, name='get_knowledge_items'),
    path('dashboard-summary/', get_dashboard_summary, name='get_dashboard_summary'),
    path('<path:meeting_id>/sync-teams-transcript/', sync_teams_transcript, name='sync_teams_transcript'),
    path('<path:meeting_id>/prep/', meeting_preparation_detail, name='meeting_preparation_detail'),
    path('<path:meeting_id>/preparation/', meeting_preparation_detail, name='meeting_preparation_detail_alias'),
    path('<path:meeting_id>/upload-media/', upload_meeting_media, name='upload_meeting_media'),
    path('<path:meeting_id>/analysis/', get_meeting_analysis, name='get_meeting_analysis'),
    path('', include(router.urls)),
]
