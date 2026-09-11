from django.contrib import admin
from .models import Applicant, Application, Document


@admin.register(Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'contact_number', 'created_at')


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('reference_number', 'applicant', 'position', 'preferred_hub', 'employment_type', 'status', 'applied_at')
    list_filter = ('position', 'preferred_hub', 'employment_type', 'status')


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('application', 'label', 'uploaded_at')
