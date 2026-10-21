package com.Studentmangment.studentmanagement.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Studentmangment.studentmanagement.entity.ParentCallRecord;

@Repository
public interface ParentCallRecordRepository extends JpaRepository<ParentCallRecord, Integer> {
    List<ParentCallRecord> findAllByOrderByInitiatedAtDesc();
    List<ParentCallRecord> findByAlertIdOrderByInitiatedAtDesc(Integer alertId);
    List<ParentCallRecord> findByStudentIdOrderByInitiatedAtDesc(int studentId);
    List<ParentCallRecord> findByStatusOrderByInitiatedAtDesc(String status);
    List<ParentCallRecord> findByFollowUpRequestedTrueOrderByInitiatedAtDesc();
    Optional<ParentCallRecord> findByProviderCallSid(String providerCallSid);
    Optional<ParentCallRecord> findByIdempotencyKey(String idempotencyKey);
    List<ParentCallRecord> findByStudentIdAndInitiatedAtAfter(int studentId, LocalDateTime after);
    List<ParentCallRecord> findByPhoneNumberAndInitiatedAtAfter(String phoneNumber, LocalDateTime after);
}
