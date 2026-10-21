package com.Studentmangment.studentmanagement.dto;

public class SimulatedSessionTurnResponseDto {
    private int callId;
    private String replyText;
    private String nextState;
    private boolean completed;
    private boolean followUpRequested;
    private boolean consentGiven;
    private boolean identityVerified;
    private String summary;
    private String aiEngine = "LOCAL_RULE_ENGINE";
    private String detectedIntent;

    public SimulatedSessionTurnResponseDto() {}

    public String getAiEngine() { return aiEngine; }
    public void setAiEngine(String aiEngine) { this.aiEngine = aiEngine; }

    public String getDetectedIntent() { return detectedIntent; }
    public void setDetectedIntent(String detectedIntent) { this.detectedIntent = detectedIntent; }

    public int getCallId() { return callId; }
    public void setCallId(int callId) { this.callId = callId; }

    public String getReplyText() { return replyText; }
    public void setReplyText(String replyText) { this.replyText = replyText; }

    public String getNextState() { return nextState; }
    public void setNextState(String nextState) { this.nextState = nextState; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public boolean isFollowUpRequested() { return followUpRequested; }
    public void setFollowUpRequested(boolean followUpRequested) { this.followUpRequested = followUpRequested; }

    public boolean isConsentGiven() { return consentGiven; }
    public void setConsentGiven(boolean consentGiven) { this.consentGiven = consentGiven; }

    public boolean isIdentityVerified() { return identityVerified; }
    public void setIdentityVerified(boolean identityVerified) { this.identityVerified = identityVerified; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
}
