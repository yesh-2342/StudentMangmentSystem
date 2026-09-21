package com.Studentmangment.studentmanagement.controller.rest;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Studentmangment.studentmanagement.dto.StudentAssignmentDto;
import com.Studentmangment.studentmanagement.dto.StudentCourseDto;
import com.Studentmangment.studentmanagement.dto.StudentDashboardDto;
import com.Studentmangment.studentmanagement.dto.StudentGradeDto;
import com.Studentmangment.studentmanagement.entity.Assignment;
import com.Studentmangment.studentmanagement.entity.AssignmentDetails;
import com.Studentmangment.studentmanagement.entity.Course;
import com.Studentmangment.studentmanagement.entity.GradeDetails;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.entity.StudentCourseDetails;
import com.Studentmangment.studentmanagement.service.AssignmentDetailsService;
import com.Studentmangment.studentmanagement.service.CourseService;
import com.Studentmangment.studentmanagement.service.StudentCourseDetailsService;
import com.Studentmangment.studentmanagement.service.StudentService;

@RestController
@RequestMapping("/api/students")
public class StudentRestController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private StudentCourseDetailsService studentCourseDetailsService;

    @Autowired
    private AssignmentDetailsService assignmentDetailsService;

    @GetMapping("/{studentId}/dashboard")
    public ResponseEntity<?> getStudentDashboard(@PathVariable("studentId") int studentId) {
        Student student = studentService.findByStudentId(studentId);
        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        StudentDashboardDto dashboard = new StudentDashboardDto();
        dashboard.setStudentId(student.getId());
        dashboard.setStudentName(student.getUserName());
        dashboard.setFirstName(student.getFirstName());
        dashboard.setLastName(student.getLastName());
        dashboard.setEmail(student.getEmail());

        List<StudentCourseDto> courseDtos = new ArrayList<>();
        List<StudentAssignmentDto> assignmentDtos = new ArrayList<>();

        int totalCourses = 0;
        int totalAssignments = 0;
        int completedAssignments = 0;
        int pendingAssignments = 0;
        double gradeSum = 0;
        int gradeCount = 0;

        List<StudentCourseDetails> scdList = studentCourseDetailsService.findByStudentId(studentId);
        if (scdList != null) {
            totalCourses = scdList.size();
            for (StudentCourseDetails scd : scdList) {
                Course course = courseService.findCourseById(scd.getCourseId());
                String courseName = course != null ? course.getName() : "Course #" + scd.getCourseId();
                String courseCode = course != null ? course.getCode() : "";
                String teacherName = (course != null && course.getTeacher() != null)
                    ? course.getTeacher().getFirstName() + " " + course.getTeacher().getLastName()
                    : "Not Assigned";

                StudentCourseDto cDto = new StudentCourseDto();
                cDto.setId(scd.getCourseId());
                cDto.setName(courseName);
                cDto.setCode(courseCode);
                cDto.setTeacherName(teacherName);

                int cAssignments = 0;
                int cCompleted = 0;

                List<Assignment> assignments = scd.getAssignments();
                if (assignments != null) {
                    for (Assignment a : assignments) {
                        totalAssignments++;
                        cAssignments++;

                        int daysRemaining = findDayDifference(a);
                        AssignmentDetails ad = assignmentDetailsService.findByAssignmentAndStudentCourseDetailsId(a.getId(), scd.getId());
                        int isDone = (ad != null) ? ad.getIsDone() : 0;
                        if (isDone == 1) {
                            completedAssignments++;
                            cCompleted++;
                        } else {
                            pendingAssignments++;
                        }

                        StudentAssignmentDto aDto = new StudentAssignmentDto();
                        aDto.setId(a.getId());
                        aDto.setName(a.getName());
                        aDto.setDescription(a.getDescription());
                        aDto.setDueDate(a.getDueDate());
                        aDto.setDaysRemaining(daysRemaining);
                        aDto.setIsDone(isDone);
                        aDto.setCourseId(scd.getCourseId());
                        aDto.setCourseName(courseName);
                        aDto.setCourseCode(courseCode);
                        assignmentDtos.add(aDto);
                    }
                }

                cDto.setTotalAssignments(cAssignments);
                cDto.setCompletedAssignments(cCompleted);

                GradeDetails gd = scd.getGradeDetails();
                if (gd != null) {
                    cDto.setGradeOne(gd.getGradeOne());
                    cDto.setGradeTwo(gd.getGradeTwo());
                    cDto.setGradeThree(gd.getGradeThree());

                    double cSum = 0;
                    int cCount = 0;
                    if (gd.getGradeOne() != -1) { cSum += gd.getGradeOne(); cCount++; gradeSum += gd.getGradeOne(); gradeCount++; }
                    if (gd.getGradeTwo() != -1) { cSum += gd.getGradeTwo(); cCount++; gradeSum += gd.getGradeTwo(); gradeCount++; }
                    if (gd.getGradeThree() != -1) { cSum += gd.getGradeThree(); cCount++; gradeSum += gd.getGradeThree(); gradeCount++; }

                    cDto.setAverageGrade(cCount > 0 ? String.format("%.1f", cSum / cCount) : "N/A");
                } else {
                    cDto.setAverageGrade("N/A");
                }

                courseDtos.add(cDto);
            }
        }

        dashboard.setTotalCourses(totalCourses);
        dashboard.setTotalAssignments(totalAssignments);
        dashboard.setCompletedAssignments(completedAssignments);
        dashboard.setPendingAssignments(pendingAssignments);
        dashboard.setAverageGrade(gradeCount > 0 ? String.format("%.1f", gradeSum / gradeCount) : "N/A");
        dashboard.setCourses(courseDtos);
        dashboard.setRecentAssignments(assignmentDtos);

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/{studentId}/courses")
    public ResponseEntity<?> getStudentCourses(@PathVariable("studentId") int studentId) {
        Student student = studentService.findByStudentId(studentId);
        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        List<StudentCourseDto> list = new ArrayList<>();
        List<StudentCourseDetails> scdList = studentCourseDetailsService.findByStudentId(studentId);
        if (scdList != null) {
            for (StudentCourseDetails scd : scdList) {
                Course course = courseService.findCourseById(scd.getCourseId());
                StudentCourseDto dto = new StudentCourseDto();
                dto.setId(scd.getCourseId());
                dto.setName(course != null ? course.getName() : "Course #" + scd.getCourseId());
                dto.setCode(course != null ? course.getCode() : "");
                dto.setTeacherName((course != null && course.getTeacher() != null)
                    ? course.getTeacher().getFirstName() + " " + course.getTeacher().getLastName()
                    : "Not Assigned");

                int totalA = 0;
                int completedA = 0;
                if (scd.getAssignments() != null) {
                    totalA = scd.getAssignments().size();
                    for (Assignment a : scd.getAssignments()) {
                        AssignmentDetails ad = assignmentDetailsService.findByAssignmentAndStudentCourseDetailsId(a.getId(), scd.getId());
                        if (ad != null && ad.getIsDone() == 1) {
                            completedA++;
                        }
                    }
                }
                dto.setTotalAssignments(totalA);
                dto.setCompletedAssignments(completedA);

                GradeDetails gd = scd.getGradeDetails();
                if (gd != null) {
                    dto.setGradeOne(gd.getGradeOne());
                    dto.setGradeTwo(gd.getGradeTwo());
                    dto.setGradeThree(gd.getGradeThree());
                    double sum = 0;
                    int count = 0;
                    if (gd.getGradeOne() != -1) { sum += gd.getGradeOne(); count++; }
                    if (gd.getGradeTwo() != -1) { sum += gd.getGradeTwo(); count++; }
                    if (gd.getGradeThree() != -1) { sum += gd.getGradeThree(); count++; }
                    dto.setAverageGrade(count > 0 ? String.format("%.1f", sum / count) : "N/A");
                }

                list.add(dto);
            }
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{studentId}/courses/{courseId}")
    public ResponseEntity<?> getStudentCourseDetail(@PathVariable("studentId") int studentId, @PathVariable("courseId") int courseId) {
        StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(studentId, courseId);
        if (scd == null) {
            return ResponseEntity.notFound().build();
        }

        Course course = courseService.findCourseById(courseId);
        StudentCourseDto courseDto = new StudentCourseDto();
        courseDto.setId(courseId);
        courseDto.setName(course != null ? course.getName() : "Course #" + courseId);
        courseDto.setCode(course != null ? course.getCode() : "");
        courseDto.setTeacherName((course != null && course.getTeacher() != null)
            ? course.getTeacher().getFirstName() + " " + course.getTeacher().getLastName()
            : "Not Assigned");

        List<StudentAssignmentDto> assignments = new ArrayList<>();
        int completed = 0;
        if (scd.getAssignments() != null) {
            for (Assignment a : scd.getAssignments()) {
                StudentAssignmentDto aDto = new StudentAssignmentDto();
                aDto.setId(a.getId());
                aDto.setName(a.getName());
                aDto.setDescription(a.getDescription());
                aDto.setDueDate(a.getDueDate());
                aDto.setDaysRemaining(findDayDifference(a));
                aDto.setCourseId(courseId);
                aDto.setCourseName(courseDto.getName());
                aDto.setCourseCode(courseDto.getCode());

                AssignmentDetails ad = assignmentDetailsService.findByAssignmentAndStudentCourseDetailsId(a.getId(), scd.getId());
                int isDone = (ad != null) ? ad.getIsDone() : 0;
                if (isDone == 1) completed++;
                aDto.setIsDone(isDone);
                assignments.add(aDto);
            }
        }

        courseDto.setTotalAssignments(assignments.size());
        courseDto.setCompletedAssignments(completed);

        GradeDetails gd = scd.getGradeDetails();
        if (gd != null) {
            courseDto.setGradeOne(gd.getGradeOne());
            courseDto.setGradeTwo(gd.getGradeTwo());
            courseDto.setGradeThree(gd.getGradeThree());
            double sum = 0;
            int count = 0;
            if (gd.getGradeOne() != -1) { sum += gd.getGradeOne(); count++; }
            if (gd.getGradeTwo() != -1) { sum += gd.getGradeTwo(); count++; }
            if (gd.getGradeThree() != -1) { sum += gd.getGradeThree(); count++; }
            courseDto.setAverageGrade(count > 0 ? String.format("%.1f", sum / count) : "N/A");
        }

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("course", courseDto);
        response.put("assignments", assignments);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{studentId}/assignments")
    public ResponseEntity<?> getAllStudentAssignments(@PathVariable("studentId") int studentId) {
        List<StudentCourseDetails> scdList = studentCourseDetailsService.findByStudentId(studentId);
        List<StudentAssignmentDto> result = new ArrayList<>();

        if (scdList != null) {
            for (StudentCourseDetails scd : scdList) {
                Course course = courseService.findCourseById(scd.getCourseId());
                String courseName = course != null ? course.getName() : "Course #" + scd.getCourseId();
                String courseCode = course != null ? course.getCode() : "";

                if (scd.getAssignments() != null) {
                    for (Assignment a : scd.getAssignments()) {
                        StudentAssignmentDto dto = new StudentAssignmentDto();
                        dto.setId(a.getId());
                        dto.setName(a.getName());
                        dto.setDescription(a.getDescription());
                        dto.setDueDate(a.getDueDate());
                        dto.setDaysRemaining(findDayDifference(a));
                        dto.setCourseId(scd.getCourseId());
                        dto.setCourseName(courseName);
                        dto.setCourseCode(courseCode);

                        AssignmentDetails ad = assignmentDetailsService.findByAssignmentAndStudentCourseDetailsId(a.getId(), scd.getId());
                        dto.setIsDone(ad != null ? ad.getIsDone() : 0);
                        result.add(dto);
                    }
                }
            }
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{studentId}/courses/{courseId}/assignment/{assignmentId}")
    public ResponseEntity<?> getStudentAssignmentDetails(
            @PathVariable("studentId") int studentId,
            @PathVariable("courseId") int courseId,
            @PathVariable("assignmentId") int assignmentId) {

        StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(studentId, courseId);
        if (scd == null) return ResponseEntity.notFound().build();

        Assignment assignment = scd.getAssignmentById(assignmentId);
        if (assignment == null) return ResponseEntity.notFound().build();

        Course course = courseService.findCourseById(courseId);
        AssignmentDetails ad = assignmentDetailsService.findByAssignmentAndStudentCourseDetailsId(assignmentId, scd.getId());

        StudentAssignmentDto dto = new StudentAssignmentDto();
        dto.setId(assignment.getId());
        dto.setName(assignment.getName());
        dto.setDescription(assignment.getDescription());
        dto.setDueDate(assignment.getDueDate());
        dto.setDaysRemaining(findDayDifference(assignment));
        dto.setIsDone(ad != null ? ad.getIsDone() : 0);
        dto.setCourseId(courseId);
        dto.setCourseName(course != null ? course.getName() : "");
        dto.setCourseCode(course != null ? course.getCode() : "");

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{studentId}/courses/{courseId}/markAsCompleted/{assignmentId}")
    public ResponseEntity<?> markAsCompleted(
            @PathVariable("studentId") int studentId,
            @PathVariable("courseId") int courseId,
            @PathVariable("assignmentId") int assignmentId) {

        StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(studentId, courseId);
        if (scd == null) return ResponseEntity.notFound().build();

        AssignmentDetails assignmentDetails = assignmentDetailsService
                .findByAssignmentAndStudentCourseDetailsId(assignmentId, scd.getId());
        if (assignmentDetails == null) {
            assignmentDetails = new AssignmentDetails();
            assignmentDetails.setAssignmentId(assignmentId);
            assignmentDetails.setStudentCourseDetailsId(scd.getId());
        }

        assignmentDetails.setIsDone(1);
        assignmentDetailsService.save(assignmentDetails);

        return ResponseEntity.ok("{\"message\": \"Assignment marked as completed\", \"isDone\": 1}");
    }

    @GetMapping("/{studentId}/grades")
    public ResponseEntity<?> getStudentGrades(@PathVariable("studentId") int studentId) {
        List<StudentCourseDetails> scdList = studentCourseDetailsService.findByStudentId(studentId);
        List<StudentGradeDto> gradeDtos = new ArrayList<>();

        if (scdList != null) {
            for (StudentCourseDetails scd : scdList) {
                Course course = courseService.findCourseById(scd.getCourseId());
                StudentGradeDto dto = new StudentGradeDto();
                dto.setCourseId(scd.getCourseId());
                dto.setCourseCode(course != null ? course.getCode() : "");
                dto.setCourseName(course != null ? course.getName() : "Course #" + scd.getCourseId());
                dto.setTeacherName((course != null && course.getTeacher() != null)
                    ? course.getTeacher().getFirstName() + " " + course.getTeacher().getLastName()
                    : "Not Assigned");

                GradeDetails gd = scd.getGradeDetails();
                if (gd != null) {
                    dto.setGradeOne(gd.getGradeOne());
                    dto.setGradeTwo(gd.getGradeTwo());
                    dto.setGradeThree(gd.getGradeThree());

                    double sum = 0;
                    int count = 0;
                    if (gd.getGradeOne() != -1) { sum += gd.getGradeOne(); count++; }
                    if (gd.getGradeTwo() != -1) { sum += gd.getGradeTwo(); count++; }
                    if (gd.getGradeThree() != -1) { sum += gd.getGradeThree(); count++; }

                    if (count > 0) {
                        double avg = sum / count;
                        dto.setAverage(String.format("%.1f", avg));
                        if (avg >= 90) dto.setLetterGrade("A");
                        else if (avg >= 80) dto.setLetterGrade("B");
                        else if (avg >= 70) dto.setLetterGrade("C");
                        else if (avg >= 60) dto.setLetterGrade("D");
                        else dto.setLetterGrade("F");
                    } else {
                        dto.setAverage("N/A");
                        dto.setLetterGrade("-");
                    }
                } else {
                    dto.setAverage("N/A");
                    dto.setLetterGrade("-");
                }
                gradeDtos.add(dto);
            }
        }
        return ResponseEntity.ok(gradeDtos);
    }

    @GetMapping("/{studentId}/profile")
    public ResponseEntity<?> getStudentProfile(@PathVariable("studentId") int studentId) {
        Student student = studentService.findByStudentId(studentId);
        if (student == null) return ResponseEntity.notFound().build();

        java.util.Map<String, Object> profile = new java.util.HashMap<>();
        profile.put("id", student.getId());
        profile.put("userName", student.getUserName());
        profile.put("firstName", student.getFirstName());
        profile.put("lastName", student.getLastName());
        profile.put("email", student.getEmail());
        profile.put("courseCount", student.getCourses() != null ? student.getCourses().size() : 0);
        profile.put("role", "STUDENT");

        return ResponseEntity.ok(profile);
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
