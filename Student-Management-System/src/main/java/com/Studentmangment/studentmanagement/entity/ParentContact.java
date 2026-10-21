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
@Table(name = "parent_contacts", indexes = {
    @Index(name = "idx_parent_student_id", columnList = "student_id"),
    @Index(name = "idx_parent_phone", columnList = "phone_number")
})
public class ParentContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "student_id", nullable = false)
    private int studentId;

    @Column(name = "guardian_name", nullable = false, length = 150)
    private String guardianName;

    @Column(name = "relationship", nullable = false, length = 50)
    private String relationship; // FATHER, MOTHER, GUARDIAN

    @Column(name = "phone_number", nullable = false, length = 30)
    private String phoneNumber;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "preferred_language", length = 30)
    private String preferredLanguage; // en-IN, hi-IN, te-IN, ta-IN

    @Column(name = "consent_status", nullable = false, length = 30)
    private String consentStatus; // CONSENTED, PENDING, OPTED_OUT

    @Column(name = "opt_out_date")
    private LocalDateTime optOutDate;

    @Column(name = "last_contacted_at")
    private LocalDateTime lastContactedAt;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public ParentContact() {}

    public ParentContact(int studentId, String guardianName, String relationship, String phoneNumber,
                         String email, String preferredLanguage, String consentStatus) {
        this.studentId = studentId;
        this.guardianName = guardianName;
        this.relationship = relationship;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.preferredLanguage = preferredLanguage != null ? preferredLanguage : "en-IN";
        this.consentStatus = consentStatus != null ? consentStatus : "CONSENTED";
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (consentStatus == null || consentStatus.trim().isEmpty()) {
            consentStatus = "CONSENTED";
        }
        if (preferredLanguage == null || preferredLanguage.trim().isEmpty()) {
            preferredLanguage = "en-IN";
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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
