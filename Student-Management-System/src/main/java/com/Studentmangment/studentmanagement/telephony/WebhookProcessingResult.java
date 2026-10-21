package com.Studentmangment.studentmanagement.telephony;

public class WebhookProcessingResult {
    private final boolean processed;
    private final String providerCallSid;
    private final String newStatus;
    private final String responsePayload;
    private final String error;

    public WebhookProcessingResult(boolean processed, String providerCallSid, String newStatus, String responsePayload, String error) {
        this.processed = processed;
        this.providerCallSid = providerCallSid;
        this.newStatus = newStatus;
        this.responsePayload = responsePayload;
        this.error = error;
    }

    public static WebhookProcessingResult ok(String providerCallSid, String newStatus, String responsePayload) {
        return new WebhookProcessingResult(true, providerCallSid, newStatus, responsePayload, null);
    }

    public static WebhookProcessingResult invalid(String error) {
        return new WebhookProcessingResult(false, null, null, null, error);
    }

    public boolean isProcessed() { return processed; }
    public String getProviderCallSid() { return providerCallSid; }
    public String getNewStatus() { return newStatus; }
    public String getResponsePayload() { return responsePayload; }
    public String getError() { return error; }
}
