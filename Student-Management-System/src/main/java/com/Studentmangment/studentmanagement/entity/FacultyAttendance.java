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
    name = "faculty_attendance",
    uniqueConstraints = @UniqueConstraint(columnNames = { "teacher_id", "session_date" })
)
public class FacultyAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "teacher_id", nullable = false)
    private int teacherId;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // PRESENT, ABSENT, LATE, ON_LEAVE

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "notes", length = 255)
    private String notes;

    @Column(name = "recorded_by", length = 100)
    private String recordedBy;

    public FacultyAttendance() {}

    public FacultyAttendance(int teacherId, LocalDate sessionDate, String status, String department, String notes, String recordedBy) {
        this.teacherId = teacherId;
        this.sessionDate = sessionDate;
        this.status = status;
        this.department = department;
        this.notes = notes;
        this.recordedBy = recordedBy;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(int teacherId) {
        this.teacherId = teacherId;
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

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getRecordedBy() {
        return recordedBy;
    }

    public void setRecordedBy(String recordedBy) {
        this.recordedBy = recordedBy;
    }
}
