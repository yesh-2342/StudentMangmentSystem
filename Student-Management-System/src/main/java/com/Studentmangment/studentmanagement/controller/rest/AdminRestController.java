package com.Studentmangment.studentmanagement.controller.rest;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Studentmangment.studentmanagement.dao.RoleDao;
import com.Studentmangment.studentmanagement.dto.AdminDashboardDto;
import com.Studentmangment.studentmanagement.dto.AdminDashboardDto.CourseItemDto;
import com.Studentmangment.studentmanagement.dto.AdminDashboardDto.StudentItemDto;
import com.Studentmangment.studentmanagement.dto.AdminDashboardDto.TeacherItemDto;
import com.Studentmangment.studentmanagement.dto.AssignmentCreateDto;
import com.Studentmangment.studentmanagement.dto.CourseCreateDto;
import com.Studentmangment.studentmanagement.dto.EnrollStudentDto;
import com.Studentmangment.studentmanagement.dto.GradeUpdateDto;
import com.Studentmangment.studentmanagement.entity.Assignment;
import com.Studentmangment.studentmanagement.entity.AssignmentDetails;
import com.Studentmangment.studentmanagement.entity.AttendanceRecord;
import com.Studentmangment.studentmanagement.entity.ConsultationRequest;
import com.Studentmangment.studentmanagement.entity.Course;
import com.Studentmangment.studentmanagement.entity.FacultyAttendance;
import com.Studentmangment.studentmanagement.entity.GradeDetails;
import com.Studentmangment.studentmanagement.entity.InterventionCase;
import com.Studentmangment.studentmanagement.entity.LibraryBook;
import com.Studentmangment.studentmanagement.entity.Role;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.entity.StudentCourseDetails;
import com.Studentmangment.studentmanagement.entity.Teacher;
import com.Studentmangment.studentmanagement.repository.AttendanceRecordRepository;
import com.Studentmangment.studentmanagement.repository.ConsultationRequestRepository;
import com.Studentmangment.studentmanagement.repository.FacultyAttendanceRepository;
import com.Studentmangment.studentmanagement.repository.InterventionCaseRepository;
import com.Studentmangment.studentmanagement.repository.LibraryBookRepository;
import com.Studentmangment.studentmanagement.service.AssignmentDetailsService;
import com.Studentmangment.studentmanagement.service.AssignmentService;
import com.Studentmangment.studentmanagement.service.CourseService;
import com.Studentmangment.studentmanagement.service.GradeDetailsService;
import com.Studentmangment.studentmanagement.service.StudentCourseDetailsService;
import com.Studentmangment.studentmanagement.service.StudentService;
import com.Studentmangment.studentmanagement.service.TeacherService;
import com.Studentmangment.studentmanagement.user.UserDto;
import com.Studentmangment.studentmanagement.util.AcademicRules;

@RestController
@RequestMapping("/api/admin")
public class AdminRestController {

    @Autowired private CourseService courseService;
    @Autowired private TeacherService teacherService;
    @Autowired private StudentService studentService;
    @Autowired private StudentCourseDetailsService studentCourseDetailsService;
    @Autowired private GradeDetailsService gradeDetailsService;
    @Autowired private AssignmentService assignmentService;
    @Autowired private AssignmentDetailsService assignmentDetailsService;
    @Autowired private AttendanceRecordRepository attendanceRecordRepository;
    @Autowired private FacultyAttendanceRepository facultyAttendanceRepository;
    @Autowired private InterventionCaseRepository interventionCaseRepository;
    @Autowired private ConsultationRequestRepository consultationRequestRepository;
    @Autowired private LibraryBookRepository libraryBookRepository;
    @Autowired private RoleDao roleDao;
    @Autowired private BCryptPasswordEncoder passwordEncoder;

    // ==========================================
    // 1. ADMIN DASHBOARD & LIVE INSTITUTIONAL STATS
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        List<Student> students = studentService.findAllStudents();
        List<Teacher> teachers = teacherService.findAllTeachers();
        List<Course> courses = courseService.findAllCourses();

        int totalStudents = students != null ? students.size() : 0;
        int totalTeachers = teachers != null ? teachers.size() : 0;
        int totalCourses = courses != null ? courses.size() : 0;

        // Calculate institutional analytics
        int totalEnrolments = 0;
        int atRiskStudentsCount = 0;
        int lowAttendanceCount = 0;
        double overallGradeSum = 0;
        int overallGradesCount = 0;

        List<Map<String, Object>> courseWiseStats = new ArrayList<>();

