package com.Studentmangment.studentmanagement.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.Studentmangment.studentmanagement.client.AiServiceClient;
import com.Studentmangment.studentmanagement.dto.ai.AiFeatureContributionDto;
import com.Studentmangment.studentmanagement.dto.ai.AiModelInfoDto;
import com.Studentmangment.studentmanagement.dto.ai.AiSimulationRequestDto;
import com.Studentmangment.studentmanagement.dto.ai.AiSimulationResponseDto;
import com.Studentmangment.studentmanagement.dto.ai.PythonAiPredictPayload;
import com.Studentmangment.studentmanagement.dto.ai.StudentAiPredictionDto;
import com.Studentmangment.studentmanagement.entity.AssignmentDetails;
import com.Studentmangment.studentmanagement.entity.AttendanceRecord;
import com.Studentmangment.studentmanagement.entity.Course;
import com.Studentmangment.studentmanagement.entity.GradeDetails;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.entity.StudentCourseDetails;
import com.Studentmangment.studentmanagement.entity.Teacher;
import com.Studentmangment.studentmanagement.repository.AttendanceRecordRepository;
import com.Studentmangment.studentmanagement.repository.ConsultationRequestRepository;
import com.Studentmangment.studentmanagement.util.SecurityRoles;

@Service
public class AiPredictionServiceImpl implements AiPredictionService {

    private static final Logger logger = LoggerFactory.getLogger(AiPredictionServiceImpl.class);

    @Autowired private AiServiceClient aiServiceClient;
    @Autowired private StudentService studentService;
    @Autowired private TeacherService teacherService;
    @Autowired private CourseService courseService;
    @Autowired private StudentCourseDetailsService studentCourseDetailsService;
    @Autowired private AssignmentDetailsService assignmentDetailsService;
    @Autowired private AttendanceRecordRepository attendanceRecordRepository;
    @Autowired private ConsultationRequestRepository consultationRepository;

