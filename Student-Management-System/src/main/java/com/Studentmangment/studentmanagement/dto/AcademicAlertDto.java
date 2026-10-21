package com.Studentmangment.studentmanagement.dto;

import java.time.LocalDateTime;

public class AcademicAlertDto {
    private int id;
    private int studentId;
    private String studentName;
    private String studentEmail;
    private Integer courseId;
    private String courseName;
    private String riskLevel;
    private String riskFactors;
    private Double attendancePercent;
    private Double gradeAverage;
    private Integer missingAssignments;
    private String status;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private String recommendedAction;
    private String scriptPreview;
    private LocalDateTime createdAt;

    // Contact and eligibility context
    private String guardianName;
    private String guardianPhone;
    private String guardianRelationship;
    private String consentStatus;
    private LocalDateTime lastContactedAt;
    private boolean eligibleForCall;
    private String ineligibilityReason;

    public AcademicAlertDto() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

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

    public String getGuardianName() { return guardianName; }
    public void setGuardianName(String guardianName) { this.guardianName = guardianName; }

    public String getGuardianPhone() { return guardianPhone; }
    public void setGuardianPhone(String guardianPhone) { this.guardianPhone = guardianPhone; }

    public String getGuardianRelationship() { return guardianRelationship; }
    public void setGuardianRelationship(String guardianRelationship) { this.guardianRelationship = guardianRelationship; }

    public String getConsentStatus() { return consentStatus; }
    public void setConsentStatus(String consentStatus) { this.consentStatus = consentStatus; }

    public LocalDateTime getLastContactedAt() { return lastContactedAt; }
    public void setLastContactedAt(LocalDateTime lastContactedAt) { this.lastContactedAt = lastContactedAt; }

    public boolean isEligibleForCall() { return eligibleForCall; }
    public void setEligibleForCall(boolean eligibleForCall) { this.eligibleForCall = eligibleForCall; }

    public String getIneligibilityReason() { return ineligibilityReason; }
    public void setIneligibilityReason(String ineligibilityReason) { this.ineligibilityReason = ineligibilityReason; }
}
