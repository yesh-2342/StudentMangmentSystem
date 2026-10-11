package com.Studentmangment.studentmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Studentmangment.studentmanagement.entity.FacultyAvailability;

public interface FacultyAvailabilityRepository extends JpaRepository<FacultyAvailability, Integer> {
    List<FacultyAvailability> findByTeacherIdOrderByDayOfWeekAsc(int teacherId);
    List<FacultyAvailability> findAllByOrderByTeacherIdAscDayOfWeekAsc();
    Optional<FacultyAvailability> findBySeedKey(String seedKey);
}
