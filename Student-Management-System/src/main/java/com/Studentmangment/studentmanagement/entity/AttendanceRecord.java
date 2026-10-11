package com.Studentmangment.studentmanagement.entity;

import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

@Entity
@Table(
    name = "attendance_record",
    uniqueConstraints = @UniqueConstraint(columnNames = { "student_id", "course_id", "session_date" })
)
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "student_id", nullable = false)
    private int studentId;

    @Column(name = "course_id", nullable = false)
    private int courseId;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "recorded_by_teacher_id")
    private Integer recordedByTeacherId;

    @Column(name = "seed_key", length = 160)
    private String seedKey;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getStudentId() {
        return studentId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public int getCourseId() {
        return courseId;
    }

    public void setCourseId(int courseId) {
        this.courseId = courseId;
    }

    public LocalDate getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDate sessionDate) {
        this.sessionDate = sessionDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getRecordedByTeacherId() {
        return recordedByTeacherId;
    }

    public void setRecordedByTeacherId(Integer recordedByTeacherId) {
        this.recordedByTeacherId = recordedByTeacherId;
    }

    public String getSeedKey() {
        return seedKey;
    }

    public void setSeedKey(String seedKey) {
        this.seedKey = seedKey;
    }
}
