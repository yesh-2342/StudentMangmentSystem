package com.Studentmangment.studentmanagement.service;

import java.util.List;
import com.Studentmangment.studentmanagement.dto.AcademicAlertDto;
import com.Studentmangment.studentmanagement.entity.AcademicAlert;
import com.Studentmangment.studentmanagement.entity.Student;

public interface AcademicRiskService {
    List<AcademicAlertDto> scanAndGetAlerts();
    AcademicAlertDto getAlertById(int alertId);
    AcademicAlertDto reviewAlert(int alertId, String reviewerUsername, String recommendedAction);
    AcademicAlertDto dismissAlert(int alertId, String reviewerUsername, String reason);
    String generateCallScript(Student student, AcademicAlert alert, String guardianName);
}
