import React, { useEffect, useState } from 'react';
import { Users, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import teacherService from '../../services/teacherService';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const TeacherStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await teacherService.getStudents(user.id);
      setStudents(data);
    } catch (err) {
      setError('Unable to load student roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user?.id]);

  const columns = [
    {
      header: 'ID',
      key: 'id',
      width: '80px',
    },
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
    {
      header: 'Email Address',
      key: 'email',
      render: (val) => (
        <a href={`mailto:${val}`} style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Mail size={14} /> {val}
        </a>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading enrolled students..." />;
  if (error) return <ErrorState description={error} onRetry={fetchStudents} />;

  return (
    <div>
      <PageHeader
        title="Enrolled Students Roster"
        subtitle="Directory of all active students across your assigned academic classes."
      />

      <DataTable
        columns={columns}
        data={students}
        keyField="id"
        emptyMessage="No students are currently enrolled in any of your courses."
      />
    </div>
  );
};

export default TeacherStudents;
