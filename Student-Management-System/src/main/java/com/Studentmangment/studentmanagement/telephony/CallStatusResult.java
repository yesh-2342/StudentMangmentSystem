package com.Studentmangment.studentmanagement.telephony;

public class CallStatusResult {
    private final String providerCallSid;
    private final String status;
    private final Integer durationSeconds;
    private final String error;

    public CallStatusResult(String providerCallSid, String status, Integer durationSeconds, String error) {
        this.providerCallSid = providerCallSid;
        this.status = status;
        this.durationSeconds = durationSeconds;
        this.error = error;
    }

    public String getProviderCallSid() { return providerCallSid; }
    public String getStatus() { return status; }
    public Integer getDurationSeconds() { return durationSeconds; }
    public String getError() { return error; }
}
