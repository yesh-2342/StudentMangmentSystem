package com.Studentmangment.studentmanagement.dto;

import java.time.LocalDateTime;

public class ParentCallRecordDto {
    private int id;
    private Integer alertId;
    private int studentId;
    private String studentName;
    private String guardianName;
    private String relationship;
    private String phoneNumber;
    private String callType; // SIMULATED, LIVE_TELEPHONY
    private String provider; // SIMULATION, EXOTEL, TWILIO
    private String providerCallSid;
    private String idempotencyKey;
    private String status;
    private String initiatedBy;
    private LocalDateTime initiatedAt;
    private LocalDateTime answeredAt;
    private LocalDateTime endedAt;
    private Integer durationSeconds;
    private Boolean identityVerified;
    private Boolean consentGiven;
    private Boolean followUpRequested;
    private String callSummary;
    private String conversationTranscript;
    private String language;
    private String academicConcerns;
    private String outcome;
    private java.time.LocalDate followUpDate;
    private String followUpNotes;
    private String errorCode;
    private String errorMessage;
    private LocalDateTime createdAt;

    public ParentCallRecordDto() {}

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
}
