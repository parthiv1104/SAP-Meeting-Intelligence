from django.urls import path
from .auth_views import (
    register_view,
    login_view,
    me_view,
    logout_view,
    list_or_create_users_view,
    manage_single_user_view
)

urlpatterns = [
    path('register/', register_view, name='auth-register'),
    path('login/', login_view, name='auth-login'),
    path('me/', me_view, name='auth-me'),
    path('users/', list_or_create_users_view, name='auth-users'),
    path('users/<int:user_id>/', manage_single_user_view, name='auth-user-detail'),
    path('logout/', logout_view, name='auth-logout'),
]
