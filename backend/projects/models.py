import uuid
from django.db import models

class Project(models.Model):
    STATUS_CHOICES = [
        ('Planning', 'Planning'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('On Hold', 'On Hold'),
    ]

    HEALTH_CHOICES = [
        ('On Track', 'On Track'),
        ('At Risk', 'At Risk'),
        ('Critical', 'Critical'),
    ]

    id = models.CharField(max_length=150, primary_key=True, default=uuid.uuid4, editable=True)
    name = models.CharField(max_length=255)
    client = models.CharField(max_length=255)
    industry = models.CharField(max_length=150, default='Manufacturing')
    sap_product = models.CharField(max_length=200, default='SAP S/4HANA (Private / On-Premise)')
    implementation_type = models.CharField(max_length=100, default='Greenfield')
    modules = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='In Progress')
    health = models.CharField(max_length=50, choices=HEALTH_CHOICES, default='On Track')
    health_score = models.IntegerField(default=90)
    progress = models.IntegerField(default=0)
    knowledge_coverage = models.IntegerField(default=0)
    project_manager = models.CharField(max_length=150, blank=True, default='')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    # Team members: list of objects: [{"name": "...", "role": "MM Lead", "email": "...", "avatar": "..."}]
    team = models.JSONField(default=list, blank=True)
    scope_description = models.TextField(blank=True, default='')

    # Cross-Meeting Cumulative Institutional Repositories
    cumulative_requirements = models.JSONField(default=list, blank=True)
    cumulative_decisions = models.JSONField(default=list, blank=True)
    cumulative_risks = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.client})"


class ProjectDocument(models.Model):
    """
    Project-level shared blueprint, BRD, RFP, or architecture specification documents.
    Automatically augments all meeting intelligence sessions under this project.
    """
    id = models.CharField(max_length=150, primary_key=True, default=uuid.uuid4, editable=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='project_docs/')
    filename = models.CharField(max_length=500)
    file_type = models.CharField(max_length=100, blank=True, default='')
    file_size = models.CharField(max_length=100, blank=True, default='')
    extracted_text = models.TextField(blank=True, default='')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.filename} ({self.project_id})"

