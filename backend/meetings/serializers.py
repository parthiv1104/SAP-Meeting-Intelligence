from rest_framework import serializers
from .models import Meeting

class MeetingSerializer(serializers.ModelSerializer):
    projectId = serializers.CharField(source='project_id', required=False, allow_null=True)
    preparationScore = serializers.IntegerField(source='preparation_score', required=False)
    analysisStatus = serializers.CharField(source='analysis_status', required=False)
    joinUrl = serializers.CharField(source='join_url', required=False, allow_blank=True)
    teamsMeetingId = serializers.CharField(source='teams_meeting_id', required=False, allow_blank=True)
    preMeetingPreparation = serializers.JSONField(source='pre_meeting_preparation', required=False)
    postMeetingAnalysis = serializers.JSONField(source='post_meeting_analysis', required=False)

    class Meta:
        model = Meeting
        fields = [
            'id', 'name', 'project', 'projectId', 'module', 'topic',
            'date', 'time', 'start_time', 'end_time', 'participants',
            'status', 'organizer', 'join_url', 'joinUrl', 'teams_meeting_id', 'teamsMeetingId',
            'industry', 'preparation_score', 'preparationScore',
            'analysis_status', 'analysisStatus', 'transcript',
            'pre_meeting_preparation', 'preMeetingPreparation',
            'post_meeting_analysis', 'postMeetingAnalysis',
            'media_file', 'created_at', 'updated_at'
        ]
