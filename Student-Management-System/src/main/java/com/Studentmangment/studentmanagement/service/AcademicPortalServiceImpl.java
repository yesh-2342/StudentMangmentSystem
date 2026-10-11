package com.Studentmangment.studentmanagement.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.Studentmangment.studentmanagement.entity.AcademicNotification;
import com.Studentmangment.studentmanagement.entity.Assignment;
import com.Studentmangment.studentmanagement.entity.AssignmentDetails;
import com.Studentmangment.studentmanagement.entity.AttendanceRecord;
import com.Studentmangment.studentmanagement.entity.ConsultationRequest;
import com.Studentmangment.studentmanagement.entity.Course;
import com.Studentmangment.studentmanagement.entity.FacultyAvailability;
import com.Studentmangment.studentmanagement.entity.GradeDetails;
import com.Studentmangment.studentmanagement.entity.InterventionCase;
import com.Studentmangment.studentmanagement.entity.LearningResource;
import com.Studentmangment.studentmanagement.entity.LibraryBook;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.entity.StudentCourseDetails;
import com.Studentmangment.studentmanagement.entity.Teacher;
import com.Studentmangment.studentmanagement.repository.AcademicNotificationRepository;
import com.Studentmangment.studentmanagement.repository.AttendanceRecordRepository;
import com.Studentmangment.studentmanagement.repository.ConsultationRequestRepository;
import com.Studentmangment.studentmanagement.repository.FacultyAvailabilityRepository;
import com.Studentmangment.studentmanagement.repository.InterventionCaseRepository;
import com.Studentmangment.studentmanagement.repository.LearningResourceRepository;
import com.Studentmangment.studentmanagement.repository.LibraryBookRepository;
import com.Studentmangment.studentmanagement.service.AssignmentDetailsService;
import com.Studentmangment.studentmanagement.util.AcademicRules;
import com.Studentmangment.studentmanagement.util.SecurityRoles;

@Service
public class AcademicPortalServiceImpl implements AcademicPortalService {

    @Autowired private StudentService studentService;
    @Autowired private TeacherService teacherService;
    @Autowired private CourseService courseService;
    @Autowired private StudentCourseDetailsService studentCourseDetailsService;
    @Autowired private AssignmentDetailsService assignmentDetailsService;
    @Autowired private FacultyAvailabilityRepository availabilityRepository;
    @Autowired private ConsultationRequestRepository consultationRepository;
    @Autowired private LibraryBookRepository libraryBookRepository;
    @Autowired private LearningResourceRepository learningResourceRepository;
    @Autowired private AttendanceRecordRepository attendanceRecordRepository;
    @Autowired private AcademicNotificationRepository notificationRepository;
    @Autowired private InterventionCaseRepository interventionCaseRepository;

    @Override
    public Map<String, Object> overview() {
        Authentication auth = requireAuth();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("role", SecurityRoles.canonicalRole(auth));
        payload.put("academicYear", "2026-2027");
        payload.put("semester", "Odd Semester");
        payload.put("modelClaim", "Deterministic descriptive analytics & rule-based What-If simulation derived from database records.");

        if (SecurityRoles.isStudent(auth)) {
            Student student = currentStudent(auth);
            List<StudentCourseDetails> details = safeList(studentCourseDetailsService.findByStudentId(student.getId()));
            payload.put("studentId", student.getId());
            payload.put("displayName", student.getFirstName() + " " + student.getLastName());
            payload.put("enrolledCourses", details.size());
            payload.put("gpa", averageFromDetails(details));
            payload.put("attendancePercent", attendancePercent(attendanceRecordRepository.findByStudentIdOrderBySessionDateDesc(student.getId())));
            payload.put("pendingConsultations", consultationRepository.findByStudentIdOrderByRequestedAtDesc(student.getId()).stream()
                .filter(item -> "PENDING".equalsIgnoreCase(item.getStatus())).count());
        } else if (SecurityRoles.isTeacher(auth)) {
            Teacher teacher = currentTeacher(auth);
            payload.put("teacherId", teacher.getId());
            payload.put("displayName", teacher.getFirstName() + " " + teacher.getLastName());
            payload.put("assignedCourses", teacher.getCourses() == null ? 0 : teacher.getCourses().size());
            payload.put("assignedStudents", uniqueStudentCount(teacher));
            payload.put("pendingConsultations", consultationRepository.findByTeacherIdOrderByRequestedAtDesc(teacher.getId()).stream()
                .filter(item -> "PENDING".equalsIgnoreCase(item.getStatus())).count());
            payload.put("atRiskCount", atRisk().size());
            payload.put("officeSlots", availabilityRepository.findByTeacherIdOrderByDayOfWeekAsc(teacher.getId()).size());
        } else if (SecurityRoles.isAdmin(auth)) {
            payload.put("displayName", "System Administrator");
            payload.put("totalStudents", sizeOf(studentService.findAllStudents()));
            payload.put("totalTeachers", sizeOf(teacherService.findAllTeachers()));
            payload.put("totalCourses", sizeOf(courseService.findAllCourses()));
            payload.put("libraryTitles", libraryBookRepository.count());
            payload.put("openConsultations", consultationRepository.findAllByOrderByRequestedAtDesc().stream()
                .filter(item -> !"COMPLETED".equalsIgnoreCase(item.getStatus()) && !"CANCELLED".equalsIgnoreCase(item.getStatus())).count());
        }
        return payload;
    }

