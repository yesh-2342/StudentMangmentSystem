package com.Studentmangment.studentmanagement.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
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

import com.Studentmangment.studentmanagement.entity.AcademicDoubt;
import com.Studentmangment.studentmanagement.entity.AcademicNotification;
import com.Studentmangment.studentmanagement.entity.AcademicTodo;
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
import com.Studentmangment.studentmanagement.entity.ResourceBookmark;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.entity.StudentCourseDetails;
import com.Studentmangment.studentmanagement.entity.Teacher;
import com.Studentmangment.studentmanagement.repository.AcademicDoubtRepository;
import com.Studentmangment.studentmanagement.repository.AcademicNotificationRepository;
import com.Studentmangment.studentmanagement.repository.AcademicTodoRepository;
import com.Studentmangment.studentmanagement.repository.AttendanceRecordRepository;
import com.Studentmangment.studentmanagement.repository.ConsultationRequestRepository;
import com.Studentmangment.studentmanagement.repository.FacultyAvailabilityRepository;
import com.Studentmangment.studentmanagement.repository.InterventionCaseRepository;
import com.Studentmangment.studentmanagement.repository.LearningResourceRepository;
import com.Studentmangment.studentmanagement.repository.LibraryBookRepository;
import com.Studentmangment.studentmanagement.repository.ResourceBookmarkRepository;
import com.Studentmangment.studentmanagement.service.AssignmentDetailsService;
import com.Studentmangment.studentmanagement.service.AssignmentService;
import com.Studentmangment.studentmanagement.util.AcademicRules;
import com.Studentmangment.studentmanagement.util.SecurityRoles;

@Service
public class AcademicPortalServiceImpl implements AcademicPortalService {

    @Autowired private StudentService studentService;
    @Autowired private TeacherService teacherService;
    @Autowired private CourseService courseService;
    @Autowired private StudentCourseDetailsService studentCourseDetailsService;
    @Autowired private AssignmentDetailsService assignmentDetailsService;
    @Autowired private AssignmentService assignmentService;
    @Autowired private FacultyAvailabilityRepository availabilityRepository;
    @Autowired private ConsultationRequestRepository consultationRepository;
    @Autowired private LibraryBookRepository libraryBookRepository;
    @Autowired private LearningResourceRepository learningResourceRepository;
    @Autowired private AttendanceRecordRepository attendanceRecordRepository;
    @Autowired private AcademicNotificationRepository notificationRepository;
    @Autowired private InterventionCaseRepository interventionCaseRepository;
    @Autowired private AcademicTodoRepository academicTodoRepository;
    @Autowired private ResourceBookmarkRepository resourceBookmarkRepository;
    @Autowired private AcademicDoubtRepository academicDoubtRepository;

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
        if (teacherId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please select an eligible faculty instructor.");
        }
        Teacher teacher = teacherService.findByTeacherId(teacherId);
        if (teacher == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected faculty member does not exist or is unavailable.");
        }
        LocalDateTime requestedAt = parseDateTime(payload.get("requestedAt"));
        if (requestedAt == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment date and time is required.");
        }
        if (requestedAt.isBefore(LocalDateTime.now().minusMinutes(5))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment date and time must be scheduled for a future slot.");
        }

