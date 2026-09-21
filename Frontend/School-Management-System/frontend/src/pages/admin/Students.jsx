import React, { useEffect, useState } from 'react';
import { GraduationCap, Trash2, BookOpen, Plus, X } from 'lucide-react';
import adminService from '../../services/adminService';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Manage courses modal
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentCoursesData, setStudentCoursesData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [courseToEnroll, setCourseToEnroll] = useState('');

  // Delete confirm dialog
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, studentId: null, studentName: '' });
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getStudents();
      setStudents(data);
    } catch (err) {
      setError('Unable to load student roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openCourseManager = async (student) => {
    setSelectedStudent(student);
    setCourseModalOpen(true);
    setModalLoading(true);
    try {
      const data = await adminService.getStudentCourses(student.id);
      setStudentCoursesData(data);
    } catch (err) {
      setStudentCoursesData(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEnrollCourse = async () => {
    if (!courseToEnroll || !selectedStudent) return;
    try {
      await adminService.enrollStudent(selectedStudent.id, parseInt(courseToEnroll, 10));
      setCourseToEnroll('');
      const updated = await adminService.getStudentCourses(selectedStudent.id);
      setStudentCoursesData(updated);
      fetchStudents();
    } catch (err) {
      alert('Failed to enroll student in course.');
    }
  };

  const handleRemoveCourse = async (courseId) => {
    if (!selectedStudent) return;
    try {
      await adminService.removeStudentCourse(selectedStudent.id, courseId);
      const updated = await adminService.getStudentCourses(selectedStudent.id);
      setStudentCoursesData(updated);
      fetchStudents();
    } catch (err) {
      alert('Failed to remove student from course.');
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteConfirm.studentId) return;
    setDeleting(true);
    try {
      await adminService.deleteStudent(deleteConfirm.studentId);
      setDeleteConfirm({ open: false, studentId: null, studentName: '' });
      fetchStudents();
    } catch (err) {
      alert('Failed to delete student.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading students..." />;
  if (error) return <ErrorState description={error} onRetry={fetchStudents} />;

  const columns = [
    { header: 'ID', key: 'id', width: '70px' },
    {
      header: 'Student Name',
      key: 'firstName',
      render: (_, row) => <strong>{row.firstName} {row.lastName}</strong>,
    },
    {
      header: 'Username',
      key: 'userName',
      render: (val) => <span className="badge badge-gray">{val}</span>,
    },
    { header: 'Email', key: 'email' },
    {
      header: 'Courses',
      key: 'courseCount',
      render: (val) => <span className="badge badge-info">{val} Courses</span>,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" size="sm" onClick={() => openCourseManager(row)}>
            <BookOpen size={14} /> Courses
          </Button>
          <button
            className="btn-icon"
            style={{ color: 'var(--error)' }}
            onClick={() => setDeleteConfirm({ open: true, studentId: row.id, studentName: `${row.firstName} ${row.lastName}` })}
            title="Delete Student"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Student Management"
        subtitle="Manage student admissions, profiles, and course enrollments."
      />

      <DataTable
        columns={columns}
        data={students}
        keyField="id"
        emptyMessage="No students currently registered in the system."
      />

      {/* Modal: Course Enrollment Manager */}
      <Modal
        isOpen={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        title={`Course Enrollments: ${selectedStudent?.firstName} ${selectedStudent?.lastName}`}
        maxWidth={620}
        footer={
          <Button variant="secondary" onClick={() => setCourseModalOpen(false)}>
            Done
          </Button>
        }
      >
        {modalLoading ? (
          <LoadingSpinner message="Loading enrollment details..." />
        ) : (
          <div>
            <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Enroll in a New Course
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  className="form-select"
                  style={{ flex: 1 }}
                  value={courseToEnroll}
                  onChange={(e) => setCourseToEnroll(e.target.value)}
                >
                  <option value="">Select available course...</option>
                  {studentCoursesData?.availableCourses?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name} ({c.teacherName})
                    </option>
                  ))}
                </select>
                <Button variant="primary" onClick={handleEnrollCourse} disabled={!courseToEnroll}>
                  <Plus size={16} /> Enroll
                </Button>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Currently Enrolled Courses ({studentCoursesData?.enrolledCourses?.length || 0})
            </h4>

            {studentCoursesData?.enrolledCourses && studentCoursesData.enrolledCourses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {studentCoursesData.enrolledCourses.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div>
                      <span className="badge badge-info" style={{ marginRight: '0.5rem' }}>{c.code}</span>
                      <strong style={{ fontSize: '0.9rem' }}>{c.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instructor: {c.teacherName}</div>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => handleRemoveCourse(c.id)}>
                      Drop Course
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Student is not enrolled in any courses.</p>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Student Deletion */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, studentId: null, studentName: '' })}
        onConfirm={handleDeleteStudent}
        loading={deleting}
        title="Delete Student"
        message={`Are you sure you want to delete ${deleteConfirm.studentName}? This will permanently remove their enrollment records, grades, and submissions.`}
      />
    </div>
  );
};

export default Students;
