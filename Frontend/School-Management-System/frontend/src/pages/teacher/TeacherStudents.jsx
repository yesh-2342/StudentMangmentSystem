import React, { useEffect, useMemo, useState } from 'react';
import { Users, Mail, Search, Edit2, Eye, AlertTriangle, CheckCircle, RefreshCw, BookOpen, UserCheck, Filter } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import teacherService from '../../services/teacherService';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const TeacherStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('ALL');

  // Modals
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchRoster = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [rosterData, courseData] = await Promise.all([
        teacherService.getStudents(user.id),
        teacherService.getCourses(user.id),
      ]);
      setStudents(Array.isArray(rosterData) ? rosterData : []);
      setCourses(Array.isArray(courseData) ? courseData : []);
    } catch (err) {
      setError(err.userMessage || 'Unable to load student roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [user?.id]);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Open Details Modal
  const handleOpenDetails = async (student) => {
    try {
      const details = await teacherService.getStudentDetails(user.id, student.id);
      setSelectedStudentDetails(details);
    } catch {
      setSelectedStudentDetails(student);
    }
    setDetailsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setEditForm({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
    });
    setFormErrors({});
    setEditModalOpen(true);
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editForm.firstName.trim()) errors.firstName = 'First name is required.';
    if (!editForm.lastName.trim()) errors.lastName = 'Last name is required.';
    if (!editForm.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setSaving(true);
    try {
      const updated = await teacherService.updateStudent(user.id, editingStudent.id, {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
      });

      // Update state locally
      setStudents((prev) =>
        prev.map((s) => (s.id === editingStudent.id ? { ...s, ...updated } : s))
      );

      setEditModalOpen(false);
      showSuccess(`Student record for ${editForm.firstName} ${editForm.lastName} updated successfully.`);
    } catch (err) {
      setFormErrors({ submit: err.response?.data?.error || err.message || 'Failed to update student.' });
    } finally {
      setSaving(false);
    }
  };

  // Filter and Search
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        `${s.firstName} ${s.lastName} ${s.userName} ${s.email} ${s.id}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCourse =
        selectedCourse === 'ALL' ||
        (s.courses && s.courses.some((c) => String(c.id) === String(selectedCourse))) ||
        String(s.courseId) === String(selectedCourse);

      let matchesRisk = true;
      if (selectedRiskFilter === 'AT_RISK') {
        matchesRisk = s.isAtRisk === true;
      } else if (selectedRiskFilter === 'GOOD_STANDING') {
        matchesRisk = s.isAtRisk === false;
      }

      return matchesSearch && matchesCourse && matchesRisk;
    });
  }, [students, searchTerm, selectedCourse, selectedRiskFilter]);

  const columns = [
    {
      header: 'ID',
      key: 'id',
      width: '70px',
      render: (val) => <span className="badge badge-gray">#{val}</span>,
    },
    {
      header: 'Student Name',
      key: 'firstName',
      render: (_, row) => (
        <div>
          <strong style={{ fontSize: '0.925rem', color: 'var(--text-main)' }}>
            {row.firstName} {row.lastName}
          </strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{row.userName}</div>
        </div>
      ),
    },
    {
      header: 'Enrolled Classes',
      key: 'courseName',
      render: (_, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {row.courses && row.courses.length > 0 ? (
            row.courses.map((c) => (
              <span key={c.id} className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                {c.code || c.name}
              </span>
            ))
          ) : (
            <span className="badge badge-info">{row.courseName || 'Enrolled'}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Assessment Avg',
      key: 'average',
      render: (val) => (
        <span
          style={{
            fontWeight: 700,
            color: val !== 'N/A' && Number(val) < 60 ? 'var(--error)' : 'var(--text-main)',
          }}
        >
          {val !== undefined && val !== null ? `${val}%` : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Attendance %',
      key: 'attendancePercentage',
      render: (val) => (
        <span
          style={{
            fontWeight: 700,
            color: val !== 'N/A' && Number(val) < 75 ? 'var(--error)' : '#0f766e',
          }}
        >
          {val !== undefined && val !== null ? `${val}%` : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Academic Standing',
      key: 'riskStatus',
      render: (val, row) => (
        <span
          className={`badge ${
            row.isAtRisk
              ? val?.includes('High')
                ? 'badge-error'
                : 'badge-warning'
              : 'badge-success'
          }`}
        >
          {val || (row.isAtRisk ? 'At-Risk' : 'Good Standing')}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleOpenDetails(row)}
            title="View Student Details"
          >
            <Eye size={14} /> Details
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleOpenEdit(row)}
            title="Edit Permitted Student Information"
          >
            <Edit2 size={14} /> Edit
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading enrolled student roster..." />;
  if (error) return <ErrorState description={error} onRetry={fetchRoster} />;

  return (
    <div>
      <PageHeader
        title="Student Management Roster"
        subtitle="Manage enrolled students across your authorized classes, view academic standing, and update student profiles."
        actions={
          <Button size="sm" variant="secondary" onClick={fetchRoster}>
            <RefreshCw size={14} /> Refresh Roster
          </Button>
        }
      />

      {successMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            background: 'var(--success-light, #dcfce7)',
            color: 'var(--success, #15803d)',
            marginBottom: '1.25rem',
            border: '1px solid #86efac',
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by student name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--card-bg)',
                fontSize: '0.9rem',
              }}
            />
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>

          {/* Filter by Course */}
          <div style={{ flex: '0 1 220px' }}>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--card-bg)',
                fontSize: '0.9rem',
              }}
            >
              <option value="ALL">All Assigned Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Risk Standing */}
          <div style={{ flex: '0 1 180px' }}>
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--card-bg)',
                fontSize: '0.9rem',
              }}
            >
              <option value="ALL">All Standings</option>
              <option value="AT_RISK">At-Risk Only</option>
              <option value="GOOD_STANDING">Good Standing Only</option>
            </select>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            Showing <strong>{filteredStudents.length}</strong> of {students.length} students
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        keyField="id"
        emptyMessage="No students match the selected filter criteria."
      />

      {/* Details View Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Student Academic Profile: ${selectedStudentDetails?.firstName} ${selectedStudentDetails?.lastName}`}
        maxWidth={620}
        footer={
          <Button variant="secondary" onClick={() => setDetailsModalOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedStudentDetails && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Identity Banner */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: 'var(--bg-main, #f8fafc)',
                borderRadius: '10px',
                border: '1px solid var(--border)',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                  {selectedStudentDetails.firstName} {selectedStudentDetails.lastName}
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Student ID: #{selectedStudentDetails.id} | @{selectedStudentDetails.userName}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                  <Mail size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  {selectedStudentDetails.email}
                </div>
              </div>
              <span
                className={`badge ${
                  selectedStudentDetails.isAtRisk ? 'badge-error' : 'badge-success'
                }`}
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
              >
                {selectedStudentDetails.riskStatus || (selectedStudentDetails.isAtRisk ? 'At-Risk' : 'Good Standing')}
              </span>
            </div>

            {/* Metrics Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Assessment Average
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color:
                      selectedStudentDetails.average !== 'N/A' && Number(selectedStudentDetails.average) < 60
                        ? 'var(--error)'
                        : 'var(--primary)',
                    marginTop: '0.25rem',
                  }}
                >
                  {selectedStudentDetails.average !== undefined ? `${selectedStudentDetails.average}%` : 'N/A'}
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Class Attendance Rate
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color:
                      selectedStudentDetails.attendancePercentage !== 'N/A' &&
                      Number(selectedStudentDetails.attendancePercentage) < 75
                        ? 'var(--error)'
                        : '#0f766e',
                    marginTop: '0.25rem',
                  }}
                >
                  {selectedStudentDetails.attendancePercentage !== undefined
                    ? `${selectedStudentDetails.attendancePercentage}%`
                    : 'N/A'}
                </div>
              </div>
            </div>

            {/* Enrolled Courses & Grades */}
            <div>
              <h5 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Enrolled Classes & Grades
              </h5>
              {selectedStudentDetails.courses && selectedStudentDetails.courses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedStudentDetails.courses.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: 'var(--bg-main, #f8fafc)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <span className="badge badge-info" style={{ marginRight: '0.5rem' }}>
                          {c.code}
                        </span>
                        <strong>{c.name}</strong>
                      </div>
                      <div style={{ fontSize: '0.85rem' }}>
                        Marks: G1: <strong>{c.gradeOne !== -1 ? `${c.gradeOne}` : '-'}</strong> | G2:{' '}
                        <strong>{c.gradeTwo !== -1 ? `${c.gradeTwo}` : '-'}</strong> | G3:{' '}
                        <strong>{c.gradeThree !== -1 ? `${c.gradeThree}` : '-'}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Enrolled in assigned course curriculum.</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Student Modal (Phase 3.B) */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Student Profile: ${editingStudent?.firstName} ${editingStudent?.lastName}`}
        maxWidth={520}
      >
        <form onSubmit={handleSaveStudent}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Faculty members may update permitted student identity fields. Protected registration credentials, roles, and course records remain institutional.
          </p>

          {formErrors.submit && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#dc2626',
                marginBottom: '1rem',
                fontSize: '0.85rem',
              }}
            >
              {formErrors.submit}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                First Name *
              </label>
              <input
                type="text"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  border: formErrors.firstName ? '1px solid var(--error)' : '1px solid var(--border)',
                  background: 'var(--card-bg)',
                }}
              />
              {formErrors.firstName && (
                <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
                  {formErrors.firstName}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Last Name *
              </label>
              <input
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  border: formErrors.lastName ? '1px solid var(--error)' : '1px solid var(--border)',
                  background: 'var(--card-bg)',
                }}
              />
              {formErrors.lastName && (
                <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
                  {formErrors.lastName}
                </span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Email Address *
            </label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '8px',
                border: formErrors.email ? '1px solid var(--error)' : '1px solid var(--border)',
                background: 'var(--card-bg)',
              }}
            />
            {formErrors.email && (
              <span style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
                {formErrors.email}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherStudents;
