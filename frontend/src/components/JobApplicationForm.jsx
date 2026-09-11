import React, { useState, useRef } from 'react';
import api from '../services/api';

const initialPersonal = {
  firstName: '',
  middleName: '',
  lastName: '',
  dob: '',
  gender: '',
  nationality: '',
  maritalStatus: '',
  placeOfBirth: '',
};

const initialContact = {
  email: '',
  contactNumber: '',
  currentAddress: '',
  permanentAddress: '',
  emergencyName: '',
  emergencyNumber: '',
  emergencyRelationship: '',
};

const initialGov = {
  tin: '',
  sss: '',
  philhealth: '',
  pagibig: '',
};

const initialDriver = {
  licenseNo: '',
  licenseType: '',
  licenseExpiry: '',
  orNo: '',
  crNo: '',
  plateNo: '',
};

const initialEducation = {
  level: '',
  school: '',
  course: '',
  yearGraduated: '',
};

export default function JobApplicationForm({ hubs = [] }) {
  const [personal, setPersonal] = useState(initialPersonal);
  const [contact, setContact] = useState(initialContact);
  const [position, setPosition] = useState('Courier');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [preferredHub, setPreferredHub] = useState('');
  const [startDate, setStartDate] = useState('');
  const [gov, setGov] = useState(initialGov);
  const [driver, setDriver] = useState(initialDriver);
  const [employmentHistory, setEmploymentHistory] = useState([]);
  const [education, setEducation] = useState(initialEducation);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [files, setFiles] = useState([]);
  const [declaration, setDeclaration] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Success Pop-up state
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);




  function resetForm() {
    setPersonal(initialPersonal);
    setContact(initialContact);
    setPosition('Courier');
    setEmploymentType('Full-time');
    setPreferredHub('');
    setStartDate('');
    setGov(initialGov);
    setDriver(initialDriver);
    setEmploymentHistory([]);
    setEducation(initialEducation);
    setSkills([]);
    setSkillInput('');
    setFiles([]);
    setDeclaration(false);
    setErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleAddEmployment() {
    setEmploymentHistory([
      ...employmentHistory,
      { company: '', position: '', type: 'Full-time', startDate: '', endDate: '', reason: '', responsibilities: '' },
    ]);
  }

  function handleRemoveEmployment(idx) {
    setEmploymentHistory(employmentHistory.filter((_, i) => i !== idx));
  }

  function handleFileChange(e) {
    const chosen = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...chosen]);
  }

  function handleRemoveFile(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleAddSkill() {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  }

  function validate() {
    const errs = {};
    if (!personal.firstName.trim()) errs.firstName = 'First name is required.';
    if (!personal.lastName.trim()) errs.lastName = 'Last name is required.';
    if (!contact.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contact.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!/^[0-9]+$/.test(contact.contactNumber)) {
      errs.contactNumber = 'Contact number must contain numbers only.';
    } else if (contact.contactNumber.length !== 11) {
      errs.contactNumber = 'Contact number must contain exactly 11 digits (e.g. 09171234567).';
    }
    if (!position) errs.position = 'Please select a position.';
    if (!declaration) errs.declaration = 'Please accept the applicant declaration.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('first_name', personal.firstName.trim());
      form.append('middle_name', personal.middleName.trim());
      form.append('last_name', personal.lastName.trim());
      form.append('dob', personal.dob || '');
      form.append('gender', personal.gender || '');
      form.append('nationality', personal.nationality.trim());
      form.append('marital_status', personal.maritalStatus || '');
      form.append('place_of_birth', personal.placeOfBirth.trim());
      form.append('email', contact.email.trim());
      form.append('contact_number', contact.contactNumber.trim());
      form.append('current_address', contact.currentAddress.trim());
      form.append('permanent_address', contact.permanentAddress.trim());
      form.append('emergency_name', contact.emergencyName.trim());
      form.append('emergency_number', contact.emergencyNumber.trim());
      form.append('emergency_relationship', contact.emergencyRelationship.trim());
      form.append('position', position);
      form.append('employment_type', employmentType);
      form.append('preferred_hub', preferredHub);
      form.append('preferred_start_date', startDate || '');
      form.append('tin', gov.tin.trim());
      form.append('sss', gov.sss.trim());
      form.append('philhealth', gov.philhealth.trim());
      form.append('pagibig', gov.pagibig.trim());
      form.append('education', JSON.stringify(education));
      form.append('skills', JSON.stringify(skills));
      form.append('employment_history', JSON.stringify(employmentHistory));

      if (position.toLowerCase().includes('rider') || position.toLowerCase().includes('driver')) {
        form.append('driver_info', JSON.stringify(driver));
      }

      files.forEach((f) => form.append('documents', f));

      const resp = await api.post('applications/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = resp.data;

      // Show success pop-up with submitted data
      setSuccessData({
        reference_number: data.reference_number || 'APP-SUCCESS',
        applicant_name: `${personal.firstName} ${personal.lastName}`,
        position: position,
        preferred_hub: preferredHub || 'Not specified',
        email: contact.email,
      });

      // Reset all inputs back to empty
      resetForm();

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        const newErrors = {};
        if (data.contact_number) newErrors.contactNumber = Array.isArray(data.contact_number) ? data.contact_number[0] : data.contact_number;
        if (data.email) newErrors.email = Array.isArray(data.email) ? data.email[0] : data.email;
        if (data.detail) newErrors.submit = data.detail;
        setErrors((prev) => ({ ...prev, ...newErrors }));
      } else {
        setErrors({ submit: 'Submission failed. Please check your connection and try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopyReference() {
    if (successData?.reference_number) {
      navigator.clipboard.writeText(successData.reference_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const isRiderOrDriver =
    position.toLowerCase().includes('rider') || position.toLowerCase().includes('driver');

  return (
    <div className="max-w-4xl mx-auto">
      {/* ─── SUCCESS POPUP MODAL ─── */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-gray-100 text-center relative animate-scale-up">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              Thank you, <strong className="text-gray-900">{successData.applicant_name}</strong>. Your job application has been successfully recorded and sent to the 3PL Workforce Management review queue.
            </p>

            {/* Reference Number Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Application Reference No.</span>
                <button
                  type="button"
                  onClick={handleCopyReference}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md transition-colors"
                >
                  {copied ? '✓ Copied!' : 'Copy Code'}
                </button>
              </div>
              <div className="text-lg font-mono font-bold text-gray-800 tracking-wider">
                {successData.reference_number}
              </div>

              <div className="border-t border-gray-200 mt-3 pt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 block">Position:</span>
                  <span className="font-semibold text-gray-700">{successData.position}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Delivery Center:</span>
                  <span className="font-semibold text-gray-700 truncate block">{successData.preferred_hub}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-6">
              Please save your reference number. Our HR team will contact you at <strong className="text-gray-600">{successData.email}</strong>.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setSuccessData(null)}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow"
              >
                Submit Another Application
              </button>
              <button
                type="button"
                onClick={() => setSuccessData(null)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN FORM ─── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {errors.submit}
          </div>
        )}

        {/* 1. PERSONAL INFORMATION */}
        <div className="card bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Personal Information</h2>
          <p className="text-xs text-gray-500 mb-4">Fields marked with <span className="text-red-500 font-bold">*</span> are required.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
              <input
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={personal.firstName}
                onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })}
                placeholder="First name"
              />
              {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Middle Name / Initial</label>
              <input
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={personal.middleName}
                onChange={(e) => setPersonal({ ...personal, middleName: e.target.value })}
                placeholder="Middle name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
              <input
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={personal.lastName}
                onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })}
                placeholder="Last name"
              />
              {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={personal.dob}
                onChange={(e) => setPersonal({ ...personal, dob: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Gender</label>
              <select
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                value={personal.gender}
                onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nationality</label>
              <input
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={personal.nationality}
                onChange={(e) => setPersonal({ ...personal, nationality: e.target.value })}
                placeholder="Filipino"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Marital Status</label>
              <select
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                value={personal.maritalStatus}
                onChange={(e) => setPersonal({ ...personal, maritalStatus: e.target.value })}
              >
                <option value="">Select status</option>
                <option>Single</option>
                <option>Married</option>
                <option>Separated</option>
                <option>Widowed</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Place of Birth</label>
            <input
              className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={personal.placeOfBirth}
              onChange={(e) => setPersonal({ ...personal, placeOfBirth: e.target.value })}
              placeholder="City / Municipality, Province"
            />
          </div>
        </div>

        {/* 2. CONTACT & ADDRESS */}
        <div className="card bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Contact & Address</h2>
          <p className="text-xs text-gray-500 mb-4">Please provide your active contact details.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                placeholder="juan.delacruz@example.com"
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Number (11 Digits) <span className="text-red-500">*</span></label>
              <input
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={contact.contactNumber}
                onChange={(e) => setContact({ ...contact, contactNumber: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="09171234567"
                maxLength={11}
              />
              {errors.contactNumber && <p className="text-xs text-red-600 mt-1">{errors.contactNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Current Address</label>
              <textarea
                rows={2}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                value={contact.currentAddress}
                onChange={(e) => setContact({ ...contact, currentAddress: e.target.value })}
                placeholder="House / Unit No., Street, Barangay, City, Province"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Permanent Address</label>
              <textarea
                rows={2}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                value={contact.permanentAddress}
                onChange={(e) => setContact({ ...contact, permanentAddress: e.target.value })}
                placeholder="Same as current or permanent address"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-3 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Emergency Contact Person</label>
              <input
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={contact.emergencyName}
                onChange={(e) => setContact({ ...contact, emergencyName: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Emergency Contact Number</label>
              <input
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={contact.emergencyNumber}
                onChange={(e) => setContact({ ...contact, emergencyNumber: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="09171234567"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Relationship</label>
              <input
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={contact.emergencyRelationship}
                onChange={(e) => setContact({ ...contact, emergencyRelationship: e.target.value })}
                placeholder="Parent / Spouse / Sibling"
              />
            </div>
          </div>
        </div>

        {/* 3. POSITION */}
        <div className="card bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Position</h2>
          <p className="text-xs text-gray-500 mb-4">Select your desired role and employment type.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Position Applied For <span className="text-red-500">*</span></label>
              <select
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white font-medium"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                <option>Courier</option>
                <option>Rider</option>
                <option>Warehouse Staff</option>
                <option>Dispatcher</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Employment Type</label>
              <select
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
              >
                <option>Full-time</option>
                <option>OCW / On-Call Workforce</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Preferred Start Date</label>
            <input
              type="date"
              className="w-full md:w-64 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* DRIVER & VEHICLE (Shown only if Rider/Driver) */}
          {isRiderOrDriver && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Driver & Vehicle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Driver's License No.</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl p-2 text-sm"
                    value={driver.licenseNo}
                    onChange={(e) => setDriver({ ...driver, licenseNo: e.target.value })}
                    placeholder="e.g. N01-12-345678"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">License Type</label>
                  <select
                    className="w-full border border-gray-200 rounded-xl p-2 text-sm bg-white"
                    value={driver.licenseType}
                    onChange={(e) => setDriver({ ...driver, licenseType: e.target.value })}
                  >
                    <option value="">Select license</option>
                    <option>Non-Professional</option>
                    <option>Professional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">License Expiry Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl p-2 text-sm"
                    value={driver.licenseExpiry}
                    onChange={(e) => setDriver({ ...driver, licenseExpiry: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle Plate Number</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl p-2 text-sm"
                    value={driver.plateNo}
                    onChange={(e) => setDriver({ ...driver, plateNo: e.target.value })}
                    placeholder="e.g. ABC 1234"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">OR (Official Receipt) No.</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl p-2 text-sm"
                    value={driver.orNo}
                    onChange={(e) => setDriver({ ...driver, orNo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CR (Certificate of Reg.) No.</label>
                  <input
                    className="w-full border border-gray-200 rounded-xl p-2 text-sm"
                    value={driver.crNo}
                    onChange={(e) => setDriver({ ...driver, crNo: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. GOVERNMENT MANDATED NUMBERS */}
        <div className="card bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Government Mandated IDs</h2>
          <p className="text-xs text-gray-500 mb-4">Optional during initial application; required upon onboarding.</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">TIN</label>
              <input
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm"
                value={gov.tin}
                onChange={(e) => setGov({ ...gov, tin: e.target.value })}
                placeholder="000-000-000-000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">SSS No.</label>
              <input
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm"
                value={gov.sss}
                onChange={(e) => setGov({ ...gov, sss: e.target.value })}
                placeholder="00-0000000-0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">PhilHealth No.</label>
              <input
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm"
                value={gov.philhealth}
                onChange={(e) => setGov({ ...gov, philhealth: e.target.value })}
                placeholder="00-000000000-0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pag-IBIG (HDMF) No.</label>
              <input
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm"
                value={gov.pagibig}
                onChange={(e) => setGov({ ...gov, pagibig: e.target.value })}
                placeholder="0000-0000-0000"
              />
            </div>
          </div>
        </div>

        {/* 5. WORK EXPERIENCE */}
        <div className="card bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Work Experience</h2>
              <p className="text-xs text-gray-500">Add any past logistics, courier, or related jobs.</p>
            </div>
            <button
              type="button"
              onClick={handleAddEmployment}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
            >
              + Add Experience
            </button>
          </div>

          {employmentHistory.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">No work experience added yet. Click "+ Add Experience" above if applicable.</p>
          ) : (
            <div className="space-y-3">
              {employmentHistory.map((rec, idx) => (
                <div key={idx} className="p-3.5 border border-gray-200 rounded-xl bg-gray-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Company #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmployment(idx)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      className="border border-gray-200 rounded-lg p-2 text-xs bg-white"
                      placeholder="Company Name"
                      value={rec.company}
                      onChange={(e) => {
                        const arr = [...employmentHistory];
                        arr[idx].company = e.target.value;
                        setEmploymentHistory(arr);
                      }}
                    />
                    <input
                      className="border border-gray-200 rounded-lg p-2 text-xs bg-white"
                      placeholder="Position / Title"
                      value={rec.position}
                      onChange={(e) => {
                        const arr = [...employmentHistory];
                        arr[idx].position = e.target.value;
                        setEmploymentHistory(arr);
                      }}
                    />
                    <input
                      className="border border-gray-200 rounded-lg p-2 text-xs bg-white"
                      placeholder="e.g. 2022 - 2024"
                      value={rec.startDate}
                      onChange={(e) => {
                        const arr = [...employmentHistory];
                        arr[idx].startDate = e.target.value;
                        setEmploymentHistory(arr);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. EDUCATION & SKILLS */}
        <div className="card bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Education & Skills</h2>
          <p className="text-xs text-gray-500 mb-4">Educational attainment and specialized skills.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Attainment</label>
              <select
                className="w-full border border-gray-200 rounded-xl p-2 text-xs bg-white"
                value={education.level}
                onChange={(e) => setEducation({ ...education, level: e.target.value })}
              >
                <option value="">Select level</option>
                <option>High School</option>
                <option>Senior High School</option>
                <option>Vocational / Technical</option>
                <option>College Undergraduate</option>
                <option>College Graduate</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">School Name</label>
              <input
                className="w-full border border-gray-200 rounded-xl p-2 text-xs"
                placeholder="School / University"
                value={education.school}
                onChange={(e) => setEducation({ ...education, school: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Course / Strand</label>
              <input
                className="w-full border border-gray-200 rounded-xl p-2 text-xs"
                placeholder="e.g. BS Logistics"
                value={education.course}
                onChange={(e) => setEducation({ ...education, course: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Year Graduated</label>
              <input
                className="w-full border border-gray-200 rounded-xl p-2 text-xs"
                placeholder="e.g. 2023"
                value={education.yearGraduated}
                onChange={(e) => setEducation({ ...education, yearGraduated: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <label className="block text-xs font-medium text-gray-600 mb-1">Skills & Certifications</label>
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 border border-gray-200 rounded-xl p-2 text-xs"
                placeholder="Type a skill (e.g. Motorcycle navigation, Defensive driving) and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
              >
                Add Skill
              </button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {s}
                    <button
                      type="button"
                      onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}
                      className="text-blue-500 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 7. DOCUMENT UPLOADS */}
        <div className="card bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Document Attachments</h2>
          <p className="text-xs text-gray-500 mb-3">Upload your Resume/CV, NBI Clearance, Driver's License, or Government ID.</p>

          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              id="doc-upload"
              onChange={handleFileChange}
            />
            <label htmlFor="doc-upload" className="cursor-pointer">
              <div className="text-gray-600 font-medium text-sm">Click to choose files or drag and drop</div>
              <div className="text-xs text-gray-400 mt-1">Supports PDF, DOC, DOCX, JPG, PNG</div>
              <span className="inline-block mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl">
                Browse Files
              </span>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs">
                  <span className="truncate max-w-[280px] font-medium text-gray-700">{f.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{Math.round(f.size / 1024)} KB</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="text-red-500 hover:underline font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 8. DECLARATION */}
        <div className="card bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-3">
          <input
            type="checkbox"
            id="decl"
            checked={declaration}
            onChange={(e) => setDeclaration(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-blue-600 cursor-pointer"
          />
          <label htmlFor="decl" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
            I hereby certify that all information provided in this application is true, accurate, and complete to the best of my knowledge. I understand that any false statement or omission may be grounds for disqualification or termination of employment.
          </label>
        </div>
        {errors.declaration && <p className="text-xs text-red-600">{errors.declaration}</p>}

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !declaration}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all text-sm flex items-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Submitting Application...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
