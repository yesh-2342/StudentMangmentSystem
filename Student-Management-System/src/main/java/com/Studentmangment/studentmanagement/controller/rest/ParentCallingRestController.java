package com.Studentmangment.studentmanagement.controller.rest;

import java.security.Principal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Studentmangment.studentmanagement.dto.AcademicAlertDto;
import com.Studentmangment.studentmanagement.dto.OllamaAiStatusDto;
import com.Studentmangment.studentmanagement.dto.ParentCallRecordDto;
import com.Studentmangment.studentmanagement.dto.ParentCallingDashboardStatsDto;
import com.Studentmangment.studentmanagement.dto.ParentContactDto;
import com.Studentmangment.studentmanagement.dto.RiskThresholdConfig;
import com.Studentmangment.studentmanagement.dto.SimulatedSessionTurnRequestDto;
import com.Studentmangment.studentmanagement.dto.SimulatedSessionTurnResponseDto;
import com.Studentmangment.studentmanagement.dto.StudentAcademicSummaryDto;
import com.Studentmangment.studentmanagement.entity.AcademicAlert;
import com.Studentmangment.studentmanagement.entity.AttendanceRecord;
import com.Studentmangment.studentmanagement.entity.Course;
import com.Studentmangment.studentmanagement.entity.ParentCallRecord;
import com.Studentmangment.studentmanagement.entity.ParentContact;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.entity.StudentCourseDetails;
import com.Studentmangment.studentmanagement.entity.Teacher;
import com.Studentmangment.studentmanagement.repository.AcademicAlertRepository;
import com.Studentmangment.studentmanagement.repository.AttendanceRecordRepository;
import com.Studentmangment.studentmanagement.repository.ParentCallRecordRepository;
import com.Studentmangment.studentmanagement.repository.ParentContactRepository;
import com.Studentmangment.studentmanagement.service.AcademicRiskConfigService;
import com.Studentmangment.studentmanagement.service.AcademicRiskService;
import com.Studentmangment.studentmanagement.service.CourseService;
import com.Studentmangment.studentmanagement.service.OllamaAiService;
import com.Studentmangment.studentmanagement.service.ParentCallService;
import com.Studentmangment.studentmanagement.service.ParentContactService;
import com.Studentmangment.studentmanagement.service.StudentCourseDetailsService;
import com.Studentmangment.studentmanagement.service.StudentService;
import com.Studentmangment.studentmanagement.service.TeacherService;

@RestController
@RequestMapping("/api/parent-calling")
public class ParentCallingRestController {

    @Autowired
    private AcademicRiskService academicRiskService;

    @Autowired
    private AcademicRiskConfigService riskConfigService;

    @Autowired
    private ParentCallService parentCallService;

    @Autowired
    private ParentContactService parentContactService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private StudentCourseDetailsService studentCourseDetailsService;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private AcademicAlertRepository academicAlertRepository;

    @Autowired
    private ParentCallRecordRepository parentCallRecordRepository;

    @Autowired
    private ParentContactRepository parentContactRepository;

    @Autowired
    private OllamaAiService ollamaAiService;

    // ==========================================
    // 1. DASHBOARD STATISTICS
    // ==========================================

