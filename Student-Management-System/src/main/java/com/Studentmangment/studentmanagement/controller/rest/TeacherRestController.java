package com.Studentmangment.studentmanagement.controller.rest;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Studentmangment.studentmanagement.dto.AssignmentCreateDto;
import com.Studentmangment.studentmanagement.dto.GradeUpdateDto;
import com.Studentmangment.studentmanagement.dto.StudentAssignmentDto;
import com.Studentmangment.studentmanagement.dto.StudentCourseDto;
import com.Studentmangment.studentmanagement.dto.TeacherCourseDetailDto;
import com.Studentmangment.studentmanagement.dto.TeacherCourseDetailDto.StudentEnrollmentDto;
import com.Studentmangment.studentmanagement.dto.TeacherDashboardDto;
import com.Studentmangment.studentmanagement.entity.Assignment;
import com.Studentmangment.studentmanagement.entity.AssignmentDetails;
import com.Studentmangment.studentmanagement.entity.AttendanceRecord;
import com.Studentmangment.studentmanagement.entity.Course;
import com.Studentmangment.studentmanagement.entity.GradeDetails;
import com.Studentmangment.studentmanagement.entity.InterventionCase;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.entity.StudentCourseDetails;
import com.Studentmangment.studentmanagement.entity.Teacher;
import com.Studentmangment.studentmanagement.repository.AttendanceRecordRepository;
import com.Studentmangment.studentmanagement.repository.InterventionCaseRepository;
import com.Studentmangment.studentmanagement.service.AssignmentDetailsService;
import com.Studentmangment.studentmanagement.service.AssignmentService;
import com.Studentmangment.studentmanagement.service.CourseService;
import com.Studentmangment.studentmanagement.service.GradeDetailsService;
import com.Studentmangment.studentmanagement.service.StudentCourseDetailsService;
import com.Studentmangment.studentmanagement.service.StudentService;
import com.Studentmangment.studentmanagement.service.TeacherService;
import com.Studentmangment.studentmanagement.util.AcademicRules;

@RestController
@RequestMapping("/api/teachers")
public class TeacherRestController {

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private StudentCourseDetailsService studentCourseDetailsService;

    @Autowired
    private AssignmentDetailsService assignmentDetailsService;

    @Autowired
    private AssignmentService assignmentService;

    @Autowired
    private GradeDetailsService gradeDetailsService;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private InterventionCaseRepository interventionCaseRepository;

