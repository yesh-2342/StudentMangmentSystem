package com.Studentmangment.studentmanagement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.Studentmangment.studentmanagement.dto.AcademicAlertDto;
import com.Studentmangment.studentmanagement.dto.CallInitiationRequestDto;
import com.Studentmangment.studentmanagement.dto.ParentCallRecordDto;
import com.Studentmangment.studentmanagement.dto.ParentContactDto;
import com.Studentmangment.studentmanagement.dto.SimulatedSessionTurnRequestDto;
import com.Studentmangment.studentmanagement.dto.SimulatedSessionTurnResponseDto;
import com.Studentmangment.studentmanagement.dto.TelephonyConfigDto;
import com.Studentmangment.studentmanagement.entity.ParentContact;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.service.AcademicRiskService;
import com.Studentmangment.studentmanagement.service.CallConsentService;
import com.Studentmangment.studentmanagement.service.CallConsentService.CallEligibilityCheck;
import com.Studentmangment.studentmanagement.service.ParentCallService;
import com.Studentmangment.studentmanagement.service.ParentContactService;
import com.Studentmangment.studentmanagement.service.StudentService;
import com.Studentmangment.studentmanagement.service.VoiceAgentService;
import com.Studentmangment.studentmanagement.telephony.ExotelTelephonyProvider;

@SpringBootTest(classes = StudentManagementApplication.class)
public class ParentVoiceAlertsSystemTests {

    @Autowired
    private AcademicRiskService academicRiskService;

    @Autowired
    private ParentContactService parentContactService;

    @Autowired
    private CallConsentService callConsentService;

    @Autowired
    private ParentCallService parentCallService;

    @Autowired
    private VoiceAgentService voiceAgentService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private ExotelTelephonyProvider exotelTelephonyProvider;

    private Student testStudent;
    private Student optedOutStudent;

    @BeforeEach
    void setupTestData() {
        testStudent = studentService.findByStudentName("test.student02");
        if (testStudent != null) {
            ParentContact contact = parentContactService.getContactByStudentId(testStudent.getId());
            if (contact == null) {
                ParentContactDto dto = new ParentContactDto();
                dto.setStudentId(testStudent.getId());
                dto.setGuardianName("Lakshmi Nair");
                dto.setRelationship("MOTHER");
                dto.setPhoneNumber("+91 98450 12345");
                dto.setEmail("lakshmi.nair@example.com");
                dto.setConsentStatus("CONSENTED");
                parentContactService.saveOrUpdateContact(dto);
            }
        }

        optedOutStudent = studentService.findByStudentName("test.student22");
        if (optedOutStudent != null) {
            ParentContact contact = parentContactService.getContactByStudentId(optedOutStudent.getId());
            if (contact == null) {
                ParentContactDto dto = new ParentContactDto();
                dto.setStudentId(optedOutStudent.getId());
                dto.setGuardianName("Vinod Kulkarni");
                dto.setRelationship("FATHER");
                dto.setPhoneNumber("+91 98555 66778");
                dto.setEmail("vinod.kulkarni@example.com");
                dto.setConsentStatus("OPTED_OUT");
                parentContactService.saveOrUpdateContact(dto);
            }
        }
    }

    @Test
    void testAcademicAlertScanningAndRiskEvaluation() {
        List<AcademicAlertDto> alerts = academicRiskService.scanAndGetAlerts();
        assertNotNull(alerts, "Alerts list should not be null");
        assertFalse(alerts.isEmpty(), "At-risk students should be identified from seeded marks and attendance");

        AcademicAlertDto alert = alerts.get(0);
        assertNotNull(alert.getStudentName(), "Student name should be populated");
        assertNotNull(alert.getRiskLevel(), "Risk level should be calculated");
        assertNotNull(alert.getRiskFactors(), "Risk factors should explain reason for alert");
        assertNotNull(alert.getScriptPreview(), "Verified script preview should be generated");
        assertTrue(alert.getScriptPreview().contains("Project 577"), "Script must introduce Project 577 automated assistant");
    }

    @Test
    void testGuardianContactRetrievalAndConsent() {
        assertNotNull(testStudent, "Test student test.student02 must exist");
        ParentContact contact = parentContactService.getContactByStudentId(testStudent.getId());
        assertNotNull(contact, "Guardian contact must be present");
        assertEquals("Lakshmi Nair", contact.getGuardianName());
        assertEquals("MOTHER", contact.getRelationship());
        assertEquals("CONSENTED", contact.getConsentStatus());
    }

