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
}
