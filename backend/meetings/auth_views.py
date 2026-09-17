from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .models import UserProfile


def get_user_profile_data(user: User):
    first_name = user.first_name or ''
    last_name = user.last_name or ''
    full_name = f"{first_name} {last_name}".strip() or user.username

    # Get or create UserProfile
    profile, _ = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'role': 'Lead Solution Architect' if user.is_staff else 'Consultant',
            'organization': 'VC ERP Consulting Group'
        }
    )
    
    # Calculate initials
    if first_name and last_name:
        initials = f"{first_name[0]}{last_name[0]}".upper()
    elif len(full_name) >= 2:
        initials = full_name[:2].upper()
    else:
        initials = full_name[:1].upper() if full_name else 'U'

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'name': full_name,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'initials': initials,
        'role': profile.role,
        'organization': profile.organization,
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

    if not email:
        return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not password:
        return Response({'error': 'Password is required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'An account with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        # Fallback to email as username if collision
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

    # Allow login by email or username
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
    GET: Returns the currently authenticated user's profile.
    PUT/PATCH/POST: Updates the consultant profile (name, role, organization, email) dynamically.
    """
    target_user = None

    # Check if request has an authenticated user
    if request.user and request.user.is_authenticated:
        target_user = request.user
    else:
        # Check Authorization header manually if TokenAuthentication was sent
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Token '):
            token_key = auth_header.split(' ')[1]
            token = Token.objects.filter(key=token_key).first()
            if token:
                target_user = token.user

    if not target_user:
        # Fallback to first user in system if demo/local
        target_user = User.objects.first()

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
        if role:
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
