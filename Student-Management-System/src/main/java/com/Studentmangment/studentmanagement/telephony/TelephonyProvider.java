package com.Studentmangment.studentmanagement.telephony;

import java.util.Map;
import com.Studentmangment.studentmanagement.entity.ParentCallRecord;

public interface TelephonyProvider {
    String getProviderName();
    boolean isAvailable();
    CallInitiationResult initiateCall(ParentCallRecord callRecord, String script);
    CallStatusResult checkCallStatus(String providerCallSid);
    WebhookProcessingResult handleStatusWebhook(Map<String, String> payload, String signatureHeader);
    WebhookProcessingResult handleVoiceWebhook(Map<String, String> payload, String signatureHeader);
}
