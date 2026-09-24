import uuid
from rest_framework import serializers
from .models import Project, ProjectDocument

class ProjectDocumentSerializer(serializers.ModelSerializer):
    projectId = serializers.CharField(source='project_id', read_only=True)
    fileUrl = serializers.FileField(source='file', read_only=True)
    fileType = serializers.CharField(source='file_type', read_only=True)
    fileSize = serializers.CharField(source='file_size', read_only=True)
    extractedText = serializers.CharField(source='extracted_text', read_only=True)
    uploadedAt = serializers.DateTimeField(source='uploaded_at', read_only=True)

    class Meta:
        model = ProjectDocument
        fields = [
            'id', 'project', 'projectId', 'file', 'fileUrl',
            'filename', 'fileType', 'fileSize', 'extractedText',
            'uploadedAt'
        ]


class ProjectSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False, default=lambda: f"proj-{uuid.uuid4().hex[:8]}")
    sapProduct = serializers.CharField(source='sap_product', required=False, allow_blank=True)
    implementationType = serializers.CharField(source='implementation_type', required=False, allow_blank=True)
    healthScore = serializers.IntegerField(source='health_score', required=False)
    knowledgeCoverage = serializers.IntegerField(source='knowledge_coverage', required=False)
    projectManager = serializers.CharField(source='project_manager', required=False, allow_blank=True)
    startDate = serializers.DateField(source='start_date', required=False, allow_null=True)
    endDate = serializers.DateField(source='end_date', required=False, allow_null=True)
    scopeDescription = serializers.CharField(source='scope_description', required=False, allow_blank=True)
    
    cumulativeRequirements = serializers.JSONField(source='cumulative_requirements', required=False)
    cumulativeDecisions = serializers.JSONField(source='cumulative_decisions', required=False)
    cumulativeRisks = serializers.JSONField(source='cumulative_risks', required=False)

    documents = ProjectDocumentSerializer(many=True, read_only=True)
    
    meetingsCount = serializers.SerializerMethodField()
    analyzedMeetingsCount = serializers.SerializerMethodField()
    openQuestions = serializers.SerializerMethodField()
    criticalQuestions = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'client', 'industry', 'sapProduct', 'sap_product',
            'implementationType', 'implementation_type',
            'modules', 'status', 'health', 'healthScore', 'health_score',
            'progress', 'knowledgeCoverage', 'knowledge_coverage',
            'projectManager', 'project_manager', 'startDate', 'start_date',
            'endDate', 'end_date', 'team', 'scopeDescription', 'scope_description',
            'cumulativeRequirements', 'cumulative_requirements',
            'cumulativeDecisions', 'cumulative_decisions',
            'cumulativeRisks', 'cumulative_risks',
            'documents', 'meetingsCount', 'analyzedMeetingsCount',
            'openQuestions', 'criticalQuestions', 'createdAt', 'updatedAt'
        ]

    def get_meetingsCount(self, obj):
        return obj.meetings.count()

    def get_analyzedMeetingsCount(self, obj):
        return obj.meetings.filter(analysis_status='Analyzed').count()

    def get_openQuestions(self, obj):
        # Calculate dynamically from meetings post-analysis & pre-prep
        count = 0
        for m in obj.meetings.all():
            if m.post_meeting_analysis and isinstance(m.post_meeting_analysis, dict):
                missed = m.post_meeting_analysis.get('missed_questions', [])
                count += len(missed)
            elif m.pre_meeting_preparation and isinstance(m.pre_meeting_preparation, dict):
                must_ask = m.pre_meeting_preparation.get('must_ask_questions', [])
                count += len(must_ask)
        return count

    def get_criticalQuestions(self, obj):
        count = 0
        for m in obj.meetings.all():
            if m.post_meeting_analysis and isinstance(m.post_meeting_analysis, dict):
                missed = m.post_meeting_analysis.get('missed_questions', [])
                count += sum(1 for q in missed if isinstance(q, dict) and (q.get('priority') == 'High' or q.get('importance') == 'Critical'))
        return count