    @Override
    public List<Map<String, Object>> insights() {
        List<Map<String, Object>> rows = new ArrayList<>();
        Authentication auth = requireAuth();
        if (SecurityRoles.isStudent(auth)) {
            Student student = currentStudent(auth);
            List<StudentCourseDetails> details = safeList(studentCourseDetailsService.findByStudentId(student.getId()));
            for (StudentCourseDetails detail : details) {
                Course course = courseService.findCourseById(detail.getCourseId());
                Double avg = courseAverage(detail.getGradeDetails());
                Double attendance = attendancePercent(attendanceRecordRepository.findByStudentIdAndCourseId(student.getId(), detail.getCourseId()));
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("scope", course != null ? course.getName() : "Course #" + detail.getCourseId());
                row.put("courseName", course != null ? course.getName() : "Course #" + detail.getCourseId());
                row.put("courseCode", course != null ? course.getCode() : "");
                row.put("average", avg);
                row.put("attendancePercent", attendance);
                row.put("strength", avg != null && avg >= 75);
                row.put("recommendation", recommendation(avg, attendance));
                row.put("explainable", true);
                rows.add(row);
            }
        } else {
            List<Course> courses = authorizedCourses(auth);
            for (Course course : courses) {
                List<Student> students = course.getStudents() == null ? new ArrayList<>() : course.getStudents();
                int atRisk = 0;
                double sum = 0;
                int counted = 0;
                for (Student student : students) {
                    StudentCourseDetails detail = studentCourseDetailsService.findByStudentAndCourseId(student.getId(), course.getId());
                    Double avg = detail == null ? null : courseAverage(detail.getGradeDetails());
                    Double attendance = attendancePercent(attendanceRecordRepository.findByStudentIdAndCourseId(student.getId(), course.getId()));
                    if (avg != null) {
                        sum += avg;
                        counted++;
                    }
                    if (AcademicRules.isAtRiskAverage(avg) || AcademicRules.isLowAttendance(attendance)) {
                        atRisk++;
                    }
                }
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("scope", course.getName());
                row.put("courseName", course.getName());
                row.put("courseCode", course.getCode());
                row.put("studentCount", students.size());
                row.put("classAverage", counted == 0 ? null : round(sum / counted));
                row.put("average", counted == 0 ? null : round(sum / counted));
                row.put("atRiskCount", atRisk);
                row.put("attendancePercent", classAttendance(course.getId()));
                row.put("recommendation", atRisk > 0 ? atRisk + " student(s) below threshold; review at-risk list for support plans." : "Class cohort performing within expected standards.");
                rows.add(row);
            }
        }
        return rows;
    }

    @Override
    public List<Map<String, Object>> atRisk() {
        Authentication auth = requireAuth();
        List<Map<String, Object>> rows = new ArrayList<>();
        if (SecurityRoles.isStudent(auth)) {
            Student student = currentStudent(auth);
            for (StudentCourseDetails detail : safeList(studentCourseDetailsService.findByStudentId(student.getId()))) {
                Double avg = courseAverage(detail.getGradeDetails());
                Double attendance = attendancePercent(attendanceRecordRepository.findByStudentIdAndCourseId(student.getId(), detail.getCourseId()));
                int missing = countMissingAssignments(detail);
                if (AcademicRules.isAtRiskAverage(avg) || AcademicRules.isLowAttendance(attendance) || missing > 0) {
                    Course course = courseService.findCourseById(detail.getCourseId());
                    rows.add(riskRow(student, course, avg, attendance, missing, false));
                }
            }
            return rows;
        }

        Set<String> seen = new HashSet<>();
        for (Course course : authorizedCourses(auth)) {
            if (course.getStudents() == null) continue;
            for (Student student : course.getStudents()) {
                String key = student.getId() + "-" + course.getId();
                if (seen.contains(key)) continue;
                seen.add(key);

                StudentCourseDetails detail = studentCourseDetailsService.findByStudentAndCourseId(student.getId(), course.getId());
                Double avg = detail == null ? null : courseAverage(detail.getGradeDetails());
                Double attendance = attendancePercent(attendanceRecordRepository.findByStudentIdAndCourseId(student.getId(), course.getId()));
                int missing = countMissingAssignments(detail);

                if (AcademicRules.isAtRiskAverage(avg) || AcademicRules.isLowAttendance(attendance) || missing > 0) {
                    rows.add(riskRow(student, course, avg, attendance, missing, true));
                }
            }
        }
        return rows;
    }

    @Override
    public List<Map<String, Object>> availability() {
        requireAuth();
        List<FacultyAvailability> slots = availabilityRepository.findAllByOrderByTeacherIdAscDayOfWeekAsc();
        List<Map<String, Object>> rows = new ArrayList<>();
        for (FacultyAvailability slot : slots) {
            Teacher teacher = teacherService.findByTeacherId(slot.getTeacherId());
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", slot.getId());
            row.put("teacherId", slot.getTeacherId());
            row.put("teacherName", teacher == null ? "Faculty" : teacher.getFirstName() + " " + teacher.getLastName());
            row.put("subjects", teacherSubjects(teacher));
            row.put("officeLocation", slot.getOfficeLocation());
            row.put("dayOfWeek", slot.getDayOfWeek());
            row.put("startTime", slot.getStartTime());
            row.put("endTime", slot.getEndTime());
            row.put("status", slot.getStatus() != null ? slot.getStatus() : "AVAILABLE");
            row.put("notes", slot.getNotes());
            rows.add(row);
        }
        return rows;
    }

    @Override
    @Transactional
    public Map<String, Object> saveAvailability(Map<String, Object> payload) {
        Authentication auth = requireAuth();
        if (!(SecurityRoles.isTeacher(auth) || SecurityRoles.isAdmin(auth))) {
            throw new AccessDeniedException("Only faculty can manage office hours");
        }
        Teacher teacher = SecurityRoles.isTeacher(auth) ? currentTeacher(auth) : teacherService.findByTeacherId(intValue(payload.get("teacherId")));
        if (teacher == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Teacher not found");
        }
        if (SecurityRoles.isTeacher(auth) && payload.get("teacherId") != null && intValue(payload.get("teacherId")) != teacher.getId()) {
            throw new AccessDeniedException("Faculty cannot modify another teacher's schedule");
        }

        FacultyAvailability slot = payload.get("id") != null
            ? availabilityRepository.findById(intValue(payload.get("id"))).orElse(new FacultyAvailability())
            : new FacultyAvailability();
        if (slot.getId() != 0 && SecurityRoles.isTeacher(auth) && slot.getTeacherId() != teacher.getId()) {
            throw new AccessDeniedException("Faculty cannot modify another teacher's schedule");
        }
        slot.setTeacherId(teacher.getId());
        slot.setOfficeLocation(stringValue(payload.get("officeLocation")));
        slot.setDayOfWeek(stringValue(payload.get("dayOfWeek")));
        slot.setStartTime(parseTime(payload.get("startTime")));
        slot.setEndTime(parseTime(payload.get("endTime")));
        if (payload.get("status") != null && !String.valueOf(payload.get("status")).isBlank()) {
            slot.setStatus(stringValue(payload.get("status")).toUpperCase());
        } else if (slot.getStatus() == null) {
            slot.setStatus("AVAILABLE");
        }
        slot.setNotes(stringValue(payload.get("notes")));
        FacultyAvailability saved = availabilityRepository.save(slot);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", saved.getId());
        result.put("message", "Availability saved");
        return result;
    }

