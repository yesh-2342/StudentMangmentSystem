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
@Table(name = "parent_call_records", indexes = {
    @Index(name = "idx_call_student", columnList = "student_id"),
    @Index(name = "idx_call_alert", columnList = "alert_id"),
    @Index(name = "idx_call_status", columnList = "status"),
    @Index(name = "idx_call_idempotency", columnList = "idempotency_key", unique = true),
    @Index(name = "idx_call_provider_sid", columnList = "provider_call_sid")
})
public class ParentCallRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "alert_id")
    private Integer alertId;

    @Column(name = "student_id", nullable = false)
    private int studentId;

    @Column(name = "student_name", nullable = false, length = 150)
    private String studentName;

    @Column(name = "guardian_name", nullable = false, length = 150)
    private String guardianName;

    @Column(name = "relationship", length = 50)
    private String relationship;

    @Column(name = "phone_number", nullable = false, length = 30)
    private String phoneNumber;

    @Column(name = "call_type", nullable = false, length = 30)
    private String callType; // SIMULATED, LIVE_TELEPHONY

    @Column(name = "provider", nullable = false, length = 30)
    private String provider; // SIMULATION, EXOTEL, TWILIO

    @Column(name = "provider_call_sid", length = 100)
    private String providerCallSid;

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 100)
    private String idempotencyKey;

    @Column(name = "status", nullable = false, length = 40)
    private String status; // QUEUED, INITIATED, RINGING, IN_PROGRESS, COMPLETED, FAILED, BUSY, NO_ANSWER, OPTED_OUT

    @Column(name = "initiated_by", nullable = false, length = 100)
    private String initiatedBy;

    @Column(name = "initiated_at", nullable = false)
    private LocalDateTime initiatedAt;

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "identity_verified")
    private Boolean identityVerified;

    @Column(name = "consent_given")
    private Boolean consentGiven;

    @Column(name = "follow_up_requested")
    private Boolean followUpRequested;

    @Column(name = "call_summary", length = 2000)
    private String callSummary;

    @Column(name = "conversation_transcript", length = 5000)
    private String conversationTranscript;

    @Column(name = "language", length = 30)
    private String language;

    @Column(name = "academic_concerns", length = 1000)
    private String academicConcerns;

    @Column(name = "outcome", length = 100)
    private String outcome;

    @Column(name = "follow_up_date")
    private java.time.LocalDate followUpDate;

    @Column(name = "follow_up_notes", length = 1000)
    private String followUpNotes;

    @Column(name = "error_code", length = 50)
    private String errorCode;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public ParentCallRecord() {}

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (initiatedAt == null) {
            initiatedAt = now;
        }
        if (status == null || status.trim().isEmpty()) {
            status = "QUEUED";
        }
        if (callType == null || callType.trim().isEmpty()) {
            callType = "SIMULATED";
        }
        if (provider == null || provider.trim().isEmpty()) {
            provider = "SIMULATION";
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Integer getAlertId() { return alertId; }
    public void setAlertId(Integer alertId) { this.alertId = alertId; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getGuardianName() { return guardianName; }
    public void setGuardianName(String guardianName) { this.guardianName = guardianName; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getCallType() { return callType; }
    public void setCallType(String callType) { this.callType = callType; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getProviderCallSid() { return providerCallSid; }
    public void setProviderCallSid(String providerCallSid) { this.providerCallSid = providerCallSid; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getInitiatedBy() { return initiatedBy; }
    public void setInitiatedBy(String initiatedBy) { this.initiatedBy = initiatedBy; }

    public LocalDateTime getInitiatedAt() { return initiatedAt; }
    public void setInitiatedAt(LocalDateTime initiatedAt) { this.initiatedAt = initiatedAt; }

    public LocalDateTime getAnsweredAt() { return answeredAt; }
    public void setAnsweredAt(LocalDateTime answeredAt) { this.answeredAt = answeredAt; }

    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public Boolean getIdentityVerified() { return identityVerified; }
    public void setIdentityVerified(Boolean identityVerified) { this.identityVerified = identityVerified; }

    public Boolean getConsentGiven() { return consentGiven; }
    public void setConsentGiven(Boolean consentGiven) { this.consentGiven = consentGiven; }

    public Boolean getFollowUpRequested() { return followUpRequested; }
    public void setFollowUpRequested(Boolean followUpRequested) { this.followUpRequested = followUpRequested; }

    public String getCallSummary() { return callSummary; }
    public void setCallSummary(String callSummary) { this.callSummary = callSummary; }

    public String getConversationTranscript() { return conversationTranscript; }
    public void setConversationTranscript(String conversationTranscript) { this.conversationTranscript = conversationTranscript; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getAcademicConcerns() { return academicConcerns; }
    public void setAcademicConcerns(String academicConcerns) { this.academicConcerns = academicConcerns; }

    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }

    public java.time.LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(java.time.LocalDate followUpDate) { this.followUpDate = followUpDate; }

    public String getFollowUpNotes() { return followUpNotes; }
    public void setFollowUpNotes(String followUpNotes) { this.followUpNotes = followUpNotes; }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
