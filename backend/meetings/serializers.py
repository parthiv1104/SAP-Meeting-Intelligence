from rest_framework import serializers
from .models import Meeting, MeetingDocument

class MeetingDocumentSerializer(serializers.ModelSerializer):
    meetingId = serializers.CharField(source='meeting_id', read_only=True)
    fileUrl = serializers.FileField(source='file', read_only=True)
    fileType = serializers.CharField(source='file_type', read_only=True)
    fileSize = serializers.CharField(source='file_size', read_only=True)
    uploadedAt = serializers.DateTimeField(source='uploaded_at', read_only=True)

    extractedText = serializers.CharField(source='extracted_text', read_only=True)

    class Meta:
        model = MeetingDocument
        fields = [
            'id', 'meeting', 'meetingId', 'file', 'fileUrl',
            'filename', 'fileType', 'file_type', 'fileSize', 'file_size',
            'extracted_text', 'extractedText', 'uploadedAt', 'uploaded_at'
        ]

class MeetingSerializer(serializers.ModelSerializer):
    projectId = serializers.CharField(source='project_id', required=False, allow_null=True)
    projectName = serializers.SerializerMethodField()
    projectClient = serializers.SerializerMethodField()
    preparationScore = serializers.IntegerField(source='preparation_score', required=False)
    analysisStatus = serializers.CharField(source='analysis_status', required=False)
    joinUrl = serializers.CharField(source='join_url', required=False, allow_blank=True)
    teamsMeetingId = serializers.CharField(source='teams_meeting_id', required=False, allow_blank=True)
    preMeetingPreparation = serializers.JSONField(source='pre_meeting_preparation', required=False)
    postMeetingAnalysis = serializers.JSONField(source='post_meeting_analysis', required=False)
    userEmail = serializers.CharField(source='user_email', required=False, allow_blank=True)
    erpSystem = serializers.CharField(source='erp_system', required=False, allow_blank=True)

    class Meta:
        model = Meeting
        fields = [
            'id', 'name', 'project', 'projectId', 'projectName', 'projectClient',
            'module', 'topic', 'erp_system', 'erpSystem',
            'user_email', 'userEmail',
            'date', 'time', 'start_time', 'end_time', 'participants',
            'status', 'organizer', 'join_url', 'joinUrl', 'teams_meeting_id', 'teamsMeetingId',
            'industry', 'preparation_score', 'preparationScore',
            'analysis_status', 'analysisStatus', 'transcript',
            'pre_meeting_preparation', 'preMeetingPreparation',
            'post_meeting_analysis', 'postMeetingAnalysis',
            'media_file', 'created_at', 'updated_at'
        ]

    def get_projectName(self, obj):
        return obj.project.name if obj.project else ''

    def get_projectClient(self, obj):
        return obj.project.client if obj.project else ''