        if (courses != null) {
            for (Course c : courses) {
                int enrolledCount = c.getStudents() != null ? c.getStudents().size() : 0;
                totalEnrolments += enrolledCount;

                double courseSum = 0;
                int courseCount = 0;
                if (c.getStudents() != null) {
                    for (Student s : c.getStudents()) {
                        StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(s.getId(), c.getId());
                        if (scd != null && scd.getGradeDetails() != null) {
                            GradeDetails gd = scd.getGradeDetails();
                            if (gd.getGradeOne() != -1) { courseSum += gd.getGradeOne(); courseCount++; overallGradeSum += gd.getGradeOne(); overallGradesCount++; }
                            if (gd.getGradeTwo() != -1) { courseSum += gd.getGradeTwo(); courseCount++; overallGradeSum += gd.getGradeTwo(); overallGradesCount++; }
                            if (gd.getGradeThree() != -1) { courseSum += gd.getGradeThree(); courseCount++; overallGradeSum += gd.getGradeThree(); overallGradesCount++; }
                        }
                    }
                }

                Map<String, Object> cStat = new HashMap<>();
                cStat.put("id", c.getId());
                cStat.put("code", c.getCode());
                cStat.put("name", c.getName());
                cStat.put("teacherName", c.getTeacher() != null ? c.getTeacher().getFirstName() + " " + c.getTeacher().getLastName() : "Unassigned");
                cStat.put("studentCount", enrolledCount);
                cStat.put("averageGrade", courseCount > 0 ? Math.round((courseSum / courseCount) * 10.0) / 10.0 : null);
                courseWiseStats.add(cStat);
            }
        }

        // Count at-risk students
        if (students != null) {
            for (Student s : students) {
                List<StudentCourseDetails> scdList = studentCourseDetailsService.findByStudentId(s.getId());
                double sSum = 0;
                int sCount = 0;
                if (scdList != null) {
                    for (StudentCourseDetails scd : scdList) {
                        if (scd.getGradeDetails() != null) {
                            GradeDetails gd = scd.getGradeDetails();
                            if (gd.getGradeOne() != -1) { sSum += gd.getGradeOne(); sCount++; }
                            if (gd.getGradeTwo() != -1) { sSum += gd.getGradeTwo(); sCount++; }
                            if (gd.getGradeThree() != -1) { sSum += gd.getGradeThree(); sCount++; }
                        }
                    }
                }
                Double studentAvg = sCount > 0 ? (sSum / sCount) : null;
                List<AttendanceRecord> records = attendanceRecordRepository.findByStudentIdOrderBySessionDateDesc(s.getId());
                long presentCount = records.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus()) || "LATE".equalsIgnoreCase(r.getStatus())).count();
                Double attPct = !records.isEmpty() ? (presentCount * 100.0 / records.size()) : null;

