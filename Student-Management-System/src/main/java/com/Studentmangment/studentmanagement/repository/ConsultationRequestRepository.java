package com.Studentmangment.studentmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Studentmangment.studentmanagement.entity.ConsultationRequest;

public interface ConsultationRequestRepository extends JpaRepository<ConsultationRequest, Integer> {
    List<ConsultationRequest> findByStudentIdOrderByRequestedAtDesc(int studentId);
    List<ConsultationRequest> findByTeacherIdOrderByRequestedAtDesc(int teacherId);
    List<ConsultationRequest> findAllByOrderByRequestedAtDesc();
    Optional<ConsultationRequest> findBySeedKey(String seedKey);
}