    private Authentication requireAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AccessDeniedException("Authentication required for academic intelligence");
        }
        return auth;
    }

    private void enforceStudentAccess(Authentication auth, int studentId) {
        if (SecurityRoles.isAdmin(auth)) return;
        if (SecurityRoles.isStudent(auth)) {
            Student s = studentService.findByStudentName(auth.getName());
            if (s == null || s.getId() != studentId) {
                throw new AccessDeniedException("Students can only view their own academic predictions");
            }
        } else if (SecurityRoles.isTeacher(auth)) {
            Teacher t = teacherService.findByTeacherName(auth.getName());
            if (t == null) throw new AccessDeniedException("Teacher profile not found");
            boolean assigned = false;
            if (t.getCourses() != null) {
                for (Course c : t.getCourses()) {
                    if (c.getStudents() != null && c.getStudents().stream().anyMatch(st -> st.getId() == studentId)) {
                        assigned = true;
                        break;
                    }
                }
            }
            if (!assigned) {
                throw new AccessDeniedException("Faculty can only access predictions for students in their assigned courses");
            }
        }
    }

    private void enforceCourseAccess(Authentication auth, int courseId) {
        if (SecurityRoles.isAdmin(auth)) return;
        Course course = courseService.findCourseById(courseId);
        if (course == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        if (SecurityRoles.isTeacher(auth)) {
            Teacher t = teacherService.findByTeacherName(auth.getName());
            if (t == null || course.getTeacher() == null || course.getTeacher().getId() != t.getId()) {
                throw new AccessDeniedException("Faculty can only view predictions for courses they teach");
            }
        } else {
            throw new AccessDeniedException("Course-wide predictions require Faculty or Administrator credentials");
        }
    }

    @Override
    public Map<String, Object> checkHealth() {
        return aiServiceClient.checkHealth();
    }

    @Override
    public AiModelInfoDto getModelInfo() {
        return aiServiceClient.getModelInfo();
    }

    @Override
    public StudentAiPredictionDto getStudentPrediction(int studentId, Integer courseId) {
        Authentication auth = requireAuth();
        enforceStudentAccess(auth, studentId);

        Student student = studentService.findByStudentId(studentId);
        if (student == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student record not found for id: " + studentId);
        }

        PythonAiPredictPayload payload = buildAcademicFeatures(student, courseId);
        try {
            return aiServiceClient.predict(payload);
        } catch (Exception ex) {
            logger.warn("AI microservice invocation failed, generating transparent fallback projection: {}", ex.getMessage());
            return generateFallbackPrediction(payload);
        }
    }

    @Override
    public List<StudentAiPredictionDto> getCoursePredictions(int courseId) {
        Authentication auth = requireAuth();
        enforceCourseAccess(auth, courseId);

        Course course = courseService.findCourseById(courseId);
        if (course == null || course.getStudents() == null) {
            return Collections.emptyList();
        }

        List<PythonAiPredictPayload> payloads = new ArrayList<>();
        for (Student student : course.getStudents()) {
            payloads.add(buildAcademicFeatures(student, courseId));
        }

        List<StudentAiPredictionDto> results = new ArrayList<>();
        try {
            Map<String, Object> batchResp = aiServiceClient.predictBatch(payloads);
            if (batchResp != null && batchResp.get("predictions") instanceof List) {
                List<?> rawList = (List<?>) batchResp.get("predictions");
                // Convert list items
                for (Object item : rawList) {
                    if (item instanceof Map) {
                        Map<?, ?> map = (Map<?, ?>) item;
                        StudentAiPredictionDto dto = new StudentAiPredictionDto();
                        dto.setStudentId((Integer) map.get("student_id"));
                        dto.setCourseId((Integer) map.get("course_id"));
                        dto.setPredictedScore(map.get("predicted_score") != null ? ((Number) map.get("predicted_score")).doubleValue() : 70.0);
                        dto.setPerformanceCategory((String) map.get("performance_category"));
                        dto.setRiskLevel((String) map.get("risk_level"));
                        dto.setConfidenceScore(map.get("confidence_score") != null ? ((Number) map.get("confidence_score")).doubleValue() : 0.9);
                        dto.setModelVersion((String) map.get("model_version"));
                        dto.setPredictionTimestamp((String) map.get("prediction_timestamp"));
                        results.add(dto);
                    }
                }
            }
        } catch (Exception ex) {
            logger.warn("Batch AI invocation failed, using fallback projections: {}", ex.getMessage());
            for (PythonAiPredictPayload p : payloads) {
                results.add(generateFallbackPrediction(p));
            }
        }
        return results;
    }

    @Override
    public AiSimulationResponseDto simulateStudentScenario(AiSimulationRequestDto request) {
        Authentication auth = requireAuth();
        if (request.getStudentId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student ID is required for simulation");
        }
        enforceStudentAccess(auth, request.getStudentId());

        Student student = studentService.findByStudentId(request.getStudentId());
        if (student == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student record not found");
        }

        PythonAiPredictPayload baseFeatures = buildAcademicFeatures(student, request.getCourseId());

        Map<String, Object> payloadMap = new LinkedHashMap<>();
        payloadMap.put("base_features", baseFeatures);
        if (request.getHypotheticalAttendanceRate() != null) payloadMap.put("hypothetical_attendance_rate", request.getHypotheticalAttendanceRate());
        if (request.getHypotheticalInternalScore() != null) payloadMap.put("hypothetical_internal_score", request.getHypotheticalInternalScore());
        if (request.getHypotheticalAssignmentCompletion() != null) payloadMap.put("hypothetical_assignment_completion", request.getHypotheticalAssignmentCompletion());
        if (request.getHypotheticalAssignmentMarks() != null) payloadMap.put("hypothetical_assignment_marks", request.getHypotheticalAssignmentMarks());
        if (request.getAdditionalConsultations() != null) payloadMap.put("additional_consultations", request.getAdditionalConsultations());

        try {
            return aiServiceClient.simulate(payloadMap);
        } catch (Exception ex) {
            logger.warn("AI microservice simulation failed, generating transparent fallback simulation: {}", ex.getMessage());
            return generateFallbackSimulation(baseFeatures, request);
        }
    }

    @Override
    public Map<String, Object> getInstitutionalAiAnalytics() {
        Authentication auth = requireAuth();
        if (!SecurityRoles.isAdmin(auth) && !SecurityRoles.isTeacher(auth)) {
            throw new AccessDeniedException("Institutional analytics require Faculty or Admin role");
        }

        List<Student> students = studentService.findAllStudents();
        List<Course> courses = courseService.findAllCourses();

        int totalStudents = students != null ? students.size() : 0;
        int criticalRisk = 0;
        int highRisk = 0;
        int moderateRisk = 0;
        int lowRisk = 0;
        double scoreSum = 0.0;
        int evaluated = 0;

        List<Map<String, Object>> courseSummaries = new ArrayList<>();

        if (courses != null) {
            for (Course c : courses) {
                if (c.getStudents() == null || c.getStudents().isEmpty()) continue;
                double cScoreSum = 0.0;
                int cAtRisk = 0;
                for (Student s : c.getStudents()) {
                    PythonAiPredictPayload payload = buildAcademicFeatures(s, c.getId());
                    StudentAiPredictionDto pred;
                    try {
                        pred = aiServiceClient.predict(payload);
                    } catch (Exception e) {
                        pred = generateFallbackPrediction(payload);
                    }
                    scoreSum += pred.getPredictedScore();
                    cScoreSum += pred.getPredictedScore();
                    evaluated++;

                    if ("CRITICAL".equalsIgnoreCase(pred.getRiskLevel())) criticalRisk++;
                    else if ("HIGH".equalsIgnoreCase(pred.getRiskLevel())) highRisk++;
                    else if ("MODERATE".equalsIgnoreCase(pred.getRiskLevel())) moderateRisk++;
                    else lowRisk++;

                    if ("CRITICAL".equalsIgnoreCase(pred.getRiskLevel()) || "HIGH".equalsIgnoreCase(pred.getRiskLevel())) {
                        cAtRisk++;
                    }
                }
                Map<String, Object> cMap = new LinkedHashMap<>();
                cMap.put("courseId", c.getId());
                cMap.put("courseCode", c.getCode());
                cMap.put("courseName", c.getName());
                cMap.put("enrolledCount", c.getStudents().size());
                cMap.put("meanPredictedScore", Math.round((cScoreSum / c.getStudents().size()) * 10.0) / 10.0);
                cMap.put("atRiskCount", cAtRisk);
                courseSummaries.add(cMap);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalStudents", totalStudents);
        result.put("evaluatedCount", evaluated);
        result.put("institutionMeanPredictedScore", evaluated > 0 ? Math.round((scoreSum / evaluated) * 10.0) / 10.0 : 72.0);
        result.put("riskBreakdown", Map.of(
            "CRITICAL", criticalRisk,
            "HIGH", highRisk,
            "MODERATE", moderateRisk,
            "LOW", lowRisk
        ));
        result.put("courseSummaries", courseSummaries);
        result.put("aiServiceHealth", aiServiceClient.checkHealth());
        return result;
    }

    private PythonAiPredictPayload buildAcademicFeatures(Student student, Integer courseId) {
        PythonAiPredictPayload payload = new PythonAiPredictPayload();
        payload.setStudentId(student.getId());
        payload.setStudentName(student.getFirstName() + " " + student.getLastName());

        Course course = null;
        if (courseId != null) {
            course = courseService.findCourseById(courseId);
            payload.setCourseId(courseId);
            if (course != null) payload.setCourseName(course.getName());
        }

        // 1. Attendance Rate
        List<AttendanceRecord> attendanceList;
        if (courseId != null) {
            attendanceList = attendanceRecordRepository.findByStudentIdAndCourseId(student.getId(), courseId);
        } else {
            attendanceList = attendanceRecordRepository.findByStudentIdOrderBySessionDateDesc(student.getId());
        }

        double attendanceRate = 75.0;
        if (attendanceList != null && !attendanceList.isEmpty()) {
            double presentCount = 0;
            int validCount = 0;
            for (AttendanceRecord ar : attendanceList) {
                if (ar.getIsDemo() != null && ar.getIsDemo()) continue;
                validCount++;
                if ("PRESENT".equalsIgnoreCase(ar.getStatus())) presentCount += 1.0;
                else if ("LATE".equalsIgnoreCase(ar.getStatus())) presentCount += 0.5;
            }
            if (validCount > 0) {
                attendanceRate = (presentCount / validCount) * 100.0;
            }
        }
        payload.setAttendanceRate(Math.round(attendanceRate * 10.0) / 10.0);

        // 2. Internal Assessment Mark Average & Coursework
        StudentCourseDetails scd = null;
        if (courseId != null) {
            scd = studentCourseDetailsService.findByStudentAndCourseId(student.getId(), courseId);
        } else {
            List<StudentCourseDetails> allDetails = studentCourseDetailsService.findByStudentId(student.getId());
            if (allDetails != null && !allDetails.isEmpty()) scd = allDetails.get(0);
        }

        double internalAvg = 70.0;
        double asgAvg = 72.0;
        double asgComp = 80.0;
        double missingCount = 0.0;

        if (scd != null) {
            GradeDetails gd = scd.getGradeDetails();
            if (gd != null) {
                if (gd.getGradeOne() != -1) internalAvg = gd.getGradeOne();
                if (gd.getGradeTwo() != -1) asgAvg = gd.getGradeTwo();
            }

            if (scd.getAssignments() != null && !scd.getAssignments().isEmpty()) {
                int totalAsg = scd.getAssignments().size();
                int submitted = 0;
                for (com.Studentmangment.studentmanagement.entity.Assignment asg : scd.getAssignments()) {
                    AssignmentDetails ad = assignmentDetailsService.findByAssignmentAndStudentCourseDetailsId(asg.getId(), scd.getId());
                    if (ad != null && ad.getIsDone() == 1) {
                        submitted++;
                    } else {
                        missingCount += 1.0;
                    }
                }
                asgComp = totalAsg > 0 ? ((double) submitted / totalAsg) * 100.0 : 80.0;
            }
        }

        payload.setInternalAssessmentAvg(Math.round(internalAvg * 10.0) / 10.0);
        payload.setAssignmentAverageMark(Math.round(asgAvg * 10.0) / 10.0);
        payload.setAssignmentCompletionRate(Math.round(asgComp * 10.0) / 10.0);
        payload.setMissingAssignmentsCount(missingCount);

        // 3. Previous Academic Average
        List<StudentCourseDetails> history = studentCourseDetailsService.findByStudentId(student.getId());
        double priorAvg = 72.0;
        if (history != null && !history.isEmpty()) {
            double sum = 0;
            int count = 0;
            for (StudentCourseDetails h : history) {
                if (courseId == null || h.getCourseId() != courseId) {
                    GradeDetails hgd = h.getGradeDetails();
                    if (hgd != null) {
                        double hsum = 0;
                        int hcount = 0;
                        if (hgd.getGradeOne() != -1) { hsum += hgd.getGradeOne(); hcount++; }
                        if (hgd.getGradeTwo() != -1) { hsum += hgd.getGradeTwo(); hcount++; }
                        if (hgd.getGradeThree() != -1) { hsum += hgd.getGradeThree(); hcount++; }
                        if (hcount > 0) {
                            sum += (hsum / hcount);
                            count++;
                        }
                    }
                }
            }
            if (count > 0) priorAvg = sum / count;
        }
        payload.setPreviousCourseAvg(Math.round(priorAvg * 10.0) / 10.0);

        // 4. Consultation engagement
        long consults = consultationRepository.findByStudentIdOrderByRequestedAtDesc(student.getId()).stream()
            .filter(c -> "COMPLETED".equalsIgnoreCase(c.getStatus())).count();
        payload.setConsultationEngagement((double) consults);

        return payload;
    }

    private StudentAiPredictionDto generateFallbackPrediction(PythonAiPredictPayload payload) {
        double score = (0.35 * payload.getInternalAssessmentAvg()) +
                       (0.25 * payload.getAssignmentAverageMark()) +
                       (0.20 * payload.getAttendanceRate()) +
                       (0.15 * payload.getPreviousCourseAvg()) -
                       (2.0 * payload.getMissingAssignmentsCount()) +
                       (0.8 * payload.getConsultationEngagement());
        score = Math.max(15.0, Math.min(98.0, Math.round(score * 10.0) / 10.0));

        String category = score >= 75 ? "Distinction" : score >= 60 ? "First Class" : score >= 40 ? "Pass" : "At-Risk";
        String risk = (score < 40 || payload.getAttendanceRate() < 60 || payload.getMissingAssignmentsCount() >= 4) ? "CRITICAL"
                    : (score < 60 || payload.getAttendanceRate() < 75 || payload.getMissingAssignmentsCount() >= 2) ? "HIGH"
                    : (score < 75 || payload.getAttendanceRate() < 85 || payload.getMissingAssignmentsCount() >= 1) ? "MODERATE"
                    : "LOW";

        StudentAiPredictionDto dto = new StudentAiPredictionDto();
        dto.setStudentId(payload.getStudentId());
        dto.setCourseId(payload.getCourseId());
        dto.setStudentName(payload.getStudentName());
        dto.setCourseName(payload.getCourseName());
        dto.setPredictedScore(score);
        dto.setPerformanceCategory(category);
        dto.setRiskLevel(risk);
        dto.setConfidenceScore(0.85);
        dto.setModelVersion("v1.2.0-fallback-rule");
        dto.setPredictionTimestamp(LocalDateTime.now().toString());

        List<String> factors = new ArrayList<>();
        factors.add(String.format("Internal assessment level at %.1f pts", payload.getInternalAssessmentAvg()));
        factors.add(String.format("Class attendance recorded at %.1f%%", payload.getAttendanceRate()));
        if (payload.getMissingAssignmentsCount() > 0) {
            factors.add(String.format("%.0f unsubmitted coursework assignment(s)", payload.getMissingAssignmentsCount()));
        }
        dto.setKeyContributingFactors(factors);

        List<String> actions = new ArrayList<>();
        if (payload.getMissingAssignmentsCount() > 0) actions.add("Submit pending course assignments immediately.");
        if (payload.getAttendanceRate() < 75) actions.add("Improve attendance to at least 80% to avoid academic penalties.");
        if (actions.isEmpty()) actions.add("Maintain consistent study schedule and preparation for final exams.");
        dto.setRecommendedActions(actions);

        return dto;
    }

    private AiSimulationResponseDto generateFallbackSimulation(PythonAiPredictPayload base, AiSimulationRequestDto req) {
        StudentAiPredictionDto basePred = generateFallbackPrediction(base);

        PythonAiPredictPayload sim = new PythonAiPredictPayload();
        sim.setStudentId(base.getStudentId());
        sim.setCourseId(base.getCourseId());
        sim.setAttendanceRate(req.getHypotheticalAttendanceRate() != null ? req.getHypotheticalAttendanceRate() : base.getAttendanceRate());
        sim.setInternalAssessmentAvg(req.getHypotheticalInternalScore() != null ? req.getHypotheticalInternalScore() : base.getInternalAssessmentAvg());
        sim.setAssignmentCompletionRate(req.getHypotheticalAssignmentCompletion() != null ? req.getHypotheticalAssignmentCompletion() : base.getAssignmentCompletionRate());
        sim.setAssignmentAverageMark(req.getHypotheticalAssignmentMarks() != null ? req.getHypotheticalAssignmentMarks() : base.getAssignmentAverageMark());
        sim.setPreviousCourseAvg(base.getPreviousCourseAvg());
        sim.setMissingAssignmentsCount(base.getMissingAssignmentsCount());
        sim.setConsultationEngagement(base.getConsultationEngagement() + (req.getAdditionalConsultations() != null ? req.getAdditionalConsultations() : 0.0));

        StudentAiPredictionDto simPred = generateFallbackPrediction(sim);

        AiSimulationResponseDto resp = new AiSimulationResponseDto();
        resp.setBaselinePredictedScore(basePred.getPredictedScore());
        resp.setBaselineRiskLevel(basePred.getRiskLevel());
        resp.setSimulatedPredictedScore(simPred.getPredictedScore());
        resp.setSimulatedRiskLevel(simPred.getRiskLevel());
        resp.setScoreDifferential(Math.round((simPred.getPredictedScore() - basePred.getPredictedScore()) * 10.0) / 10.0);
        resp.setRiskTransition(basePred.getRiskLevel() + " -> " + simPred.getRiskLevel());
        resp.setKeyDrivers(List.of("Rule-based deterministic simulation (AI service offline)."));
        resp.setEducationalGuidance("Statistical projection calculated from academic weights.");
        resp.setModelVersion("v1.2.0-fallback-rule");
        resp.setTimestamp(LocalDateTime.now().toString());
        return resp;
    }
}
