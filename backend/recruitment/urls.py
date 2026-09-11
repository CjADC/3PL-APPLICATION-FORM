from django.urls import path
from .views import ApplicationCreateView, ApplicationDetailView, AdminApplicationsList, ApplicationActionView

urlpatterns = [
    path('applications/', ApplicationCreateView.as_view(), name='application-create'),
    path('applications/<str:ref>/', ApplicationDetailView.as_view(), name='application-detail'),
    path('admin/applications/', AdminApplicationsList.as_view(), name='admin-applications'),
    path('admin/applications/<str:ref>/action/', ApplicationActionView.as_view(), name='application-action'),
]
