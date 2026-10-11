package com.Studentmangment.studentmanagement.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Studentmangment.studentmanagement.entity.AttendanceRecord;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Integer> {
    List<AttendanceRecord> findByStudentIdOrderBySessionDateDesc(int studentId);
    List<AttendanceRecord> findByCourseIdOrderBySessionDateDesc(int courseId);
    List<AttendanceRecord> findByStudentIdAndCourseId(int studentId, int courseId);
    Optional<AttendanceRecord> findByStudentIdAndCourseIdAndSessionDate(int studentId, int courseId, LocalDate sessionDate);
    Optional<AttendanceRecord> findBySeedKey(String seedKey);
}
