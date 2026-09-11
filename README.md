# Job Application Form (3PL Workforce Management)

This workspace adds a Job Application feature (frontend + backend) compatible with a React + Vite + Tailwind frontend and Django REST Framework backend.

Quick integration steps:

1. Backend

- Copy `backend/recruitment` into your Django project.
- Add `recruitment` to `INSTALLED_APPS` in `settings.py`.
- Ensure `MEDIA_ROOT` and `MEDIA_URL` are configured and served by your project.
- Run migrations: `python manage.py makemigrations recruitment` and `python manage.py migrate`.
- Include the recruitment URLs, e.g. `path('api/', include('recruitment.urls'))` in your main `urls.py`.

2. Frontend

- Copy `frontend/src/components/JobApplicationForm.jsx`, `ApplicationSuccess.jsx`, `AdminApplications.jsx` and `frontend/src/services/api.js` into your Vite React app.
- Ensure Tailwind is configured; these components use Tailwind classes.
- Route `/application-success` to `ApplicationSuccess` and mount `JobApplicationForm` where needed.
- The form posts to `/api/applications/` using `FormData` for file uploads.

3. Notes

- File uploads are saved via Django `FileField` in `Document` model.
- The application `reference_number` is a short UUID used for lookup.
- The admin endpoints are basic and intended to be extended for pagination, filters, authentication and permissions in your project.

Admin & extra endpoints:

- `GET /api/admin/applications/` - paginated list (admin-only). Supports `position`, `hub`, `status` query params.
- `POST /api/admin/applications/<ref>/action/` - perform actions: `approve`, `reject`, `interview`, `convert` (admin-only). `convert` returns a stub `employee_id` and should be integrated with your Employee module.

Tests:

- Basic tests are in `backend/recruitment/tests.py`. Run with `python manage.py test recruitment`.
