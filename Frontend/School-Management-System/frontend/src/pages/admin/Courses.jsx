import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2, Users, UserPlus } from 'lucide-react';
import adminService from '../../services/adminService';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Course Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({ code: '', name: '', teacherId: '' });
  const [creating, setCreating] = useState(false);

  // Manage Course Students Modal
  const [studentsModalOpen, setStudentsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseStudentsData, setCourseStudentsData] = useState(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentToAdd, setStudentToAdd] = useState('');

  // Delete Course
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, courseId: null, courseName: '' });
  const [deleting, setDeleting] = useState(false);

  const fetchCoursesAndTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseData, teacherData] = await Promise.all([
        adminService.getCourses(),
        adminService.getTeachers(),
      ]);
      setCourses(courseData);
      setTeachers(teacherData);
    } catch (err) {
      setError('Unable to load course catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndTeachers();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.code || !courseForm.name || !courseForm.teacherId) {
      alert('Please fill out all fields including the assigned instructor.');
      return;
    }
    setCreating(true);
    try {
      await adminService.createCourse({
        code: courseForm.code,
        name: courseForm.name,
        teacherId: parseInt(courseForm.teacherId, 10),
      });
      setCreateModalOpen(false);
      setCourseForm({ code: '', name: '', teacherId: '' });
      fetchCoursesAndTeachers();
    } catch (err) {
      alert('Failed to create course.');
    } finally {
      setCreating(false);
    }
  };

  const openStudentsManager = async (course) => {
    setSelectedCourse(course);
    setStudentsModalOpen(true);
    setStudentsLoading(true);
    try {
      const data = await adminService.getCourseStudents(course.id);
      setCourseStudentsData(data);
    } catch (err) {
      setCourseStudentsData(null);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!studentToAdd || !selectedCourse) return;
    try {
      await adminService.addStudentToCourse(selectedCourse.id, parseInt(studentToAdd, 10));
      setStudentToAdd('');
      const updated = await adminService.getCourseStudents(selectedCourse.id);
      setCourseStudentsData(updated);
      fetchCoursesAndTeachers();
    } catch (err) {
      alert('Failed to enroll student.');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!selectedCourse) return;
    try {
      await adminService.removeStudentFromCourse(selectedCourse.id, studentId);
      const updated = await adminService.getCourseStudents(selectedCourse.id);
      setCourseStudentsData(updated);
      fetchCoursesAndTeachers();
    } catch (err) {
      alert('Failed to remove student from course.');
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteConfirm.courseId) return;
    setDeleting(true);
    try {
      await adminService.deleteCourse(deleteConfirm.courseId);
      setDeleteConfirm({ open: false, courseId: null, courseName: '' });
      fetchCoursesAndTeachers();
    } catch (err) {
      alert('Failed to delete course.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading course catalog..." />;
  if (error) return <ErrorState description={error} onRetry={fetchCoursesAndTeachers} />;

  const columns = [
    {
      header: 'Code',
      key: 'code',
      render: (val) => <span className="badge badge-info">{val}</span>,
      width: '100px',
    },
    {
      header: 'Course Name',
      key: 'name',
      render: (val) => <strong>{val}</strong>,
    },
    {
      header: 'Assigned Instructor',
      key: 'teacherName',
    },
    {
      header: 'Enrollment',
      key: 'studentCount',
      render: (val) => <span className="badge badge-success">{val} Students</span>,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" size="sm" onClick={() => openStudentsManager(row)}>
            <Users size={14} /> Students
          </Button>
          <button
            className="btn-icon"
            style={{ color: 'var(--error)' }}
            onClick={() => setDeleteConfirm({ open: true, courseId: row.id, courseName: row.name })}
            title="Delete Course"
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
        title="Academic Course Catalog"
        subtitle="Create curriculum courses, assign faculty lecturers, and supervise student enrollments."
        actions={
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} /> Create Course
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={courses}
        keyField="id"
        emptyMessage="No courses registered in the catalog."
      />

      {/* Modal: Create Course */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Course"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateCourse} loading={creating}>
              Create Course
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateCourse}>
          <Input
            id="courseCode"
            label="Course Code"
            placeholder="e.g. CS101"
            value={courseForm.code}
            onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
            required
          />
          <Input
            id="courseName"
            label="Course Title"
            placeholder="e.g. Introduction to Algorithms"
            value={courseForm.name}
            onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
            required
          />
          <Select
            id="teacherId"
            label="Assigned Instructor / Professor"
            value={courseForm.teacherId}
            onChange={(e) => setCourseForm({ ...courseForm, teacherId: e.target.value })}
            options={teachers.map((t) => ({
              value: t.id,
              label: `${t.firstName} ${t.lastName} (@${t.userName})`,
            }))}
            placeholder="Choose an instructor..."
            required
          />
        </form>
      </Modal>

      {/* Modal: Course Students Management */}
      <Modal
        isOpen={studentsModalOpen}
        onClose={() => setStudentsModalOpen(false)}
        title={`Class Roster: ${selectedCourse?.name}`}
        maxWidth={620}
        footer={
          <Button variant="secondary" onClick={() => setStudentsModalOpen(false)}>
            Done
          </Button>
        }
      >
        {studentsLoading ? (
          <LoadingSpinner message="Loading course roster..." />
        ) : (
          <div>
            <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Add Student to this Course
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  className="form-select"
                  style={{ flex: 1 }}
                  value={studentToAdd}
                  onChange={(e) => setStudentToAdd(e.target.value)}
                >
                  <option value="">Select student to enroll...</option>
                  {courseStudentsData?.availableStudents?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} (@{s.userName})
                    </option>
                  ))}
                </select>
                <Button variant="primary" onClick={handleAddStudent} disabled={!studentToAdd}>
                  <UserPlus size={16} /> Add Student
                </Button>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Enrolled Students ({courseStudentsData?.enrolledStudents?.length || 0})
            </h4>

            {courseStudentsData?.enrolledStudents && courseStudentsData.enrolledStudents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {courseStudentsData.enrolledStudents.map((s) => (
                  <div
                    key={s.id}
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
                      <strong style={{ fontSize: '0.9rem' }}>{s.firstName} {s.lastName}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.email}</div>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => handleRemoveStudent(s.id)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No students currently enrolled in this class.</p>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Deletion */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, courseId: null, courseName: '' })}
        onConfirm={handleDeleteCourse}
        loading={deleting}
        title="Delete Course"
        message={`Are you sure you want to delete ${deleteConfirm.courseName}? This will remove the course and all student enrollment records and grades.`}
      />
    </div>
  );
};

export default Courses;
