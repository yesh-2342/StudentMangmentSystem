package com.Studentmangment.studentmanagement.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Studentmangment.studentmanagement.dto.CallInitiationRequestDto;
import com.Studentmangment.studentmanagement.dto.ParentCallRecordDto;
import com.Studentmangment.studentmanagement.dto.SimulatedSessionTurnRequestDto;
import com.Studentmangment.studentmanagement.dto.SimulatedSessionTurnResponseDto;
import com.Studentmangment.studentmanagement.dto.TelephonyConfigDto;
import com.Studentmangment.studentmanagement.entity.AcademicAlert;
import com.Studentmangment.studentmanagement.entity.ParentCallRecord;
import com.Studentmangment.studentmanagement.entity.ParentContact;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.repository.AcademicAlertRepository;
import com.Studentmangment.studentmanagement.repository.ParentCallRecordRepository;
import com.Studentmangment.studentmanagement.repository.ParentContactRepository;
import com.Studentmangment.studentmanagement.service.CallConsentService.CallEligibilityCheck;
import com.Studentmangment.studentmanagement.telephony.CallInitiationResult;
import com.Studentmangment.studentmanagement.telephony.ExotelTelephonyProvider;
import com.Studentmangment.studentmanagement.telephony.SimulationTelephonyProvider;
import com.Studentmangment.studentmanagement.telephony.TelephonyProvider;
import com.Studentmangment.studentmanagement.telephony.WebhookProcessingResult;

@Service
public class ParentCallServiceImpl implements ParentCallService {

    private static final Logger logger = LoggerFactory.getLogger(ParentCallServiceImpl.class);

    @Autowired
    private StudentService studentService;

    @Autowired
    private AcademicAlertRepository academicAlertRepository;

    @Autowired
    private ParentCallRecordRepository parentCallRecordRepository;

    @Autowired
    private ParentContactRepository parentContactRepository;

    @Autowired
    private CallConsentService callConsentService;

    @Autowired
    private ParentContactService parentContactService;

    @Autowired
    private VoiceAgentService voiceAgentService;

    @Autowired
    private SimulationTelephonyProvider simulationTelephonyProvider;

    @Autowired
    private ExotelTelephonyProvider exotelTelephonyProvider;

    @Override
    @Transactional
    public ParentCallRecordDto initiateCall(CallInitiationRequestDto request, String initiatedBy) {
        Student student = studentService.findByStudentId(request.getStudentId());
        if (student == null) {
            throw new IllegalArgumentException("Student not found with ID: " + request.getStudentId());
        }

        AcademicAlert alert = request.getAlertId() != null
                ? academicAlertRepository.findById(request.getAlertId()).orElse(null)
                : null;

        // Idempotency check
        String idempotencyKey = request.getIdempotencyKey();
        if (idempotencyKey != null && !idempotencyKey.trim().isEmpty()) {
            Optional<ParentCallRecord> existing = parentCallRecordRepository.findByIdempotencyKey(idempotencyKey);
            if (existing.isPresent()) {
                logger.info("Idempotent duplicate call request detected for key: {}", idempotencyKey);
                return toDto(existing.get());
            }
        } else {
            idempotencyKey = "CALL-" + student.getId() + "-" + System.currentTimeMillis();
        }

        // Consent and cooldown check
        CallEligibilityCheck eligibility = callConsentService.checkEligibility(student.getId());
        if (!eligibility.isEligible()) {
            throw new IllegalStateException("Call blocked: " + eligibility.getReason());
        }

        ParentContact contact = eligibility.getContact();

        // Determine provider
        boolean requestLive = "LIVE".equalsIgnoreCase(request.getMode());
        TelephonyProvider provider = (requestLive && exotelTelephonyProvider.isAvailable())
                ? exotelTelephonyProvider
                : simulationTelephonyProvider;

        ParentCallRecord record = new ParentCallRecord();
        record.setStudentId(student.getId());
        record.setStudentName(student.getFirstName() + " " + student.getLastName());
        record.setAlertId(alert != null ? alert.getId() : null);
        record.setGuardianName(contact.getGuardianName());
        record.setRelationship(contact.getRelationship());
        record.setPhoneNumber(contact.getPhoneNumber());
        record.setInitiatedBy(initiatedBy != null ? initiatedBy : "admin");
        record.setInitiatedAt(LocalDateTime.now());
        record.setIdempotencyKey(idempotencyKey);
        record.setProvider(provider.getProviderName());
        record.setCallType("LIVE".equalsIgnoreCase(request.getMode()) && exotelTelephonyProvider.isAvailable()
                ? "LIVE_TELEPHONY" : "SIMULATED");
        record.setStatus("INITIATED");

        String script = voiceAgentService.buildVerifiedAcademicScript(student, alert);
        record.setConversationTranscript("AI: " + voiceAgentService.buildInitialGreeting(record.getStudentName(), record.getGuardianName()));

        CallInitiationResult result = provider.initiateCall(record, script);
        if (result.isSuccess()) {
            record.setProviderCallSid(result.getProviderCallSid());
            record.setStatus(result.getStatus());
            record.setAnsweredAt(LocalDateTime.now());
        } else {
            record.setStatus("FAILED");
            record.setErrorMessage(result.getErrorMessage());
        }

        ParentCallRecord saved = parentCallRecordRepository.save(record);

        // Update alert and contact timestamps
        if (alert != null) {
            alert.setStatus(result.isSuccess() ? "CALL_SCHEDULED" : "REVIEWED");
            academicAlertRepository.save(alert);
        }
        parentContactService.updateLastContacted(student.getId());

        return toDto(saved);
    }

