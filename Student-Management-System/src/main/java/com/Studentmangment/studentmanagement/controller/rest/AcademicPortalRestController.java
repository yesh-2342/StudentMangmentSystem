package com.Studentmangment.studentmanagement.controller.rest;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Studentmangment.studentmanagement.service.AcademicPortalService;

@RestController
@RequestMapping("/api/academic")
public class AcademicPortalRestController {

    @Autowired
    private AcademicPortalService academicPortalService;

    @GetMapping("/overview")
    public ResponseEntity<?> overview() {
        return ok(() -> academicPortalService.overview());
    }

    @GetMapping("/insights")
    public ResponseEntity<?> insights() {
        return ok(() -> academicPortalService.insights());
    }

    @GetMapping("/at-risk")
    public ResponseEntity<?> atRisk() {
        return ok(() -> academicPortalService.atRisk());
    }

    @GetMapping("/availability")
    public ResponseEntity<?> availability() {
        return ok(() -> academicPortalService.availability());
    }

    @PostMapping("/availability")
    public ResponseEntity<?> saveAvailability(@RequestBody Map<String, Object> payload) {
        return ok(() -> academicPortalService.saveAvailability(payload));
    }

    @GetMapping({"/faculty-members", "/teachers"})
    public ResponseEntity<?> facultyMembers() {
        return ok(() -> academicPortalService.facultyMembers());
    }

    @GetMapping("/consultations")
    public ResponseEntity<?> consultations() {
        return ok(() -> academicPortalService.consultations());
    }

    @PostMapping("/consultations")
    public ResponseEntity<?> createConsultation(@RequestBody Map<String, Object> payload) {
        return ok(() -> academicPortalService.createConsultation(payload));
    }

    @PutMapping("/consultations/{id}")
    public ResponseEntity<?> updateConsultation(@PathVariable("id") int id, @RequestBody Map<String, Object> payload) {
        return ok(() -> academicPortalService.updateConsultation(id, payload));
    }

    @GetMapping("/library")
    public ResponseEntity<?> library(@RequestParam(value = "q", required = false) String query,
                                     @RequestParam(value = "category", required = false) String category) {
        return ok(() -> academicPortalService.library(query, category));
    }

    @PostMapping("/library")
    public ResponseEntity<?> saveBook(@RequestBody Map<String, Object> payload) {
        return ok(() -> academicPortalService.saveBook(payload));
    }

    @GetMapping("/resources")
    public ResponseEntity<?> resources(@RequestParam(value = "q", required = false) String query) {
        return ok(() -> academicPortalService.resources(query));
    }

    @PostMapping("/resources")
    public ResponseEntity<?> saveResource(@RequestBody Map<String, Object> payload) {
        return ok(() -> academicPortalService.saveResource(payload));
    }

    @GetMapping("/attendance")
    public ResponseEntity<?> attendance(@RequestParam(value = "courseId", required = false) Integer courseId) {
        return ok(() -> academicPortalService.attendance(courseId));
    }

