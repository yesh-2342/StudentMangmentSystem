package com.Studentmangment.studentmanagement.dto;

import java.time.LocalDate;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class InterventionCaseRequestDto {

    @NotNull(message = "studentId is required")
    private Integer studentId;

    private Integer teacherId;

    @NotBlank(message = "reason is required")
    @Size(max = 500, message = "reason must be 500 characters or fewer")
    private String reason;

    @NotBlank(message = "actionPlan is required")
    @Size(max = 1000, message = "actionPlan must be 1000 characters or fewer")
    private String actionPlan;

    @Size(max = 40, message = "status must be 40 characters or fewer")
    private String status;

    private LocalDate followUpDate;

    @Size(max = 1000, message = "outcome must be 1000 characters or fewer")
    private String outcome;

    @Size(max = 1500, message = "staffNotes must be 1500 characters or fewer")
    private String staffNotes;

    public Integer getStudentId() {
        return studentId;
    }

    public void setStudentId(Integer studentId) {
        this.studentId = studentId;
    }

    public Integer getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Integer teacherId) {
        this.teacherId = teacherId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getActionPlan() {
        return actionPlan;
    }

    public void setActionPlan(String actionPlan) {
        this.actionPlan = actionPlan;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(LocalDate followUpDate) {
        this.followUpDate = followUpDate;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public String getStaffNotes() {
        return staffNotes;
    }

    public void setStaffNotes(String staffNotes) {
        this.staffNotes = staffNotes;
    }
}
