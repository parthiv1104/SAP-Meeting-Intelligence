import uuid
from django.db import models
from projects.models import Project

class Meeting(models.Model):
    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    # Primary key - supports custom string IDs (e.g. 'mtg-005-abc-proc') or auto-generated UUIDs
    id = models.CharField(max_length=100, primary_key=True, default=uuid.uuid4, editable=True)
    name = models.CharField(max_length=255, default='SAP Meeting')
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True, related_name='meetings')
    
    # Teams Integration & User Ownership Reference
    user_email = models.CharField(max_length=255, blank=True, default='', db_index=True)
    teams_meeting_id = models.CharField(max_length=500, blank=True, default='', db_index=True)
    join_url = models.URLField(max_length=1000, blank=True, default='')
    organizer = models.CharField(max_length=255, blank=True, default='')
    
    # Scheduling & Timing
    date = models.CharField(max_length=50, blank=True, default='')
    time = models.CharField(max_length=50, blank=True, default='')
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    participants = models.IntegerField(default=1)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Scheduled')
    
    # Context & Industry Fields
    module = models.CharField(max_length=50, default='MM')
    topic = models.CharField(max_length=255, default='SAP Requirement Workshop')
    industry = models.CharField(max_length=100, default='Manufacturing')
    
    # AI Readiness & Processing Status
    preparation_score = models.IntegerField(default=85)
    analysis_status = models.CharField(max_length=50, default='Pending') # Pending | Analyzed
    
    # Transcripts & AI Generated Intelligence
    transcript = models.TextField(blank=True, default='')
    pre_meeting_preparation = models.JSONField(default=dict, blank=True)
    post_meeting_analysis = models.JSONField(default=dict, blank=True)
    
    # Media upload tracking (Recordings / Transcripts)
    media_file = models.FileField(upload_to='meetings_media/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.module} - {self.status})"

    @property
    def title(self):
        return self.name

    @title.setter
    def title(self, value):
        self.name = value
