package com.Studentmangment.studentmanagement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import com.Studentmangment.studentmanagement.controller.rest.ParentCallingRestController;
import com.Studentmangment.studentmanagement.dto.AcademicAlertDto;
import com.Studentmangment.studentmanagement.dto.OllamaAiStatusDto;
import com.Studentmangment.studentmanagement.dto.ParentCallRecordDto;
import com.Studentmangment.studentmanagement.dto.ParentCallingDashboardStatsDto;
import com.Studentmangment.studentmanagement.dto.RiskThresholdConfig;
import com.Studentmangment.studentmanagement.dto.SimulatedSessionTurnRequestDto;
import com.Studentmangment.studentmanagement.dto.SimulatedSessionTurnResponseDto;
import com.Studentmangment.studentmanagement.dto.StudentAcademicSummaryDto;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.service.AcademicRiskConfigService;
import com.Studentmangment.studentmanagement.service.StudentService;

@SpringBootTest(classes = StudentManagementApplication.class)
public class ParentCallingAssistantTests {

    @Autowired
    private ParentCallingRestController parentCallingRestController;

    @Autowired
    private AcademicRiskConfigService riskConfigService;

    @Autowired
    private StudentService studentService;

    @Test
    void testDashboardStatsRetrieval() {
        ResponseEntity<ParentCallingDashboardStatsDto> response = parentCallingRestController.getDashboardStats(null);
        assertNotNull(response);
        assertEquals(200, response.getStatusCodeValue());
        ParentCallingDashboardStatsDto stats = response.getBody();
        assertNotNull(stats);
        assertTrue(stats.getTotalStudentsRequiringAttention() >= 0);
        assertNotNull(stats.getActiveThresholds());
        assertNotNull(stats.getAiStatus());
        assertTrue(stats.getAiStatus().isLocalRuleEngineAvailable(), "Local rule engine must always be available");
    }

    @Test
    void testConfigurableThresholdUpdate() {
        RiskThresholdConfig original = riskConfigService.getConfig();
        assertNotNull(original);

        RiskThresholdConfig update = new RiskThresholdConfig();
        update.setAttendanceThreshold(70.0);
        update.setMarksThreshold(45.0);
        update.setMissingAssignmentsThreshold(2);

        ResponseEntity<RiskThresholdConfig> res = parentCallingRestController.updateRiskConfig(update);
        assertEquals(200, res.getStatusCodeValue());
        assertEquals(70.0, res.getBody().getAttendanceThreshold());
        assertEquals(45.0, res.getBody().getMarksThreshold());

        // Restore default
        RiskThresholdConfig restore = new RiskThresholdConfig();
        restore.setAttendanceThreshold(75.0);
        restore.setMarksThreshold(60.0);
        restore.setMissingAssignmentsThreshold(1);
        parentCallingRestController.updateRiskConfig(restore);
    }

    @Test
    void testStudentAcademicSummary() {
        Student student = studentService.findByStudentName("test.student02");
        assertNotNull(student, "Test student test.student02 must exist");

        ResponseEntity<?> res = parentCallingRestController.getStudentAcademicSummary(student.getId());
        assertEquals(200, res.getStatusCodeValue());
        StudentAcademicSummaryDto summary = (StudentAcademicSummaryDto) res.getBody();
        assertNotNull(summary);
        assertEquals("test.student02", student.getUserName());
        assertNotNull(summary.getStudentName());
        assertNotNull(summary.getSuggestedCallScript());
        assertTrue(summary.getSuggestedCallScript().contains("Project 577"));
        assertNotNull(summary.getGuardian());
    }

    @Test
    @Transactional
    void testCompleteSimulatedSessionLifecycle() {
        Student student = studentService.findByStudentName("test.student02");
        assertNotNull(student);

        // 1. Start session
        Map<String, Object> startReq = Map.of(
            "studentId", student.getId(),
            "language", "en-IN",
            "academicConcerns", "Low attendance in CS Course"
        );
        ResponseEntity<?> startRes = parentCallingRestController.startVoiceSession(startReq, () -> "test.teacher");
        assertEquals(200, startRes.getStatusCodeValue());
        ParentCallRecordDto session = (ParentCallRecordDto) startRes.getBody();
        assertNotNull(session);
        assertEquals("IN_PROGRESS", session.getStatus());
        int callId = session.getId();

        // 2. Turn: Identity verification
        SimulatedSessionTurnRequestDto turn1 = new SimulatedSessionTurnRequestDto();
        turn1.setCallId(callId);
        turn1.setCurrentState("GREETING_AND_IDENTITY_CHECK");
        turn1.setParentInput("Yes, I am speaking, this is her guardian.");
        turn1.setLanguage("en-IN");

        ResponseEntity<SimulatedSessionTurnResponseDto> turn1Res = parentCallingRestController.handleVoiceTurn(turn1);
        assertEquals(200, turn1Res.getStatusCodeValue());
        SimulatedSessionTurnResponseDto r1 = turn1Res.getBody();
        assertNotNull(r1);
        assertTrue(r1.isIdentityVerified());
        assertNotNull(r1.getAiEngine());

        // 3. End session with outcome and follow-up
        Map<String, Object> endReq = Map.of(
            "status", "COMPLETED",
            "reason", "Parent agreed to teacher consultation",
            "outcome", "CONSULTATION_REQUESTED",
            "followUpRequested", true,
            "followUpDate", LocalDate.now().plusDays(2).toString(),
            "followUpNotes", "Call guardian at 4 PM after faculty office hours."
        );
        ResponseEntity<?> endRes = parentCallingRestController.endVoiceSession(callId, endReq);
        assertEquals(200, endRes.getStatusCodeValue());
        ParentCallRecordDto ended = (ParentCallRecordDto) endRes.getBody();
        assertNotNull(ended);
        assertEquals("COMPLETED", ended.getStatus());
        assertTrue(ended.getFollowUpRequested());
        assertNotNull(ended.getFollowUpDate());
    }

    @Test
    void testAiStatusCheck() {
        ResponseEntity<OllamaAiStatusDto> response = parentCallingRestController.getAiStatus();
        assertEquals(200, response.getStatusCodeValue());
        OllamaAiStatusDto status = response.getBody();
        assertNotNull(status);
        assertNotNull(status.getEndpoint());
        assertTrue(status.isLocalRuleEngineAvailable());
        assertTrue(status.isSpeechRecognitionAvailable());
        assertTrue(status.isSpeechSynthesisAvailable());
    }
}
