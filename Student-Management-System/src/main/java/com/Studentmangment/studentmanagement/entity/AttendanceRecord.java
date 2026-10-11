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

    @Column(name = "is_demo")
    private Boolean isDemo = false;

    @Column(name = "demo_student_name", length = 120)
    private String demoStudentName;

    @Column(name = "demo_course_name", length = 150)
    private String demoCourseName;

    @Column(name = "class_section", length = 50)
    private String classSection;

    @Column(name = "session_period", length = 50)
    private String sessionPeriod;

    @Column(name = "remarks", length = 255)
    private String remarks;

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

    public Boolean getIsDemo() {
        return isDemo;
    }

    public void setIsDemo(Boolean isDemo) {
        this.isDemo = isDemo;
    }

    public String getDemoStudentName() {
        return demoStudentName;
    }

    public void setDemoStudentName(String demoStudentName) {
        this.demoStudentName = demoStudentName;
    }

    public String getDemoCourseName() {
        return demoCourseName;
    }

    public void setDemoCourseName(String demoCourseName) {
        this.demoCourseName = demoCourseName;
    }

    public String getSeedKey() {
        return seedKey;
    }

    public void setSeedKey(String seedKey) {
        this.seedKey = seedKey;
    }

    public String getClassSection() {
        return classSection;
    }

    public void setClassSection(String classSection) {
        this.classSection = classSection;
    }

    public String getSessionPeriod() {
        return sessionPeriod;
    }

    public void setSessionPeriod(String sessionPeriod) {
        this.sessionPeriod = sessionPeriod;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