    @GetMapping("/dashboard-stats")
    public ResponseEntity<ParentCallingDashboardStatsDto> getDashboardStats(Principal principal) {
        ParentCallingDashboardStatsDto stats = new ParentCallingDashboardStatsDto();

        List<AcademicAlertDto> alerts = academicRiskService.scanAndGetAlerts();
        List<ParentCallRecordDto> allCalls = parentCallService.getAllCallHistory();
        List<ParentCallRecordDto> followUps = parentCallService.getFollowUpRequests();

        stats.setTotalStudentsRequiringAttention(alerts != null ? alerts.size() : 0);

        int lowAtt = 0;
        int lowMarks = 0;
        if (alerts != null) {
            double attThresh = riskConfigService.getConfig().getAttendanceThreshold();
            double marksThresh = riskConfigService.getConfig().getMarksThreshold();
            for (AcademicAlertDto a : alerts) {
                if (a.getAttendancePercent() != null && a.getAttendancePercent() < attThresh) {
                    lowAtt++;
                }
                if (a.getGradeAverage() != null && a.getGradeAverage() < marksThresh) {
                    lowMarks++;
                }
            }
        }
        stats.setStudentsLowAttendance(lowAtt);
        stats.setStudentsLowMarks(lowMarks);

        int completed = 0;
        int unanswered = 0;
        int interrupted = 0;
        if (allCalls != null) {
            for (ParentCallRecordDto c : allCalls) {
                String st = c.getStatus() != null ? c.getStatus().toUpperCase(Locale.ROOT) : "";
                if ("COMPLETED".equals(st)) completed++;
                else if ("UNANSWERED".equals(st) || "NO_ANSWER".equals(st) || "BUSY".equals(st)) unanswered++;
                else if ("INTERRUPTED".equals(st) || "FAILED".equals(st)) interrupted++;
            }
        }
        stats.setCallsCompleted(completed);
        stats.setCallsUnanswered(unanswered);
        stats.setCallsInterrupted(interrupted);
        stats.setFollowUpsRequired(followUps != null ? followUps.size() : 0);

        // Recent activity (up to 10 latest)
        if (allCalls != null && !allCalls.isEmpty()) {
            stats.setRecentActivity(allCalls.stream().limit(10).collect(Collectors.toList()));
        }

        stats.setActiveThresholds(riskConfigService.getConfig());
        stats.setAiStatus(ollamaAiService.checkStatus());

        return ResponseEntity.ok(stats);
    }

    // ==========================================
    // 2. FLAGGED STUDENTS SEARCH & FILTER
    // ==========================================

