package com.Studentmangment.studentmanagement;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.transaction.annotation.Transactional;

import com.Studentmangment.studentmanagement.service.AcademicPortalService;
import com.Studentmangment.studentmanagement.service.ChatService;
import com.Studentmangment.studentmanagement.service.StudentService;
import com.Studentmangment.studentmanagement.service.TeacherService;
import com.Studentmangment.studentmanagement.service.CourseService;
import com.Studentmangment.studentmanagement.service.AssignmentService;
import com.Studentmangment.studentmanagement.service.AssignmentDetailsService;
import com.Studentmangment.studentmanagement.service.StudentCourseDetailsService;
import com.Studentmangment.studentmanagement.entity.Course;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.entity.Teacher;
import com.Studentmangment.studentmanagement.entity.Assignment;
import com.Studentmangment.studentmanagement.entity.AssignmentDetails;
import com.Studentmangment.studentmanagement.entity.StudentCourseDetails;
import com.Studentmangment.studentmanagement.dto.ChatRequestDto;
import com.Studentmangment.studentmanagement.dto.ChatResponseDto;

@SpringBootTest(classes = StudentManagementApplication.class)
@Transactional
public class AdvancedAcademicFeaturesTests {

    @Autowired
    private AcademicPortalService academicPortalService;

    @Autowired
    private ChatService chatService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private AssignmentDetailsService assignmentDetailsService;

    @Autowired
    private StudentCourseDetailsService studentCourseDetailsService;

    @Test
    @WithMockUser(username = "test.student02", roles = {"STUDENT"})
    void testSmartAcademicTodoList() {
        // 1. Fetch smart to-dos
        List<Map<String, Object>> todos = academicPortalService.todos();
        assertNotNull(todos, "To-dos list should not be null");

        // 2. Create custom to-do
        Map<String, Object> payload = Map.of(
            "title", "Review Chapter 4 Algorithms",
            "category", "STUDY",
            "priority", "HIGH",
            "dueDate", "2026-11-01"
        );
        Map<String, Object> created = academicPortalService.createTodo(payload);
        assertNotNull(created.get("id"));

        int id = (int) created.get("id");

        // 3. Toggle to-do
        Map<String, Object> toggled = academicPortalService.toggleTodo(id);
        assertTrue((Boolean) toggled.get("completed"), "To-do should be marked completed");

        // 4. Delete to-do
        Map<String, Object> deleted = academicPortalService.deleteTodo(id);
        assertNotNull(deleted.get("message"));
    }

    @Test
    @WithMockUser(username = "test.student02", roles = {"STUDENT"})
    void testAttendanceRecoveryCalculator() {
        Map<String, Object> recovery = academicPortalService.attendanceRecovery(75, null);
        assertNotNull(recovery, "Recovery calculation should not be null");
        assertNotNull(recovery.get("currentOverallPercentage"));
        assertNotNull(recovery.get("overallConsecutiveSessionsNeeded"));
        assertNotNull(recovery.get("overallMarginSessionsCanMiss"));
        assertNotNull(recovery.get("courses"));
    }

    @Test
    @WithMockUser(username = "test.student02", roles = {"STUDENT"})
    void testPersonalizedStudyPlanner() {
        Map<String, Object> plan = academicPortalService.studyPlan(Map.of("weekdayHours", 3, "weekendHours", 5));
        assertNotNull(plan, "Study plan should not be null");
        assertEquals(25, plan.get("totalWeeklyHours"), "5*3 + 2*5 = 25 total weekly study hours");
        assertNotNull(plan.get("subjectAllocations"));
        assertNotNull(plan.get("weeklySchedule"));
    }

    @Test
    @WithMockUser(username = "test.student02", roles = {"STUDENT"})
    void testCourseResourceBookmarking() {
        // Toggle bookmark for resource #1
        Map<String, Object> b1 = academicPortalService.toggleBookmark(1);
        assertNotNull(b1);
        assertTrue((Boolean) b1.get("bookmarked"));

        List<Map<String, Object>> bookmarked = academicPortalService.bookmarkedResources();
        assertNotNull(bookmarked);
        assertFalse(bookmarked.isEmpty(), "Should contain bookmarked resource");

        // Toggle again to remove
        Map<String, Object> b2 = academicPortalService.toggleBookmark(1);
        assertFalse((Boolean) b2.get("bookmarked"));
    }

    @Test
    @WithMockUser(username = "test.student02", roles = {"STUDENT"})
    void testDoubtAndClarificationWorkflow() {
        Student student = studentService.findByStudentName("test.student02");
        assertNotNull(student);
        int courseId = (student.getCourses() != null && !student.getCourses().isEmpty()) 
            ? student.getCourses().get(0).getId() 
            : courseService.findAllCourses().get(0).getId();

        Map<String, Object> payload = Map.of(
            "courseId", courseId,
            "topic", "Binary Search Trees Balancing",
            "question", "How does AVL tree rotation maintain O(log N) lookup time?"
        );
        Map<String, Object> created = academicPortalService.createDoubt(payload);
        assertNotNull(created.get("id"));

        List<Map<String, Object>> doubts = academicPortalService.doubts(null);
        assertNotNull(doubts);
        assertFalse(doubts.isEmpty());
    }

