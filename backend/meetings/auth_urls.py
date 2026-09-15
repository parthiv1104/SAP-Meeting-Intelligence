from django.urls import path
from .auth_views import register_view, login_view, me_view, logout_view

urlpatterns = [
    path('register/', register_view, name='auth-register'),
    path('login/', login_view, name='auth-login'),
    path('me/', me_view, name='auth-me'),
    path('logout/', logout_view, name='auth-logout'),
]
