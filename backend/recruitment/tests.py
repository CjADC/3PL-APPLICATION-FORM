from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from .models import Applicant, Application


class ApplicationAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_application_minimal(self):
        data = {
            'first_name': 'Juan',
            'last_name': 'Dela Cruz',
            'email': 'juan@example.com',
            'contact_number': '09171234567',
            'position': 'Courier',
        }
        resp = self.client.post('/api/applications/', data)
        self.assertEqual(resp.status_code, 201)
        self.assertIn('reference_number', resp.data)

    def test_admin_actions_require_auth(self):
        # create sample application
        applicant = Applicant.objects.create(first_name='A', last_name='B', email='a@b.com')
        app = Application.objects.create(applicant=applicant, reference_number='REF123', position='Courier')
        resp = self.client.post(f'/api/admin/applications/{app.reference_number}/action/', {'action': 'approve'})
        self.assertIn(resp.status_code, (401, 403))