    @Test
    @WithMockUser(username = "test.teacher01", roles = {"TEACHER"})
    void testTeacherClassHealthDashboard() {
        List<Map<String, Object>> health = academicPortalService.classHealth();
        assertNotNull(health, "Class health metrics should not be null");
        if (!health.isEmpty()) {
            Map<String, Object> first = health.get(0);
            assertNotNull(first.get("courseName"));
            assertNotNull(first.get("healthIndex"));
            assertNotNull(first.get("status"));
        }
    }

    @Test
    @WithMockUser(username = "test.teacher01", roles = {"TEACHER"})
    void testBulkMarksEntry() {
        Teacher teacher = teacherService.findByTeacherName("test.teacher01");
        assertNotNull(teacher);
        if (teacher.getCourses() != null && !teacher.getCourses().isEmpty()) {
            com.Studentmangment.studentmanagement.entity.Course course = teacher.getCourses().get(0);
            if (course.getStudents() != null && !course.getStudents().isEmpty()) {
                int studentId = course.getStudents().get(0).getId();
                Map<String, Object> payload = Map.of(
                    "courseId", course.getId(),
                    "records", List.of(
                        Map.of("studentId", studentId, "gradeOne", 85, "gradeTwo", 90, "gradeThree", 88)
                    )
                );
                Map<String, Object> result = academicPortalService.recordBulkMarks(payload);
                assertNotNull(result);
                assertEquals(1, result.get("updated"));
            }
        }
    }

    @Test
    @WithMockUser(username = "test.teacher01", roles = {"TEACHER"})
    void testAssignmentSubmissionTracker() {
        Teacher teacher = teacherService.findByTeacherName("test.teacher01");
        assertNotNull(teacher);
        if (teacher.getCourses() != null && !teacher.getCourses().isEmpty()) {
            com.Studentmangment.studentmanagement.entity.Course course = teacher.getCourses().get(0);
            if (course.getStudents() != null && !course.getStudents().isEmpty()) {
                Student s = course.getStudents().get(0);
                com.Studentmangment.studentmanagement.entity.StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(s.getId(), course.getId());
                assertNotNull(scd);

                com.Studentmangment.studentmanagement.entity.Assignment assignment = new com.Studentmangment.studentmanagement.entity.Assignment();
                assignment.setName("Unit Test Lab Milestone");
                assignment.setDescription("Complete lab assignment");
                assignment.setDueDate("2026-11-15");
                assignmentService.save(assignment);

                com.Studentmangment.studentmanagement.entity.AssignmentDetails ad = new com.Studentmangment.studentmanagement.entity.AssignmentDetails();
                ad.setAssignmentId(assignment.getId());
                ad.setStudentCourseDetailsId(scd.getId());
                ad.setIsDone(0);
                assignmentDetailsService.save(ad);

                List<com.Studentmangment.studentmanagement.entity.Assignment> currentAssigns = scd.getAssignments() != null ? scd.getAssignments() : new java.util.ArrayList<>();
                currentAssigns.add(assignment);
                scd.setAssignments(currentAssigns);
                studentCourseDetailsService.save(scd);

                List<Map<String, Object>> submissions = academicPortalService.assignmentSubmissions(assignment.getId());
                assertNotNull(submissions);
                assertFalse(submissions.isEmpty());

                Map<String, Object> update = academicPortalService.updateAssignmentSubmission(assignment.getId(), s.getId(), Map.of("isDone", true));
                assertNotNull(update);
                assertTrue((Boolean) update.get("isDone"));
            }
        }
    }

    @Test
    @WithMockUser(username = "test.student02", roles = {"STUDENT"})
    void testStudentProgressChangeAlerts() {
        List<Map<String, Object>> notifs = academicPortalService.notifications();
        assertNotNull(notifs);

        Map<String, Object> markAll = academicPortalService.markAllNotificationsRead();
        assertNotNull(markAll);
        assertNotNull(markAll.get("markedRead"));
    }

    @Test
    @WithMockUser(username = "test.student02", roles = {"STUDENT"})
    void testAcademicAssistantWithNewFeatures() {
        // Query Attendance Recovery
        ChatRequestDto req1 = new ChatRequestDto("What is my attendance recovery?", "test-session-rec-1");
        ChatResponseDto res1 = chatService.processMessage("test.student02", req1);
        assertNotNull(res1);
        assertTrue(res1.getMessage().isVerifiedRecord());
        assertEquals("ATTENDANCE_RECOVERY", res1.getMessage().getCategory());

        // Query Smart To-Do list
        ChatRequestDto req2 = new ChatRequestDto("Show my academic to-do list", "test-session-todo-1");
        ChatResponseDto res2 = chatService.processMessage("test.student02", req2);
        assertNotNull(res2);
        assertTrue(res2.getMessage().isVerifiedRecord());
        assertEquals("TODOS", res2.getMessage().getCategory());
    }
}