    @Test
    void testCallConsentEligibility_OptedOutBlocked() {
        assertNotNull(optedOutStudent, "Student test.student22 must exist");
        CallEligibilityCheck check = callConsentService.checkEligibility(optedOutStudent.getId());
        assertNotNull(check);
        assertFalse(check.isEligible(), "Opted out parent must be blocked from receiving calls");
        assertTrue(check.getReason().toLowerCase().contains("opted out"), "Reason should specify opt-out");
    }

    @Test
    @Transactional
    void testSimulationCallInitiationAndIdempotency() {
        assertNotNull(testStudent, "Test student test.student02 must exist");
        CallInitiationRequestDto request = new CallInitiationRequestDto();
        request.setStudentId(testStudent.getId());
        request.setMode("SIMULATION");
        String key = "TEST-IDEMPOTENT-KEY-" + System.currentTimeMillis();
        request.setIdempotencyKey(key);

        ParentCallRecordDto call1 = parentCallService.initiateCall(request, "test.admin");
        assertNotNull(call1);
        assertEquals("SIMULATION", call1.getProvider());
        assertEquals("SIMULATED", call1.getCallType());
        assertNotNull(call1.getProviderCallSid());

        // Test duplicate call with same idempotency key
        ParentCallRecordDto call2 = parentCallService.initiateCall(request, "test.admin");
        assertEquals(call1.getId(), call2.getId(), "Idempotent call should return existing call record without duplicates");
    }

    @Test
    @Transactional
    void testVoiceAgentConversationalDialogueTurns() {
        assertNotNull(testStudent, "Test student test.student02 must exist");
        // Start simulated session
        ParentCallRecordDto session = parentCallService.startSimulatedSession(testStudent.getId(), null, "test.admin");
        assertNotNull(session);
        int callId = session.getId();

        // Turn 1: Identity confirmation
        SimulatedSessionTurnRequestDto turn1 = new SimulatedSessionTurnRequestDto();
        turn1.setCallId(callId);
        turn1.setCurrentState("GREETING_AND_IDENTITY_CHECK");
        turn1.setParentInput("Yes, speaking, this is her mother.");

        SimulatedSessionTurnResponseDto resp1 = parentCallService.handleTurn(turn1);
        assertNotNull(resp1);
        assertEquals("PURPOSE_AND_CONSENT", resp1.getNextState());
        assertTrue(resp1.isIdentityVerified());
        assertFalse(resp1.isCompleted());

        // Turn 2: Consent to hear academic summary
        SimulatedSessionTurnRequestDto turn2 = new SimulatedSessionTurnRequestDto();
        turn2.setCallId(callId);
        turn2.setCurrentState(resp1.getNextState());
        turn2.setParentInput("Sure, please go ahead.");

        SimulatedSessionTurnResponseDto resp2 = parentCallService.handleTurn(turn2);
        assertNotNull(resp2);
        assertEquals("ACADEMIC_SUMMARY", resp2.getNextState());
        assertTrue(resp2.isConsentGiven());
        assertTrue(resp2.getReplyText().contains("attendance") || resp2.getReplyText().contains("assessment") || resp2.getReplyText().contains("average"));

        // Turn 3: Request teacher follow-up
        SimulatedSessionTurnRequestDto turn3 = new SimulatedSessionTurnRequestDto();
        turn3.setCallId(callId);
        turn3.setCurrentState(resp2.getNextState());
        turn3.setParentInput("Yes, please arrange a meeting with the teacher.");

        SimulatedSessionTurnResponseDto resp3 = parentCallService.handleTurn(turn3);
        assertNotNull(resp3);
        assertTrue(resp3.isFollowUpRequested());
        assertTrue(resp3.isCompleted());
        assertNotNull(resp3.getSummary());
    }

    @Test
    void testWebhookSignatureVerification() {
        Map<String, String> payload = new HashMap<>();
        payload.put("CallSid", "EXO-12345");
        payload.put("Status", "completed");

        // When secret is default, verification passes
        boolean valid = exotelTelephonyProvider.verifyWebhookSignature(payload, null);
        assertTrue(valid, "Default test secret token should accept test callbacks");
    }

    @Test
    void testTelephonyConfigFeasibilityReport() {
        TelephonyConfigDto config = parentCallService.getTelephonyConfig();
        assertNotNull(config);
        assertTrue(config.isSimulationAvailable(), "Zero-cost simulation mode must be available");
        assertNotNull(config.getFeasibilityNotice(), "Feasibility notice regarding TRAI / Android SIM limits must be present");
        assertTrue(config.getFeasibilityNotice().contains("Android SIM") || config.getFeasibilityNotice().contains("TRAI"));
    }
}