        // Check for conflicting teacher consultations around this time (within 30 minutes)
        List<ConsultationRequest> teacherBookings = consultationRepository.findByTeacherIdOrderByRequestedAtDesc(teacherId);
        for (ConsultationRequest cr : teacherBookings) {
            if (("PENDING".equalsIgnoreCase(cr.getStatus()) || "CONFIRMED".equalsIgnoreCase(cr.getStatus())) && cr.getRequestedAt() != null) {
                long diff = Math.abs(java.time.Duration.between(cr.getRequestedAt(), requestedAt).toMinutes());
                if (diff < 30) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "The selected faculty member already has a consultation booked around this time. Please choose a different time slot.");
                }
            }
        }

        // Check for conflicting student consultations around this time
        List<ConsultationRequest> studentBookings = consultationRepository.findByStudentIdOrderByRequestedAtDesc(student.getId());
        for (ConsultationRequest cr : studentBookings) {
            if (("PENDING".equalsIgnoreCase(cr.getStatus()) || "CONFIRMED".equalsIgnoreCase(cr.getStatus())) && cr.getRequestedAt() != null) {
                long diff = Math.abs(java.time.Duration.between(cr.getRequestedAt(), requestedAt).toMinutes());
                if (diff < 30) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have another appointment scheduled around this time. Please choose another time slot.");
                }
            }
        }

        ConsultationRequest request = new ConsultationRequest();
        request.setStudentId(student.getId());
        request.setTeacherId(teacherId);
        request.setRequestedAt(requestedAt);
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
            String role = SecurityRoles.canonicalRole(auth);
            int userId = SecurityRoles.isStudent(auth) ? currentStudent(auth).getId() : (SecurityRoles.isTeacher(auth) ? currentTeacher(auth).getId() : 0);
            boolean isBookmarked = resourceBookmarkRepository.existsByUserIdAndUserRoleAndResourceId(userId, role, resource.getId());

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", resource.getId());
            row.put("title", resource.getTitle());
            row.put("courseCode", resource.getCourseCode());
            row.put("description", resource.getDescription());
            row.put("resourceUrl", resource.getResourceUrl());
            row.put("teacherId", resource.getTeacherId());
            row.put("isBookmarked", isBookmarked);
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

    // ==========================================
    // SMART ACADEMIC TO-DO LIST IMPLEMENTATION
    // ==========================================

    @Override
    public List<Map<String, Object>> todos() {
        Authentication auth = requireAuth();
        List<Map<String, Object>> items = new ArrayList<>();

        if (SecurityRoles.isStudent(auth)) {
            Student student = currentStudent(auth);

            // 1. Pending Coursework / Assignments
            List<StudentCourseDetails> scdList = safeList(studentCourseDetailsService.findByStudentId(student.getId()));
            for (StudentCourseDetails scd : scdList) {
                Course c = courseService.findCourseById(scd.getCourseId());
                String cCode = c != null ? c.getCode() : "COURSE";
                String cName = c != null ? c.getName() : "Course #" + scd.getCourseId();
                if (scd.getAssignments() != null) {
                    for (Assignment a : scd.getAssignments()) {
                        AssignmentDetails ad = assignmentDetailsService.findByAssignmentAndStudentCourseDetailsId(a.getId(), scd.getId());
                        if (ad == null || ad.getIsDone() != 1) {
                            Map<String, Object> todo = new LinkedHashMap<>();
                            todo.put("id", "assign-" + a.getId() + "-" + scd.getId());
                            todo.put("assignmentId", a.getId());
                            todo.put("title", "Submit " + a.getName() + " (" + cName + ")");
                            todo.put("category", "ASSIGNMENT");
                            todo.put("courseCode", cCode);
                            todo.put("courseName", cName);
                            LocalDate due = a.getDueDate() != null ? LocalDate.parse(a.getDueDate()) : LocalDate.now().plusDays(3);
                            todo.put("dueDate", due.toString());
                            long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), due);
                            todo.put("daysRemaining", (int) daysLeft);
                            todo.put("priority", daysLeft <= 2 ? "URGENT" : (daysLeft <= 5 ? "HIGH" : "NORMAL"));
                            todo.put("completed", false);
                            todo.put("isSystemGenerated", true);
                            items.add(todo);
                        }
                    }
                }

                // 2. Attendance Shortfall Alert To-Do
                List<AttendanceRecord> records = attendanceRecordRepository.findByStudentIdAndCourseId(student.getId(), scd.getCourseId());
                Double attPct = attendancePercent(records);
                if (attPct != null && attPct < 75.0) {
                    long total = records.stream().filter(r -> r.getIsDemo() == null || !r.getIsDemo()).count();
                    long present = records.stream().filter(r -> (r.getIsDemo() == null || !r.getIsDemo()) && ("PRESENT".equalsIgnoreCase(r.getStatus()) || "LATE".equalsIgnoreCase(r.getStatus()))).count();
                    int needed = (int) Math.ceil((75.0 * total - 100.0 * present) / (100.0 - 75.0));
                    if (needed < 1) needed = 1;
                    Map<String, Object> attTodo = new LinkedHashMap<>();
                    attTodo.put("id", "att-" + scd.getCourseId());
                    attTodo.put("title", "Attendance Recovery: Attend next " + needed + " sessions in " + cName + " to reach 75%");
                    attTodo.put("category", "ATTENDANCE");
                    attTodo.put("courseCode", cCode);
                    attTodo.put("courseName", cName);
                    attTodo.put("dueDate", LocalDate.now().plusDays(7).toString());
                    attTodo.put("priority", "HIGH");
                    attTodo.put("completed", false);
                    attTodo.put("isSystemGenerated", true);
                    items.add(attTodo);
                }
            }

            // 3. User Custom To-Dos
            List<AcademicTodo> customTodos = academicTodoRepository.findByStudentIdOrderByDueDateAscCreatedAtDesc(student.getId());
            for (AcademicTodo ct : customTodos) {
                Map<String, Object> todo = new LinkedHashMap<>();
                todo.put("id", String.valueOf(ct.getId()));
                todo.put("dbId", ct.getId());
                todo.put("title", ct.getTitle());
                todo.put("category", ct.getCategory() != null ? ct.getCategory() : "PERSONAL");
                todo.put("courseCode", ct.getCourseCode());
                todo.put("dueDate", ct.getDueDate() != null ? ct.getDueDate().toString() : null);
                todo.put("priority", ct.getPriority() != null ? ct.getPriority() : "NORMAL");
                todo.put("completed", ct.isCompleted());
                todo.put("isSystemGenerated", false);
                items.add(todo);
            }
        }
        return items;
    }

    @Override
    @Transactional
    public Map<String, Object> createTodo(Map<String, Object> payload) {
        Authentication auth = requireAuth();
        if (!SecurityRoles.isStudent(auth)) {
            throw new AccessDeniedException("Only students can manage personal study to-dos");
        }
        Student student = currentStudent(auth);
        AcademicTodo todo = new AcademicTodo();
        todo.setStudentId(student.getId());
        todo.setTitle(stringValue(payload.get("title")));
        todo.setCategory(payload.get("category") != null ? stringValue(payload.get("category")) : "PERSONAL");
        todo.setPriority(payload.get("priority") != null ? stringValue(payload.get("priority")) : "NORMAL");
        if (payload.get("dueDate") != null) {
            todo.setDueDate(LocalDate.parse(stringValue(payload.get("dueDate"))));
        }
        if (payload.get("courseCode") != null) {
            todo.setCourseCode(stringValue(payload.get("courseCode")));
        }
        todo.setCompleted(false);
        AcademicTodo saved = academicTodoRepository.save(todo);
        Map<String, Object> res = new HashMap<>();
        res.put("id", saved.getId());
        res.put("message", "To-do item created successfully");
        return res;
    }

    @Override
    @Transactional
    public Map<String, Object> toggleTodo(int id) {
        Authentication auth = requireAuth();
        AcademicTodo todo = academicTodoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "To-do item not found"));
        if (SecurityRoles.isStudent(auth) && todo.getStudentId() != currentStudent(auth).getId()) {
            throw new AccessDeniedException("Cannot toggle another student's to-do item");
        }
        todo.setCompleted(!todo.isCompleted());
        academicTodoRepository.save(todo);
        Map<String, Object> res = new HashMap<>();
        res.put("id", todo.getId());
        res.put("completed", todo.isCompleted());
        return res;
    }

    @Override
    @Transactional
    public Map<String, Object> deleteTodo(int id) {
        Authentication auth = requireAuth();
        AcademicTodo todo = academicTodoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "To-do item not found"));
        if (SecurityRoles.isStudent(auth) && todo.getStudentId() != currentStudent(auth).getId()) {
            throw new AccessDeniedException("Cannot delete another student's to-do item");
        }
        academicTodoRepository.delete(todo);
        return Map.of("message", "To-do deleted successfully", "id", id);
    }

    // ==========================================
    // ATTENDANCE RECOVERY CALCULATOR IMPLEMENTATION
    // ==========================================

    @Override
    public Map<String, Object> attendanceRecovery(Integer targetPercentage, Integer studentId) {
        Authentication auth = requireAuth();
        Student student;
        if (studentId != null && (SecurityRoles.isTeacher(auth) || SecurityRoles.isAdmin(auth))) {
            student = studentService.findByStudentId(studentId);
        } else {
            student = currentStudent(auth);
        }
        if (student == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found");

        double target = (targetPercentage != null && targetPercentage >= 50 && targetPercentage <= 100) ? targetPercentage : 75.0;

        List<AttendanceRecord> allRecords = attendanceRecordRepository.findByStudentIdOrderBySessionDateDesc(student.getId());
        long overallTotal = allRecords.stream().filter(r -> r.getIsDemo() == null || !r.getIsDemo()).count();
        long overallPresent = allRecords.stream().filter(r -> (r.getIsDemo() == null || !r.getIsDemo()) && ("PRESENT".equalsIgnoreCase(r.getStatus()) || "LATE".equalsIgnoreCase(r.getStatus()))).count();
        double currentOverallPct = overallTotal > 0 ? round((overallPresent * 100.0) / overallTotal) : 100.0;

        int overallNeededToAttend = 0;
        int overallMarginToMiss = 0;
        if (currentOverallPct < target) {
            overallNeededToAttend = (int) Math.ceil((target * overallTotal - 100.0 * overallPresent) / (100.0 - target));
            if (overallNeededToAttend < 0) overallNeededToAttend = 0;
        } else {
            overallMarginToMiss = (int) Math.floor((100.0 * overallPresent - target * overallTotal) / target);
            if (overallMarginToMiss < 0) overallMarginToMiss = 0;
        }

        List<StudentCourseDetails> scdList = safeList(studentCourseDetailsService.findByStudentId(student.getId()));
        List<Map<String, Object>> courseBreakdown = new ArrayList<>();
        for (StudentCourseDetails scd : scdList) {
            Course c = courseService.findCourseById(scd.getCourseId());
            String cName = c != null ? c.getName() : "Course #" + scd.getCourseId();
            String cCode = c != null ? c.getCode() : "CODE";
            List<AttendanceRecord> cRecords = attendanceRecordRepository.findByStudentIdAndCourseId(student.getId(), scd.getCourseId());
            long cTot = cRecords.stream().filter(r -> r.getIsDemo() == null || !r.getIsDemo()).count();
            long cPres = cRecords.stream().filter(r -> (r.getIsDemo() == null || !r.getIsDemo()) && ("PRESENT".equalsIgnoreCase(r.getStatus()) || "LATE".equalsIgnoreCase(r.getStatus()))).count();
            double cPct = cTot > 0 ? round((cPres * 100.0) / cTot) : 100.0;

            int cNeeded = 0;
            int cMargin = 0;
            if (cPct < target) {
                cNeeded = (int) Math.ceil((target * cTot - 100.0 * cPres) / (100.0 - target));
                if (cNeeded < 0) cNeeded = 0;
            } else {
                cMargin = (int) Math.floor((100.0 * cPres - target * cTot) / target);
                if (cMargin < 0) cMargin = 0;
            }

            Map<String, Object> crow = new LinkedHashMap<>();
            crow.put("courseId", scd.getCourseId());
            crow.put("courseName", cName);
            crow.put("courseCode", cCode);
            crow.put("totalSessions", cTot);
            crow.put("attendedSessions", cPres);
            crow.put("currentPercentage", cPct);
            crow.put("meetsTarget", cPct >= target);
            crow.put("consecutiveSessionsNeeded", cNeeded);
            crow.put("marginSessionsCanMiss", cMargin);
            crow.put("status", cPct >= target ? "ELIGIBLE" : "ACTION_REQUIRED");
            courseBreakdown.add(crow);
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("studentId", student.getId());
        res.put("studentName", student.getFirstName() + " " + student.getLastName());
        res.put("targetPercentage", target);
        res.put("overallTotalSessions", overallTotal);
        res.put("overallAttendedSessions", overallPresent);
        res.put("currentOverallPercentage", currentOverallPct);
        res.put("overallMeetsTarget", currentOverallPct >= target);
        res.put("overallConsecutiveSessionsNeeded", overallNeededToAttend);
        res.put("overallMarginSessionsCanMiss", overallMarginToMiss);
        res.put("courses", courseBreakdown);
        res.put("formulaNote", String.format("Accreditation recovery formula: N = ⌈(Target × Total - 100 × Attended) / (100 - Target)⌉ for Target = %.0f%%", target));
        return res;
    }

    // ==========================================
    // PERSONALIZED STUDY PLANNER IMPLEMENTATION
    // ==========================================

    @Override
    public Map<String, Object> studyPlan(Map<String, Object> preferences) {
        Authentication auth = requireAuth();
        Student student = currentStudent(auth);
        List<StudentCourseDetails> scdList = safeList(studentCourseDetailsService.findByStudentId(student.getId()));

        int weekdayHours = (preferences != null && preferences.get("weekdayHours") != null) ? intValue(preferences.get("weekdayHours")) : 3;
        int weekendHours = (preferences != null && preferences.get("weekendHours") != null) ? intValue(preferences.get("weekendHours")) : 5;
        int totalWeeklyHours = (weekdayHours * 5) + (weekendHours * 2);

        List<Map<String, Object>> subjectAllocations = new ArrayList<>();
        double totalWeight = 0;

        for (StudentCourseDetails scd : scdList) {
            Course c = courseService.findCourseById(scd.getCourseId());
            if (c == null) continue;
            Double avg = courseAverage(scd.getGradeDetails());
            Double att = attendancePercent(attendanceRecordRepository.findByStudentIdAndCourseId(student.getId(), c.getId()));
            int missingAssignments = countMissingAssignments(scd);

            double multiplier = 1.0;
            if (avg != null && avg < 60.0) multiplier += 0.8;
            else if (avg != null && avg < 75.0) multiplier += 0.4;
            if (att != null && att < 75.0) multiplier += 0.3;
            if (missingAssignments > 0) multiplier += (0.2 * missingAssignments);

            totalWeight += multiplier;
            Map<String, Object> sa = new LinkedHashMap<>();
            sa.put("courseId", c.getId());
            sa.put("courseCode", c.getCode());
            sa.put("courseName", c.getName());
            sa.put("currentAverage", avg != null ? avg : 75.0);
            sa.put("attendanceRate", att != null ? att : 85.0);
            sa.put("missingAssignments", missingAssignments);
            sa.put("urgencyFactor", round(multiplier));
            sa.put("status", (avg != null && avg < 60) ? "HIGH_PRIORITY" : ((avg != null && avg < 75) ? "MODERATE_FOCUS" : "MAINTENANCE"));
            subjectAllocations.add(sa);
        }

        for (Map<String, Object> sa : subjectAllocations) {
            double factor = (double) sa.get("urgencyFactor");
            double allocated = totalWeight > 0 ? round((factor / totalWeight) * totalWeeklyHours) : round((double) totalWeeklyHours / Math.max(1, subjectAllocations.size()));
            sa.put("allocatedWeeklyHours", Math.max(2.0, allocated));
            sa.put("recommendedTechnique", ((double) sa.get("currentAverage") < 65) ? "Active Recall & Worked Problem Sets" : "Spaced Repetition & Chapter Quizzes");
        }

        String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
        List<Map<String, Object>> weeklySchedule = new ArrayList<>();
        int subjectIdx = 0;
        for (String day : days) {
            boolean isWeekend = "Saturday".equals(day) || "Sunday".equals(day);
            int dayTarget = isWeekend ? weekendHours : weekdayHours;

            List<Map<String, Object>> slots = new ArrayList<>();
            if (!subjectAllocations.isEmpty()) {
                Map<String, Object> s1 = subjectAllocations.get(subjectIdx % subjectAllocations.size());
                slots.add(Map.of(
                    "timeSlot", isWeekend ? "10:00 AM - 12:30 PM" : "05:00 PM - 06:30 PM",
                    "courseCode", s1.get("courseCode"),
                    "courseName", s1.get("courseName"),
                    "focus", "Core concepts & continuous evaluation prep",
                    "durationHours", isWeekend ? 2.5 : 1.5
                ));
                subjectIdx++;

                Map<String, Object> s2 = subjectAllocations.get(subjectIdx % subjectAllocations.size());
                slots.add(Map.of(
                    "timeSlot", isWeekend ? "03:00 PM - 05:30 PM" : "07:30 PM - 09:00 PM",
                    "courseCode", s2.get("courseCode"),
                    "courseName", s2.get("courseName"),
                    "focus", "Assignment completion & revision questions",
                    "durationHours", isWeekend ? 2.5 : 1.5
                ));
                subjectIdx++;
            }

            weeklySchedule.add(Map.of(
                "day", day,
                "isWeekend", isWeekend,
                "targetHours", dayTarget,
                "sessions", slots
            ));
        }

        Map<String, Object> plan = new LinkedHashMap<>();
        plan.put("studentName", student.getFirstName() + " " + student.getLastName());
        plan.put("totalWeeklyHours", totalWeeklyHours);
        plan.put("subjectAllocations", subjectAllocations);
        plan.put("weeklySchedule", weeklySchedule);
        plan.put("studyTips", List.of(
            "Use 50-minute Pomodoro focus blocks with 10-minute rest intervals.",
            "Prioritize HIGH_PRIORITY subjects during your peak morning/evening focus windows.",
            "Review your study plan weekly after continuous assessment grades are published."
        ));
        return plan;
    }

    // ==========================================
    // RESOURCE BOOKMARKING IMPLEMENTATION
    // ==========================================

    @Override
    @Transactional
    public Map<String, Object> toggleBookmark(int resourceId) {
        Authentication auth = requireAuth();
        String role = SecurityRoles.canonicalRole(auth);
        int userId = SecurityRoles.isStudent(auth) ? currentStudent(auth).getId() : (SecurityRoles.isTeacher(auth) ? currentTeacher(auth).getId() : 0);

        boolean exists = resourceBookmarkRepository.existsByUserIdAndUserRoleAndResourceId(userId, role, resourceId);
        if (exists) {
            resourceBookmarkRepository.deleteByUserIdAndUserRoleAndResourceId(userId, role, resourceId);
            return Map.of("resourceId", resourceId, "bookmarked", false, "message", "Bookmark removed");
        } else {
            ResourceBookmark bookmark = new ResourceBookmark(userId, role, resourceId);
            resourceBookmarkRepository.save(bookmark);
            return Map.of("resourceId", resourceId, "bookmarked", true, "message", "Resource bookmarked");
        }
    }

    @Override
    public List<Map<String, Object>> bookmarkedResources() {
        Authentication auth = requireAuth();
        String role = SecurityRoles.canonicalRole(auth);
        int userId = SecurityRoles.isStudent(auth) ? currentStudent(auth).getId() : (SecurityRoles.isTeacher(auth) ? currentTeacher(auth).getId() : 0);

        List<ResourceBookmark> bookmarks = resourceBookmarkRepository.findByUserIdAndUserRole(userId, role);
        List<Map<String, Object>> result = new ArrayList<>();
        for (ResourceBookmark bm : bookmarks) {
            learningResourceRepository.findById(bm.getResourceId()).ifPresent(res -> {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", res.getId());
                row.put("title", res.getTitle());
                row.put("courseCode", res.getCourseCode());
                row.put("description", res.getDescription());
                row.put("resourceUrl", res.getResourceUrl());
                row.put("isBookmarked", true);
                row.put("bookmarkedAt", bm.getCreatedAt());
                result.add(row);
            });
        }
        return result;
    }

    // ==========================================
    // DOUBT & CLARIFICATION REQUESTS IMPLEMENTATION
    // ==========================================

    @Override
    public List<Map<String, Object>> doubts(Integer courseId) {
        Authentication auth = requireAuth();
        List<AcademicDoubt> doubts;
        if (SecurityRoles.isStudent(auth)) {
            Student student = currentStudent(auth);
            doubts = academicDoubtRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
        } else if (SecurityRoles.isTeacher(auth)) {
            Teacher teacher = currentTeacher(auth);
            doubts = academicDoubtRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getId());
        } else {
            doubts = courseId != null ? academicDoubtRepository.findByCourseIdOrderByCreatedAtDesc(courseId) : academicDoubtRepository.findAllByOrderByCreatedAtDesc();
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        for (AcademicDoubt d : doubts) {
            if (courseId != null && d.getCourseId() != courseId) continue;
            Student s = studentService.findByStudentId(d.getStudentId());
            Course c = courseService.findCourseById(d.getCourseId());
            Teacher t = d.getTeacherId() != null ? teacherService.findByTeacherId(d.getTeacherId()) : (c != null ? c.getTeacher() : null);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", d.getId());
            row.put("studentId", d.getStudentId());
            row.put("studentName", s != null ? s.getFirstName() + " " + s.getLastName() : "Student #" + d.getStudentId());
            row.put("courseId", d.getCourseId());
            row.put("courseName", c != null ? c.getName() : "Course #" + d.getCourseId());
            row.put("courseCode", c != null ? c.getCode() : "");
            row.put("teacherName", t != null ? t.getFirstName() + " " + t.getLastName() : "Faculty");
            row.put("topic", d.getTopic());
            row.put("question", d.getQuestion());
            row.put("answer", d.getAnswer());
            row.put("status", d.getStatus());
            row.put("createdAt", d.getCreatedAt());
            row.put("answeredAt", d.getAnsweredAt());
            rows.add(row);
        }
        return rows;
    }

    @Override
    @Transactional
    public Map<String, Object> createDoubt(Map<String, Object> payload) {
        Authentication auth = requireAuth();
        if (!SecurityRoles.isStudent(auth)) {
            throw new AccessDeniedException("Only enrolled students can post academic doubts");
        }
        Student student = currentStudent(auth);
        int courseId = intValue(payload.get("courseId"));
        Course course = courseService.findCourseById(courseId);
        if (course == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");

        Integer teacherId = course.getTeacher() != null ? course.getTeacher().getId() : null;
        AcademicDoubt doubt = new AcademicDoubt(student.getId(), courseId, teacherId, stringValue(payload.get("topic")), stringValue(payload.get("question")));
        AcademicDoubt saved = academicDoubtRepository.save(doubt);

        if (teacherId != null) {
            AcademicNotification notif = new AcademicNotification();
            notif.setRecipientRole("ROLE_TEACHER");
            notif.setRecipientUserId(teacherId);
            notif.setTitle("New Academic Doubt: " + course.getName());
            notif.setMessage(student.getFirstName() + " " + student.getLastName() + " asked a question on " + doubt.getTopic());
            notif.setNotificationType("DOUBT_RECEIVED");
            notif.setRead(false);
            notificationRepository.save(notif);
        }

        return Map.of("id", saved.getId(), "message", "Doubt submitted successfully to faculty");
    }

    @Override
    @Transactional
    public Map<String, Object> replyDoubt(int doubtId, Map<String, Object> payload) {
        Authentication auth = requireAuth();
        if (!SecurityRoles.isTeacher(auth) && !SecurityRoles.isAdmin(auth)) {
            throw new AccessDeniedException("Only faculty or administrators can resolve doubts");
        }
        AcademicDoubt doubt = academicDoubtRepository.findById(doubtId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doubt not found"));

        String answer = stringValue(payload.get("answer"));
        doubt.setAnswer(answer);
        doubt.setStatus("RESOLVED");
        doubt.setAnsweredAt(LocalDateTime.now());
        academicDoubtRepository.save(doubt);

        AcademicNotification notif = new AcademicNotification();
        notif.setRecipientRole("ROLE_STUDENT");
        notif.setRecipientUserId(doubt.getStudentId());
        notif.setTitle("Doubt Answered: " + doubt.getTopic());
        notif.setMessage("Your instructor has answered your question: \"" + (answer.length() > 80 ? answer.substring(0, 77) + "..." : answer) + "\"");
        notif.setNotificationType("PROGRESS_ALERT");
        notif.setRead(false);
        notificationRepository.save(notif);

        return Map.of("id", doubt.getId(), "message", "Response published and student notified");
    }

    // ==========================================
    // TEACHER CLASS HEALTH DASHBOARD IMPLEMENTATION
    // ==========================================

    @Override
    public List<Map<String, Object>> classHealth() {
        Authentication auth = requireAuth();
        List<Course> courses;
        if (SecurityRoles.isAdmin(auth)) {
            courses = courseService.findAllCourses();
        } else if (SecurityRoles.isTeacher(auth)) {
            Teacher teacher = currentTeacher(auth);
            courses = teacher.getCourses() != null ? teacher.getCourses() : new ArrayList<>();
        } else {
            throw new AccessDeniedException("Only faculty and administrators can view class health diagnostics");
        }

        List<Map<String, Object>> healthReport = new ArrayList<>();
        for (Course c : courses) {
            int studentCount = c.getStudents() != null ? c.getStudents().size() : 0;
            Double avgGrade = classAverage(c.getId());
            Double attRate = classAttendance(c.getId());

            int totalAssignmentSlots = 0;
            int completedAssignments = 0;
            if (c.getStudents() != null && !c.getStudents().isEmpty()) {
                for (Student s : c.getStudents()) {
                    StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(s.getId(), c.getId());
                    if (scd != null && scd.getAssignments() != null) {
                        for (Assignment a : scd.getAssignments()) {
                            totalAssignmentSlots++;
                            AssignmentDetails ad = assignmentDetailsService.findByAssignmentAndStudentCourseDetailsId(a.getId(), scd.getId());
                            if (ad != null && ad.getIsDone() == 1) {
                                completedAssignments++;
                            }
                        }
                    }
                }
            }
            double assignmentRate = totalAssignmentSlots > 0 ? round((completedAssignments * 100.0) / totalAssignmentSlots) : 100.0;

            int atRiskCount = 0;
            if (c.getStudents() != null) {
                for (Student s : c.getStudents()) {
                    StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(s.getId(), c.getId());
                    Double sAvg = scd != null ? courseAverage(scd.getGradeDetails()) : null;
                    Double sAtt = attendancePercent(attendanceRecordRepository.findByStudentIdAndCourseId(s.getId(), c.getId()));
                    if ((sAvg != null && sAvg < 60.0) || (sAtt != null && sAtt < 75.0)) {
                        atRiskCount++;
                    }
                }
            }

            double gradeVal = avgGrade != null ? avgGrade : 75.0;
            double attVal = attRate != null ? attRate : 85.0;
            double healthIndex = round((0.4 * gradeVal) + (0.4 * attVal) + (0.2 * assignmentRate));

            String status;
            if (healthIndex >= 85.0) status = "EXCELLENT";
            else if (healthIndex >= 75.0) status = "HEALTHY";
            else if (healthIndex >= 65.0) status = "NEEDS_ATTENTION";
            else status = "CRITICAL";

            Map<String, Object> ch = new LinkedHashMap<>();
            ch.put("courseId", c.getId());
            ch.put("courseCode", c.getCode());
            ch.put("courseName", c.getName());
            ch.put("totalStudents", studentCount);
            ch.put("averageGrade", avgGrade != null ? avgGrade : "N/A");
            ch.put("attendanceRate", attRate != null ? attRate : "N/A");
            ch.put("assignmentCompletionRate", assignmentRate);
            ch.put("atRiskCount", atRiskCount);
            ch.put("healthIndex", healthIndex);
            ch.put("status", status);
            ch.put("recommendation", atRiskCount > 0 ? "Schedule intervention review for " + atRiskCount + " at-risk student(s)." : "Class metrics meet institutional accreditation benchmarks.");
            healthReport.add(ch);
        }
        return healthReport;
    }

    // ==========================================
    // BULK MARKS ENTRY IMPLEMENTATION
    // ==========================================

    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public Map<String, Object> recordBulkMarks(Map<String, Object> payload) {
        Authentication auth = requireAuth();
        if (!SecurityRoles.isTeacher(auth) && !SecurityRoles.isAdmin(auth)) {
            throw new AccessDeniedException("Only faculty and administrators can enter academic marks");
        }
        int courseId = intValue(payload.get("courseId"));
        if (!canManageCourse(auth, courseId)) {
            throw new AccessDeniedException("Not authorized to manage marks for this course");
        }
        Course course = courseService.findCourseById(courseId);

        List<Object> records = (List<Object>) payload.get("records");
        if (records == null || records.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No student grade records provided");
        }

        int updatedCount = 0;
        for (Object item : records) {
            Map<String, Object> entry = (Map<String, Object>) item;
            int studentId = intValue(entry.get("studentId"));
            StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(studentId, courseId);
            if (scd == null) continue;

            int g1 = entry.get("gradeOne") != null ? (int) Math.round(doubleValue(entry.get("gradeOne"))) : -1;
            int g2 = entry.get("gradeTwo") != null ? (int) Math.round(doubleValue(entry.get("gradeTwo"))) : -1;
            int g3 = entry.get("gradeThree") != null ? (int) Math.round(doubleValue(entry.get("gradeThree"))) : -1;

            GradeDetails gd = scd.getGradeDetails();
            if (gd != null) {
                gd.setGradeOne(g1);
                gd.setGradeTwo(g2);
                gd.setGradeThree(g3);
            } else {
                gd = new GradeDetails();
                gd.setGradeOne(g1);
                gd.setGradeTwo(g2);
                gd.setGradeThree(g3);
                scd.setGradeDetails(gd);
            }
            studentCourseDetailsService.save(scd);
            updatedCount++;

            AcademicNotification notif = new AcademicNotification();
            notif.setRecipientRole("ROLE_STUDENT");
            notif.setRecipientUserId(studentId);
            notif.setTitle("Grades Updated: " + (course != null ? course.getName() : "Course"));
            notif.setMessage("Your internal marks have been recorded for " + (course != null ? course.getName() : "your course") + ".");
            notif.setNotificationType("GRADE_UPDATE");
            notif.setRead(false);
            notificationRepository.save(notif);
        }

        return Map.of("updated", updatedCount, "message", "Marks recorded successfully for " + updatedCount + " students");
    }

    // ==========================================
    // ASSIGNMENT SUBMISSION TRACKER IMPLEMENTATION
    // ==========================================

    @Override
    public List<Map<String, Object>> assignmentSubmissions(int assignmentId) {
        Authentication auth = requireAuth();
        Assignment assignment = assignmentService.findAssignmentById(assignmentId);
        if (assignment == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found");

        List<Course> courses = courseService.findAllCourses();
        List<Map<String, Object>> roster = new ArrayList<>();

        for (Course c : courses) {
            if (c.getStudents() == null) continue;
            for (Student s : c.getStudents()) {
                StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(s.getId(), c.getId());
                if (scd != null && scd.getAssignments() != null) {
                    boolean hasAssignment = scd.getAssignments().stream().anyMatch(a -> a.getId() == assignmentId);
                    if (hasAssignment) {
                        if (SecurityRoles.isStudent(auth) && s.getId() != currentStudent(auth).getId()) {
                            continue;
                        }
                        AssignmentDetails ad = assignmentDetailsService.findByAssignmentAndStudentCourseDetailsId(assignmentId, scd.getId());
                        Map<String, Object> row = new LinkedHashMap<>();
                        row.put("id", ad != null ? ad.getId() : ("assign-" + assignmentId + "-" + s.getId()));
                        row.put("assignmentId", assignmentId);
                        row.put("assignmentName", assignment.getName());
                        row.put("dueDate", assignment.getDueDate());
                        row.put("studentId", s.getId());
                        row.put("studentName", s.getFirstName() + " " + s.getLastName());
                        row.put("studentEmail", s.getEmail());
                        row.put("courseName", c.getName());
                        row.put("courseCode", c.getCode());
                        boolean isDone = ad != null && ad.getIsDone() == 1;
                        row.put("isDone", isDone);
                        row.put("status", isDone ? "SUBMITTED" : "PENDING");
                        roster.add(row);
                    }
                }
            }
        }
        return roster;
    }

    @Override
    @Transactional
    public Map<String, Object> updateAssignmentSubmission(int assignmentId, int studentId, Map<String, Object> payload) {
        Authentication auth = requireAuth();
        Assignment assignment = assignmentService.findAssignmentById(assignmentId);
        if (assignment == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found");

        List<StudentCourseDetails> scdList = safeList(studentCourseDetailsService.findByStudentId(studentId));
        AssignmentDetails targetDetail = null;
        for (StudentCourseDetails scd : scdList) {
            AssignmentDetails ad = assignmentDetailsService.findByAssignmentAndStudentCourseDetailsId(assignmentId, scd.getId());
            if (ad != null) {
                targetDetail = ad;
                break;
            }
        }
        if (targetDetail == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment enrollment record not found for student");
        }

        if (SecurityRoles.isStudent(auth)) {
            if (currentStudent(auth).getId() != studentId) {
                throw new AccessDeniedException("Cannot submit assignments on behalf of another student");
            }
            targetDetail.setIsDone(1);
        } else if (SecurityRoles.isTeacher(auth) || SecurityRoles.isAdmin(auth)) {
            boolean isDone = Boolean.TRUE.equals(payload.get("isDone")) || "1".equals(String.valueOf(payload.get("isDone")));
            targetDetail.setIsDone(isDone ? 1 : 0);
        }
        assignmentDetailsService.save(targetDetail);

        AcademicNotification notif = new AcademicNotification();
        notif.setRecipientRole("ROLE_STUDENT");
        notif.setRecipientUserId(studentId);
        notif.setTitle("Assignment Status: " + assignment.getName());
        notif.setMessage("Your assignment \"" + assignment.getName() + "\" is now marked as " + (targetDetail.getIsDone() == 1 ? "COMPLETED" : "PENDING") + ".");
        notif.setNotificationType("PROGRESS_ALERT");
        notif.setRead(false);
        notificationRepository.save(notif);

        return Map.of("assignmentId", assignmentId, "studentId", studentId, "isDone", targetDetail.getIsDone() == 1, "status", targetDetail.getIsDone() == 1 ? "SUBMITTED" : "PENDING");
    }

    // ==========================================
    // PROGRESS ALERTS & NOTIFICATIONS READ ALL
    // ==========================================

    @Override
    @Transactional
    public Map<String, Object> markAllNotificationsRead() {
        Authentication auth = requireAuth();
        String role = SecurityRoles.canonicalRole(auth);
        Integer userId = SecurityRoles.isAdmin(auth) ? 0 : (SecurityRoles.isTeacher(auth) ? currentTeacher(auth).getId() : currentStudent(auth).getId());

        List<AcademicNotification> items = notificationRepository.findAll();
        int count = 0;
        for (AcademicNotification item : items) {
            if (matchesRecipient(item, role, userId) && !item.isRead()) {
                item.setRead(true);
                notificationRepository.save(item);
                count++;
            }
        }
        return Map.of("markedRead", count, "message", "All notifications marked as read");
    }

    // ==========================================
    // FACULTY MEMBERS FOR CONSULTATIONS
    // ==========================================

    @Override
    public List<Map<String, Object>> facultyMembers() {
        requireAuth();
        List<Teacher> teachers = teacherService.findAllTeachers();
        List<FacultyAvailability> allAvailabilities = availabilityRepository.findAll();
        Map<Integer, List<FacultyAvailability>> availMap = allAvailabilities.stream()
                .filter(a -> a.getTeacherId() > 0)
                .collect(Collectors.groupingBy(FacultyAvailability::getTeacherId));

        List<Map<String, Object>> result = new ArrayList<>();
        if (teachers != null) {
            for (Teacher t : teachers) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", t.getId());
                String first = t.getFirstName() != null ? t.getFirstName() : "";
                String last = t.getLastName() != null ? t.getLastName() : "";
                String fullName = (first + " " + last).trim();
                map.put("name", fullName.isBlank() ? t.getUserName() : fullName);
                map.put("firstName", first);
                map.put("lastName", last);
                map.put("email", t.getEmail());
                map.put("username", t.getUserName());

                // Derive department / teaching domain from assigned courses
                String department = "Academic Faculty";
                if (t.getCourses() != null && !t.getCourses().isEmpty()) {
                    department = t.getCourses().get(0).getName();
                }
                map.put("department", department);

                List<FacultyAvailability> slots = availMap.getOrDefault(t.getId(), Collections.emptyList());
                boolean hasAvailableSlot = slots.isEmpty() || slots.stream().anyMatch(s -> "AVAILABLE".equalsIgnoreCase(s.getStatus()));
                map.put("availableForConsultation", hasAvailableSlot);

                List<Map<String, Object>> slotList = new ArrayList<>();
                String primaryOffice = "Faculty Cabin";
                for (FacultyAvailability fa : slots) {
                    Map<String, Object> sm = new LinkedHashMap<>();
                    sm.put("id", fa.getId());
                    sm.put("dayOfWeek", fa.getDayOfWeek());
                    sm.put("startTime", fa.getStartTime() != null ? fa.getStartTime().toString() : null);
                    sm.put("endTime", fa.getEndTime() != null ? fa.getEndTime().toString() : null);
                    sm.put("officeLocation", fa.getOfficeLocation());
                    sm.put("status", fa.getStatus());
                    sm.put("notes", fa.getNotes());
                    slotList.add(sm);
                    if (fa.getOfficeLocation() != null && !fa.getOfficeLocation().isBlank()) {
                        primaryOffice = fa.getOfficeLocation();
                    }
                }
                map.put("availabilitySlots", slotList);
                map.put("officeLocation", primaryOffice);

                result.add(map);
            }
        }
        return result;
    }
}


