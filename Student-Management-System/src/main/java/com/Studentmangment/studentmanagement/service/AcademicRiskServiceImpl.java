package com.Studentmangment.studentmanagement.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Studentmangment.studentmanagement.dto.AcademicAlertDto;
import com.Studentmangment.studentmanagement.entity.AcademicAlert;
import com.Studentmangment.studentmanagement.entity.AttendanceRecord;
import com.Studentmangment.studentmanagement.entity.Course;
import com.Studentmangment.studentmanagement.entity.GradeDetails;
import com.Studentmangment.studentmanagement.entity.ParentContact;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.entity.StudentCourseDetails;
import com.Studentmangment.studentmanagement.repository.AcademicAlertRepository;
import com.Studentmangment.studentmanagement.repository.AttendanceRecordRepository;
import com.Studentmangment.studentmanagement.repository.ParentContactRepository;
import com.Studentmangment.studentmanagement.service.CallConsentService.CallEligibilityCheck;
import com.Studentmangment.studentmanagement.util.AcademicRules;

@Service
public class AcademicRiskServiceImpl implements AcademicRiskService {

    @Autowired
    private StudentService studentService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private StudentCourseDetailsService studentCourseDetailsService;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private AcademicAlertRepository academicAlertRepository;

    @Autowired
    private ParentContactRepository parentContactRepository;

    @Autowired
    private CallConsentService callConsentService;

    @Autowired
    private VoiceAgentService voiceAgentService;

    @Autowired
    private AcademicRiskConfigService riskConfigService;

    @Override
    @Transactional
    public List<AcademicAlertDto> scanAndGetAlerts() {
        List<Course> courses = courseService.findAllCourses();
        Set<String> seen = new HashSet<>();

        double attThresh = riskConfigService.getConfig().getAttendanceThreshold();
        double marksThresh = riskConfigService.getConfig().getMarksThreshold();
        int missThresh = riskConfigService.getConfig().getMissingAssignmentsThreshold();

        if (courses != null) {
            for (Course course : courses) {
                if (course.getStudents() == null) continue;
                for (Student student : course.getStudents()) {
                    String key = student.getId() + "-" + course.getId();
                    if (seen.contains(key)) continue;
                    seen.add(key);

                    StudentCourseDetails detail = studentCourseDetailsService.findByStudentAndCourseId(student.getId(), course.getId());
                    Double avg = detail == null ? null : calculateAverage(detail.getGradeDetails());
                    Double attendance = calculateAttendance(attendanceRecordRepository.findByStudentIdAndCourseId(student.getId(), course.getId()));
                    int missing = calculateMissingAssignments(detail);

                    boolean isRiskAvg = avg != null && avg < marksThresh;
                    boolean isLowAtt = attendance != null && attendance < attThresh;
                    boolean isMissing = missThresh > 0 && missing >= missThresh;

                    if (isRiskAvg || isLowAtt || isMissing) {
                        // Create or update alert record
                        syncAlert(student, course, avg, attendance, missing, isRiskAvg, isLowAtt, attThresh, marksThresh);
                    }
                }
            }
        }

        List<AcademicAlert> allAlerts = academicAlertRepository.findAllByOrderByCreatedAtDesc();
        List<AcademicAlertDto> dtos = new ArrayList<>();
        for (AcademicAlert alert : allAlerts) {
            dtos.add(toDto(alert));
        }
        return dtos;
    }

    private void syncAlert(Student student, Course course, Double avg, Double attendance, int missing,
                           boolean isRiskAvg, boolean isLowAtt, double attThresh, double marksThresh) {
        Optional<AcademicAlert> opt = academicAlertRepository.findByStudentIdAndCourseId(student.getId(), course.getId());
        AcademicAlert alert = opt.orElseGet(AcademicAlert::new);

        alert.setStudentId(student.getId());
        alert.setCourseId(course.getId());
        alert.setCourseName(course.getName());
        alert.setAttendancePercent(attendance != null ? Math.round(attendance * 10.0) / 10.0 : null);
        alert.setGradeAverage(avg != null ? Math.round(avg * 10.0) / 10.0 : null);
        alert.setMissingAssignments(missing);

        List<String> factors = new ArrayList<>();
        if (isLowAtt) factors.add(String.format("Attendance below %.0f%% (%.1f%%)", attThresh, attendance));
        if (isRiskAvg) factors.add(String.format("Subject average below %.0f%% (%.1f%%)", marksThresh, avg));
        if (missing > 0) factors.add(missing + " missing coursework assignment(s)");
        alert.setRiskFactors(String.join(" | ", factors));

        // Risk Level determination
        if (isLowAtt && isRiskAvg) {
            alert.setRiskLevel("HIGH");
            alert.setRecommendedAction("Immediate parental consultation and personalized remediation plan.");
        } else if (isLowAtt || isRiskAvg) {
            alert.setRiskLevel("MEDIUM");
            alert.setRecommendedAction("Parent voice alert advisory and faculty office hours tutoring.");
        } else {
            alert.setRiskLevel("LOW");
            alert.setRecommendedAction("Coursework submission reminder.");
        }

        if (alert.getStatus() == null) {
            alert.setStatus("ELIGIBLE");
        }

        String guardianName = parentContactRepository.findByStudentId(student.getId())
                .map(ParentContact::getGuardianName).orElse("Parent/Guardian");
        alert.setScriptPreview(generateCallScript(student, alert, guardianName));

        academicAlertRepository.save(alert);
    }

