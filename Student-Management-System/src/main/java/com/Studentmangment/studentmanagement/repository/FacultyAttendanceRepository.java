package com.Studentmangment.studentmanagement.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Studentmangment.studentmanagement.entity.FacultyAttendance;

@Repository
public interface FacultyAttendanceRepository extends JpaRepository<FacultyAttendance, Integer> {
    List<FacultyAttendance> findByTeacherIdOrderBySessionDateDesc(int teacherId);
    List<FacultyAttendance> findBySessionDateOrderByTeacherIdAsc(LocalDate sessionDate);
    List<FacultyAttendance> findAllByOrderBySessionDateDesc();
    Optional<FacultyAttendance> findByTeacherIdAndSessionDate(int teacherId, LocalDate sessionDate);
}
