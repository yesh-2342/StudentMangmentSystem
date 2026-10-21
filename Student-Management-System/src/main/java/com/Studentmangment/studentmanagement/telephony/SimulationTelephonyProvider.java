package com.Studentmangment.studentmanagement.telephony;

import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.Studentmangment.studentmanagement.entity.ParentCallRecord;

@Component("simulationTelephonyProvider")
public class SimulationTelephonyProvider implements TelephonyProvider {

    private static final Logger logger = LoggerFactory.getLogger(SimulationTelephonyProvider.class);

    @Override
    public String getProviderName() {
        return "SIMULATION";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public CallInitiationResult initiateCall(ParentCallRecord callRecord, String script) {
        String simSid = "SIM-CALL-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        logger.info("[SIMULATION] Initiating zero-cost in-browser voice session for studentId={}, guardianPhone={}, sid={}",
                callRecord.getStudentId(), callRecord.getPhoneNumber(), simSid);
        return CallInitiationResult.ok(simSid, "IN_PROGRESS");
    }

    @Override
    public CallStatusResult checkCallStatus(String providerCallSid) {
        return new CallStatusResult(providerCallSid, "COMPLETED", 95, null);
    }

    @Override
    public WebhookProcessingResult handleStatusWebhook(Map<String, String> payload, String signatureHeader) {
        String sid = payload.getOrDefault("CallSid", payload.getOrDefault("call_sid", "SIM-UNKNOWN"));
        String status = payload.getOrDefault("Status", payload.getOrDefault("status", "COMPLETED"));
        return WebhookProcessingResult.ok(sid, status, "{\"status\":\"acknowledged\",\"provider\":\"SIMULATION\"}");
    }

    @Override
    public WebhookProcessingResult handleVoiceWebhook(Map<String, String> payload, String signatureHeader) {
        String sid = payload.getOrDefault("CallSid", payload.getOrDefault("call_sid", "SIM-UNKNOWN"));
        return WebhookProcessingResult.ok(sid, "IN_PROGRESS", "{\"action\":\"speak\",\"text\":\"Simulated voice response.\"}");
    }
}
