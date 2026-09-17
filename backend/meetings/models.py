import uuid
from django.db import models
from django.contrib.auth.models import User
from projects.models import Project

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=150, default='Lead Solution Architect')
    organization = models.CharField(max_length=200, default='VC ERP Consulting Group')
    phone = models.CharField(max_length=50, blank=True, default='')

    def __str__(self):
        return f"{self.user.username} Profile ({self.role})"


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


class MeetingDocument(models.Model):
    """
    Scope / Specification document uploaded specifically for an individual meeting.
    Supports PDF, DOCX, TXT, XLSX.
    """
    id = models.CharField(max_length=100, primary_key=True, default=uuid.uuid4, editable=True)
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='meeting_docs/')
    filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50, blank=True, default='') # PDF, Word, Excel, Text
    file_size = models.CharField(max_length=50, blank=True, default='')
    extracted_text = models.TextField(blank=True, default='')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.filename} ({self.meeting_id})"

