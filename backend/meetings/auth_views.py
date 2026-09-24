from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .models import UserProfile


def get_authenticated_user(request):
    """
    Utility helper to retrieve the authenticated User instance from request.user or Token header.
    """
    if request.user and request.user.is_authenticated:
        return request.user
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Token '):
        token_key = auth_header.split(' ')[1]
        token = Token.objects.filter(key=token_key).first()
        if token:
            return token.user
    # Fallback for local testing if unauthenticated
    return User.objects.filter(is_superuser=True).first() or User.objects.first()


def get_user_profile_data(user: User):
    first_name = user.first_name or ''
    last_name = user.last_name or ''
    full_name = f"{first_name} {last_name}".strip() or user.username

    is_admin_candidate = user.is_superuser or user.is_staff or user.email == 'parthiv.dudhrejiya@vc-erp.com'
    
    # Get or create UserProfile
    profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'role': 'Admin' if is_admin_candidate else 'Consultant',
            'organization': 'VC ERP Consulting Group'
        }
    )
    
    # Auto-upgrade superuser / primary executive to Admin
    if is_admin_candidate and profile.role != 'Admin':
        profile.role = 'Admin'
        profile.save(update_fields=['role'])

    valid_roles = ['Admin', 'Team Leader', 'Project Manager', 'Consultant']
    role = profile.role if profile.role in valid_roles else 'Consultant'

    # Calculate initials
    if first_name and last_name:
        initials = f"{first_name[0]}{last_name[0]}".upper()
    elif len(full_name) >= 2:
        initials = full_name[:2].upper()
    else:
        initials = full_name[:1].upper() if full_name else 'U'

    # Role-based permissions & allowed roles to create
    if role == 'Admin':
        allowed_roles = ['Admin', 'Team Leader', 'Project Manager', 'Consultant']
        can_create_users = True
        can_create_projects = True
        can_delete_projects = True
        can_delete_meetings = True
        can_manage_health = True
        can_delete_users = True
    elif role == 'Team Leader':
        allowed_roles = ['Project Manager', 'Consultant']
        can_create_users = True
        can_create_projects = True
        can_delete_projects = True
        can_delete_meetings = True
        can_manage_health = True
        can_delete_users = True
    elif role == 'Project Manager':
        allowed_roles = ['Consultant']
        can_create_users = True
        can_create_projects = True
        can_delete_projects = False
        can_delete_meetings = True
        can_manage_health = False
        can_delete_users = False
    else:  # Consultant / User
        allowed_roles = []
        can_create_users = False
        can_create_projects = False
        can_delete_projects = False
        can_delete_meetings = False
        can_manage_health = False
        can_delete_users = False

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'name': full_name,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'initials': initials,
        'role': role,
        'organization': profile.organization,
        'createdBy': profile.created_by.email if profile.created_by else None,
        'permissions': {
            'canCreateUsers': can_create_users,
            'allowedRolesToCreate': allowed_roles,
            'canCreateProjects': can_create_projects,
            'canDeleteProjects': can_delete_projects,
            'canDeleteMeetings': can_delete_meetings,
            'canManageHealth': can_manage_health,
            'canDeleteUsers': can_delete_users,
        }
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Registers a new user account and returns an auth token and user profile.
    """
    data = request.data
    email = data.get('email', '').strip().lower()
    username = data.get('username', '').strip() or email
    password = data.get('password', '')
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    name = data.get('name', '').strip()
    requested_role = data.get('role', 'Consultant').strip()

    if not email:
        return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not password:
        return Response({'error': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'An account with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        username = email

    if name and not first_name:
        parts = name.split(' ', 1)
        first_name = parts[0]
        if len(parts) > 1:
            last_name = parts[1]

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Check if first user in system -> make Admin
        total_users = User.objects.count()
        assigned_role = 'Admin' if total_users == 1 else requested_role
        if assigned_role not in ['Admin', 'Team Leader', 'Project Manager', 'Consultant']:
            assigned_role = 'Consultant'

        UserProfile.objects.create(
            user=user,
            role=assigned_role,
            organization='VC ERP Consulting Group'
        )

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'status': 'success',
            'token': token.key,
            'user': get_user_profile_data(user),
            'message': 'Registration successful.'
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': f"Registration failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Authenticates with email or username and returns an auth token and user profile.
    """
    data = request.data
    identifier = data.get('email', '') or data.get('username', '')
    identifier = identifier.strip()
    password = data.get('password', '')

    if not identifier or not password:
        return Response({'error': 'Email/username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    user = None
    if '@' in identifier:
        user_obj = User.objects.filter(email__iexact=identifier).first()
        if user_obj:
            user = authenticate(username=user_obj.username, password=password)
    
    if not user:
        user = authenticate(username=identifier, password=password)

    if not user:
        return Response({'error': 'Invalid email/username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'status': 'success',
        'token': token.key,
        'user': get_user_profile_data(user),
        'message': 'Login successful.'
    })


@api_view(['GET', 'PUT', 'PATCH', 'POST'])
@permission_classes([AllowAny])
def me_view(request):
    """
    GET: Returns the currently authenticated user's profile and RBAC permissions.
    PUT/PATCH/POST: Updates the consultant profile dynamically.
    """
    target_user = get_authenticated_user(request)
    if not target_user:
        return Response({'authenticated': False, 'user': None}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method in ['PUT', 'PATCH', 'POST']:
        data = request.data
        name = data.get('name', '').strip()
        role = data.get('role', '').strip()
        org = data.get('organization', '').strip()
        email = data.get('email', '').strip().lower()

        if name:
            parts = name.split(' ', 1)
            target_user.first_name = parts[0]
            target_user.last_name = parts[1] if len(parts) > 1 else ''
        if email and not User.objects.filter(email=email).exclude(id=target_user.id).exists():
            target_user.email = email

        target_user.save()

        profile, _ = UserProfile.objects.get_or_create(user=target_user)
        if role and role in ['Admin', 'Team Leader', 'Project Manager', 'Consultant']:
            # Only allow role self-change if user is Admin
            requester_profile_data = get_user_profile_data(target_user)
            if requester_profile_data['role'] == 'Admin':
                profile.role = role
        if org:
            profile.organization = org
        profile.save()

        return Response({
            'status': 'success',
            'authenticated': True,
            'user': get_user_profile_data(target_user),
            'message': 'Profile updated successfully.'
        }, status=status.HTTP_200_OK)

    return Response({
        'authenticated': True,
        'user': get_user_profile_data(target_user)
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """
    Logs out the user and invalidates the auth token.
    """
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Token '):
        token_key = auth_header.split(' ')[1]
        Token.objects.filter(key=token_key).delete()
    elif request.user and request.user.is_authenticated:
        Token.objects.filter(user=request.user).delete()

    return Response({'status': 'success', 'message': 'Logged out successfully.'})


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def list_or_create_users_view(request):
    """
    GET: Returns list of all registered team members with their roles.
    POST: Creates a new user account with designated role.
          Permissions:
          - Admin can create: Admin, Team Leader, Project Manager, Consultant
          - Team Leader can create: Project Manager, Consultant
          - Project Manager can create: Consultant
    """
    requester = get_authenticated_user(request)
    requester_data = get_user_profile_data(requester) if requester else None
    
    if request.method == 'GET':
        users = User.objects.all().order_by('first_name', 'username')
        results = [get_user_profile_data(u) for u in users]
        return Response(results, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        if not requester_data or not requester_data['permissions']['canCreateUsers']:
            return Response({
                'error': 'Forbidden',
                'message': 'You do not have permission to create user accounts.'
            }, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        email = data.get('email', '').strip().lower()
        password = data.get('password', '').strip() or 'Welcome@123'
        name = data.get('name', '').strip()
        target_role = data.get('role', 'Consultant').strip()

        if not email:
            return Response({'error': 'Email address is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': f'An account with email "{email}" already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce RBAC allowed roles
        allowed_roles = requester_data['permissions']['allowedRolesToCreate']
        if target_role not in allowed_roles:
            return Response({
                'error': 'Permission Denied',
                'message': f"As a '{requester_data['role']}', you are not authorized to create '{target_role}' accounts. Allowed roles: {', '.join(allowed_roles)}"
            }, status=status.HTTP_403_FORBIDDEN)

        parts = name.split(' ', 1) if name else [email.split('@')[0], '']
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ''

        try:
            new_user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            UserProfile.objects.create(
                user=new_user,
                role=target_role,
                organization='VC ERP Consulting Group',
                created_by=requester
            )
            return Response({
                'status': 'success',
                'user': get_user_profile_data(new_user),
                'message': f"Account created for {name or email} with role '{target_role}'."
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f"Failed to create user: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH', 'DELETE'])
@permission_classes([AllowAny])
def manage_single_user_view(request, user_id):
    """
    PATCH: Updates user role or profile.
    DELETE: Deletes user account (Admin or Team Leader).
    """
    requester = get_authenticated_user(request)
    requester_data = get_user_profile_data(requester) if requester else None
    
    target_user = User.objects.filter(id=user_id).first()
    if not target_user:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        if not requester_data or not requester_data['permissions']['canDeleteUsers']:
            return Response({'error': 'Permission Denied', 'message': 'Only Admins and Team Leaders can delete user accounts.'}, status=status.HTTP_403_FORBIDDEN)

        if requester and requester.id == target_user.id:
            return Response({'error': 'Cannot delete your own active administrator account.'}, status=status.HTTP_400_BAD_REQUEST)

        user_name = target_user.get_full_name() or target_user.username
        target_user.delete()
        return Response({'status': 'success', 'message': f'User "{user_name}" deleted.'}, status=status.HTTP_200_OK)

    elif request.method == 'PATCH':
        new_role = request.data.get('role', '').strip()
        if new_role:
            allowed_roles = requester_data['permissions']['allowedRolesToCreate']
            if new_role not in allowed_roles and requester_data['role'] != 'Admin':
                return Response({'error': f"Not authorized to assign role '{new_role}'."}, status=status.HTTP_403_FORBIDDEN)
            
            profile, _ = UserProfile.objects.get_or_create(user=target_user)
            profile.role = new_role
            profile.save(update_fields=['role'])

        return Response({
            'status': 'success',
            'user': get_user_profile_data(target_user),
            'message': 'User role updated.'
        }, status=status.HTTP_200_OK)

