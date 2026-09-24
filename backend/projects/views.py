import os
import uuid
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project, ProjectDocument
from .serializers import ProjectSerializer, ProjectDocumentSerializer
from meetings.models import Meeting
from meetings.serializers import MeetingSerializer
from meetings.document_service import extract_text_from_file, format_file_size

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data

        # Embed all meetings associated with this project
        meetings = Meeting.objects.filter(project=instance).order_by('-created_at')
        meeting_serializer = MeetingSerializer(meetings, many=True)
        data['meetings'] = meeting_serializer.data

        return Response(data)

    def create(self, request, *args, **kwargs):
        payload = request.data.copy()
        
        # Generate clean ID if not provided
        if not payload.get('id'):
            client_slug = ''.join(e for e in payload.get('client', 'proj') if e.isalnum()).lower()[:6]
            payload['id'] = f"proj-{client_slug}-{uuid.uuid4().hex[:6]}"

        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Unlink any meetings tied to this project
        Meeting.objects.filter(project=instance).update(project=None)
        
        # Delete project documents and their files
        for doc in instance.documents.all():
            if doc.file and hasattr(doc.file, 'path') and os.path.exists(doc.file.path):
                try:
                    os.remove(doc.file.path)
                except Exception:
                    pass
            doc.delete()

        instance.delete()
        return Response({'message': 'Project deleted successfully', 'id': kwargs.get('pk')}, status=status.HTTP_200_OK)


    @action(detail=True, methods=['post'], url_path='upload-document')
    def upload_document(self, request, pk=None):
        project = self.get_object()
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        filename = file_obj.name
        _, ext = os.path.splitext(filename)
        file_size_str = format_file_size(file_obj.size)

        type_map = {
            '.pdf': 'PDF Document',
            '.docx': 'Word Document',
            '.doc': 'Word Document',
            '.xlsx': 'Excel Spreadsheet',
            '.xls': 'Excel Spreadsheet',
            '.txt': 'Text Specification',
            '.md': 'Markdown Document',
            '.json': 'JSON Document'
        }
        file_type = type_map.get(ext.lower(), 'Specification Document')

        doc = ProjectDocument.objects.create(
            project=project,
            file=file_obj,
            filename=filename,
            file_type=file_type,
            file_size=file_size_str,
        )

        # Extract text content
        if doc.file and hasattr(doc.file, 'path') and os.path.exists(doc.file.path):
            doc.extracted_text = extract_text_from_file(doc.file.path, ext)
            doc.save(update_fields=['extracted_text'])

        return Response(ProjectDocumentSerializer(doc).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='documents/(?P<doc_id>[^/.]+)')
    def delete_document(self, request, pk=None, doc_id=None):
        project = self.get_object()
        doc = ProjectDocument.objects.filter(project=project, id=doc_id).first()
        if not doc:
            return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if doc.file and os.path.exists(doc.file.path):
            try:
                os.remove(doc.file.path)
            except Exception:
                pass
        doc.delete()
        return Response({'message': 'Document deleted successfully'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='add-meeting')
    def add_meeting(self, request, pk=None):
        project = self.get_object()
        meeting_id = request.data.get('meeting_id') or request.data.get('meetingId')
        if not meeting_id:
            return Response({'error': 'meeting_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        meeting = Meeting.objects.filter(id=meeting_id).first()
        if not meeting:
            return Response({'error': 'Meeting not found'}, status=status.HTTP_404_NOT_FOUND)

        meeting.project = project
        if not meeting.industry or meeting.industry == 'Manufacturing':
            meeting.industry = project.industry
        if not meeting.erp_system or 'Private' in meeting.erp_system:
            meeting.erp_system = project.sap_product
        meeting.save()

        # Recalculate project progress
        self._update_project_metrics(project)

        return Response({'message': f'Meeting "{meeting.name}" linked to project "{project.name}"'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='remove-meeting')
    def remove_meeting(self, request, pk=None):
        project = self.get_object()
        meeting_id = request.data.get('meeting_id') or request.data.get('meetingId')
        if not meeting_id:
            return Response({'error': 'meeting_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        meeting = Meeting.objects.filter(id=meeting_id, project=project).first()
        if not meeting:
            return Response({'error': 'Meeting not associated with this project'}, status=status.HTTP_404_NOT_FOUND)

        meeting.project = None
        meeting.save()

        self._update_project_metrics(project)
        return Response({'message': f'Meeting "{meeting.name}" unlinked from project'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='add-team-member')
    def add_team_member(self, request, pk=None):
        project = self.get_object()
        member = request.data.get('member') or request.data
        name = member.get('name', '').strip()
        role = member.get('role', 'Consultant').strip()
        email = member.get('email', '').strip()

        if not name:
            return Response({'error': 'Member name is required'}, status=status.HTTP_400_BAD_REQUEST)

        current_team = list(project.team) if isinstance(project.team, list) else []
        
        # Check if already exists by email or name
        exists = False
        for m in current_team:
            if isinstance(m, dict) and ((email and m.get('email') == email) or (m.get('name') == name)):
                m['role'] = role
                if email:
                    m['email'] = email
                exists = True
                break
        
        if not exists:
            current_team.append({
                'id': f"member-{uuid.uuid4().hex[:6]}",
                'name': name,
                'role': role,
                'email': email,
            })

        project.team = current_team
        project.save(update_fields=['team'])
        return Response(ProjectSerializer(project).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='remove-team-member')
    def remove_team_member(self, request, pk=None):
        project = self.get_object()
        email = request.data.get('email', '').strip()
        name = request.data.get('name', '').strip()

        current_team = list(project.team) if isinstance(project.team, list) else []
        updated_team = [
            m for m in current_team
            if not (isinstance(m, dict) and ((email and m.get('email') == email) or (name and m.get('name') == name)))
        ]

        project.team = updated_team
        project.save(update_fields=['team'])
        return Response(ProjectSerializer(project).data, status=status.HTTP_200_OK)

    def _update_project_metrics(self, project):
        """Dynamically updates project progress, health, and knowledge coverage based on meetings."""
        meetings = project.meetings.all()
        total_meetings = meetings.count()
        if total_meetings == 0:
            project.progress = 0
            project.knowledge_coverage = 0
            project.health = 'On Track'
            project.health_score = 90
            project.save()
            return

        analyzed_count = meetings.filter(analysis_status='Analyzed').count()
        progress = int((analyzed_count / total_meetings) * 100)

        # Knowledge coverage: based on cumulative requirements & confirmed decisions
        req_count = len(project.cumulative_requirements or [])
        dec_count = len(project.cumulative_decisions or [])
        knowledge_score = min(95, 40 + (req_count * 5) + (dec_count * 8)) if (req_count + dec_count) > 0 else 20

        project.progress = progress
        project.knowledge_coverage = knowledge_score
        project.health = 'On Track' if progress >= 50 or total_meetings <= 2 else 'At Risk'
        project.health_score = max(70, min(98, 75 + (analyzed_count * 5)))
        project.save()
