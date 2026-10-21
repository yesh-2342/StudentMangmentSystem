package com.Studentmangment.studentmanagement.telephony;

public class CallInitiationResult {
    private final boolean success;
    private final String providerCallSid;
    private final String status;
    private final String errorMessage;

    public CallInitiationResult(boolean success, String providerCallSid, String status, String errorMessage) {
        this.success = success;
        this.providerCallSid = providerCallSid;
        this.status = status;
        this.errorMessage = errorMessage;
    }

    public static CallInitiationResult ok(String providerCallSid, String status) {
        return new CallInitiationResult(true, providerCallSid, status, null);
    }

    public static CallInitiationResult failed(String errorMessage) {
        return new CallInitiationResult(false, null, "FAILED", errorMessage);
    }

    public boolean isSuccess() { return success; }
    public String getProviderCallSid() { return providerCallSid; }
    public String getStatus() { return status; }
    public String getErrorMessage() { return errorMessage; }
}
