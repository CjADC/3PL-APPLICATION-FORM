from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import permissions
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from .serializers import ApplicationSerializer, ApplicantSerializer
from .models import Applicant, Application, Document
from django.utils import timezone
import uuid


class ApplicationCreateView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        # Build applicant data from form fields
        applicant_data = {
            'first_name': request.data.get('first_name', ''),
            'middle_name': request.data.get('middle_name', ''),
            'last_name': request.data.get('last_name', ''),
            'dob': request.data.get('dob') or None,
            'gender': request.data.get('gender', ''),
            'nationality': request.data.get('nationality', ''),
            'marital_status': request.data.get('marital_status', ''),
            'place_of_birth': request.data.get('place_of_birth', ''),
            'email': request.data.get('email', ''),
            'contact_number': request.data.get('contact_number', ''),
            'current_address': request.data.get('current_address', ''),
            'permanent_address': request.data.get('permanent_address', ''),
            'emergency_name': request.data.get('emergency_name', ''),
            'emergency_number': request.data.get('emergency_number', ''),
            'emergency_relationship': request.data.get('emergency_relationship', ''),
            'tin': request.data.get('tin', ''),
            'sss': request.data.get('sss', ''),
            'philhealth': request.data.get('philhealth', ''),
            'pagibig': request.data.get('pagibig', ''),
        }

        # validate applicant
        applicant_serializer = ApplicantSerializer(data=applicant_data)
        applicant_serializer.is_valid(raise_exception=True)

        application_data = {
            'position': request.data.get('position', ''),
            'employment_type': request.data.get('employment_type', ''),
            'preferred_hub': request.data.get('preferred_hub', ''),
            'preferred_start_date': request.data.get('preferred_start_date') or None,
            'driver_info': request.data.get('driver_info') and request.data.get('driver_info') or None,
            'education': request.data.get('education') and request.data.get('education') or None,
            'skills': request.data.get('skills') and request.data.get('skills') or None,
            'employment_history': request.data.get('employment_history') and request.data.get('employment_history') or None,
            'applied_at': timezone.now(),
            'status': 'Pending',
        }

        # create applicant
        applicant = Applicant.objects.create(**applicant_serializer.validated_data)
        # create application
        reference = str(uuid.uuid4()).split('-')[0].upper()
        application = Application.objects.create(applicant=applicant, reference_number=reference, **application_data)

        # handle files
        files = request.FILES.getlist('documents')
        for f in files:
            Document.objects.create(application=application, file=f, label=f.name)

        serializer = ApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ApplicationDetailView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, ref, format=None):
        app = get_object_or_404(Application, reference_number=ref)
        data = {
            'reference_number': app.reference_number,
            'applicant_name': str(app.applicant),
            'position': app.position,
            'preferred_hub_name': app.preferred_hub,
            'applied_at': app.applied_at,
            'status': app.status,
        }
        return Response(data)


class AdminApplicationsList(APIView):
    permission_classes = (permissions.IsAuthenticated, permissions.IsAdminUser)

    def get(self, request, format=None):
        qs = Application.objects.select_related('applicant').order_by('-applied_at')

        # filtering
        position = request.query_params.get('position')
        hub = request.query_params.get('hub')
        status_q = request.query_params.get('status')
        if position:
            qs = qs.filter(position__iexact=position)
        if hub:
            qs = qs.filter(preferred_hub__iexact=hub)
        if status_q:
            qs = qs.filter(status__iexact=status_q)

        # pagination
        paginator = PageNumberPagination()
        paginator.page_size = 25
        page = paginator.paginate_queryset(qs, request)

        out = []
        for a in page:
            out.append({
                'reference_number': a.reference_number,
                'applicant_name': str(a.applicant),
                'position': a.position,
                'preferred_hub_name': a.preferred_hub,
                'employment_type': a.employment_type,
                'applied_at': a.applied_at,
                'status': a.status,
            })
        return paginator.get_paginated_response(out)


class ApplicationActionView(APIView):
    permission_classes = (permissions.IsAuthenticated, permissions.IsAdminUser)

    def post(self, request, ref, format=None):
        action = request.data.get('action')
        app = get_object_or_404(Application, reference_number=ref)
        if action == 'approve':
            app.status = 'Approved'
            app.save()
            return Response({'status': 'Approved'})
        if action == 'reject':
            app.status = 'Rejected'
            app.save()
            return Response({'status': 'Rejected'})
        if action == 'interview':
            app.status = 'Interview'
            app.save()
            return Response({'status': 'Interview'})
        if action == 'convert':
            # Stub: convert to employee integration point. Return generated employee id.
            employee_id = f"EMP-{str(uuid.uuid4()).split('-')[0].upper()}"
            # TODO: integrate with Employee Management module to create employee record.
            app.status = 'Approved'
            app.save()
            return Response({'status': 'Converted', 'employee_id': employee_id})

        return Response({'detail': 'Unknown action'}, status=status.HTTP_400_BAD_REQUEST)
