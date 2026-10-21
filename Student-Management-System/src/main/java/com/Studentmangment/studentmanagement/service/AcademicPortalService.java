package com.Studentmangment.studentmanagement.service;

import java.util.List;
import java.util.Map;

public interface AcademicPortalService {
    Map<String, Object> overview();
    List<Map<String, Object>> insights();
    List<Map<String, Object>> atRisk();
    List<Map<String, Object>> availability();
    Map<String, Object> saveAvailability(Map<String, Object> payload);
    List<Map<String, Object>> consultations();
    Map<String, Object> createConsultation(Map<String, Object> payload);
    Map<String, Object> updateConsultation(int id, Map<String, Object> payload);
    List<Map<String, Object>> library(String query, String category);
    Map<String, Object> saveBook(Map<String, Object> payload);
    List<Map<String, Object>> resources(String query);
    Map<String, Object> saveResource(Map<String, Object> payload);
    List<Map<String, Object>> attendance(Integer courseId);
    Map<String, Object> recordAttendance(Map<String, Object> payload);
    List<Map<String, Object>> notifications();
    Map<String, Object> markNotificationRead(int id);
    Map<String, Object> createAnnouncement(Map<String, Object> payload);
    Map<String, Object> reports();
    Map<String, Object> simulate(Map<String, Object> payload);

    // Smart Academic To-Do List
    List<Map<String, Object>> todos();
    Map<String, Object> createTodo(Map<String, Object> payload);
    Map<String, Object> toggleTodo(int id);
    Map<String, Object> deleteTodo(int id);

    // Attendance Recovery Calculator
    Map<String, Object> attendanceRecovery(Integer targetPercentage, Integer studentId);

    // Personalized Study Planner
    Map<String, Object> studyPlan(Map<String, Object> preferences);

    // Course Resource Bookmarking
    Map<String, Object> toggleBookmark(int resourceId);
    List<Map<String, Object>> bookmarkedResources();

    // Doubt and Clarification Requests
    List<Map<String, Object>> doubts(Integer courseId);
    Map<String, Object> createDoubt(Map<String, Object> payload);
    Map<String, Object> replyDoubt(int doubtId, Map<String, Object> payload);

    // Teacher Class Health Dashboard
    List<Map<String, Object>> classHealth();

    // Bulk Attendance and Marks Entry
    Map<String, Object> recordBulkMarks(Map<String, Object> payload);

    // Assignment Submission Tracker
    List<Map<String, Object>> assignmentSubmissions(int assignmentId);
    Map<String, Object> updateAssignmentSubmission(int assignmentId, int studentId, Map<String, Object> payload);

    // Student Progress Change Alerts
    Map<String, Object> markAllNotificationsRead();

    // Faculty Members for Consultation
    List<Map<String, Object>> facultyMembers();
}
