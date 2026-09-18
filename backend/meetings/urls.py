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
    get_dashboard_summary,
    meeting_documents_view,
    delete_meeting_document,
    get_all_documents,
    single_meeting_detail,
    get_platform_health_status
)

router = DefaultRouter()
router.register(r'', MeetingViewSet, basename='meetings')

urlpatterns = [
    path('health-check/', get_platform_health_status, name='platform_health_status'),
    path('all-documents/', get_all_documents, name='get_all_documents'),
    path('documents-library/', get_all_documents, name='get_all_documents_alias'),
    path('live-teams/', live_teams_meetings, name='live_teams_meetings'),
    path('questions-library/', get_all_questions, name='get_all_questions'),
    path('knowledge-library/', get_knowledge_items, name='get_knowledge_items'),
    path('dashboard-summary/', get_dashboard_summary, name='get_dashboard_summary'),
    path('<path:meeting_id>/sync-teams-transcript/', sync_teams_transcript, name='sync_teams_transcript'),
    path('<path:meeting_id>/prep/', meeting_preparation_detail, name='meeting_preparation_detail'),
    path('<path:meeting_id>/preparation/', meeting_preparation_detail, name='meeting_preparation_detail_alias'),
    path('<path:meeting_id>/documents/', meeting_documents_view, name='meeting_documents'),
    path('<path:meeting_id>/documents/<path:doc_id>/', delete_meeting_document, name='delete_meeting_document'),
    path('<path:meeting_id>/upload-media/', upload_meeting_media, name='upload_meeting_media'),
    path('<path:meeting_id>/analysis/', get_meeting_analysis, name='get_meeting_analysis'),
    path('<path:meeting_id>/', single_meeting_detail, name='single_meeting_detail'),
    path('', include(router.urls)),
]
