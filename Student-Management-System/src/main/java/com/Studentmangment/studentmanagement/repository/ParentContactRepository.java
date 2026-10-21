package com.Studentmangment.studentmanagement.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Studentmangment.studentmanagement.entity.ParentContact;

@Repository
public interface ParentContactRepository extends JpaRepository<ParentContact, Integer> {
    Optional<ParentContact> findByStudentId(int studentId);
    Optional<ParentContact> findByPhoneNumber(String phoneNumber);
}
