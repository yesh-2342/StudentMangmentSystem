package com.Studentmangment.studentmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Studentmangment.studentmanagement.entity.AcademicNotification;

public interface AcademicNotificationRepository extends JpaRepository<AcademicNotification, Integer> {
    List<AcademicNotification> findByRecipientRoleAndRecipientUserIdOrderByCreatedAtDesc(String recipientRole, Integer recipientUserId);
    List<AcademicNotification> findByRecipientRoleOrderByCreatedAtDesc(String recipientRole);
    Optional<AcademicNotification> findBySeedKey(String seedKey);
}
