package com.Studentmangment.studentmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Studentmangment.studentmanagement.entity.AcademicDoubt;

@Repository
public interface AcademicDoubtRepository extends JpaRepository<AcademicDoubt, Integer> {
    List<AcademicDoubt> findByStudentIdOrderByCreatedAtDesc(int studentId);
    List<AcademicDoubt> findByTeacherIdOrderByCreatedAtDesc(int teacherId);
    List<AcademicDoubt> findByCourseIdOrderByCreatedAtDesc(int courseId);
    List<AcademicDoubt> findAllByOrderByCreatedAtDesc();
}