    @Override
    @Transactional
    public ParentCallRecordDto startSimulatedSession(int studentId, Integer alertId, String initiatedBy) {
        return startSimulatedSession(studentId, alertId, initiatedBy, "en-IN", null);
    }

    @Override
    @Transactional
    public ParentCallRecordDto startSimulatedSession(int studentId, Integer alertId, String initiatedBy, String language, String academicConcerns) {
        Student student = studentService.findByStudentId(studentId);
        if (student == null) {
            throw new IllegalArgumentException("Student not found with ID: " + studentId);
        }

        AcademicAlert alert = alertId != null ? academicAlertRepository.findById(alertId).orElse(null) : null;
        ParentContact contact = parentContactRepository.findByStudentId(studentId)
                .orElseGet(() -> {
                    ParentContact c = new ParentContact(studentId, "Guardian of " + student.getFirstName(), "GUARDIAN", "+919876543210", "guardian@example.com", language != null ? language : "en-IN", "CONSENTED");
                    return parentContactRepository.save(c);
                });

        ParentCallRecord record = new ParentCallRecord();
        record.setStudentId(student.getId());
        record.setStudentName(student.getFirstName() + " " + student.getLastName());
        record.setAlertId(alert != null ? alert.getId() : null);
        record.setGuardianName(contact.getGuardianName());
        record.setRelationship(contact.getRelationship());
        record.setPhoneNumber(contact.getPhoneNumber());
        record.setLanguage(language != null ? language : (contact.getPreferredLanguage() != null ? contact.getPreferredLanguage() : "en-IN"));
        record.setAcademicConcerns(academicConcerns != null ? academicConcerns : (alert != null ? alert.getRiskFactors() : "Routine Academic Progress Review"));
        record.setInitiatedBy(initiatedBy != null ? initiatedBy : "admin");
        record.setInitiatedAt(LocalDateTime.now());
        record.setAnsweredAt(LocalDateTime.now());
        record.setIdempotencyKey("SIM-SESS-" + UUID.randomUUID().toString());
        record.setProvider("SIMULATION");
        record.setCallType("SIMULATED");
        record.setStatus("IN_PROGRESS");
        record.setProviderCallSid("SIM-SID-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        String initialGreeting = voiceAgentService.buildInitialGreeting(record.getStudentName(), record.getGuardianName());
        record.setConversationTranscript("AI: " + initialGreeting);

        ParentCallRecord saved = parentCallRecordRepository.save(record);
        parentContactService.updateLastContacted(student.getId());

        return toDto(saved);
    }

    @Override
    public SimulatedSessionTurnResponseDto handleTurn(SimulatedSessionTurnRequestDto turnRequest) {
        return voiceAgentService.processTurn(turnRequest);
    }

    @Override
    @Transactional
    public ParentCallRecordDto endSimulatedSession(int callId, String reason) {
        return endSimulatedSession(callId, "COMPLETED", reason, "COMPLETED", null, null, null);
    }

    @Override
    @Transactional
    public ParentCallRecordDto endSimulatedSession(int callId, String status, String reason, String outcome,
                                                   Boolean followUpRequested, java.time.LocalDate followUpDate, String followUpNotes) {
        ParentCallRecord call = parentCallRecordRepository.findById(callId)
                .orElseThrow(() -> new IllegalArgumentException("Call session not found with ID: " + callId));

        String finalStatus = (status != null && !status.trim().isEmpty()) ? status.trim().toUpperCase() : "COMPLETED";
        call.setStatus(finalStatus);
        call.setOutcome(outcome != null ? outcome : finalStatus);

        if (followUpRequested != null) {
            call.setFollowUpRequested(followUpRequested);
        }
        if (followUpDate != null) {
            call.setFollowUpDate(followUpDate);
        }
        if (followUpNotes != null) {
            call.setFollowUpNotes(followUpNotes);
        }

        call.setEndedAt(LocalDateTime.now());
        if (call.getAnsweredAt() != null) {
            long sec = Duration.between(call.getAnsweredAt(), call.getEndedAt()).getSeconds();
            call.setDurationSeconds((int) Math.max(5, sec));
        } else {
            call.setDurationSeconds(15);
        }

        if (call.getCallSummary() == null || call.getCallSummary().trim().isEmpty() || reason != null) {
            String summaryPrefix = "Simulated voice session [" + finalStatus + "]. ";
            call.setCallSummary(summaryPrefix + (reason != null ? reason : ""));
        }

        if (call.getAlertId() != null) {
            AcademicAlert alert = academicAlertRepository.findById(call.getAlertId()).orElse(null);
            if (alert != null) {
                if ("COMPLETED".equalsIgnoreCase(finalStatus)) {
                    alert.setStatus("CALL_COMPLETED");
                } else if ("UNANSWERED".equalsIgnoreCase(finalStatus)) {
                    alert.setStatus("UNANSWERED");
                } else if ("INTERRUPTED".equalsIgnoreCase(finalStatus) || "FAILED".equalsIgnoreCase(finalStatus)) {
                    alert.setStatus("ATTENTION_REQUIRED");
                }
                academicAlertRepository.save(alert);
            }
        }

        ParentCallRecord saved = parentCallRecordRepository.save(call);
        return toDto(saved);
    }

    @Override
    public List<ParentCallRecordDto> getAllCallHistory() {
        List<ParentCallRecord> list = parentCallRecordRepository.findAllByOrderByInitiatedAtDesc();
        List<ParentCallRecordDto> dtos = new ArrayList<>();
        for (ParentCallRecord r : list) {
            dtos.add(toDto(r));
        }
        return dtos;
    }

    @Override
    public ParentCallRecordDto getCallRecordById(int callId) {
        ParentCallRecord r = parentCallRecordRepository.findById(callId).orElse(null);
        return r != null ? toDto(r) : null;
    }

    @Override
    public List<ParentCallRecordDto> getFollowUpRequests() {
        List<ParentCallRecord> list = parentCallRecordRepository.findByFollowUpRequestedTrueOrderByInitiatedAtDesc();
        List<ParentCallRecordDto> dtos = new ArrayList<>();
        for (ParentCallRecord r : list) {
            dtos.add(toDto(r));
        }
        return dtos;
    }

    @Override
    @Transactional
    public String handleStatusWebhook(Map<String, String> payload, String signatureHeader) {
        WebhookProcessingResult result = exotelTelephonyProvider.handleStatusWebhook(payload, signatureHeader);
        if (!result.isProcessed()) {
            logger.warn("Status webhook processing rejected: {}", result.getError());
            return "{\"error\":\"" + result.getError() + "\"}";
        }

        String sid = result.getProviderCallSid();
        Optional<ParentCallRecord> opt = parentCallRecordRepository.findByProviderCallSid(sid);
        if (opt.isPresent()) {
            ParentCallRecord call = opt.get();
            call.setStatus(result.getNewStatus());
            if ("COMPLETED".equalsIgnoreCase(result.getNewStatus())) {
                call.setEndedAt(LocalDateTime.now());
            }
            parentCallRecordRepository.save(call);
        }
        return result.getResponsePayload();
    }

    @Override
    public String handleVoiceWebhook(Map<String, String> payload, String signatureHeader) {
        WebhookProcessingResult result = exotelTelephonyProvider.handleVoiceWebhook(payload, signatureHeader);
        return result.isProcessed() ? result.getResponsePayload() : "{\"error\":\"" + result.getError() + "\"}";
    }

    @Override
    public TelephonyConfigDto getTelephonyConfig() {
        TelephonyConfigDto dto = new TelephonyConfigDto();
        boolean liveAvail = exotelTelephonyProvider.isAvailable();
        dto.setActiveMode(liveAvail ? "LIVE" : "SIMULATION");
        dto.setProviderName(liveAvail ? "EXOTEL" : "SIMULATION");
        dto.setSimulationAvailable(true);
        dto.setLiveProviderAvailable(liveAvail);
        dto.setCallerId(liveAvail ? "Configured Exotel Virtual Number" : "In-Browser Voice Agent Simulation (Zero Cost)");
        dto.setWebhookUrl("/api/telephony/webhooks/status");
        dto.setSupportedLanguages(Arrays.asList("English (India, en-IN)", "Hindi (hi-IN)", "Telugu (te-IN)", "Tamil (ta-IN)"));
        dto.setFeasibilityNotice("Indian telecom regulations (TRAI/DoT) require DLT registration, business KYC, and a dedicated Virtual Number/CLI for outbound carrier calls. Regular Android SIM cards cannot inject two-way AI audio programmatically due to Android OS audio sandboxing. High-fidelity in-browser simulation provides zero-cost immediate testing with zero paid subscriptions.");
        return dto;
    }

    private ParentCallRecordDto toDto(ParentCallRecord entity) {
        ParentCallRecordDto dto = new ParentCallRecordDto();
        dto.setId(entity.getId());
        dto.setAlertId(entity.getAlertId());
        dto.setStudentId(entity.getStudentId());
        dto.setStudentName(entity.getStudentName());
        dto.setGuardianName(entity.getGuardianName());
        dto.setRelationship(entity.getRelationship());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setCallType(entity.getCallType());
        dto.setProvider(entity.getProvider());
        dto.setProviderCallSid(entity.getProviderCallSid());
        dto.setIdempotencyKey(entity.getIdempotencyKey());
        dto.setStatus(entity.getStatus());
        dto.setInitiatedBy(entity.getInitiatedBy());
        dto.setInitiatedAt(entity.getInitiatedAt());
        dto.setAnsweredAt(entity.getAnsweredAt());
        dto.setEndedAt(entity.getEndedAt());
        dto.setDurationSeconds(entity.getDurationSeconds());
        dto.setIdentityVerified(entity.getIdentityVerified());
        dto.setConsentGiven(entity.getConsentGiven());
        dto.setFollowUpRequested(entity.getFollowUpRequested());
        dto.setCallSummary(entity.getCallSummary());
        dto.setConversationTranscript(entity.getConversationTranscript());
        dto.setLanguage(entity.getLanguage());
        dto.setAcademicConcerns(entity.getAcademicConcerns());
        dto.setOutcome(entity.getOutcome());
        dto.setFollowUpDate(entity.getFollowUpDate());
        dto.setFollowUpNotes(entity.getFollowUpNotes());
        dto.setErrorCode(entity.getErrorCode());
        dto.setErrorMessage(entity.getErrorMessage());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
