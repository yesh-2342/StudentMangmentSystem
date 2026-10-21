package com.Studentmangment.studentmanagement.dto;

import java.time.LocalDateTime;

public class ParentContactDto {
    private int id;
    private int studentId;
    private String guardianName;
    private String relationship;
    private String phoneNumber;
    private String email;
    private String preferredLanguage;
    private String consentStatus;
    private LocalDateTime optOutDate;
    private LocalDateTime lastContactedAt;
    private String notes;

    public ParentContactDto() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getGuardianName() { return guardianName; }
    public void setGuardianName(String guardianName) { this.guardianName = guardianName; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }

    public String getConsentStatus() { return consentStatus; }
    public void setConsentStatus(String consentStatus) { this.consentStatus = consentStatus; }

    public LocalDateTime getOptOutDate() { return optOutDate; }
    public void setOptOutDate(LocalDateTime optOutDate) { this.optOutDate = optOutDate; }

    public LocalDateTime getLastContactedAt() { return lastContactedAt; }
    public void setLastContactedAt(LocalDateTime lastContactedAt) { this.lastContactedAt = lastContactedAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
