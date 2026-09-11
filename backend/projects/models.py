from django.db import models

class Project(models.Model):
    id = models.CharField(max_length=100, primary_key=True) # e.g. 'proj-abc-mfg'
    name = models.CharField(max_length=255)
    client = models.CharField(max_length=255)
    industry = models.CharField(max_length=100, default='Manufacturing')
    sap_product = models.CharField(max_length=100, default='SAP S/4HANA')
    implementation_type = models.CharField(max_length=100, default='Greenfield')
    modules = models.JSONField(default=list)
    status = models.CharField(max_length=50, default='In Progress')
    health = models.CharField(max_length=50, default='On Track')
    health_score = models.IntegerField(default=80)
    progress = models.IntegerField(default=0)
    knowledge_coverage = models.IntegerField(default=0)
    project_manager = models.CharField(max_length=100, blank=True, default='')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    open_questions = models.IntegerField(default=0)
    critical_questions = models.IntegerField(default=0)
    team = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.id})"
