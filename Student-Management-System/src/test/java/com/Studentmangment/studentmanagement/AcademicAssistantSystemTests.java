package com.Studentmangment.studentmanagement;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;

import com.Studentmangment.studentmanagement.dto.ChatMessageDto;
import com.Studentmangment.studentmanagement.dto.ChatRequestDto;
import com.Studentmangment.studentmanagement.dto.ChatResponseDto;
import com.Studentmangment.studentmanagement.service.ChatService;

@SpringBootTest(classes = StudentManagementApplication.class)
@WithMockUser(username = "test.admin", roles = {"ADMIN"})
public class AcademicAssistantSystemTests {

    @Autowired
    private ChatService chatService;

    @Test
    void testStudentAttendanceQueryVerifiedRecord() {
        ChatRequestDto request = new ChatRequestDto("Explain my attendance", "test-session-stu-1");
        ChatResponseDto response = chatService.processMessage("test.student02", request);

        assertNotNull(response, "Response should not be null");
        assertNotNull(response.getMessage(), "Message should not be null");
        assertEquals("ASSISTANT", response.getMessage().getSender());
        assertTrue(response.getMessage().isVerifiedRecord(), "Attendance response must be marked as verified database record");
        assertEquals("ATTENDANCE", response.getMessage().getCategory());
        assertTrue(response.getMessage().getText().contains("Attendance"), "Text should contain Attendance details");
        assertNotNull(response.getSuggestions(), "Suggestions list should be provided");
    }

    @Test
    void testStudentPendingAssignmentsQuery() {
        ChatRequestDto request = new ChatRequestDto("What assignments are pending?", "test-session-stu-2");
        ChatResponseDto response = chatService.processMessage("test.student02", request);

        assertNotNull(response);
        assertNotNull(response.getMessage());
        assertTrue(response.getMessage().isVerifiedRecord());
        assertEquals("ASSESSMENTS", response.getMessage().getCategory());
        assertTrue(response.getMessage().getText().contains("Assignment"), "Text should mention assignment status");
    }

    @Test
    void testStudentAcademicProgressQuery() {
        ChatRequestDto request = new ChatRequestDto("Explain my academic progress", "test-session-stu-3");
        ChatResponseDto response = chatService.processMessage("test.student02", request);

        assertNotNull(response);
        assertNotNull(response.getMessage());
        assertTrue(response.getMessage().isVerifiedRecord());
        assertEquals("ACADEMIC_PROGRESS", response.getMessage().getCategory());
    }

    @Test
    void testTeacherCohortAttendanceQuery() {
        ChatRequestDto request = new ChatRequestDto("Summarize my class attendance", "test-session-tea-1");
        ChatResponseDto response = chatService.processMessage("test.teacher01", request);

        assertNotNull(response);
        assertNotNull(response.getMessage());
        assertEquals("ASSISTANT", response.getMessage().getSender());
        assertTrue(response.getMessage().isVerifiedRecord());
        assertEquals("ATTENDANCE", response.getMessage().getCategory());
    }

    @Test
    void testAdminInstitutionalRiskQuery() {
        ChatRequestDto request = new ChatRequestDto("Show authorized institutional risk statistics", "test-session-adm-1");
        ChatResponseDto response = chatService.processMessage("test.admin", request);

        assertNotNull(response);
        assertNotNull(response.getMessage());
        assertEquals("ASSISTANT", response.getMessage().getSender());
        assertTrue(response.getMessage().isVerifiedRecord());
        assertEquals("RISK_MONITORING", response.getMessage().getCategory());
    }

    @Test
    void testRoleBasedSuggestions() {
        List<String> studentSuggestions = chatService.getSuggestedPrompts("test.student02");
        assertNotNull(studentSuggestions);
        assertTrue(studentSuggestions.contains("Explain my attendance"));
        assertTrue(studentSuggestions.contains("What assignments are pending?"));

        List<String> teacherSuggestions = chatService.getSuggestedPrompts("test.teacher01");
        assertNotNull(teacherSuggestions);
        assertTrue(teacherSuggestions.contains("Summarize my class attendance"));

        List<String> adminSuggestions = chatService.getSuggestedPrompts("test.admin");
        assertNotNull(adminSuggestions);
        assertTrue(adminSuggestions.contains("Summarize institutional attendance"));
    }

    @Test
    void testSessionHistoryAndReset() {
        String sessionId = "test-hist-session";
        ChatRequestDto req1 = new ChatRequestDto("Hello", sessionId);
        chatService.processMessage("test.student02", req1);

        List<ChatMessageDto> history = chatService.getSessionHistory("test.student02", sessionId);
        assertNotNull(history);
        assertEquals(2, history.size(), "History should contain 1 user and 1 assistant message");

        chatService.clearSession("test.student02", sessionId);
        List<ChatMessageDto> cleared = chatService.getSessionHistory("test.student02", sessionId);
        assertTrue(cleared.isEmpty(), "Session history should be empty after clear");
    }
}
