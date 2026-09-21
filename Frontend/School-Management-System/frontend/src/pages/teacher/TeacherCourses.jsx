import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import teacherService from '../../services/teacherService';
import PageHeader from '../../components/layout/PageHeader';
import CourseCard from '../../components/ui/CourseCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const TeacherCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await teacherService.getCourses(user.id);
      setCourses(data);
    } catch (err) {
      setError('Unable to load assigned courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  if (loading) return <LoadingSpinner message="Loading courses..." />;
  if (error) return <ErrorState description={error} onRetry={fetchCourses} />;

  return (
    <div>
      <PageHeader
        title="My Courses"
        subtitle="View and manage the courses you are currently teaching."
      />

      {courses && courses.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={{
                ...course,
                totalAssignments: `${course.totalAssignments} Students Enrolled`,
              }}
              linkTo={`/teacher/courses/${course.id}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No Courses Found"
          description="You do not have any assigned courses yet."
        />
      )}
    </div>
  );
};

export default TeacherCourses;