    @GetMapping("/{teacherId}/dashboard")
    public ResponseEntity<?> getTeacherDashboard(@PathVariable("teacherId") int teacherId) {
        if (!canAccessTeacher(teacherId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied for this teacher record"));
        }
        Teacher teacher = teacherService.findByTeacherId(teacherId);
        if (teacher == null) return ResponseEntity.notFound().build();

        TeacherDashboardDto dashboard = new TeacherDashboardDto();
        dashboard.setTeacherId(teacher.getId());
        dashboard.setTeacherName(teacher.getUserName());
        dashboard.setFirstName(teacher.getFirstName());
        dashboard.setLastName(teacher.getLastName());
        dashboard.setEmail(teacher.getEmail());

        List<Course> courses = teacher.getCourses() != null ? teacher.getCourses() : new ArrayList<>();
        dashboard.setTotalCourses(courses.size());

        Set<Integer> uniqueStudentIds = new HashSet<>();
        int totalAssignments = 0;
        int upcomingAssignments = 0;
        List<StudentAssignmentDto> assignmentDtos = new ArrayList<>();
        List<StudentCourseDto> courseDtos = new ArrayList<>();

        for (Course c : courses) {
            StudentCourseDto cDto = new StudentCourseDto();
            cDto.setId(c.getId());
            cDto.setCode(c.getCode());
            cDto.setName(c.getName());
            cDto.setTeacherName(teacher.getFirstName() + " " + teacher.getLastName());

            List<Student> students = c.getStudents();
            if (students != null) {
                cDto.setTotalAssignments(students.size()); // repurpose for student count in listing
                for (Student s : students) {
                    uniqueStudentIds.add(s.getId());
                }

                if (!students.isEmpty()) {
                    StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(students.get(0).getId(), c.getId());
                    if (scd != null && scd.getAssignments() != null) {
                        for (Assignment a : scd.getAssignments()) {
                            totalAssignments++;
                            int daysRemaining = findDayDifference(a);
                            if (daysRemaining >= 0) {
                                upcomingAssignments++;
                            }

                            StudentAssignmentDto aDto = new StudentAssignmentDto();
                            aDto.setId(a.getId());
                            aDto.setName(a.getName());
                            aDto.setDescription(a.getDescription());
                            aDto.setDueDate(a.getDueDate());
                            aDto.setDaysRemaining(daysRemaining);
                            aDto.setCourseId(c.getId());
                            aDto.setCourseName(c.getName());
                            aDto.setCourseCode(c.getCode());
                            assignmentDtos.add(aDto);
                        }
                    }
                }
            }
            courseDtos.add(cDto);
        }

        dashboard.setTotalStudents(uniqueStudentIds.size());
        dashboard.setTotalAssignments(totalAssignments);
        dashboard.setUpcomingAssignments(upcomingAssignments);
        dashboard.setCourses(courseDtos);
        dashboard.setRecentAssignments(assignmentDtos);

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/{teacherId}/courses")
    public ResponseEntity<?> getTeacherCourses(@PathVariable("teacherId") int teacherId) {
        if (!canAccessTeacher(teacherId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied for this teacher record"));
        }
        Teacher teacher = teacherService.findByTeacherId(teacherId);
        if (teacher == null) return ResponseEntity.notFound().build();

        List<StudentCourseDto> list = new ArrayList<>();
        if (teacher.getCourses() != null) {
            for (Course c : teacher.getCourses()) {
                StudentCourseDto dto = new StudentCourseDto();
                dto.setId(c.getId());
                dto.setCode(c.getCode());
                dto.setName(c.getName());
                dto.setTeacherName(teacher.getFirstName() + " " + teacher.getLastName());
                dto.setTotalAssignments(c.getStudents() != null ? c.getStudents().size() : 0);
                list.add(dto);
            }
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{teacherId}/courses/{courseId}")
    public ResponseEntity<?> getTeacherCourseDetails(@PathVariable("teacherId") int teacherId, @PathVariable("courseId") int courseId) {
        if (!canAccessTeacherCourse(teacherId, courseId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied for this course"));
        }
        Teacher teacher = teacherService.findByTeacherId(teacherId);
        Course course = courseService.findCourseById(courseId);
        if (teacher == null || course == null) return ResponseEntity.notFound().build();

        TeacherCourseDetailDto dto = new TeacherCourseDetailDto();
        dto.setCourseId(course.getId());
        dto.setCourseCode(course.getCode());
        dto.setCourseName(course.getName());
        dto.setTeacherId(teacher.getId());
        dto.setTeacherName(teacher.getFirstName() + " " + teacher.getLastName());

        List<StudentEnrollmentDto> enrollmentDtos = new ArrayList<>();
        List<StudentAssignmentDto> assignmentDtos = new ArrayList<>();

        List<Student> students = course.getStudents();
        if (students != null && !students.isEmpty()) {
            for (Student s : students) {
                StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(s.getId(), courseId);
                StudentEnrollmentDto sDto = new StudentEnrollmentDto();
                sDto.setStudentId(s.getId());
                sDto.setUserName(s.getUserName());
                sDto.setFirstName(s.getFirstName());
                sDto.setLastName(s.getLastName());
                sDto.setEmail(s.getEmail());

                if (scd != null && scd.getGradeDetails() != null) {
                    GradeDetails gd = scd.getGradeDetails();
                    sDto.setGradeDetailsId(gd.getId());
                    sDto.setGradeOne(gd.getGradeOne());
                    sDto.setGradeTwo(gd.getGradeTwo());
                    sDto.setGradeThree(gd.getGradeThree());

                    double sum = 0;
                    int count = 0;
                    if (gd.getGradeOne() != -1) { sum += gd.getGradeOne(); count++; }
                    if (gd.getGradeTwo() != -1) { sum += gd.getGradeTwo(); count++; }
                    if (gd.getGradeThree() != -1) { sum += gd.getGradeThree(); count++; }
                    sDto.setAverage(count > 0 ? String.format("%.1f", sum / count) : "N/A");
                }
                enrollmentDtos.add(sDto);
            }

            StudentCourseDetails firstScd = studentCourseDetailsService.findByStudentAndCourseId(students.get(0).getId(), courseId);
            if (firstScd != null && firstScd.getAssignments() != null) {
                for (Assignment a : firstScd.getAssignments()) {
                    StudentAssignmentDto aDto = new StudentAssignmentDto();
                    aDto.setId(a.getId());
                    aDto.setName(a.getName());
                    aDto.setDescription(a.getDescription());
                    aDto.setDueDate(a.getDueDate());
                    aDto.setDaysRemaining(findDayDifference(a));
                    aDto.setCourseId(courseId);
                    aDto.setCourseName(course.getName());
                    aDto.setCourseCode(course.getCode());
                    assignmentDtos.add(aDto);
                }
            }
        }

        dto.setStudents(enrollmentDtos);
        dto.setAssignments(assignmentDtos);

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{teacherId}/courses/{courseId}/assignments")
    public ResponseEntity<?> addAssignment(
            @PathVariable("teacherId") int teacherId,
            @PathVariable("courseId") int courseId,
            @Valid @RequestBody AssignmentCreateDto dto) {

        if (!canAccessTeacherCourse(teacherId, courseId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied for this course"));
        }
        Course course = courseService.findCourseById(courseId);
        if (course == null) return ResponseEntity.notFound().build();

        Assignment assignment = new Assignment();
        assignment.setName(dto.getName());
        assignment.setDescription(dto.getDescription());
        assignment.setDueDate(dto.getDueDate());
        assignment.setDaysRemaining(findDayDifference(assignment));
        assignmentService.save(assignment);

        List<Student> students = course.getStudents();
        if (students != null) {
            for (Student student : students) {
                StudentCourseDetails studentCourseDetails = studentCourseDetailsService.findByStudentAndCourseId(student.getId(), courseId);
                if (studentCourseDetails != null) {
                    AssignmentDetails assignmentDetail = new AssignmentDetails();
                    assignmentDetail.setAssignmentId(assignment.getId());
                    assignmentDetail.setStudentCourseDetailsId(studentCourseDetails.getId());
                    assignmentDetail.setIsDone(0);
                    assignmentDetailsService.save(assignmentDetail);
                }
            }
        }

        return ResponseEntity.ok(Map.of("message", "Assignment created successfully", "assignmentId", assignment.getId()));
    }

    @DeleteMapping("/{teacherId}/courses/{courseId}/assignments/{assignmentId}")
    public ResponseEntity<?> deleteAssignment(
            @PathVariable("teacherId") int teacherId,
            @PathVariable("courseId") int courseId,
            @PathVariable("assignmentId") int assignmentId) {

        if (!canAccessTeacherCourse(teacherId, courseId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied for this course"));
        }
        assignmentService.deleteAssignmentById(assignmentId);
        return ResponseEntity.ok(Map.of("message", "Assignment deleted successfully"));
    }

    @GetMapping("/{teacherId}/courses/{courseId}/assignments/{assignmentId}/status")
    public ResponseEntity<?> getAssignmentStatus(
            @PathVariable("teacherId") int teacherId,
            @PathVariable("courseId") int courseId,
            @PathVariable("assignmentId") int assignmentId) {

        if (!canAccessTeacherCourse(teacherId, courseId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied for this course"));
        }
        Course course = courseService.findCourseById(courseId);
        if (course == null) return ResponseEntity.notFound().build();

        List<Student> students = course.getStudents();
        List<Map<String, Object>> statusList = new ArrayList<>();

        if (students != null) {
            for (Student s : students) {
                StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(s.getId(), courseId);
                AssignmentDetails ad = null;
                if (scd != null) {
                    ad = assignmentDetailsService.findByAssignmentAndStudentCourseDetailsId(assignmentId, scd.getId());
                }

                Map<String, Object> map = new HashMap<>();
                map.put("studentId", s.getId());
                map.put("studentName", s.getFirstName() + " " + s.getLastName());
                map.put("email", s.getEmail());
                map.put("status", (ad != null && ad.getIsDone() == 1) ? "completed" : "incomplete");
                map.put("isDone", (ad != null) ? ad.getIsDone() : 0);
                statusList.add(map);
            }
        }

        return ResponseEntity.ok(statusList);
    }

    @PostMapping("/{teacherId}/courses/{courseId}/editGrades/save/{gradeDetailsId}")
    public ResponseEntity<?> modifyGrades(
            @PathVariable("teacherId") int teacherId,
            @PathVariable("courseId") int courseId,
            @PathVariable("gradeDetailsId") int gradeDetailsId,
            @RequestBody GradeUpdateDto dto) {

        if (!canAccessTeacherCourse(teacherId, courseId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied for this course"));
        }
        GradeDetails existingGrade = gradeDetailsService.findById(gradeDetailsId);
        if (existingGrade == null) return ResponseEntity.notFound().build();

        StudentCourseDetails studentCourseDetails = existingGrade.getStudentCourseDetails();
        GradeDetails newGrade = new GradeDetails();
        newGrade.setGradeOne(dto.getGradeOne() != null ? dto.getGradeOne() : -1);
        newGrade.setGradeTwo(dto.getGradeTwo() != null ? dto.getGradeTwo() : -1);
        newGrade.setGradeThree(dto.getGradeThree() != null ? dto.getGradeThree() : -1);

        studentCourseDetails.setGradeDetails(newGrade);
        studentCourseDetailsService.save(studentCourseDetails);
        gradeDetailsService.deleteById(gradeDetailsId);

        return ResponseEntity.ok(Map.of("message", "Grades updated successfully"));
    }

    // ==========================================
    // TEACHER STUDENT MANAGEMENT & EDIT WORKFLOW
    // ==========================================

    @GetMapping("/{teacherId}/students")
    public ResponseEntity<?> getTeacherStudents(@PathVariable("teacherId") int teacherId) {
        if (!canAccessTeacher(teacherId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied for this teacher record"));
        }
        Teacher teacher = teacherService.findByTeacherId(teacherId);
        if (teacher == null) return ResponseEntity.notFound().build();

        Set<Integer> seen = new HashSet<>();
        List<Map<String, Object>> students = new ArrayList<>();

        if (teacher.getCourses() != null) {
            for (Course c : teacher.getCourses()) {
                if (c.getStudents() != null) {
                    for (Student s : c.getStudents()) {
                        if (!seen.contains(s.getId())) {
                            seen.add(s.getId());
                            students.add(buildStudentAcademicSummary(s, teacher));
                        }
                    }
                }
            }
        }

        return ResponseEntity.ok(students);
    }

    @GetMapping("/{teacherId}/students/{studentId}")
    public ResponseEntity<?> getTeacherStudentDetails(@PathVariable("teacherId") int teacherId, @PathVariable("studentId") int studentId) {
        if (!canAccessTeacher(teacherId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied for this teacher record"));
        }
        Teacher teacher = teacherService.findByTeacherId(teacherId);
        Student student = studentService.findByStudentId(studentId);
        if (teacher == null || student == null) return ResponseEntity.notFound().build();

        boolean isAuthorized = isStudentInTeacherCourses(student, teacher);
        if (!isAuthorized && !isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Student is not enrolled in your classes"));
        }

        Map<String, Object> details = buildStudentAcademicSummary(student, teacher);
        return ResponseEntity.ok(details);
    }

    @PutMapping("/{teacherId}/students/{studentId}")
    public ResponseEntity<?> updateTeacherStudent(
            @PathVariable("teacherId") int teacherId,
            @PathVariable("studentId") int studentId,
            @RequestBody Map<String, Object> payload) {

        if (!canAccessTeacher(teacherId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied for this teacher record"));
        }
        Teacher teacher = teacherService.findByTeacherId(teacherId);
        Student student = studentService.findByStudentId(studentId);
        if (teacher == null || student == null) return ResponseEntity.notFound().build();

        boolean isAuthorized = isStudentInTeacherCourses(student, teacher);
        if (!isAuthorized && !isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Faculty can only edit students in assigned courses"));
        }

        // Validate and apply permitted profile updates only
        String firstName = (String) payload.get("firstName");
        String lastName = (String) payload.get("lastName");
        String email = (String) payload.get("email");

        if (firstName == null || firstName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "First name cannot be blank"));
        }
        if (lastName == null || lastName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Last name cannot be blank"));
        }
        if (email == null || !email.contains("@")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Valid email address is required"));
        }

        student.setFirstName(firstName.trim());
        student.setLastName(lastName.trim());
        student.setEmail(email.trim());

        studentService.save(student);

        Map<String, Object> result = buildStudentAcademicSummary(student, teacher);
        result.put("message", "Student profile updated successfully");
        return ResponseEntity.ok(result);
    }

    // ==========================================
    // ONE-CLICK AT-RISK STUDENTS WORKFLOW (PHASE 4)
    // ==========================================

    @GetMapping("/{teacherId}/at-risk")
    public ResponseEntity<?> getTeacherAtRiskStudents(@PathVariable("teacherId") int teacherId) {
        if (!canAccessTeacher(teacherId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied for this teacher record"));
        }
        Teacher teacher = teacherService.findByTeacherId(teacherId);
        if (teacher == null) return ResponseEntity.notFound().build();

        Set<Integer> processedStudents = new HashSet<>();
        List<Map<String, Object>> atRiskStudents = new ArrayList<>();

        if (teacher.getCourses() != null) {
            for (Course course : teacher.getCourses()) {
                if (course.getStudents() == null) continue;
                for (Student student : course.getStudents()) {
                    if (processedStudents.contains(student.getId())) continue;

                    StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(student.getId(), course.getId());
                    Double avg = scd != null ? calculateCourseAverage(scd.getGradeDetails()) : null;
                    List<AttendanceRecord> attendanceRecords = attendanceRecordRepository.findByStudentIdAndCourseId(student.getId(), course.getId());
                    Double attendancePct = calculateAttendancePercent(attendanceRecords);

                    int missingAssignments = countMissingAssignments(scd);

                    boolean isLowAvg = AcademicRules.isAtRiskAverage(avg);
                    boolean isLowAtt = AcademicRules.isLowAttendance(attendancePct);
                    boolean hasMissing = missingAssignments > 0;

                    if (isLowAvg || isLowAtt || hasMissing) {
                        processedStudents.add(student.getId());

                        Map<String, Object> item = new LinkedHashMap<>();
                        item.put("studentId", student.getId());
                        item.put("studentName", student.getFirstName() + " " + student.getLastName());
                        item.put("userName", student.getUserName());
                        item.put("email", student.getEmail());
                        item.put("courseId", course.getId());
                        item.put("courseCode", course.getCode());
                        item.put("courseName", course.getName());
                        item.put("academicAverage", avg != null ? avg : "N/A");
                        item.put("gradeAverage", avg);
                        item.put("attendancePercentage", attendancePct != null ? attendancePct : "N/A");
                        item.put("attendancePercent", attendancePct);
                        item.put("missingAssignments", missingAssignments);

                        // Determine severity level & transparent reasons
                        List<String> riskReasons = new ArrayList<>();
                        String riskLevel = "Moderate";
                        if (avg != null && avg < 50) {
                            riskLevel = "Critical";
                            riskReasons.add("Critical assessment average below 50% (" + String.format("%.1f", avg) + "%)");
                        } else if (isLowAvg) {
                            riskLevel = "High";
                            riskReasons.add("Assessment average below institutional threshold 60% (" + String.format("%.1f", avg) + "%)");
                        }

                        if (attendancePct != null && attendancePct < 60) {
                            riskLevel = "Critical";
                            riskReasons.add("Critical attendance below 60% (" + String.format("%.1f", attendancePct) + "%)");
                        } else if (isLowAtt) {
                            if (!"Critical".equals(riskLevel)) riskLevel = "High";
                            riskReasons.add("Attendance below 75% threshold (" + String.format("%.1f", attendancePct) + "%)");
                        }

                        if (hasMissing) {
                            riskReasons.add(missingAssignments + " incomplete / missing assignment(s)");
                        }

                        item.put("riskLevel", riskLevel);
                        item.put("riskReasons", riskReasons);
                        item.put("riskReason", String.join(" | ", riskReasons));

                        // Fetch existing intervention status
                        List<InterventionCase> cases = interventionCaseRepository.findByStudentIdOrderByUpdatedAtDesc(student.getId());
                        if (cases != null && !cases.isEmpty()) {
                            InterventionCase latest = cases.get(0);
                            item.put("interventionStatus", latest.getStatus());
                            item.put("interventionReason", latest.getReason());
                            item.put("actionPlan", latest.getActionPlan());
                            item.put("lastUpdated", latest.getCreatedAt() != null ? latest.getCreatedAt().toString() : "Recent");
                        } else {
                            item.put("interventionStatus", "NO_ACTIVE_INTERVENTION");
                            item.put("lastUpdated", "None");
                        }

                        atRiskStudents.add(item);
                    }
                }
            }
        }

        return ResponseEntity.ok(atRiskStudents);
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private Map<String, Object> buildStudentAcademicSummary(Student s, Teacher teacher) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", s.getId());
        map.put("studentId", s.getId());
        map.put("userName", s.getUserName());
        map.put("firstName", s.getFirstName());
        map.put("lastName", s.getLastName());
        map.put("email", s.getEmail());

        List<Map<String, Object>> enrolledCourses = new ArrayList<>();
        double totalSum = 0;
        int totalGradesCount = 0;
        int missingAssignments = 0;

        if (teacher.getCourses() != null) {
            for (Course c : teacher.getCourses()) {
                StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(s.getId(), c.getId());
                if (scd != null) {
                    Map<String, Object> cMap = new HashMap<>();
                    cMap.put("id", c.getId());
                    cMap.put("code", c.getCode());
                    cMap.put("name", c.getName());

                    if (scd.getGradeDetails() != null) {
                        GradeDetails gd = scd.getGradeDetails();
                        cMap.put("gradeOne", gd.getGradeOne());
                        cMap.put("gradeTwo", gd.getGradeTwo());
                        cMap.put("gradeThree", gd.getGradeThree());
                        Double cAvg = calculateCourseAverage(gd);
                        cMap.put("average", cAvg);
                        if (cAvg != null) {
                            totalSum += cAvg;
                            totalGradesCount++;
                        }
                    }
                    missingAssignments += countMissingAssignments(scd);
                    enrolledCourses.add(cMap);
                }
            }
        }

        map.put("courses", enrolledCourses);
        map.put("courseCount", enrolledCourses.size());
        map.put("courseName", !enrolledCourses.isEmpty() ? enrolledCourses.get(0).get("name") : "Enrolled");
        map.put("courseCode", !enrolledCourses.isEmpty() ? enrolledCourses.get(0).get("code") : "");

        Double overallAverage = totalGradesCount > 0 ? Math.round((totalSum / totalGradesCount) * 10.0) / 10.0 : null;
        map.put("average", overallAverage != null ? overallAverage : "N/A");
        map.put("gradeAverage", overallAverage);

        List<AttendanceRecord> attendanceRecords = attendanceRecordRepository.findByStudentIdOrderBySessionDateDesc(s.getId());
        Double attendancePct = calculateAttendancePercent(attendanceRecords);
        map.put("attendancePercentage", attendancePct != null ? attendancePct : "N/A");
        map.put("attendancePercent", attendancePct);

        map.put("missingAssignmentsCount", missingAssignments);

        boolean isAtRisk = (overallAverage != null && overallAverage < 60) || (attendancePct != null && attendancePct < 75) || missingAssignments > 0;
        map.put("isAtRisk", isAtRisk);
        map.put("riskStatus", isAtRisk ? (overallAverage != null && overallAverage < 50 ? "High Risk" : "Moderate Risk") : (overallAverage != null ? "Good Standing" : "Needs Data"));

        List<InterventionCase> cases = interventionCaseRepository.findByStudentIdOrderByUpdatedAtDesc(s.getId());
        map.put("activeInterventionsCount", cases != null ? cases.stream().filter(c -> !"CLOSED".equalsIgnoreCase(c.getStatus()) && !"RESOLVED".equalsIgnoreCase(c.getStatus())).count() : 0);

        return map;
    }

    private boolean isStudentInTeacherCourses(Student student, Teacher teacher) {
        if (teacher.getCourses() == null) return false;
        for (Course c : teacher.getCourses()) {
            if (c.getStudents() != null && c.getStudents().contains(student)) {
                return true;
            }
        }
        return false;
    }

    private Double calculateCourseAverage(GradeDetails gd) {
        if (gd == null) return null;
        double sum = 0;
        int count = 0;
        if (gd.getGradeOne() != -1) { sum += gd.getGradeOne(); count++; }
        if (gd.getGradeTwo() != -1) { sum += gd.getGradeTwo(); count++; }
        if (gd.getGradeThree() != -1) { sum += gd.getGradeThree(); count++; }
        return count > 0 ? Math.round((sum / count) * 10.0) / 10.0 : null;
    }

    private Double calculateAttendancePercent(List<AttendanceRecord> records) {
        if (records == null || records.isEmpty()) return null;
        long present = records.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus()) || "LATE".equalsIgnoreCase(r.getStatus())).count();
        return Math.round((present * 100.0 / records.size()) * 10.0) / 10.0;
    }

    private int countMissingAssignments(StudentCourseDetails scd) {
        if (scd == null || scd.getAssignments() == null) return 0;
        int missing = 0;
        for (Assignment a : scd.getAssignments()) {
            AssignmentDetails ad = assignmentDetailsService.findByAssignmentAndStudentCourseDetailsId(a.getId(), scd.getId());
            if (ad == null || ad.getIsDone() != 1) {
                missing++;
            }
        }
        return missing;
    }

    private int findDayDifference(Assignment assignment) {
        String dateString = assignment.getDueDate();
        if (dateString == null || dateString.isEmpty()) return -1;
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        try {
            LocalDate dueDate = LocalDate.parse(dateString, dtf);
            LocalDate today = LocalDate.now();
            return (int) Duration.between(today.atStartOfDay(), dueDate.atStartOfDay()).toDays();
        } catch (Exception e) {
            return -1;
        }
    }

    private boolean canAccessTeacher(int teacherId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) return false;
        if (isAdmin()) return true;
        if (!hasAuthority(authentication, "ROLE_TEACHER") && !hasAuthority(authentication, "TEACHER")) return false;

        Teacher teacher = teacherService.findByTeacherName(authentication.getName());
        return teacher != null && teacher.getId() == teacherId;
    }

    private boolean canAccessTeacherCourse(int teacherId, int courseId) {
        if (!canAccessTeacher(teacherId)) return false;
        if (isAdmin()) return true;

        Course course = courseService.findCourseById(courseId);
        return course != null && course.getTeacher() != null && course.getTeacher().getId() == teacherId;
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && (hasAuthority(authentication, "ROLE_ADMIN") || hasAuthority(authentication, "ADMIN"));
    }

    private boolean hasAuthority(Authentication authentication, String authority) {
        return authentication.getAuthorities().stream()
            .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals(authority));
    }
}
