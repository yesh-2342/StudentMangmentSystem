package com.Studentmangment.studentmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Studentmangment.studentmanagement.entity.InterventionCase;

public interface InterventionCaseRepository extends JpaRepository<InterventionCase, Integer> {

    List<InterventionCase> findByStudentIdOrderByUpdatedAtDesc(int studentId);

    List<InterventionCase> findByTeacherIdOrderByUpdatedAtDesc(int teacherId);

    List<InterventionCase> findAllByOrderByUpdatedAtDesc();
}