    @Override
    public AcademicAlertDto getAlertById(int alertId) {
        AcademicAlert alert = academicAlertRepository.findById(alertId).orElse(null);
        return alert != null ? toDto(alert) : null;
    }

    @Override
    @Transactional
    public AcademicAlertDto reviewAlert(int alertId, String reviewerUsername, String recommendedAction) {
        AcademicAlert alert = academicAlertRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found with ID: " + alertId));
        alert.setStatus("REVIEWED");
        alert.setReviewedBy(reviewerUsername);
        alert.setReviewedAt(LocalDateTime.now());
        if (recommendedAction != null && !recommendedAction.trim().isEmpty()) {
            alert.setRecommendedAction(recommendedAction);
        }
        AcademicAlert saved = academicAlertRepository.save(alert);
        return toDto(saved);
    }

    @Override
    @Transactional
    public AcademicAlertDto dismissAlert(int alertId, String reviewerUsername, String reason) {
        AcademicAlert alert = academicAlertRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found with ID: " + alertId));
        alert.setStatus("DISMISSED");
        alert.setReviewedBy(reviewerUsername);
        alert.setReviewedAt(LocalDateTime.now());
        alert.setRecommendedAction("Dismissed: " + (reason != null ? reason : "Acknowledged by administrator"));
        AcademicAlert saved = academicAlertRepository.save(alert);
        return toDto(saved);
    }

    @Override
    public String generateCallScript(Student student, AcademicAlert alert, String guardianName) {
        String greeting = voiceAgentService.buildInitialGreeting(
                student != null ? student.getFirstName() + " " + student.getLastName() : "the student",
                guardianName
        );
        String factBody = voiceAgentService.buildVerifiedAcademicScript(student, alert);
        return greeting + "\n\n" + factBody;
    }

    private AcademicAlertDto toDto(AcademicAlert entity) {
        AcademicAlertDto dto = new AcademicAlertDto();
        dto.setId(entity.getId());
        dto.setStudentId(entity.getStudentId());
        dto.setCourseId(entity.getCourseId());
        dto.setCourseName(entity.getCourseName());
        dto.setRiskLevel(entity.getRiskLevel());
        dto.setRiskFactors(entity.getRiskFactors());
        dto.setAttendancePercent(entity.getAttendancePercent());
        dto.setGradeAverage(entity.getGradeAverage());
        dto.setMissingAssignments(entity.getMissingAssignments());
        dto.setStatus(entity.getStatus());
        dto.setReviewedBy(entity.getReviewedBy());
        dto.setReviewedAt(entity.getReviewedAt());
        dto.setRecommendedAction(entity.getRecommendedAction());
        dto.setScriptPreview(entity.getScriptPreview());
        dto.setCreatedAt(entity.getCreatedAt());

        Student s = studentService.findByStudentId(entity.getStudentId());
        if (s != null) {
            dto.setStudentName(s.getFirstName() + " " + s.getLastName());
            dto.setStudentEmail(s.getEmail());
        }

        // Contact & Eligibility
        CallEligibilityCheck check = callConsentService.checkEligibility(entity.getStudentId());
        dto.setEligibleForCall(check.isEligible());
        dto.setIneligibilityReason(check.getReason());
        if (check.getContact() != null) {
            ParentContact c = check.getContact();
            dto.setGuardianName(c.getGuardianName());
            dto.setGuardianPhone(c.getPhoneNumber());
            dto.setGuardianRelationship(c.getRelationship());
            dto.setConsentStatus(c.getConsentStatus());
            dto.setLastContactedAt(c.getLastContactedAt());
        }

        return dto;
    }

    private Double calculateAverage(GradeDetails gradeDetails) {
        if (gradeDetails == null) return null;
        double sum = 0;
        int count = 0;
        if (gradeDetails.getGradeOne() >= 0) { sum += gradeDetails.getGradeOne(); count++; }
        if (gradeDetails.getGradeTwo() >= 0) { sum += gradeDetails.getGradeTwo(); count++; }
        if (gradeDetails.getGradeThree() >= 0) { sum += gradeDetails.getGradeThree(); count++; }
        return count == 0 ? null : (sum / count);
    }

    private Double calculateAttendance(List<AttendanceRecord> records) {
        if (records == null || records.isEmpty()) return null;
        int total = records.size();
        int attended = 0;
        for (AttendanceRecord r : records) {
            if ("PRESENT".equalsIgnoreCase(r.getStatus())) attended++;
        }
        return (attended * 100.0) / total;
    }

    private int calculateMissingAssignments(StudentCourseDetails detail) {
        if (detail == null || detail.getGradeDetails() == null) return 0;
        int missing = 0;
        GradeDetails g = detail.getGradeDetails();
        if (g.getGradeOne() < 0) missing++;
        if (g.getGradeTwo() < 0) missing++;
        if (g.getGradeThree() < 0) missing++;
        return missing;
    }
}
