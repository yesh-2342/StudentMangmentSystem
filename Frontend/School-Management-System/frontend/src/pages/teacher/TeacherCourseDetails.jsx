import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, FileText, Plus, Trash2, Edit2, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import teacherService from '../../services/teacherService';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const TeacherCourseDetails = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ name: '', description: '', dueDate: '' });
  const [savingAssignment, setSavingAssignment] = useState(false);

  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradesForm, setGradesForm] = useState({ gradeOne: '', gradeTwo: '', gradeThree: '' });
  const [savingGrades, setSavingGrades] = useState(false);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusList, setStatusList] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [selectedAssignmentName, setSelectedAssignmentName] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, assignmentId: null });

  const fetchCourseData = async () => {
    if (!user?.id || !courseId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await teacherService.getCourseDetails(user.id, courseId);
      setCourseData(data);
    } catch (err) {
      setError('Unable to load course management details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [user?.id, courseId]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignment.name || !newAssignment.dueDate) {
      alert('Please provide assignment name and due date.');
      return;
    }
    setSavingAssignment(true);
    try {
      await teacherService.addAssignment(user.id, courseId, newAssignment);
      setAssignmentModalOpen(false);
      setNewAssignment({ name: '', description: '', dueDate: '' });
      fetchCourseData();
    } catch (err) {
      alert('Failed to create assignment.');
    } finally {
      setSavingAssignment(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!deleteConfirm.assignmentId) return;
    try {
      await teacherService.deleteAssignment(user.id, courseId, deleteConfirm.assignmentId);
      setDeleteConfirm({ open: false, assignmentId: null });
      fetchCourseData();
    } catch (err) {
      alert('Failed to delete assignment.');
    }
  };

  const openGradeEdit = (student) => {
    setSelectedStudent(student);
    setGradesForm({
      gradeOne: student.gradeOne !== -1 ? String(student.gradeOne) : '',
      gradeTwo: student.gradeTwo !== -1 ? String(student.gradeTwo) : '',
      gradeThree: student.gradeThree !== -1 ? String(student.gradeThree) : '',
    });
    setGradeModalOpen(true);
  };

  const handleSaveGrades = async (e) => {
    e.preventDefault();
    if (!selectedStudent?.gradeDetailsId) return;
    setSavingGrades(true);
    try {
      await teacherService.modifyGrades(user.id, courseId, selectedStudent.gradeDetailsId, {
        gradeOne: gradesForm.gradeOne !== '' ? parseInt(gradesForm.gradeOne, 10) : -1,
        gradeTwo: gradesForm.gradeTwo !== '' ? parseInt(gradesForm.gradeTwo, 10) : -1,
        gradeThree: gradesForm.gradeThree !== '' ? parseInt(gradesForm.gradeThree, 10) : -1,
      });
      setGradeModalOpen(false);
      fetchCourseData();
    } catch (err) {
      alert('Failed to save student grades.');
    } finally {
      setSavingGrades(false);
    }
  };

  const openAssignmentStatus = async (assignment) => {
    setSelectedAssignmentName(assignment.name);
    setStatusModalOpen(true);
    setStatusLoading(true);
    try {
      const data = await teacherService.getAssignmentStatus(user.id, courseId, assignment.id);
      setStatusList(data);
    } catch (err) {
      setStatusList([]);
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading course management console..." />;
  if (error) return <ErrorState description={error} onRetry={fetchCourseData} />;
  if (!courseData) return <EmptyState title="Course Not Found" description="Could not load course." />;

  const formatScore = (val) => (val !== null && val !== undefined && val !== -1 ? `${val}%` : '-');

  const studentColumns = [
    {
      header: 'Student Name',
      key: 'firstName',
      render: (_, row) => <strong>{row.firstName} {row.lastName}</strong>,
    },
    {
      header: 'Email',
      key: 'email',
    },
    {
      header: 'Midterm 1',
      key: 'gradeOne',
      render: (val) => formatScore(val),
    },
    {
      header: 'Midterm 2',
      key: 'gradeTwo',
      render: (val) => formatScore(val),
    },
    {
      header: 'Final Exam',
      key: 'gradeThree',
      render: (val) => formatScore(val),
    },
    {
      header: 'Average',
      key: 'average',
      render: (val) => <span className="badge badge-info">{val !== 'N/A' ? `${val}%` : '-'}</span>,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <Button variant="secondary" size="sm" onClick={() => openGradeEdit(row)}>
          <Edit2 size={14} /> Edit Grades
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/teacher/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to My Courses
        </Link>
      </div>

      <PageHeader
        title={`${courseData.courseName} (${courseData.courseCode})`}
        subtitle={`Enrolled Students: ${courseData.students?.length || 0} | Total Assignments: ${courseData.assignments?.length || 0}`}
        actions={
          <Button variant="primary" onClick={() => setAssignmentModalOpen(true)}>
            <Plus size={16} /> Add Assignment
          </Button>
        }
      />

      {/* Enrolled Students & Gradebook Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>
          Class Roster & Gradebook
        </h3>
        <DataTable
          columns={studentColumns}
          data={courseData.students || []}
          keyField="studentId"
          emptyMessage="No students are enrolled in this course yet."
        />
      </div>

      {/* Assignments Section */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>
          Course Assignments
        </h3>

        {courseData.assignments && courseData.assignments.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {courseData.assignments.map((a) => (
              <div key={a.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{a.name}</h4>
                  <span className="badge badge-warning">
                    <Clock size={12} /> {a.daysRemaining}d left
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {a.description || 'No instructions provided.'}
                </p>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Due Date: <strong>{a.dueDate}</strong>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button variant="secondary" size="sm" onClick={() => openAssignmentStatus(a)}>
                    Submission Status
                  </Button>
                  <button
                    className="btn-icon"
                    style={{ color: 'var(--error)' }}
                    onClick={() => setDeleteConfirm({ open: true, assignmentId: a.id })}
                    title="Delete Assignment"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No Assignments Yet"
            description="Create your first assignment for this class to evaluate student coursework."
            actionLabel="Add Assignment"
            onAction={() => setAssignmentModalOpen(true)}
          />
        )}
      </div>

      {/* Modal: Add Assignment */}
      <Modal
        isOpen={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        title="Add Course Assignment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignmentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateAssignment} loading={savingAssignment}>
              Save Assignment
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateAssignment}>
          <Input
            id="assignName"
            label="Assignment Title"
            value={newAssignment.name}
            onChange={(e) => setNewAssignment({ ...newAssignment, name: e.target.value })}
            placeholder="e.g. Midterm Project Part 1"
            required
          />
          <div className="form-group">
            <label className="form-label">Instructions & Details</label>
            <textarea
              rows={3}
              className="form-textarea"
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
              placeholder="Describe tasks, rubrics, and submission requirements..."
            />
          </div>
          <Input
            id="assignDue"
            label="Due Date"
            type="date"
            value={newAssignment.dueDate}
            onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
            required
          />
        </form>
      </Modal>

      {/* Modal: Edit Grades */}
      <Modal
        isOpen={gradeModalOpen}
        onClose={() => setGradeModalOpen(false)}
        title={`Edit Grades: ${selectedStudent?.firstName} ${selectedStudent?.lastName}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setGradeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveGrades} loading={savingGrades}>
              Update Grades
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveGrades}>
          <Input
            id="gradeOne"
            label="Midterm Exam 1 (0 - 100)"
            type="number"
            min="0"
            max="100"
            value={gradesForm.gradeOne}
            onChange={(e) => setGradesForm({ ...gradesForm, gradeOne: e.target.value })}
            placeholder="e.g. 85"
          />
          <Input
            id="gradeTwo"
            label="Midterm Exam 2 (0 - 100)"
            type="number"
            min="0"
            max="100"
            value={gradesForm.gradeTwo}
            onChange={(e) => setGradesForm({ ...gradesForm, gradeTwo: e.target.value })}
            placeholder="e.g. 90"
          />
          <Input
            id="gradeThree"
            label="Final Examination (0 - 100)"
            type="number"
            min="0"
            max="100"
            value={gradesForm.gradeThree}
            onChange={(e) => setGradesForm({ ...gradesForm, gradeThree: e.target.value })}
            placeholder="e.g. 95"
          />
        </form>
      </Modal>

      {/* Modal: Assignment Status */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Status: ${selectedAssignmentName}`}
        footer={
          <Button variant="secondary" onClick={() => setStatusModalOpen(false)}>
            Close
          </Button>
        }
      >
        {statusLoading ? (
          <LoadingSpinner message="Loading submissions..." />
        ) : (
          <DataTable
            columns={[
              { header: 'Student', key: 'studentName' },
              { header: 'Email', key: 'email' },
              {
                header: 'Status',
                key: 'status',
                render: (val) => (
                  <span className={`badge ${val === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                    {val === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {val === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                ),
              },
            ]}
            data={statusList}
            keyField="studentId"
            emptyMessage="No student statuses found."
          />
        )}
      </Modal>

      {/* Confirm Assignment Deletion */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, assignmentId: null })}
        onConfirm={handleDeleteAssignment}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? All student submission records for this assignment will also be removed."
      />
    </div>
  );
};

export default TeacherCourseDetails;
