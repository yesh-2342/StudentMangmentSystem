package com.Studentmangment.studentmanagement.telephony;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Collections;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.Studentmangment.studentmanagement.entity.ParentCallRecord;

@Component("exotelTelephonyProvider")
public class ExotelTelephonyProvider implements TelephonyProvider {

    private static final Logger logger = LoggerFactory.getLogger(ExotelTelephonyProvider.class);

    @Value("${telephony.exotel.enabled:false}")
    private boolean enabled;

    @Value("${telephony.exotel.account-sid:}")
    private String accountSid;

    @Value("${telephony.exotel.api-key:}")
    private String apiKey;

    @Value("${telephony.exotel.api-token:}")
    private String apiToken;

    @Value("${telephony.exotel.caller-id:}")
    private String callerId;

    @Value("${telephony.exotel.subdomain:api.exotel.com}")
    private String subdomain;

    @Value("${telephony.webhook.secret:sms-telephony-secret-token}")
    private String webhookSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String getProviderName() {
        return "EXOTEL";
    }

    @Override
    public boolean isAvailable() {
        return enabled && accountSid != null && !accountSid.trim().isEmpty()
                && apiKey != null && !apiKey.trim().isEmpty()
                && apiToken != null && !apiToken.trim().isEmpty()
                && callerId != null && !callerId.trim().isEmpty();
    }

    @Override
    public CallInitiationResult initiateCall(ParentCallRecord callRecord, String script) {
        if (!isAvailable()) {
            return CallInitiationResult.failed("Exotel provider is not configured or disabled. Check EXOTEL_ACCOUNT_SID, EXOTEL_API_KEY, and EXOTEL_CALLER_ID.");
        }

        try {
            String url = String.format("https://%s/v1/Accounts/%s/Calls/connect.json", subdomain, accountSid);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            String auth = apiKey + ":" + apiToken;
            byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes(StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + new String(encodedAuth, StandardCharsets.UTF_8));

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("From", sanitizePhoneNumber(callRecord.getPhoneNumber()));
            body.add("CallerId", callerId);
            body.add("CallType", "trans");
            body.add("StatusCallback", "/api/telephony/webhooks/status");
            body.add("CustomField", callRecord.getIdempotencyKey());

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> callData = (Map<?, ?>) response.getBody().get("Call");
                String sid = callData != null ? String.valueOf(callData.get("Sid")) : "EXO-" + System.currentTimeMillis();
                String status = callData != null ? String.valueOf(callData.get("Status")) : "QUEUED";
                logger.info("Exotel call initiated successfully: sid={}, status={}", sid, status);
                return CallInitiationResult.ok(sid, status);
            } else {
                return CallInitiationResult.failed("Provider returned status code: " + response.getStatusCodeValue());
            }
        } catch (Exception ex) {
            logger.error("Failed to connect to Exotel API: {}", ex.getMessage());
            return CallInitiationResult.failed("Exotel API error: " + ex.getMessage());
        }
    }

    @Override
    public CallStatusResult checkCallStatus(String providerCallSid) {
        if (!isAvailable()) {
            return new CallStatusResult(providerCallSid, "UNKNOWN", null, "Provider not active");
        }
        try {
            String url = String.format("https://%s/v1/Accounts/%s/Calls/%s.json", subdomain, accountSid, providerCallSid);
            HttpHeaders headers = new HttpHeaders();
            String auth = apiKey + ":" + apiToken;
            byte[] encodedAuth = Base64.getEncoder().encode(auth.getBytes(StandardCharsets.UTF_8));
            headers.set("Authorization", "Basic " + new String(encodedAuth, StandardCharsets.UTF_8));

            HttpEntity<?> request = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<?, ?> callData = (Map<?, ?>) response.getBody().get("Call");
                String status = callData != null ? String.valueOf(callData.get("Status")) : "UNKNOWN";
                Object dur = callData != null ? callData.get("Duration") : null;
                Integer duration = dur != null ? Integer.parseInt(dur.toString()) : null;
                return new CallStatusResult(providerCallSid, status, duration, null);
            }
        } catch (Exception ex) {
            logger.warn("Exotel status check failed: {}", ex.getMessage());
        }
        return new CallStatusResult(providerCallSid, "UNKNOWN", null, "Failed to retrieve status");
    }

    @Override
    public WebhookProcessingResult handleStatusWebhook(Map<String, String> payload, String signatureHeader) {
        if (!verifyWebhookSignature(payload, signatureHeader)) {
            logger.warn("Exotel webhook signature verification failed!");
            return WebhookProcessingResult.invalid("Invalid webhook signature or unauthorized source.");
        }

        String sid = payload.getOrDefault("CallSid", payload.getOrDefault("Sid", "UNKNOWN"));
        String status = payload.getOrDefault("Status", payload.getOrDefault("CallStatus", "COMPLETED"));
        logger.info("Exotel status webhook verified: sid={}, status={}", sid, status);
        return WebhookProcessingResult.ok(sid, status, "{\"status\":\"success\"}");
    }

    @Override
    public WebhookProcessingResult handleVoiceWebhook(Map<String, String> payload, String signatureHeader) {
        if (!verifyWebhookSignature(payload, signatureHeader)) {
            return WebhookProcessingResult.invalid("Invalid webhook signature.");
        }
        String sid = payload.getOrDefault("CallSid", "UNKNOWN");
        // Exotel NCCO or simple voice response format
        String responsePayload = "{\"response\":[{\"say\":\"Hello, this is Project 577 academic alert assistant.\"}]}";
        return WebhookProcessingResult.ok(sid, "IN_PROGRESS", responsePayload);
    }

    public boolean verifyWebhookSignature(Map<String, String> payload, String signatureHeader) {
        // If no secret configured or test mode token matches, accept
        if (webhookSecret == null || webhookSecret.trim().isEmpty() || "sms-telephony-secret-token".equals(webhookSecret)) {
            return true;
        }
        if (signatureHeader == null || signatureHeader.trim().isEmpty()) {
            return false;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            String dataToSign = payload.getOrDefault("CallSid", "") + payload.getOrDefault("Status", "");
            byte[] hmac = mac.doFinal(dataToSign.getBytes(StandardCharsets.UTF_8));
            String expectedSig = Base64.getEncoder().encodeToString(hmac);
            return MessageDigest.isEqual(expectedSig.getBytes(StandardCharsets.UTF_8), signatureHeader.getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            logger.error("Signature verification exception: {}", ex.getMessage());
            return false;
        }
    }

    private String sanitizePhoneNumber(String phone) {
        if (phone == null) return "";
        String clean = phone.replaceAll("[^0-9+]", "");
        if (clean.length() == 10 && !clean.startsWith("+")) {
            return "+91" + clean;
        }
        return clean;
    }
}
