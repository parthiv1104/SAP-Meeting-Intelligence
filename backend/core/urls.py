from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('meetings.auth_urls')),
    path('api/projects/', include('projects.urls')),
    path('api/meetings/', include('meetings.urls')),
]
