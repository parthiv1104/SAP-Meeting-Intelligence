from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    sapProduct = serializers.CharField(source='sap_product', required=False)
    implementationType = serializers.CharField(source='implementation_type', required=False)
    healthScore = serializers.IntegerField(source='health_score', required=False)
    knowledgeCoverage = serializers.IntegerField(source='knowledge_coverage', required=False)
    projectManager = serializers.CharField(source='project_manager', required=False)
    startDate = serializers.DateField(source='start_date', required=False, allow_null=True)
    endDate = serializers.DateField(source='end_date', required=False, allow_null=True)
    openQuestions = serializers.IntegerField(source='open_questions', required=False)
    criticalQuestions = serializers.IntegerField(source='critical_questions', required=False)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'client', 'industry', 'sapProduct', 'implementationType',
            'modules', 'status', 'health', 'healthScore', 'progress',
            'knowledgeCoverage', 'projectManager', 'startDate', 'endDate',
            'openQuestions', 'criticalQuestions', 'team'
        ]