    @GetMapping("/flagged-students")
    public ResponseEntity<List<AcademicAlertDto>> getFlaggedStudents(
            @RequestParam(value = "courseId", required = false) Integer courseId,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "riskLevel", required = false) String riskLevel,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "attendanceMax", required = false) Double attendanceMax,
            @RequestParam(value = "marksMax", required = false) Double marksMax) {

        List<AcademicAlertDto> alerts = academicRiskService.scanAndGetAlerts();
        if (alerts == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<AcademicAlertDto> filtered = alerts.stream().filter(a -> {
            if (courseId != null && courseId > 0 && a.getCourseId() != courseId) {
                return false;
            }
            if (search != null && !search.trim().isEmpty()) {
                String q = search.trim().toLowerCase(Locale.ROOT);
                boolean matchesName = a.getStudentName() != null && a.getStudentName().toLowerCase(Locale.ROOT).contains(q);
                boolean matchesId = String.valueOf(a.getStudentId()).contains(q);
                boolean matchesCourse = a.getCourseName() != null && a.getCourseName().toLowerCase(Locale.ROOT).contains(q);
                if (!matchesName && !matchesId && !matchesCourse) return false;
            }
            if (riskLevel != null && !riskLevel.trim().isEmpty() && !"ALL".equalsIgnoreCase(riskLevel)) {
                if (!riskLevel.equalsIgnoreCase(a.getRiskLevel())) return false;
            }
            if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
                if (!status.equalsIgnoreCase(a.getStatus())) return false;
            }
            if (attendanceMax != null && a.getAttendancePercent() != null && a.getAttendancePercent() > attendanceMax) {
                return false;
            }
            if (marksMax != null && a.getGradeAverage() != null && a.getGradeAverage() > marksMax) {
                return false;
            }
            return true;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(filtered);
    }

    // ==========================================
    // 3. STUDENT ACADEMIC SUMMARY & CALL PREP
    // ==========================================

    @GetMapping("/students/{studentId}/academic-summary")
    public ResponseEntity<?> getStudentAcademicSummary(@PathVariable("studentId") int studentId) {
        Student student = studentService.findByStudentId(studentId);
        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        StudentAcademicSummaryDto summary = new StudentAcademicSummaryDto();
        summary.setStudentId(student.getId());
        summary.setStudentName(student.getFirstName() + " " + student.getLastName());
        summary.setEmail(student.getEmail());

        List<StudentAcademicSummaryDto.CourseAcademicSummaryDto> courseList = new ArrayList<>();
        double totalAtt = 0.0;
        int attCount = 0;
        double totalMarks = 0.0;
        int marksCount = 0;
        int totalMissing = 0;
        List<String> riskReasons = new ArrayList<>();

        double attThresh = riskConfigService.getConfig().getAttendanceThreshold();
        double marksThresh = riskConfigService.getConfig().getMarksThreshold();

        if (student.getCourses() != null) {
            for (Course c : student.getCourses()) {
                StudentAcademicSummaryDto.CourseAcademicSummaryDto cd = new StudentAcademicSummaryDto.CourseAcademicSummaryDto();
                cd.setCourseId(c.getId());
                cd.setCourseName(c.getName());
                cd.setTeacherName(c.getTeacher() != null ? c.getTeacher().getFirstName() + " " + c.getTeacher().getLastName() : "Faculty Advisor");

                StudentCourseDetails detail = studentCourseDetailsService.findByStudentAndCourseId(student.getId(), c.getId());
                Double m = detail != null ? calculateGradeAverage(detail.getGradeDetails()) : null;
                if (m != null) {
                    cd.setMarksAverage(Math.round(m * 10.0) / 10.0);
                    cd.setLetterGrade(com.Studentmangment.studentmanagement.util.AcademicRules.letterGrade(m));
                    totalMarks += m;
                    marksCount++;
                    if (m < marksThresh) {
                        cd.setLowMarks(true);
                        riskReasons.add(c.getName() + ": Assessment average " + Math.round(m) + "% (< " + (int) marksThresh + "%)");
                    }
                }

                List<AttendanceRecord> records = attendanceRecordRepository.findByStudentIdAndCourseId(student.getId(), c.getId());
                if (records != null && !records.isEmpty()) {
                    long present = records.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())).count();
                    double attPct = (double) present * 100.0 / records.size();
                    cd.setAttendancePercent(Math.round(attPct * 10.0) / 10.0);
                    totalAtt += attPct;
                    attCount++;
                    if (attPct < attThresh) {
                        cd.setLowAttendance(true);
                        riskReasons.add(c.getName() + ": Attendance rate " + Math.round(attPct) + "% (< " + (int) attThresh + "%)");
                    }
                }

                courseList.add(cd);
            }
        }
        summary.setCourses(courseList);

        if (attCount > 0) {
            summary.setOverallAttendancePercent(Math.round((totalAtt / attCount) * 10.0) / 10.0);
        } else {
            summary.setHasIncompleteData(true);
            summary.setIncompleteDataNotice("No attendance sessions recorded yet for this student.");
        }

        if (marksCount > 0) {
            summary.setOverallMarksAverage(Math.round((totalMarks / marksCount) * 10.0) / 10.0);
        } else {
            summary.setHasIncompleteData(true);
            String existingNotice = summary.getIncompleteDataNotice() != null ? summary.getIncompleteDataNotice() + " " : "";
            summary.setIncompleteDataNotice(existingNotice + "No formal assessments recorded yet.");
        }

        summary.setTotalMissingAssignments(totalMissing);
        summary.setRiskReasons(riskReasons);

        // Risk Level
        if (riskReasons.size() >= 2) {
            summary.setRiskLevel("HIGH");
        } else if (!riskReasons.isEmpty()) {
            summary.setRiskLevel("MEDIUM");
        } else {
            summary.setRiskLevel("LOW");
        }

        // Guardian Information
        ParentContact contact = parentContactRepository.findByStudentId(studentId).orElse(null);
        if (contact != null) {
            ParentContactDto gDto = new ParentContactDto();
            gDto.setId(contact.getId());
            gDto.setStudentId(contact.getStudentId());
            gDto.setGuardianName(contact.getGuardianName());
            gDto.setRelationship(contact.getRelationship());
            gDto.setPhoneNumber(contact.getPhoneNumber());
            gDto.setEmail(contact.getEmail());
            gDto.setPreferredLanguage(contact.getPreferredLanguage());
            gDto.setConsentStatus(contact.getConsentStatus());
            summary.setGuardian(gDto);
            summary.setTestGuardianProfile(false);
        } else {
            // Test guardian profile placeholder clearly marked as test
            ParentContactDto testProfile = new ParentContactDto();
            testProfile.setStudentId(studentId);
            testProfile.setGuardianName("Guardian of " + student.getFirstName());
            testProfile.setRelationship("GUARDIAN (SIMULATION PROFILE)");
            testProfile.setPhoneNumber("+91 98000 00000");
            testProfile.setEmail("guardian." + student.getUserName() + "@example.edu");
            testProfile.setPreferredLanguage("en-IN");
            testProfile.setConsentStatus("CONSENTED");
            summary.setGuardian(testProfile);
            summary.setTestGuardianProfile(true);
        }

        // Suggested call script preview
        String primaryCourse = (!courseList.isEmpty() && courseList.get(0).getCourseName() != null)
                ? courseList.get(0).getCourseName() : "academic courses";
        summary.setSuggestedCallScript(String.format(
            "Hello, this is the automated academic support assistant from Project 577 College of Engineering calling for the parent or guardian of %s. We are reaching out regarding academic progress in %s (attendance: %s, assessment: %s). Would you like to schedule an advisory consultation?",
            summary.getStudentName(),
            primaryCourse,
            summary.getOverallAttendancePercent() != null ? summary.getOverallAttendancePercent() + "%" : "N/A",
            summary.getOverallMarksAverage() != null ? summary.getOverallMarksAverage() + "%" : "N/A"
        ));

        return ResponseEntity.ok(summary);
    }

    // ==========================================
    // 4. CONFIGURABLE RISK THRESHOLDS & TEMPLATES
    // ==========================================

    @GetMapping("/risk-config")
    public ResponseEntity<RiskThresholdConfig> getRiskConfig() {
        return ResponseEntity.ok(riskConfigService.getConfig());
    }

    @PostMapping("/risk-config")
    public ResponseEntity<RiskThresholdConfig> updateRiskConfig(@RequestBody RiskThresholdConfig newConfig) {
        RiskThresholdConfig updated = riskConfigService.updateConfig(newConfig);
        return ResponseEntity.ok(updated);
    }

    // ==========================================
    // 5. SIMULATED VOICE SESSION LIFECYCLE
    // ==========================================

    @PostMapping("/session/start")
    public ResponseEntity<?> startVoiceSession(@RequestBody Map<String, Object> body, Principal principal) {
        if (!body.containsKey("studentId")) {
            return ResponseEntity.badRequest().body(Map.of("error", "studentId is required"));
        }

        int studentId = Integer.parseInt(body.get("studentId").toString());
        Integer alertId = body.containsKey("alertId") && body.get("alertId") != null
                ? Integer.parseInt(body.get("alertId").toString())
                : null;

        String language = body.containsKey("language") && body.get("language") != null
                ? body.get("language").toString()
                : "en-IN";

        String academicConcerns = body.containsKey("academicConcerns") && body.get("academicConcerns") != null
                ? body.get("academicConcerns").toString()
                : null;

        String initiatedBy = principal != null ? principal.getName() : "staff";
        ParentCallRecordDto session = parentCallService.startSimulatedSession(studentId, alertId, initiatedBy, language, academicConcerns);
        return ResponseEntity.ok(session);
    }

    @PostMapping("/session/turn")
    public ResponseEntity<SimulatedSessionTurnResponseDto> handleVoiceTurn(
            @RequestBody SimulatedSessionTurnRequestDto turnRequest) {
        SimulatedSessionTurnResponseDto response = parentCallService.handleTurn(turnRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/session/{id}/end")
    public ResponseEntity<?> endVoiceSession(@PathVariable("id") int id,
                                             @RequestBody(required = false) Map<String, Object> body) {
        String status = body != null && body.containsKey("status") && body.get("status") != null
                ? body.get("status").toString()
                : "COMPLETED";

        String reason = body != null && body.containsKey("reason") && body.get("reason") != null
                ? body.get("reason").toString()
                : "Session concluded by staff.";

        String outcome = body != null && body.containsKey("outcome") && body.get("outcome") != null
                ? body.get("outcome").toString()
                : status;

        Boolean followUpRequested = body != null && body.containsKey("followUpRequested") && body.get("followUpRequested") != null
                ? Boolean.parseBoolean(body.get("followUpRequested").toString())
                : null;

        LocalDate followUpDate = null;
        if (body != null && body.containsKey("followUpDate") && body.get("followUpDate") != null) {
            try {
                followUpDate = LocalDate.parse(body.get("followUpDate").toString());
            } catch (Exception ignored) {}
        }

        String followUpNotes = body != null && body.containsKey("followUpNotes") && body.get("followUpNotes") != null
                ? body.get("followUpNotes").toString()
                : null;

        ParentCallRecordDto ended = parentCallService.endSimulatedSession(
                id, status, reason, outcome, followUpRequested, followUpDate, followUpNotes);
        return ResponseEntity.ok(ended);
    }

    // ==========================================
    // 6. CALL HISTORY & TRANSCRIPTS
    // ==========================================

    @GetMapping("/history")
    public ResponseEntity<List<ParentCallRecordDto>> getCallHistory(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "followUp", required = false) Boolean followUp) {

        List<ParentCallRecordDto> history = parentCallService.getAllCallHistory();
        if (history == null) return ResponseEntity.ok(Collections.emptyList());

        List<ParentCallRecordDto> filtered = history.stream().filter(c -> {
            if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
                if (!status.equalsIgnoreCase(c.getStatus())) return false;
            }
            if (followUp != null && followUp) {
                if (c.getFollowUpRequested() == null || !c.getFollowUpRequested()) return false;
            }
            if (search != null && !search.trim().isEmpty()) {
                String q = search.trim().toLowerCase(Locale.ROOT);
                boolean mStudent = c.getStudentName() != null && c.getStudentName().toLowerCase(Locale.ROOT).contains(q);
                boolean mGuardian = c.getGuardianName() != null && c.getGuardianName().toLowerCase(Locale.ROOT).contains(q);
                boolean mPhone = c.getPhoneNumber() != null && c.getPhoneNumber().contains(q);
                if (!mStudent && !mGuardian && !mPhone) return false;
            }
            return true;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<?> getCallRecordById(@PathVariable("id") int id) {
        ParentCallRecordDto record = parentCallService.getCallRecordById(id);
        if (record == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(record);
    }

    // ==========================================
    // 7. FOLLOW-UP MANAGEMENT
    // ==========================================

    @GetMapping("/follow-ups")
    public ResponseEntity<List<ParentCallRecordDto>> getFollowUpRequests() {
        return ResponseEntity.ok(parentCallService.getFollowUpRequests());
    }

    @PutMapping("/follow-ups/{id}/resolve")
    public ResponseEntity<?> resolveFollowUp(@PathVariable("id") int id,
                                             @RequestBody(required = false) Map<String, String> body) {
        ParentCallRecord record = parentCallRecordRepository.findById(id).orElse(null);
        if (record == null) {
            return ResponseEntity.notFound().build();
        }

        String resolutionNotes = body != null ? body.get("notes") : "Follow-up resolved by staff.";
        record.setFollowUpRequested(false);
        String currentNotes = record.getFollowUpNotes() != null ? record.getFollowUpNotes() + " | " : "";
        record.setFollowUpNotes(currentNotes + "RESOLVED: " + resolutionNotes);
        parentCallRecordRepository.save(record);

        return ResponseEntity.ok(Map.of("message", "Follow-up resolved successfully", "id", id));
    }

    // ==========================================
    // 8. LOCAL AI & VOICE STATUS
    // ==========================================

    @GetMapping("/ai-status")
    public ResponseEntity<OllamaAiStatusDto> getAiStatus() {
        return ResponseEntity.ok(ollamaAiService.checkStatus());
    }

    private Double calculateGradeAverage(com.Studentmangment.studentmanagement.entity.GradeDetails gradeDetails) {
        if (gradeDetails == null) return null;
        double sum = 0;
        int count = 0;
        if (gradeDetails.getGradeOne() >= 0) { sum += gradeDetails.getGradeOne(); count++; }
        if (gradeDetails.getGradeTwo() >= 0) { sum += gradeDetails.getGradeTwo(); count++; }
        if (gradeDetails.getGradeThree() >= 0) { sum += gradeDetails.getGradeThree(); count++; }
        return count == 0 ? null : (sum / count);
    }
}
