package com.Studentmangment.studentmanagement.dto;

public class CallInitiationRequestDto {
    private Integer alertId;
    private int studentId;
    private String mode; // SIMULATION, LIVE
    private String customNotes;
    private String idempotencyKey;

    public CallInitiationRequestDto() {}

    public Integer getAlertId() { return alertId; }
    public void setAlertId(Integer alertId) { this.alertId = alertId; }

    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getCustomNotes() { return customNotes; }
    public void setCustomNotes(String customNotes) { this.customNotes = customNotes; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
}
