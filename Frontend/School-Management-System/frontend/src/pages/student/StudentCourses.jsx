import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import studentService from '../../services/studentService';
import PageHeader from '../../components/layout/PageHeader';
import CourseCard from '../../components/ui/CourseCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const StudentCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getCourses(user.id);
      setCourses(data);
    } catch (err) {
      setError('Unable to load your enrolled courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  if (loading) return <LoadingSpinner message="Loading your courses..." />;
  if (error) return <ErrorState description={error} onRetry={fetchCourses} />;

  return (
    <div>
      <PageHeader
        title="My Enrolled Courses"
        subtitle="Manage your current curriculum, professors, assignments, and exam grades."
      />

      {courses && courses.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              linkTo={`/student/courses/${course.id}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No Courses Enrolled"
          description="You are not currently registered for any academic courses."
        />
      )}
    </div>
  );
};

export default StudentCourses;
