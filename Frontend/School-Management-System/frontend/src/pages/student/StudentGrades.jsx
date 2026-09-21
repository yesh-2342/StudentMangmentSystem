import React, { useEffect, useState } from 'react';
import { Award, BookOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import studentService from '../../services/studentService';
import PageHeader from '../../components/layout/PageHeader';
import GradeCard from '../../components/ui/GradeCard';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const StudentGrades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGrades = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getGrades(user.id);
      setGrades(data);
    } catch (err) {
      setError('Unable to load your academic transcript.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [user?.id]);

  const formatScore = (val) => (val !== null && val !== undefined && val !== -1 ? `${val}%` : '-');

  const columns = [
    {
      header: 'Course Code',
      key: 'courseCode',
      render: (val) => <span className="badge badge-info">{val}</span>,
    },
    {
      header: 'Course Name',
      key: 'courseName',
      render: (val) => <strong>{val}</strong>,
    },
    {
      header: 'Professor',
      key: 'teacherName',
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
      render: (val) => <strong>{val !== 'N/A' ? `${val}%` : '-'}</strong>,
    },
    {
      header: 'Grade',
      key: 'letterGrade',
      render: (val) => (
        <span className={`badge ${val === 'A' ? 'badge-success' : val === 'F' ? 'badge-danger' : 'badge-warning'}`}>
          {val}
        </span>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading transcript..." />;
  if (error) return <ErrorState description={error} onRetry={fetchGrades} />;

  return (
    <div>
      <PageHeader
        title="Academic Transcript & Grades"
        subtitle="Official breakdown of semester exams, midterm assessments, and overall standing."
      />

      {grades.length > 0 ? (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <DataTable columns={columns} data={grades} keyField="courseId" />
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>
            Course Cards Overview
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {grades.map((g) => (
              <GradeCard key={g.courseId} grade={g} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={Award}
          title="No Grades Available"
          description="Your professors have not published grades for this semester yet."
        />
      )}
    </div>
  );
};

export default StudentGrades;
