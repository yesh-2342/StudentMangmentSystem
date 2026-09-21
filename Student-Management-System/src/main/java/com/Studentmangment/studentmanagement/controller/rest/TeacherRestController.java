package com.Studentmangment.studentmanagement.controller.rest;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
import com.Studentmangment.studentmanagement.entity.Course;
import com.Studentmangment.studentmanagement.entity.GradeDetails;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.entity.StudentCourseDetails;
import com.Studentmangment.studentmanagement.entity.Teacher;
import com.Studentmangment.studentmanagement.service.AssignmentDetailsService;
import com.Studentmangment.studentmanagement.service.AssignmentService;
import com.Studentmangment.studentmanagement.service.CourseService;
import com.Studentmangment.studentmanagement.service.GradeDetailsService;
import com.Studentmangment.studentmanagement.service.StudentCourseDetailsService;
import com.Studentmangment.studentmanagement.service.TeacherService;

@RestController
@RequestMapping("/api/teachers")
public class TeacherRestController {

    @Autowired
    private TeacherService teacherService;

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

    @GetMapping("/{teacherId}/dashboard")
    public ResponseEntity<?> getTeacherDashboard(@PathVariable("teacherId") int teacherId) {
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
                dto.setTotalAssignments(c.getStudents() != null ? c.getStudents().size() : 0); // enrolled students
                list.add(dto);
            }
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{teacherId}/courses/{courseId}")
    public ResponseEntity<?> getTeacherCourseDetails(@PathVariable("teacherId") int teacherId, @PathVariable("courseId") int courseId) {
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

        return ResponseEntity.ok("{\"message\": \"Assignment created successfully\", \"assignmentId\": " + assignment.getId() + "}");
    }

    @DeleteMapping("/{teacherId}/courses/{courseId}/assignments/{assignmentId}")
    public ResponseEntity<?> deleteAssignment(
            @PathVariable("teacherId") int teacherId,
            @PathVariable("courseId") int courseId,
            @PathVariable("assignmentId") int assignmentId) {

        assignmentService.deleteAssignmentById(assignmentId);
        return ResponseEntity.ok("{\"message\": \"Assignment deleted successfully\"}");
    }

    @GetMapping("/{teacherId}/courses/{courseId}/assignments/{assignmentId}/status")
    public ResponseEntity<?> getAssignmentStatus(
            @PathVariable("teacherId") int teacherId,
            @PathVariable("courseId") int courseId,
            @PathVariable("assignmentId") int assignmentId) {

        Course course = courseService.findCourseById(courseId);
        if (course == null) return ResponseEntity.notFound().build();

        List<Student> students = course.getStudents();
        List<java.util.Map<String, Object>> statusList = new ArrayList<>();

        if (students != null) {
            for (Student s : students) {
                StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(s.getId(), courseId);
                AssignmentDetails ad = null;
                if (scd != null) {
                    ad = assignmentDetailsService.findByAssignmentAndStudentCourseDetailsId(assignmentId, scd.getId());
                }

                java.util.Map<String, Object> map = new java.util.HashMap<>();
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

        return ResponseEntity.ok("{\"message\": \"Grades updated successfully\"}");
    }

    @GetMapping("/{teacherId}/students")
    public ResponseEntity<?> getTeacherStudents(@PathVariable("teacherId") int teacherId) {
        Teacher teacher = teacherService.findByTeacherId(teacherId);
        if (teacher == null) return ResponseEntity.notFound().build();

        Set<Integer> seen = new HashSet<>();
        List<java.util.Map<String, Object>> students = new ArrayList<>();

        if (teacher.getCourses() != null) {
            for (Course c : teacher.getCourses()) {
                if (c.getStudents() != null) {
                    for (Student s : c.getStudents()) {
                        if (!seen.contains(s.getId())) {
                            seen.add(s.getId());
                            java.util.Map<String, Object> map = new java.util.HashMap<>();
                            map.put("id", s.getId());
                            map.put("userName", s.getUserName());
                            map.put("firstName", s.getFirstName());
                            map.put("lastName", s.getLastName());
                            map.put("email", s.getEmail());
                            students.add(map);
                        }
                    }
                }
            }
        }

        return ResponseEntity.ok(students);
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
}
