package com.Studentmangment.studentmanagement.entity;

import java.time.LocalDateTime;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;

@Entity
@Table(name = "academic_alerts", indexes = {
    @Index(name = "idx_alert_student", columnList = "student_id"),
    @Index(name = "idx_alert_status", columnList = "status"),
    @Index(name = "idx_alert_risk_level", columnList = "risk_level")
})
public class AcademicAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "student_id", nullable = false)
    private int studentId;

    @Column(name = "course_id")
    private Integer courseId;

    @Column(name = "course_name", length = 150)
    private String courseName;

    @Column(name = "risk_level", nullable = false, length = 20)
    private String riskLevel; // HIGH, MEDIUM, LOW

    @Column(name = "risk_factors", nullable = false, length = 500)
    private String riskFactors;

    @Column(name = "attendance_percent")
    private Double attendancePercent;

    @Column(name = "grade_average")
    private Double gradeAverage;

    @Column(name = "missing_assignments")
    private Integer missingAssignments;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // ELIGIBLE, REVIEWED, CALL_SCHEDULED, CALL_COMPLETED, DISMISSED

    @Column(name = "reviewed_by", length = 100)
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "recommended_action", length = 500)
    private String recommendedAction;

    @Column(name = "script_preview", length = 2000)
    private String scriptPreview;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public AcademicAlert() {}

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null || status.trim().isEmpty()) {
            status = "ELIGIBLE";
        }
        if (riskLevel == null || riskLevel.trim().isEmpty()) {
            riskLevel = "MEDIUM";
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public Integer getCourseId() { return courseId; }
    public void setCourseId(Integer courseId) { this.courseId = courseId; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getRiskFactors() { return riskFactors; }
    public void setRiskFactors(String riskFactors) { this.riskFactors = riskFactors; }

    public Double getAttendancePercent() { return attendancePercent; }
    public void setAttendancePercent(Double attendancePercent) { this.attendancePercent = attendancePercent; }

    public Double getGradeAverage() { return gradeAverage; }
    public void setGradeAverage(Double gradeAverage) { this.gradeAverage = gradeAverage; }

    public Integer getMissingAssignments() { return missingAssignments; }
    public void setMissingAssignments(Integer missingAssignments) { this.missingAssignments = missingAssignments; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public String getScriptPreview() { return scriptPreview; }
    public void setScriptPreview(String scriptPreview) { this.scriptPreview = scriptPreview; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