    @Override
    public List<Map<String, Object>> consultations() {
        Authentication auth = requireAuth();
        List<ConsultationRequest> requests;
        if (SecurityRoles.isAdmin(auth)) {
            requests = consultationRepository.findAllByOrderByRequestedAtDesc();
        } else if (SecurityRoles.isTeacher(auth)) {
            requests = consultationRepository.findByTeacherIdOrderByRequestedAtDesc(currentTeacher(auth).getId());
        } else {
            requests = consultationRepository.findByStudentIdOrderByRequestedAtDesc(currentStudent(auth).getId());
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (ConsultationRequest request : requests) {
            rows.add(consultationRow(request));
        }
        return rows;
    }

    @Override
    @Transactional
    public Map<String, Object> createConsultation(Map<String, Object> payload) {
        Authentication auth = requireAuth();
        if (!SecurityRoles.isStudent(auth)) {
            throw new AccessDeniedException("Only students can request consultations");
        }
        Student student = currentStudent(auth);
        int teacherId = intValue(payload.get("teacherId"));
        Teacher teacher = teacherService.findByTeacherId(teacherId);
        if (teacher == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Teacher not found");
        }
        ConsultationRequest request = new ConsultationRequest();
        request.setStudentId(student.getId());
        request.setTeacherId(teacherId);
        request.setRequestedAt(parseDateTime(payload.get("requestedAt")));
        request.setStudentNotes(stringValue(payload.get("studentNotes")));
        request.setStatus("PENDING");
        return consultationRow(consultationRepository.save(request));
    }

    @Override
    @Transactional
    public Map<String, Object> updateConsultation(int id, Map<String, Object> payload) {
        Authentication auth = requireAuth();
        ConsultationRequest request = consultationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consultation not found"));
        String status = stringValue(payload.get("status"));
        if (SecurityRoles.isStudent(auth)) {
            Student student = currentStudent(auth);
            if (request.getStudentId() != student.getId()) {
                throw new AccessDeniedException("Students can only update their own consultations");
            }
            if (!"CANCELLED".equalsIgnoreCase(status) && !"PENDING".equalsIgnoreCase(status)) {
                throw new AccessDeniedException("Students may only cancel or reschedule pending requests");
            }
            if (payload.get("requestedAt") != null) {
                request.setRequestedAt(parseDateTime(payload.get("requestedAt")));
                request.setStatus("PENDING");
            } else {
                request.setStatus(status.toUpperCase());
            }
        } else if (SecurityRoles.isTeacher(auth)) {
            Teacher teacher = currentTeacher(auth);
            if (request.getTeacherId() != teacher.getId()) {
                throw new AccessDeniedException("Faculty can only update assigned consultation requests");
            }
            if (status != null) {
                request.setStatus(status.toUpperCase());
            }
            if (payload.get("instructions") != null) {
                request.setInstructions(stringValue(payload.get("instructions")));
            }
            if (payload.get("requestedAt") != null) {
                request.setRequestedAt(parseDateTime(payload.get("requestedAt")));
            }
        } else if (SecurityRoles.isAdmin(auth)) {
            if (status != null) request.setStatus(status.toUpperCase());
            if (payload.get("instructions") != null) request.setInstructions(stringValue(payload.get("instructions")));
        } else {
            throw new AccessDeniedException("Not authorized");
        }
        return consultationRow(consultationRepository.save(request));
    }

    @Override
    public List<Map<String, Object>> library(String query, String category) {
        requireAuth();
        List<Map<String, Object>> rows = new ArrayList<>();
        for (LibraryBook book : libraryBookRepository.findAllByOrderByTitleAsc()) {
            if (category != null && !category.isBlank() && (book.getCategory() == null || !book.getCategory().equalsIgnoreCase(category))) {
                continue;
            }
            if (query != null && !query.isBlank()) {
                String haystack = (book.getTitle() + " " + book.getAuthor() + " " + book.getIsbn()).toLowerCase();
                if (!haystack.contains(query.toLowerCase())) continue;
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", book.getId());
            row.put("title", book.getTitle());
            row.put("author", book.getAuthor());
            row.put("category", book.getCategory());
            row.put("isbn", book.getIsbn());
            row.put("availableCopies", book.getAvailableCopies());
            row.put("totalCopies", book.getTotalCopies());
            row.put("availability", book.getAvailableCopies() > 0 ? "Available" : "On loan");
            rows.add(row);
        }
        return rows;
    }

    @Override
    @Transactional
    public Map<String, Object> saveBook(Map<String, Object> payload) {
        Authentication auth = requireAuth();
        if (!SecurityRoles.isAdmin(auth)) {
            throw new AccessDeniedException("Only administrators can manage the library catalogue");
        }
        LibraryBook book = payload.get("id") != null
            ? libraryBookRepository.findById(intValue(payload.get("id"))).orElse(new LibraryBook())
            : new LibraryBook();
        book.setTitle(stringValue(payload.get("title")));
        book.setAuthor(stringValue(payload.get("author")));
        book.setCategory(stringValue(payload.get("category")));
        book.setIsbn(stringValue(payload.get("isbn")));
        book.setAvailableCopies(payload.get("availableCopies") == null ? 0 : intValue(payload.get("availableCopies")));
        book.setTotalCopies(payload.get("totalCopies") == null ? book.getAvailableCopies() : intValue(payload.get("totalCopies")));
        LibraryBook saved = libraryBookRepository.save(book);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", saved.getId());
        result.put("message", "Book saved");
        return result;
    }

    @Override
    public List<Map<String, Object>> resources(String query) {
        Authentication auth = requireAuth();
        List<LearningResource> resources;
        if (SecurityRoles.isStudent(auth)) {
            Student student = currentStudent(auth);
            List<String> codes = new ArrayList<>();
            if (student.getCourses() != null) {
                for (Course course : student.getCourses()) {
                    codes.add(course.getCode());
                }
            }
            resources = codes.isEmpty() ? new ArrayList<>() : learningResourceRepository.findByCourseCodeIn(codes);
        } else if (SecurityRoles.isTeacher(auth)) {
            Teacher teacher = currentTeacher(auth);
            resources = learningResourceRepository.findByTeacherIdOrderByTitleAsc(teacher.getId());
            Set<String> codes = new HashSet<>();
            if (teacher.getCourses() != null) {
                for (Course course : teacher.getCourses()) codes.add(course.getCode());
            }
            for (LearningResource resource : learningResourceRepository.findAllByOrderByTitleAsc()) {
                if (codes.contains(resource.getCourseCode()) && resources.stream().noneMatch(existing -> existing.getId() == resource.getId())) {
                    resources.add(resource);
                }
            }
        } else {
            resources = learningResourceRepository.findAllByOrderByTitleAsc();
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (LearningResource resource : resources) {
            if (query != null && !query.isBlank()) {
                String haystack = (resource.getTitle() + " " + resource.getCourseCode() + " " + resource.getDescription()).toLowerCase();
                if (!haystack.contains(query.toLowerCase())) continue;
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", resource.getId());
            row.put("title", resource.getTitle());
            row.put("courseCode", resource.getCourseCode());
            row.put("description", resource.getDescription());
            row.put("resourceUrl", resource.getResourceUrl());
            row.put("teacherId", resource.getTeacherId());
            Teacher t = teacherService.findByTeacherId(resource.getTeacherId());
            row.put("teacherName", t != null ? t.getFirstName() + " " + t.getLastName() : "Faculty");
            rows.add(row);
        }
        return rows;
    }

    @Override
    @Transactional
    public Map<String, Object> saveResource(Map<String, Object> payload) {
        Authentication auth = requireAuth();
        if (!(SecurityRoles.isTeacher(auth) || SecurityRoles.isAdmin(auth))) {
            throw new AccessDeniedException("Students cannot upload institutional resources");
        }
        LearningResource resource = payload.get("id") != null
            ? learningResourceRepository.findById(intValue(payload.get("id"))).orElse(new LearningResource())
            : new LearningResource();
        if (SecurityRoles.isTeacher(auth)) {
            Teacher teacher = currentTeacher(auth);
            resource.setTeacherId(teacher.getId());
            String courseCode = stringValue(payload.get("courseCode"));
            boolean assigned = teacher.getCourses() != null && teacher.getCourses().stream().anyMatch(course -> course.getCode().equalsIgnoreCase(courseCode));
            if (!assigned && !SecurityRoles.isAdmin(auth)) {
                throw new AccessDeniedException("Faculty can only add resources for assigned subjects");
            }
        } else if (payload.get("teacherId") != null) {
            resource.setTeacherId(intValue(payload.get("teacherId")));
        }
        resource.setTitle(stringValue(payload.get("title")));
        resource.setCourseCode(stringValue(payload.get("courseCode")));
        resource.setDescription(stringValue(payload.get("description")));
        resource.setResourceUrl(stringValue(payload.get("resourceUrl")));
        LearningResource saved = learningResourceRepository.save(resource);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", saved.getId());
        result.put("message", "Resource saved");
        return result;
    }

    @Override
    public List<Map<String, Object>> attendance(Integer courseId) {
        Authentication auth = requireAuth();
        List<AttendanceRecord> records;
        if (SecurityRoles.isStudent(auth)) {
            records = attendanceRecordRepository.findByStudentIdOrderBySessionDateDesc(currentStudent(auth).getId());
        } else if (courseId != null) {
            if (!canManageCourse(auth, courseId)) {
                throw new AccessDeniedException("Not authorized for this class attendance");
            }
            records = attendanceRecordRepository.findByCourseIdOrderBySessionDateDesc(courseId);
        } else if (SecurityRoles.isTeacher(auth)) {
            records = new ArrayList<>();
            Teacher teacher = currentTeacher(auth);
            if (teacher.getCourses() != null) {
                for (Course course : teacher.getCourses()) {
                    records.addAll(attendanceRecordRepository.findByCourseIdOrderBySessionDateDesc(course.getId()));
                }
            }
            List<AttendanceRecord> demoRecords = attendanceRecordRepository.findByRecordedByTeacherIdOrderBySessionDateDesc(teacher.getId());
            for (AttendanceRecord dr : demoRecords) {
                if (dr.getIsDemo() != null && dr.getIsDemo()) {
                    if (!records.contains(dr)) {
                        records.add(dr);
                    }
                }
            }
            records.sort((a, b) -> b.getSessionDate().compareTo(a.getSessionDate()));
        } else {
            records = attendanceRecordRepository.findAll();
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (AttendanceRecord record : records) {
            rows.add(attendanceRow(record));
        }
        return rows;
    }

    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> recordAttendance(Map<String, Object> payload) {
        Authentication auth = requireAuth();
        if (!(SecurityRoles.isTeacher(auth) || SecurityRoles.isAdmin(auth))) {
            throw new AccessDeniedException("Students cannot record class attendance");
        }
        boolean isDemo = Boolean.TRUE.equals(payload.get("isDemo")) || (payload.get("isDemo") instanceof String && "true".equalsIgnoreCase((String) payload.get("isDemo")));
        int courseId = intValue(payload.get("courseId"));
        if (!isDemo && !canManageCourse(auth, courseId)) {
            throw new AccessDeniedException("Not authorized for this class");
        }
        LocalDate sessionDate = LocalDate.parse(stringValue(payload.get("sessionDate")));
        Integer teacherId = SecurityRoles.isTeacher(auth) ? currentTeacher(auth).getId() : null;
        String demoCourseName = stringValue(payload.get("demoCourseName"));
        String classSection = payload.get("section") != null ? stringValue(payload.get("section")) : (payload.get("classSection") != null ? stringValue(payload.get("classSection")) : null);
        String sessionPeriod = payload.get("sessionPeriod") != null ? stringValue(payload.get("sessionPeriod")) : (payload.get("period") != null ? stringValue(payload.get("period")) : null);
        String commonRemarks = payload.get("remarks") != null ? stringValue(payload.get("remarks")) : null;

        int saved = 0;
        if (payload.get("records") instanceof List) {
            List<Object> entries = (List<Object>) payload.get("records");
            for (Object entry : entries) {
                Map<String, Object> item = (Map<String, Object>) entry;
                int studentId = intValue(item.get("studentId"));
                String demoStudentName = stringValue(item.get("studentName"));
                if (!isDemo && !studentInCourse(studentId, courseId)) {
                    throw new AccessDeniedException("Student is not enrolled in this class");
                }
                AttendanceRecord record = attendanceRecordRepository
                    .findByStudentIdAndCourseIdAndSessionDate(studentId, courseId, sessionDate)
                    .orElseGet(AttendanceRecord::new);
                record.setStudentId(studentId);
                record.setCourseId(courseId);
                record.setSessionDate(sessionDate);
                record.setStatus(stringValue(item.get("status")).toUpperCase());
                record.setClassSection(item.get("section") != null ? stringValue(item.get("section")) : classSection);
                record.setSessionPeriod(item.get("sessionPeriod") != null ? stringValue(item.get("sessionPeriod")) : sessionPeriod);
                record.setRemarks(item.get("remarks") != null ? stringValue(item.get("remarks")) : commonRemarks);
                record.setRecordedByTeacherId(teacherId);
                record.setIsDemo(isDemo);
                if (isDemo) {
                    record.setDemoStudentName(demoStudentName);
                    record.setDemoCourseName(demoCourseName);
                }
                attendanceRecordRepository.save(record);
                saved++;
            }
        } else if (payload.get("studentId") != null) {
            int studentId = intValue(payload.get("studentId"));
            String demoStudentName = stringValue(payload.get("studentName"));
            if (!isDemo && !studentInCourse(studentId, courseId)) {
                throw new AccessDeniedException("Student is not enrolled in this class");
            }
            AttendanceRecord record = attendanceRecordRepository
                .findByStudentIdAndCourseIdAndSessionDate(studentId, courseId, sessionDate)
                .orElseGet(AttendanceRecord::new);
            record.setStudentId(studentId);
            record.setCourseId(courseId);
            record.setSessionDate(sessionDate);
            record.setStatus(stringValue(payload.get("status")).toUpperCase());
            record.setClassSection(classSection);
            record.setSessionPeriod(sessionPeriod);
            record.setRemarks(commonRemarks);
            record.setRecordedByTeacherId(teacherId);
            record.setIsDemo(isDemo);
            if (isDemo) {
                record.setDemoStudentName(demoStudentName);
                record.setDemoCourseName(demoCourseName);
            }
            attendanceRecordRepository.save(record);
            saved++;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("saved", saved);
        result.put("message", isDemo ? "Demo class attendance recorded" : "Attendance recorded");
        return result;
    }

    @Override
    public List<Map<String, Object>> notifications() {
        Authentication auth = requireAuth();
        String role = SecurityRoles.canonicalRole(auth);
        Integer userId = SecurityRoles.isAdmin(auth) ? 0 : (SecurityRoles.isTeacher(auth) ? currentTeacher(auth).getId() : currentStudent(auth).getId());
        List<AcademicNotification> items = notificationRepository.findAll();
        items.sort((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()));

        List<Map<String, Object>> rows = new ArrayList<>();
        for (AcademicNotification item : items) {
            if (!matchesRecipient(item, role, userId)) {
                continue;
            }
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", item.getId());
            row.put("title", item.getTitle());
            row.put("message", item.getMessage());
            row.put("type", item.getNotificationType());
            row.put("read", item.isRead());
            row.put("createdAt", item.getCreatedAt());
            rows.add(row);
        }
        return rows;
    }

    @Override
    @Transactional
    public Map<String, Object> markNotificationRead(int id) {
        Authentication auth = requireAuth();
        AcademicNotification item = notificationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        String role = SecurityRoles.canonicalRole(auth);
        Integer userId = SecurityRoles.isAdmin(auth) ? 0 : (SecurityRoles.isTeacher(auth) ? currentTeacher(auth).getId() : currentStudent(auth).getId());
        if (!matchesRecipient(item, role, userId)) {
            throw new AccessDeniedException("Cannot mark another user's notification");
        }
        item.setRead(true);
        notificationRepository.save(item);
        Map<String, Object> result = new HashMap<>();
        result.put("id", item.getId());
        result.put("read", true);
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> createAnnouncement(Map<String, Object> payload) {
        Authentication auth = requireAuth();
        if (!SecurityRoles.isAdmin(auth) && !SecurityRoles.isTeacher(auth)) {
            throw new AccessDeniedException("Only faculty and administrators can publish announcements");
        }
        AcademicNotification item = new AcademicNotification();
        String targetRole = payload.get("recipientRole") != null ? stringValue(payload.get("recipientRole")) : (payload.get("targetRole") != null ? stringValue(payload.get("targetRole")) : "ALL");
        item.setRecipientRole(SecurityRoles.normalize(targetRole));
        item.setRecipientUserId(payload.get("recipientUserId") == null ? 0 : intValue(payload.get("recipientUserId")));
        item.setTitle(stringValue(payload.get("title")));
        String messageText = payload.get("message") != null ? stringValue(payload.get("message")) : stringValue(payload.get("content"));
        item.setMessage(messageText != null ? messageText : "Announcement");
        item.setNotificationType(stringValue(payload.get("notificationType")) != null ? stringValue(payload.get("notificationType")).toUpperCase() : "ANNOUNCEMENT");
        item.setRead(false);
        AcademicNotification saved = notificationRepository.save(item);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("message", "Announcement published");
        return result;
    }

    @Override
    public Map<String, Object> reports() {
        Authentication auth = requireAuth();
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("generatedFrom", "Live Institutional Database Tables");
        report.put("insights", insights());
        report.put("atRisk", atRisk());
        report.put("attendanceCount", attendance(null).size());
        report.put("consultationCount", consultations().size());
        if (SecurityRoles.isStudent(auth)) {
            Student student = currentStudent(auth);
            report.put("personalAverage", averageFromDetails(safeList(studentCourseDetailsService.findByStudentId(student.getId()))));
            report.put("personalAttendance", attendancePercent(attendanceRecordRepository.findByStudentIdOrderBySessionDateDesc(student.getId())));
        }
        return report;
    }

    // ==========================================
    // PHASE 5: WHAT-IF SIMULATOR IMPLEMENTATION
    // ==========================================

    @Override
    public Map<String, Object> simulate(Map<String, Object> payload) {
        Authentication auth = requireAuth();
        Double currentAverage = null;
        Double currentAttendance = null;
        String studentName = "Target Student";
        String courseName = "Target Subject";

        if (SecurityRoles.isStudent(auth)) {
            Student student = currentStudent(auth);
            studentName = student.getFirstName() + " " + student.getLastName();
            List<StudentCourseDetails> details = safeList(studentCourseDetailsService.findByStudentId(student.getId()));
            currentAverage = averageFromDetails(details);
            currentAttendance = attendancePercent(attendanceRecordRepository.findByStudentIdOrderBySessionDateDesc(student.getId()));
        } else if (payload.get("studentId") != null) {
            int studentId = intValue(payload.get("studentId"));
            Student student = studentService.findByStudentId(studentId);
            if (student != null) {
                studentName = student.getFirstName() + " " + student.getLastName();
                if (payload.get("courseId") != null) {
                    int courseId = intValue(payload.get("courseId"));
                    Course c = courseService.findCourseById(courseId);
                    if (c != null) courseName = c.getName();
                    StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(studentId, courseId);
                    currentAverage = scd != null ? courseAverage(scd.getGradeDetails()) : null;
                    currentAttendance = attendancePercent(attendanceRecordRepository.findByStudentIdAndCourseId(studentId, courseId));
                } else {
                    List<StudentCourseDetails> details = safeList(studentCourseDetailsService.findByStudentId(studentId));
                    currentAverage = averageFromDetails(details);
                    currentAttendance = attendancePercent(attendanceRecordRepository.findByStudentIdOrderBySessionDateDesc(studentId));
                }
            }
        } else if (payload.get("courseId") != null) {
            int courseId = intValue(payload.get("courseId"));
            Course c = courseService.findCourseById(courseId);
            if (c != null) courseName = c.getName();
            currentAverage = classAverage(courseId);
            currentAttendance = classAttendance(courseId);
        }

        // Fallback default baselines if no student data yet
        if (currentAverage == null) currentAverage = 72.0;
        if (currentAttendance == null) currentAttendance = 80.0;

        // Simulation parameters
        double targetAverage = payload.get("targetFinalAverage") != null ? doubleValue(payload.get("targetFinalAverage")) : 85.0;
        double remainingWeight = payload.get("remainingWeight") != null ? doubleValue(payload.get("remainingWeight")) : 30.0;
        double hypotheticalScore = payload.get("hypotheticalNextScore") != null ? doubleValue(payload.get("hypotheticalNextScore")) : 90.0;
        int additionalSessions = payload.get("additionalAttendanceSessions") != null ? intValue(payload.get("additionalAttendanceSessions")) : 5;
        int additionalAttended = payload.get("additionalAttended") != null ? intValue(payload.get("additionalAttended")) : 5;

        // 1. Calculate Projected Academic Average
        // Formula: Projected = CurrentAverage * (1 - Weight/100) + HypotheticalScore * (Weight/100)
        double completedWeight = Math.max(0, 100.0 - remainingWeight);
        double projectedAverage = (currentAverage * (completedWeight / 100.0)) + (hypotheticalScore * (remainingWeight / 100.0));
        projectedAverage = Math.max(0, Math.min(100, Math.round(projectedAverage * 10.0) / 10.0));

        // 2. Calculate Required Score to Achieve Target
        // Target = Current * (1 - W) + Required * W  => Required = (Target - Current * (1 - W)) / W
        double requiredScore = remainingWeight > 0
            ? (targetAverage - (currentAverage * (completedWeight / 100.0))) / (remainingWeight / 100.0)
            : targetAverage;
        requiredScore = Math.round(requiredScore * 10.0) / 10.0;
        boolean targetAchievable = requiredScore <= 100.0 && requiredScore >= 0.0;
        String targetFeasibility = targetAchievable ? "FEASIBLE" : (requiredScore > 100.0 ? "MATHEMATICALLY_INFEASIBLE" : "ALREADY_ACHIEVED");
        String feasibilityNote = targetAchievable
            ? String.format("Target goal of %.1f%% is mathematically feasible: requires %.1f%% on remaining work.", targetAverage, Math.max(0, requiredScore))
            : (requiredScore > 100.0
                ? String.format("Target goal of %.1f%% is mathematically infeasible: requires %.1f%% on remaining assessments (exceeds 100%% maximum score).", targetAverage, requiredScore)
                : String.format("Current baseline of %.1f%% already satisfies target goal of %.1f%% even with 0%% on remaining assessments.", currentAverage, targetAverage));

        // 3. Calculate Projected Attendance
        // Assume baseline 10 sessions logged
        int baseSessions = 10;
        double baseAttended = (currentAttendance / 100.0) * baseSessions;
        double projectedAttendance = ((baseAttended + additionalAttended) / (baseSessions + additionalSessions)) * 100.0;
        projectedAttendance = Math.max(0, Math.min(100, Math.round(projectedAttendance * 10.0) / 10.0));

        // 4. Standing / Risk Transitions
        String currentRiskCategory = getRiskCategory(currentAverage, currentAttendance);
        String projectedRiskCategory = getRiskCategory(projectedAverage, projectedAttendance);

        List<String> contributingFactors = new ArrayList<>();
        if (projectedAverage > currentAverage) {
            contributingFactors.add(String.format("Assessment boost of +%.1f%% from achieving %.1f%% on the remaining %.0f%% weighting.", (projectedAverage - currentAverage), hypotheticalScore, remainingWeight));
        } else if (projectedAverage < currentAverage) {
            contributingFactors.add(String.format("Assessment decrease of %.1f%% if score drops to %.1f%% on remaining work.", (currentAverage - projectedAverage), hypotheticalScore));
        }

        if (projectedAttendance > currentAttendance) {
            contributingFactors.add(String.format("Attendance rate increases from %.1f%% to %.1f%% by attending %d of the next %d sessions.", currentAttendance, projectedAttendance, additionalAttended, additionalSessions));
        }

        if (!currentRiskCategory.equals(projectedRiskCategory)) {
            contributingFactors.add(String.format("Status transition: '%s' to '%s'.", currentRiskCategory, projectedRiskCategory));
        }
        contributingFactors.add(feasibilityNote);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("simulated", true);
        result.put("doesNotAlterRecords", true);
        result.put("studentName", studentName);
        result.put("courseName", courseName);
        result.put("currentAverage", round(currentAverage));
        result.put("currentAttendance", round(currentAttendance));
        result.put("currentRiskCategory", currentRiskCategory);
        result.put("targetAverage", targetAverage);
        result.put("remainingWeight", remainingWeight);
        result.put("hypotheticalNextScore", hypotheticalScore);
        result.put("projectedAverage", projectedAverage);
        result.put("averageDelta", round(projectedAverage - currentAverage));
        result.put("requiredScoreOnRemaining", requiredScore);
        result.put("targetAchievable", targetAchievable);
        result.put("targetFeasibility", targetFeasibility);
        result.put("feasibilityNote", feasibilityNote);
        result.put("projectedAttendance", projectedAttendance);
        result.put("attendanceDelta", round(projectedAttendance - currentAttendance));
        result.put("projectedRiskCategory", projectedRiskCategory);
        result.put("projectedLetter", AcademicRules.letterGrade(projectedAverage));
        result.put("contributingFactors", contributingFactors);
        result.put("formulaExplanation", String.format(
            "Projected Grade = (Current Avg %.1f%% × %.0f%% completed weight) + (Hypothetical Score %.1f%% × %.0f%% remaining weight) = %.1f%%. Attendance projected over %d total sessions.",
            currentAverage, completedWeight, hypotheticalScore, remainingWeight, projectedAverage, (baseSessions + additionalSessions)
        ));
        result.put("modelDisclaimer", "Deterministic mathematical projection. Does not modify official institutional records or grades.");

        return result;
    }

    private String getRiskCategory(Double avg, Double att) {
        if (avg == null || att == null) return "Needs Data";
        if (avg < 50 || att < 60) return "High Risk (Critical)";
        if (avg < 60 || att < 75) return "Moderate Risk (Warning)";
        if (avg >= 85) return "Dean's List / High Standing";
        return "Good Standing";
    }

    private Map<String, Object> riskRow(Student student, Course course, Double avg, Double attendance, int missing, boolean includeStudent) {
        Map<String, Object> row = new LinkedHashMap<>();
        if (includeStudent) {
            row.put("studentId", student.getId());
            row.put("studentName", student.getFirstName() + " " + student.getLastName());
            row.put("userName", student.getUserName());
            row.put("email", student.getEmail());
        }
        row.put("courseId", course == null ? null : course.getId());
        row.put("courseName", course == null ? null : course.getName());
        row.put("courseCode", course == null ? null : course.getCode());
        row.put("gradeAverage", avg);
        row.put("academicAverage", avg != null ? avg : "N/A");
        row.put("attendancePercent", attendance);
        row.put("attendancePercentage", attendance != null ? attendance : "N/A");
        row.put("missingAssignments", missing);

        List<String> factors = new ArrayList<>();
        if (AcademicRules.isAtRiskAverage(avg)) factors.add("Average below 60% (" + (avg != null ? avg : "") + "%)");
        if (AcademicRules.isLowAttendance(attendance)) factors.add("Attendance below 75% (" + (attendance != null ? attendance : "") + "%)");
        if (missing > 0) factors.add(missing + " missing assignment(s)");
        row.put("factors", factors);
        row.put("riskReason", String.join(" | ", factors));

        List<InterventionCase> cases = interventionCaseRepository.findByStudentIdOrderByUpdatedAtDesc(student.getId());
        if (cases != null && !cases.isEmpty()) {
            row.put("interventionStatus", cases.get(0).getStatus());
        } else {
            row.put("interventionStatus", "NO_ACTIVE_INTERVENTION");
        }

        row.put("suggestion", AcademicRules.isLowAttendance(attendance)
            ? "Prioritize attendance recovery and complete outstanding assessments."
            : "Review published marks and schedule office hours mentoring.");
        return row;
    }

    private Map<String, Object> consultationRow(ConsultationRequest request) {
        Student student = studentService.findByStudentId(request.getStudentId());
        Teacher teacher = teacherService.findByTeacherId(request.getTeacherId());
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", request.getId());
        row.put("studentId", request.getStudentId());
        row.put("studentName", student == null ? "Student" : student.getFirstName() + " " + student.getLastName());
        row.put("teacherId", request.getTeacherId());
        row.put("teacherName", teacher == null ? "Faculty" : teacher.getFirstName() + " " + teacher.getLastName());
        row.put("requestedAt", request.getRequestedAt());
        row.put("status", request.getStatus());
        row.put("studentNotes", request.getStudentNotes());
        row.put("instructions", request.getInstructions());
        return row;
    }

    private Map<String, Object> attendanceRow(AttendanceRecord record) {
        boolean isDemo = record.getIsDemo() != null && record.getIsDemo();
        Student student = !isDemo ? studentService.findByStudentId(record.getStudentId()) : null;
        Course course = !isDemo ? courseService.findCourseById(record.getCourseId()) : null;
        Teacher teacher = record.getRecordedByTeacherId() != null ? teacherService.findByTeacherId(record.getRecordedByTeacherId()) : null;
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", record.getId());
        row.put("studentId", record.getStudentId());
        row.put("studentName", isDemo
            ? (record.getDemoStudentName() != null ? record.getDemoStudentName() : "Demo Student #" + Math.abs(record.getStudentId()))
            : (student == null ? "Student" : student.getFirstName() + " " + student.getLastName()));
        row.put("courseId", record.getCourseId());
        row.put("courseName", isDemo
            ? (record.getDemoCourseName() != null ? record.getDemoCourseName() : "Demo Class")
            : (course == null ? null : course.getName()));
        row.put("courseCode", isDemo ? "DEMO" : (course == null ? null : course.getCode()));
        row.put("sessionDate", record.getSessionDate());
        row.put("status", record.getStatus());
        row.put("section", record.getClassSection() != null ? record.getClassSection() : "Section A");
        row.put("sessionPeriod", record.getSessionPeriod() != null ? record.getSessionPeriod() : "Period 1 (08:30 - 09:30)");
        row.put("remarks", record.getRemarks() != null ? record.getRemarks() : "");
        row.put("isDemo", isDemo);
        row.put("recordedByTeacherName", teacher != null ? teacher.getFirstName() + " " + teacher.getLastName() : "System / Faculty");
        return row;
    }

    private List<Course> authorizedCourses(Authentication auth) {
        if (SecurityRoles.isAdmin(auth)) {
            List<Course> courses = courseService.findAllCourses();
            return courses == null ? new ArrayList<>() : courses;
        }
        Teacher teacher = currentTeacher(auth);
        return teacher.getCourses() == null ? new ArrayList<>() : teacher.getCourses();
    }

    private boolean canManageCourse(Authentication auth, int courseId) {
        if (SecurityRoles.isAdmin(auth)) return true;
        if (!SecurityRoles.isTeacher(auth)) return false;
        Course course = courseService.findCourseById(courseId);
        return course != null && course.getTeacher() != null && course.getTeacher().getId() == currentTeacher(auth).getId();
    }

    private boolean studentInCourse(int studentId, int courseId) {
        return studentCourseDetailsService.findByStudentAndCourseId(studentId, courseId) != null;
    }

    private List<String> teacherSubjects(Teacher teacher) {
        if (teacher == null || teacher.getCourses() == null) return new ArrayList<>();
        return teacher.getCourses().stream().map(Course::getName).collect(Collectors.toList());
    }

    private Double averageFromDetails(List<StudentCourseDetails> details) {
        double sum = 0;
        int count = 0;
        for (StudentCourseDetails detail : details) {
            Double avg = courseAverage(detail.getGradeDetails());
            if (avg != null) {
                sum += avg;
                count++;
            }
        }
        return count == 0 ? null : round(sum / count);
    }

    private Double classAverage(int courseId) {
        Course course = courseService.findCourseById(courseId);
        if (course == null || course.getStudents() == null) return null;
        double sum = 0;
        int count = 0;
        for (Student student : course.getStudents()) {
            StudentCourseDetails detail = studentCourseDetailsService.findByStudentAndCourseId(student.getId(), courseId);
            Double avg = detail == null ? null : courseAverage(detail.getGradeDetails());
            if (avg != null) {
                sum += avg;
                count++;
            }
        }
        return count == 0 ? null : round(sum / count);
    }

    private Double courseAverage(GradeDetails grades) {
        if (grades == null) return null;
        double sum = 0;
        int count = 0;
        if (grades.getGradeOne() != -1) { sum += grades.getGradeOne(); count++; }
        if (grades.getGradeTwo() != -1) { sum += grades.getGradeTwo(); count++; }
        if (grades.getGradeThree() != -1) { sum += grades.getGradeThree(); count++; }
        return count == 0 ? null : round(sum / count);
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

    private Double attendancePercent(List<AttendanceRecord> records) {
        if (records == null || records.isEmpty()) return null;
        long present = records.stream()
            .filter(item -> (item.getIsDemo() == null || !item.getIsDemo()) && ("PRESENT".equalsIgnoreCase(item.getStatus()) || "LATE".equalsIgnoreCase(item.getStatus())))
            .count();
        long total = records.stream()
            .filter(item -> item.getIsDemo() == null || !item.getIsDemo())
            .count();
        if (total == 0) return null;
        return round((present * 100.0) / total);
    }

    private Double classAttendance(int courseId) {
        return attendancePercent(attendanceRecordRepository.findByCourseIdOrderBySessionDateDesc(courseId));
    }

    private String recommendation(Double avg, Double attendance) {
        if (avg == null && attendance == null) return "Insufficient published data for a recommendation.";
        if (AcademicRules.isAtRiskAverage(avg)) return "Focus on upcoming assessments in this subject.";
        if (AcademicRules.isLowAttendance(attendance)) return "Improve attendance to remain eligible for evaluation.";
        if (avg != null && avg >= 80) return "Maintain current study pattern; this is a strength area.";
        return "Keep completing assignments on schedule.";
    }

    private int uniqueStudentCount(Teacher teacher) {
        Set<Integer> ids = new HashSet<>();
        if (teacher.getCourses() != null) {
            for (Course course : teacher.getCourses()) {
                if (course.getStudents() == null) continue;
                for (Student student : course.getStudents()) ids.add(student.getId());
            }
        }
        return ids.size();
    }

    private boolean matchesRecipient(AcademicNotification item, String role, Integer userId) {
        if (item == null || item.getRecipientRole() == null) {
            return false;
        }
        if ("ALL".equalsIgnoreCase(item.getRecipientRole())) {
            return true;
        }
        if (!item.getRecipientRole().equalsIgnoreCase(role)) {
            return false;
        }
        return item.getRecipientUserId() == null || item.getRecipientUserId() == 0 || item.getRecipientUserId().equals(userId);
    }

    private Authentication requireAuth() {
        Authentication authentication = SecurityRoles.current();
        if (!SecurityRoles.isAuthenticated(authentication)) {
            throw new AccessDeniedException("Authentication required");
        }
        return authentication;
    }

    private Student currentStudent(Authentication authentication) {
        Student student = studentService.findByStudentName(authentication.getName());
        if (student == null) throw new AccessDeniedException("Student profile not found");
        return student;
    }

    private Teacher currentTeacher(Authentication authentication) {
        Teacher teacher = teacherService.findByTeacherName(authentication.getName());
        if (teacher == null) throw new AccessDeniedException("Teacher profile not found");
        return teacher;
    }

    private List<StudentCourseDetails> safeList(List<StudentCourseDetails> details) {
        return details == null ? new ArrayList<>() : details;
    }

    private int sizeOf(List<?> items) {
        return items == null ? 0 : items.size();
    }

    private int intValue(Object value) {
        if (value == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Required numeric value is missing");
        return Integer.parseInt(String.valueOf(value));
    }

    private Double doubleValue(Object value) {
        if (value == null) return null;
        return Double.parseDouble(String.valueOf(value));
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private LocalTime parseTime(Object value) {
        if (value == null || String.valueOf(value).isBlank()) return null;
        return LocalTime.parse(String.valueOf(value));
    }

    private LocalDateTime parseDateTime(Object value) {
        if (value == null || String.valueOf(value).isBlank()) {
            return LocalDateTime.now().plusDays(2).withHour(10).withMinute(0).withSecond(0).withNano(0);
        }
        String text = String.valueOf(value);
        if (text.length() == 16) {
            return LocalDateTime.parse(text);
        }
        return LocalDateTime.parse(text);
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
