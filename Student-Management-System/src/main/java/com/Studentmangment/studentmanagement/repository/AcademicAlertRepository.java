package com.Studentmangment.studentmanagement.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Studentmangment.studentmanagement.entity.AcademicAlert;

@Repository
public interface AcademicAlertRepository extends JpaRepository<AcademicAlert, Integer> {
    List<AcademicAlert> findAllByOrderByCreatedAtDesc();
    List<AcademicAlert> findByStatusOrderByCreatedAtDesc(String status);
    List<AcademicAlert> findByStudentId(int studentId);
    Optional<AcademicAlert> findByStudentIdAndCourseId(int studentId, Integer courseId);
    Optional<AcademicAlert> findByStudentIdAndCourseIdAndStatus(int studentId, Integer courseId, String status);
}