    @PostMapping("/attendance")
    public ResponseEntity<?> recordAttendance(@RequestBody Map<String, Object> payload) {
        return ok(() -> academicPortalService.recordAttendance(payload));
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> notifications() {
        return ok(() -> academicPortalService.notifications());
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable("id") int id) {
        return ok(() -> academicPortalService.markNotificationRead(id));
    }

    @PostMapping("/announcements")
    public ResponseEntity<?> announce(@RequestBody Map<String, Object> payload) {
        return ok(() -> academicPortalService.createAnnouncement(payload));
    }

    @GetMapping("/reports")
    public ResponseEntity<?> reports() {
        return ok(() -> academicPortalService.reports());
    }

    @PostMapping("/simulator")
    public ResponseEntity<?> simulator(@RequestBody(required = false) Map<String, Object> payload) {
        return ok(() -> academicPortalService.simulate(payload == null ? Map.of() : payload));
    }

    // --- Smart Academic To-Do List ---
    @GetMapping("/todos")
    public ResponseEntity<?> todos() {
        return ok(() -> academicPortalService.todos());
    }

    @PostMapping("/todos")
    public ResponseEntity<?> createTodo(@RequestBody Map<String, Object> payload) {
        return ok(() -> academicPortalService.createTodo(payload));
    }

    @PutMapping("/todos/{id}/toggle")
    public ResponseEntity<?> toggleTodo(@PathVariable("id") int id) {
        return ok(() -> academicPortalService.toggleTodo(id));
    }

    @DeleteMapping("/todos/{id}")
    public ResponseEntity<?> deleteTodo(@PathVariable("id") int id) {
        return ok(() -> academicPortalService.deleteTodo(id));
    }

    // --- Attendance Recovery Calculator ---
    @GetMapping("/attendance/recovery")
    public ResponseEntity<?> attendanceRecovery(
            @RequestParam(value = "targetPercentage", required = false) Integer targetPercentage,
            @RequestParam(value = "studentId", required = false) Integer studentId) {
        return ok(() -> academicPortalService.attendanceRecovery(targetPercentage, studentId));
    }

    // --- Personalized Study Planner ---
    @GetMapping("/study-plan")
    public ResponseEntity<?> studyPlan() {
        return ok(() -> academicPortalService.studyPlan(Map.of()));
    }

    @PostMapping("/study-plan")
    public ResponseEntity<?> updateStudyPlan(@RequestBody(required = false) Map<String, Object> payload) {
        return ok(() -> academicPortalService.studyPlan(payload == null ? Map.of() : payload));
    }

    // --- Course Resource Bookmarking ---
    @PostMapping("/resources/{id}/bookmark")
    public ResponseEntity<?> toggleBookmark(@PathVariable("id") int id) {
        return ok(() -> academicPortalService.toggleBookmark(id));
    }

    @DeleteMapping("/resources/{id}/bookmark")
    public ResponseEntity<?> removeBookmark(@PathVariable("id") int id) {
        return ok(() -> academicPortalService.toggleBookmark(id));
    }

    @GetMapping("/resources/bookmarks")
    public ResponseEntity<?> bookmarkedResources() {
        return ok(() -> academicPortalService.bookmarkedResources());
    }

    // --- Doubt and Clarification Requests ---
    @GetMapping("/doubts")
    public ResponseEntity<?> doubts(@RequestParam(value = "courseId", required = false) Integer courseId) {
        return ok(() -> academicPortalService.doubts(courseId));
    }

    @PostMapping("/doubts")
    public ResponseEntity<?> createDoubt(@RequestBody Map<String, Object> payload) {
        return ok(() -> academicPortalService.createDoubt(payload));
    }

    @PutMapping("/doubts/{id}/reply")
    public ResponseEntity<?> replyDoubt(@PathVariable("id") int id, @RequestBody Map<String, Object> payload) {
        return ok(() -> academicPortalService.replyDoubt(id, payload));
    }

    // --- Teacher Class Health Dashboard ---
    @GetMapping("/class-health")
    public ResponseEntity<?> classHealth() {
        return ok(() -> academicPortalService.classHealth());
    }

    // --- Bulk Attendance and Marks Entry ---
    @PostMapping("/bulk-marks")
    public ResponseEntity<?> recordBulkMarks(@RequestBody Map<String, Object> payload) {
        return ok(() -> academicPortalService.recordBulkMarks(payload));
    }

    // --- Assignment Submission Tracker ---
    @GetMapping("/assignments/{id}/submissions")
    public ResponseEntity<?> assignmentSubmissions(@PathVariable("id") int id) {
        return ok(() -> academicPortalService.assignmentSubmissions(id));
    }

    @PutMapping("/assignments/{id}/submissions/{studentId}")
    public ResponseEntity<?> updateAssignmentSubmission(
            @PathVariable("id") int id,
            @PathVariable("studentId") int studentId,
            @RequestBody Map<String, Object> payload) {
        return ok(() -> academicPortalService.updateAssignmentSubmission(id, studentId, payload));
    }

    // --- Student Progress Change Alerts & Notifications ---
    @PutMapping("/notifications/read-all")
    public ResponseEntity<?> markAllNotificationsRead() {
        return ok(() -> academicPortalService.markAllNotificationsRead());
    }

    private ResponseEntity<?> ok(SupplierWithError supplier) {
        try {
            return ResponseEntity.ok(supplier.get());
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", ex.getMessage()));
        }
    }

    @FunctionalInterface
    private interface SupplierWithError {
        Object get();
    }
}