                if (studentAvg != null && studentAvg < 60) atRiskStudentsCount++;
                if (attPct != null && attPct < 75) lowAttendanceCount++;
            }
        }

        // Attendance stats
        List<AttendanceRecord> allAttendance = attendanceRecordRepository.findAll();
        long totalStudentPresent = allAttendance.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus()) || "LATE".equalsIgnoreCase(r.getStatus())).count();
        double studentAttendanceRate = !allAttendance.isEmpty() ? Math.round((totalStudentPresent * 100.0 / allAttendance.size()) * 10.0) / 10.0 : 85.0;

        List<FacultyAttendance> allFacultyAttendance = facultyAttendanceRepository.findAll();
        long totalFacultyPresent = allFacultyAttendance.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus()) || "LATE".equalsIgnoreCase(r.getStatus())).count();
        double facultyAttendanceRate = !allFacultyAttendance.isEmpty() ? Math.round((totalFacultyPresent * 100.0 / allFacultyAttendance.size()) * 10.0) / 10.0 : 92.0;

        long activeInterventions = interventionCaseRepository.count();
        long pendingConsultations = consultationRequestRepository.findAll().stream().filter(c -> "PENDING".equalsIgnoreCase(c.getStatus())).count();
        long libraryBooksCount = libraryBookRepository.count();

        // Build Response
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalStudents", totalStudents);
        res.put("totalTeachers", totalTeachers);
        res.put("totalAdmins", 1);
        res.put("totalCourses", totalCourses);
        res.put("totalEnrolments", totalEnrolments);
        res.put("institutionalGPA", overallGradesCount > 0 ? Math.round((overallGradeSum / overallGradesCount) * 10.0) / 10.0 : 82.5);
        res.put("studentAttendanceRate", studentAttendanceRate);
        res.put("facultyAttendanceRate", facultyAttendanceRate);
        res.put("atRiskStudentsCount", atRiskStudentsCount);
        res.put("lowAttendanceCount", lowAttendanceCount);
        res.put("activeInterventionsCount", activeInterventions);
        res.put("pendingConsultationsCount", pendingConsultations);
        res.put("libraryBooksCount", libraryBooksCount);
        res.put("courseWiseStats", courseWiseStats);

        // Recent items
        List<StudentItemDto> recentStudents = new ArrayList<>();
        if (students != null) {
            int count = 0;
            for (Student s : students) {
                if (count++ >= 6) break;
                recentStudents.add(new StudentItemDto(
                    s.getId(), s.getUserName(), s.getFirstName(), s.getLastName(), s.getEmail(),
                    s.getCourses() != null ? s.getCourses().size() : 0
                ));
            }
        }
        res.put("recentStudents", recentStudents);

        List<TeacherItemDto> recentTeachers = new ArrayList<>();
        if (teachers != null) {
            int count = 0;
            for (Teacher t : teachers) {
                if (count++ >= 6) break;
                recentTeachers.add(new TeacherItemDto(
                    t.getId(), t.getUserName(), t.getFirstName(), t.getLastName(), t.getEmail(),
                    t.getCourses() != null ? t.getCourses().size() : 0
                ));
            }
        }
        res.put("recentTeachers", recentTeachers);

        List<CourseItemDto> recentCourses = new ArrayList<>();
        if (courses != null) {
            int count = 0;
            for (Course c : courses) {
                if (count++ >= 6) break;
                recentCourses.add(new CourseItemDto(
                    c.getId(), c.getCode(), c.getName(),
                    c.getTeacher() != null ? c.getTeacher().getId() : 0,
                    c.getTeacher() != null ? c.getTeacher().getFirstName() + " " + c.getTeacher().getLastName() : "Unassigned",
                    c.getStudents() != null ? c.getStudents().size() : 0
                ));
            }
        }
        res.put("recentCourses", recentCourses);

        return ResponseEntity.ok(res);
    }

    // ==========================================
    // 2. STUDENT MANAGEMENT & ENROLMENTS
    // ==========================================

    @GetMapping("/students")
    public ResponseEntity<?> getStudents() {
        List<Student> students = studentService.findAllStudents();
        List<Map<String, Object>> list = new ArrayList<>();
        if (students != null) {
            for (Student s : students) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", s.getId());
                map.put("userName", s.getUserName());
                map.put("firstName", s.getFirstName());
                map.put("lastName", s.getLastName());
                map.put("email", s.getEmail());
                map.put("courseCount", s.getCourses() != null ? s.getCourses().size() : 0);

                // Calculate academic averages and attendance
                List<StudentCourseDetails> scdList = studentCourseDetailsService.findByStudentId(s.getId());
                double sum = 0;
                int count = 0;
                if (scdList != null) {
                    for (StudentCourseDetails scd : scdList) {
                        if (scd.getGradeDetails() != null) {
                            GradeDetails gd = scd.getGradeDetails();
                            if (gd.getGradeOne() != -1) { sum += gd.getGradeOne(); count++; }
                            if (gd.getGradeTwo() != -1) { sum += gd.getGradeTwo(); count++; }
                            if (gd.getGradeThree() != -1) { sum += gd.getGradeThree(); count++; }
                        }
                    }
                }
                Double avg = count > 0 ? Math.round((sum / count) * 10.0) / 10.0 : null;
                map.put("averageGrade", avg);

                List<AttendanceRecord> records = attendanceRecordRepository.findByStudentIdOrderBySessionDateDesc(s.getId());
                long present = records.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus()) || "LATE".equalsIgnoreCase(r.getStatus())).count();
                Double attPct = !records.isEmpty() ? Math.round((present * 100.0 / records.size()) * 10.0) / 10.0 : null;
                map.put("attendancePercent", attPct);

                boolean isAtRisk = (avg != null && avg < 60) || (attPct != null && attPct < 75);
                map.put("isAtRisk", isAtRisk);
                map.put("riskStatus", isAtRisk ? "At-Risk" : "Good Standing");

                list.add(map);
            }
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@RequestBody Map<String, Object> payload) {
        String userName = (String) payload.get("userName");
        String password = (String) payload.get("password");
        String firstName = (String) payload.get("firstName");
        String lastName = (String) payload.get("lastName");
        String email = (String) payload.get("email");

        if (userName == null || userName.trim().isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        if (password == null || password.trim().isEmpty()) password = "Test@123";
        if (firstName == null || firstName.trim().isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "First name is required"));
        if (lastName == null || lastName.trim().isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Last name is required"));
        if (email == null || !email.contains("@")) return ResponseEntity.badRequest().body(Map.of("error", "Valid email is required"));

        if (studentService.findByStudentName(userName) != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Student with username '" + userName + "' already exists"));
        }

        Role role = roleDao.findRoleByName("ROLE_STUDENT");
        if (role == null) role = roleDao.findRoleByName("STUDENT");
        if (role == null) role = new Role("ROLE_STUDENT");

        UserDto userDto = new UserDto();
        userDto.setUserName(userName.trim());
        userDto.setPassword(password);
        userDto.setFirstName(firstName.trim());
        userDto.setLastName(lastName.trim());
        userDto.setEmail(email.trim());
        userDto.setRole(role);
        studentService.save(userDto);

        Student created = studentService.findByStudentName(userName.trim());
        return ResponseEntity.ok(Map.of("message", "Student created successfully", "studentId", created != null ? created.getId() : 0));
    }

    @PutMapping("/students/{studentId}")
    public ResponseEntity<?> updateStudent(@PathVariable("studentId") int studentId, @RequestBody Map<String, Object> payload) {
        Student student = studentService.findByStudentId(studentId);
        if (student == null) return ResponseEntity.notFound().build();

        String firstName = (String) payload.get("firstName");
        String lastName = (String) payload.get("lastName");
        String email = (String) payload.get("email");

        if (firstName != null && !firstName.trim().isEmpty()) student.setFirstName(firstName.trim());
        if (lastName != null && !lastName.trim().isEmpty()) student.setLastName(lastName.trim());
        if (email != null && email.contains("@")) student.setEmail(email.trim());

        studentService.save(student);
        return ResponseEntity.ok(Map.of("message", "Student profile updated successfully"));
    }

    @DeleteMapping("/students/{studentId}")
    public ResponseEntity<?> deleteStudent(@PathVariable("studentId") int studentId) {
        List<StudentCourseDetails> list = studentCourseDetailsService.findByStudentId(studentId);
        if (list != null) {
            for (StudentCourseDetails scd : list) {
                int gradeId = scd.getGradeDetails() != null ? scd.getGradeDetails().getId() : 0;
                studentCourseDetailsService.deleteByStudentId(studentId);
                if (gradeId > 0) gradeDetailsService.deleteById(gradeId);
            }
        }
        studentService.deleteById(studentId);
        return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
    }

    @GetMapping("/students/{studentId}/courses")
    public ResponseEntity<?> getStudentCourses(@PathVariable("studentId") int studentId) {
        Student student = studentService.findByStudentId(studentId);
        if (student == null) return ResponseEntity.notFound().build();

        List<CourseItemDto> enrolled = new ArrayList<>();
        if (student.getCourses() != null) {
            for (Course c : student.getCourses()) {
                enrolled.add(new CourseItemDto(
                    c.getId(), c.getCode(), c.getName(),
                    c.getTeacher() != null ? c.getTeacher().getId() : 0,
                    c.getTeacher() != null ? c.getTeacher().getFirstName() + " " + c.getTeacher().getLastName() : "Unassigned",
                    c.getStudents() != null ? c.getStudents().size() : 0
                ));
            }
        }

        List<Course> allCourses = courseService.findAllCourses();
        List<CourseItemDto> available = new ArrayList<>();
        if (allCourses != null) {
            for (Course c : allCourses) {
                if (student.getCourses() == null || !student.getCourses().contains(c)) {
                    available.add(new CourseItemDto(
                        c.getId(), c.getCode(), c.getName(),
                        c.getTeacher() != null ? c.getTeacher().getId() : 0,
                        c.getTeacher() != null ? c.getTeacher().getFirstName() + " " + c.getTeacher().getLastName() : "Unassigned",
                        c.getStudents() != null ? c.getStudents().size() : 0
                    ));
                }
            }
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("studentId", student.getId());
        res.put("studentName", student.getFirstName() + " " + student.getLastName());
        res.put("enrolledCourses", enrolled);
        res.put("availableCourses", available);

        return ResponseEntity.ok(res);
    }

    @PostMapping("/students/{studentId}/courses")
    public ResponseEntity<?> enrollStudentInCourse(@PathVariable("studentId") int studentId, @RequestBody EnrollStudentDto dto) {
        int courseId = dto.getCourseId();
        StudentCourseDetails existing = studentCourseDetailsService.findByStudentAndCourseId(studentId, courseId);
        if (existing != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Student is already enrolled in this course"));
        }
        StudentCourseDetails sc = new StudentCourseDetails(studentId, courseId, new ArrayList<Assignment>(), new GradeDetails());
        studentCourseDetailsService.save(sc);
        return ResponseEntity.ok(Map.of("message", "Student enrolled in course successfully"));
    }

    @DeleteMapping("/students/{studentId}/courses/{courseId}")
    public ResponseEntity<?> removeStudentFromCourse(@PathVariable("studentId") int studentId, @PathVariable("courseId") int courseId) {
        StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(studentId, courseId);
        if (scd != null) {
            int gradeId = scd.getGradeDetails() != null ? scd.getGradeDetails().getId() : 0;
            studentCourseDetailsService.deleteByStudentAndCourseId(studentId, courseId);
            if (gradeId > 0) gradeDetailsService.deleteById(gradeId);
        }
        return ResponseEntity.ok(Map.of("message", "Student removed from course successfully"));
    }

    // ==========================================
    // 3. TEACHER & FACULTY MANAGEMENT
    // ==========================================

    @GetMapping("/teachers")
    public ResponseEntity<?> getTeachers() {
        List<Teacher> teachers = teacherService.findAllTeachers();
        List<Map<String, Object>> list = new ArrayList<>();
        if (teachers != null) {
            for (Teacher t : teachers) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", t.getId());
                map.put("userName", t.getUserName());
                map.put("firstName", t.getFirstName());
                map.put("lastName", t.getLastName());
                map.put("email", t.getEmail());
                map.put("courseCount", t.getCourses() != null ? t.getCourses().size() : 0);

                int studentCount = 0;
                if (t.getCourses() != null) {
                    Set<Integer> uniqueStudents = new HashSet<>();
                    for (Course c : t.getCourses()) {
                        if (c.getStudents() != null) {
                            for (Student s : c.getStudents()) uniqueStudents.add(s.getId());
                        }
                    }
                    studentCount = uniqueStudents.size();
                }
                map.put("studentCount", studentCount);

                list.add(map);
            }
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping("/teachers")
    public ResponseEntity<?> createTeacher(@RequestBody Map<String, Object> payload) {
        String userName = (String) payload.get("userName");
        String password = (String) payload.get("password");
        String firstName = (String) payload.get("firstName");
        String lastName = (String) payload.get("lastName");
        String email = (String) payload.get("email");

        if (userName == null || userName.trim().isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        if (password == null || password.trim().isEmpty()) password = "Test@123";
        if (firstName == null || firstName.trim().isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "First name is required"));
        if (lastName == null || lastName.trim().isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Last name is required"));
        if (email == null || !email.contains("@")) return ResponseEntity.badRequest().body(Map.of("error", "Valid email is required"));

        if (teacherService.findByTeacherName(userName) != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Teacher with username '" + userName + "' already exists"));
        }

        Role role = roleDao.findRoleByName("ROLE_TEACHER");
        if (role == null) role = roleDao.findRoleByName("TEACHER");
        if (role == null) role = new Role("ROLE_TEACHER");

        UserDto userDto = new UserDto();
        userDto.setUserName(userName.trim());
        userDto.setPassword(password);
        userDto.setFirstName(firstName.trim());
        userDto.setLastName(lastName.trim());
        userDto.setEmail(email.trim());
        userDto.setRole(role);
        teacherService.save(userDto);

        Teacher created = teacherService.findByTeacherName(userName.trim());
        return ResponseEntity.ok(Map.of("message", "Faculty account created successfully", "teacherId", created != null ? created.getId() : 0));
    }

    @PutMapping("/teachers/{teacherId}")
    public ResponseEntity<?> updateTeacher(@PathVariable("teacherId") int teacherId, @RequestBody Map<String, Object> payload) {
        Teacher teacher = teacherService.findByTeacherId(teacherId);
        if (teacher == null) return ResponseEntity.notFound().build();

        String firstName = (String) payload.get("firstName");
        String lastName = (String) payload.get("lastName");
        String email = (String) payload.get("email");

        if (firstName != null && !firstName.trim().isEmpty()) teacher.setFirstName(firstName.trim());
        if (lastName != null && !lastName.trim().isEmpty()) teacher.setLastName(lastName.trim());
        if (email != null && email.contains("@")) teacher.setEmail(email.trim());

        teacherService.save(teacher);
        return ResponseEntity.ok(Map.of("message", "Faculty profile updated successfully"));
    }

    @DeleteMapping("/teachers/{teacherId}")
    public ResponseEntity<?> deleteTeacher(@PathVariable("teacherId") int teacherId) {
        Teacher teacher = teacherService.findByTeacherId(teacherId);
        if (teacher == null) return ResponseEntity.notFound().build();

        if (teacher.getCourses() != null && !teacher.getCourses().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot delete faculty with assigned courses. Please reassign courses first."));
        }

        teacherService.deleteTeacherById(teacherId);
        return ResponseEntity.ok(Map.of("message", "Faculty record deleted successfully"));
    }

    // ==========================================
    // 4. COURSE & SUBJECT MANAGEMENT
    // ==========================================

    @GetMapping("/courses")
    public ResponseEntity<?> getCourses() {
        List<Course> courses = courseService.findAllCourses();
        List<Map<String, Object>> list = new ArrayList<>();
        if (courses != null) {
            for (Course c : courses) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", c.getId());
                map.put("code", c.getCode());
                map.put("name", c.getName());
                map.put("teacherId", c.getTeacher() != null ? c.getTeacher().getId() : 0);
                map.put("teacherName", c.getTeacher() != null ? c.getTeacher().getFirstName() + " " + c.getTeacher().getLastName() : "Unassigned");
                map.put("studentCount", c.getStudents() != null ? c.getStudents().size() : 0);

                // Calculate course average
                double sum = 0;
                int count = 0;
                if (c.getStudents() != null) {
                    for (Student s : c.getStudents()) {
                        StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(s.getId(), c.getId());
                        if (scd != null && scd.getGradeDetails() != null) {
                            GradeDetails gd = scd.getGradeDetails();
                            if (gd.getGradeOne() != -1) { sum += gd.getGradeOne(); count++; }
                            if (gd.getGradeTwo() != -1) { sum += gd.getGradeTwo(); count++; }
                            if (gd.getGradeThree() != -1) { sum += gd.getGradeThree(); count++; }
                        }
                    }
                }
                map.put("averageGrade", count > 0 ? Math.round((sum / count) * 10.0) / 10.0 : null);
                list.add(map);
            }
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping("/courses")
    public ResponseEntity<?> createCourse(@Valid @RequestBody CourseCreateDto dto) {
        Teacher teacher = teacherService.findByTeacherId(dto.getTeacherId());
        if (teacher == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Teacher not found with ID " + dto.getTeacherId()));
        }

        Course course = new Course();
        course.setCode(dto.getCode().trim());
        course.setName(dto.getName().trim());
        course.setTeacher(teacher);
        courseService.save(course);

        return ResponseEntity.ok(Map.of("message", "Course created successfully", "courseId", course.getId()));
    }

    @PutMapping("/courses/{courseId}")
    public ResponseEntity<?> updateCourse(@PathVariable("courseId") int courseId, @RequestBody Map<String, Object> payload) {
        Course course = courseService.findCourseById(courseId);
        if (course == null) return ResponseEntity.notFound().build();

        String code = (String) payload.get("code");
        String name = (String) payload.get("name");
        Object tIdObj = payload.get("teacherId");

        if (code != null && !code.trim().isEmpty()) course.setCode(code.trim());
        if (name != null && !name.trim().isEmpty()) course.setName(name.trim());
        if (tIdObj != null) {
            int tId = Integer.parseInt(String.valueOf(tIdObj));
            Teacher teacher = teacherService.findByTeacherId(tId);
            if (teacher != null) course.setTeacher(teacher);
        }

        courseService.save(course);
        return ResponseEntity.ok(Map.of("message", "Course details updated successfully"));
    }

    @DeleteMapping("/courses/{courseId}")
    public ResponseEntity<?> deleteCourse(@PathVariable("courseId") int courseId) {
        Course course = courseService.findCourseById(courseId);
        if (course == null) return ResponseEntity.notFound().build();

        List<Student> students = course.getStudents();
        if (students != null) {
            for (Student student : students) {
                StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(student.getId(), courseId);
                if (scd != null) {
                    int gradeId = scd.getGradeDetails() != null ? scd.getGradeDetails().getId() : 0;
                    studentCourseDetailsService.deleteByStudentAndCourseId(student.getId(), courseId);
                    if (gradeId > 0) gradeDetailsService.deleteById(gradeId);
                }
            }
        }

        courseService.deleteCourseById(courseId);
        return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
    }

    @GetMapping("/courses/{courseId}/students")
    public ResponseEntity<?> getCourseStudents(@PathVariable("courseId") int courseId) {
        Course course = courseService.findCourseById(courseId);
        if (course == null) return ResponseEntity.notFound().build();

        List<StudentItemDto> enrolled = new ArrayList<>();
        if (course.getStudents() != null) {
            for (Student s : course.getStudents()) {
                enrolled.add(new StudentItemDto(
                    s.getId(), s.getUserName(), s.getFirstName(), s.getLastName(), s.getEmail(),
                    s.getCourses() != null ? s.getCourses().size() : 0
                ));
            }
        }

        List<Student> allStudents = studentService.findAllStudents();
        List<StudentItemDto> available = new ArrayList<>();
        if (allStudents != null) {
            for (Student s : allStudents) {
                if (course.getStudents() == null || !course.getStudents().contains(s)) {
                    available.add(new StudentItemDto(
                        s.getId(), s.getUserName(), s.getFirstName(), s.getLastName(), s.getEmail(),
                        s.getCourses() != null ? s.getCourses().size() : 0
                    ));
                }
            }
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("courseId", course.getId());
        res.put("courseName", course.getName());
        res.put("courseCode", course.getCode());
        res.put("teacherName", course.getTeacher() != null ? course.getTeacher().getFirstName() + " " + course.getTeacher().getLastName() : "Unassigned");
        res.put("enrolledStudents", enrolled);
        res.put("availableStudents", available);

        return ResponseEntity.ok(res);
    }

    @PostMapping("/courses/{courseId}/students")
    public ResponseEntity<?> addStudentToCourse(@PathVariable("courseId") int courseId, @RequestBody EnrollStudentDto dto) {
        int studentId = dto.getStudentId();
        StudentCourseDetails existing = studentCourseDetailsService.findByStudentAndCourseId(studentId, courseId);
        if (existing != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Student already added to course"));
        }
        StudentCourseDetails sc = new StudentCourseDetails(studentId, courseId, new ArrayList<Assignment>(), new GradeDetails());
        studentCourseDetailsService.save(sc);
        return ResponseEntity.ok(Map.of("message", "Student added to course successfully"));
    }

    @DeleteMapping("/courses/{courseId}/students/{studentId}")
    public ResponseEntity<?> removeStudentFromCourseByAdmin(@PathVariable("courseId") int courseId, @PathVariable("studentId") int studentId) {
        StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(studentId, courseId);
        if (scd != null) {
            int gradeId = scd.getGradeDetails() != null ? scd.getGradeDetails().getId() : 0;
            studentCourseDetailsService.deleteByStudentAndCourseId(studentId, courseId);
            if (gradeId > 0) gradeDetailsService.deleteById(gradeId);
        }
        return ResponseEntity.ok(Map.of("message", "Student removed from course successfully"));
    }

    // ==========================================
    // 5. CENTRAL MARKS & GRADES MANAGEMENT
    // ==========================================

    @GetMapping("/grades")
    public ResponseEntity<?> getAllGrades() {
        List<Course> courses = courseService.findAllCourses();
        List<Map<String, Object>> gradesList = new ArrayList<>();

        if (courses != null) {
            for (Course course : courses) {
                if (course.getStudents() != null) {
                    for (Student student : course.getStudents()) {
                        StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(student.getId(), course.getId());
                        if (scd != null && scd.getGradeDetails() != null) {
                            GradeDetails gd = scd.getGradeDetails();
                            Map<String, Object> map = new LinkedHashMap<>();
                            map.put("gradeDetailsId", gd.getId());
                            map.put("studentId", student.getId());
                            map.put("studentName", student.getFirstName() + " " + student.getLastName());
                            map.put("userName", student.getUserName());
                            map.put("courseId", course.getId());
                            map.put("courseCode", course.getCode());
                            map.put("courseName", course.getName());
                            map.put("instructorName", course.getTeacher() != null ? course.getTeacher().getFirstName() + " " + course.getTeacher().getLastName() : "Unassigned");
                            map.put("gradeOne", gd.getGradeOne());
                            map.put("gradeTwo", gd.getGradeTwo());
                            map.put("gradeThree", gd.getGradeThree());

                            double sum = 0;
                            int count = 0;
                            if (gd.getGradeOne() != -1) { sum += gd.getGradeOne(); count++; }
                            if (gd.getGradeTwo() != -1) { sum += gd.getGradeTwo(); count++; }
                            if (gd.getGradeThree() != -1) { sum += gd.getGradeThree(); count++; }

                            Double avg = count > 0 ? Math.round((sum / count) * 10.0) / 10.0 : null;
                            map.put("average", avg);
                            map.put("letterGrade", AcademicRules.letterGrade(avg));
                            gradesList.add(map);
                        }
                    }
                }
            }
        }

        return ResponseEntity.ok(gradesList);
    }

    @PutMapping("/grades/{gradeDetailsId}")
    public ResponseEntity<?> updateGradeRecord(@PathVariable("gradeDetailsId") int gradeDetailsId, @RequestBody GradeUpdateDto dto) {
        GradeDetails existingGrade = gradeDetailsService.findById(gradeDetailsId);
        if (existingGrade == null) return ResponseEntity.notFound().build();

        StudentCourseDetails scd = existingGrade.getStudentCourseDetails();
        GradeDetails newGrade = new GradeDetails();
        newGrade.setGradeOne(dto.getGradeOne() != null ? dto.getGradeOne() : -1);
        newGrade.setGradeTwo(dto.getGradeTwo() != null ? dto.getGradeTwo() : -1);
        newGrade.setGradeThree(dto.getGradeThree() != null ? dto.getGradeThree() : -1);

        scd.setGradeDetails(newGrade);
        studentCourseDetailsService.save(scd);
        gradeDetailsService.deleteById(gradeDetailsId);

        return ResponseEntity.ok(Map.of("message", "Academic marks updated successfully"));
    }

    // ==========================================
    // 6. FACULTY ATTENDANCE MANAGEMENT
    // ==========================================

    @GetMapping("/faculty-attendance")
    public ResponseEntity<?> getFacultyAttendance() {
        List<FacultyAttendance> list = facultyAttendanceRepository.findAllByOrderBySessionDateDesc();
        List<Map<String, Object>> res = new ArrayList<>();
        for (FacultyAttendance fa : list) {
            Teacher teacher = teacherService.findByTeacherId(fa.getTeacherId());
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", fa.getId());
            map.put("teacherId", fa.getTeacherId());
            map.put("teacherName", teacher != null ? teacher.getFirstName() + " " + teacher.getLastName() : "Faculty Member");
            map.put("userName", teacher != null ? teacher.getUserName() : "");
            map.put("sessionDate", fa.getSessionDate());
            map.put("status", fa.getStatus());
            map.put("department", fa.getDepartment() != null ? fa.getDepartment() : "General Faculty");
            map.put("notes", fa.getNotes());
            map.put("recordedBy", fa.getRecordedBy() != null ? fa.getRecordedBy() : "System Administrator");
            res.add(map);
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/faculty-attendance")
    public ResponseEntity<?> recordFacultyAttendance(@RequestBody Map<String, Object> payload) {
        int teacherId = Integer.parseInt(String.valueOf(payload.get("teacherId")));
        LocalDate sessionDate = LocalDate.parse(String.valueOf(payload.get("sessionDate")));
        String status = String.valueOf(payload.get("status")).toUpperCase();
        String department = payload.get("department") != null ? String.valueOf(payload.get("department")) : "Faculty Department";
        String notes = payload.get("notes") != null ? String.valueOf(payload.get("notes")) : "";

        FacultyAttendance fa = facultyAttendanceRepository.findByTeacherIdAndSessionDate(teacherId, sessionDate)
            .orElseGet(FacultyAttendance::new);
        fa.setTeacherId(teacherId);
        fa.setSessionDate(sessionDate);
        fa.setStatus(status);
        fa.setDepartment(department);
        fa.setNotes(notes);
        fa.setRecordedBy("System Administrator");
        facultyAttendanceRepository.save(fa);

        return ResponseEntity.ok(Map.of("message", "Faculty attendance logged successfully"));
    }

    // ==========================================
    // 7. CENTRAL ASSIGNMENTS & ASSESSMENTS
    // ==========================================

    @GetMapping("/assessments")
    public ResponseEntity<?> getAllAssessments() {
        List<Course> courses = courseService.findAllCourses();
        List<Map<String, Object>> list = new ArrayList<>();

        if (courses != null) {
            for (Course course : courses) {
                if (course.getStudents() != null && !course.getStudents().isEmpty()) {
                    StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(course.getStudents().get(0).getId(), course.getId());
                    if (scd != null && scd.getAssignments() != null) {
                        for (Assignment a : scd.getAssignments()) {
                            Map<String, Object> map = new LinkedHashMap<>();
                            map.put("id", a.getId());
                            map.put("name", a.getName());
                            map.put("description", a.getDescription());
                            map.put("dueDate", a.getDueDate());
                            map.put("courseId", course.getId());
                            map.put("courseCode", course.getCode());
                            map.put("courseName", course.getName());
                            map.put("teacherName", course.getTeacher() != null ? course.getTeacher().getFirstName() + " " + course.getTeacher().getLastName() : "Unassigned");
                            map.put("enrolledStudentsCount", course.getStudents().size());

                            // Count completed
                            int completed = 0;
                            for (Student s : course.getStudents()) {
                                StudentCourseDetails sDetails = studentCourseDetailsService.findByStudentAndCourseId(s.getId(), course.getId());
                                if (sDetails != null) {
                                    AssignmentDetails ad = assignmentDetailsService.findByAssignmentAndStudentCourseDetailsId(a.getId(), sDetails.getId());
                                    if (ad != null && ad.getIsDone() == 1) completed++;
                                }
                            }
                            map.put("completedSubmissions", completed);
                            list.add(map);
                        }
                    }
                }
            }
        }

        return ResponseEntity.ok(list);
    }
}
