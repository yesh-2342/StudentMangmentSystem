package com.Studentmangment.studentmanagement.dto;

public class SimulatedSessionTurnRequestDto {
    private int callId;
    private String currentState;
    private String parentInput;
    private String language;

    public SimulatedSessionTurnRequestDto() {}

    public int getCallId() { return callId; }
    public void setCallId(int callId) { this.callId = callId; }

    public String getCurrentState() { return currentState; }
    public void setCurrentState(String currentState) { this.currentState = currentState; }

    public String getParentInput() { return parentInput; }
    public void setParentInput(String parentInput) { this.parentInput = parentInput; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
