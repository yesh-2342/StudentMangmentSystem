package com.Studentmangment.studentmanagement.controller.rest;

import java.util.ArrayList;
import java.util.List;
import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Studentmangment.studentmanagement.dto.AdminDashboardDto;
import com.Studentmangment.studentmanagement.dto.AdminDashboardDto.CourseItemDto;
import com.Studentmangment.studentmanagement.dto.AdminDashboardDto.StudentItemDto;
import com.Studentmangment.studentmanagement.dto.AdminDashboardDto.TeacherItemDto;
import com.Studentmangment.studentmanagement.dto.CourseCreateDto;
import com.Studentmangment.studentmanagement.dto.EnrollStudentDto;
import com.Studentmangment.studentmanagement.entity.Assignment;
import com.Studentmangment.studentmanagement.entity.Course;
import com.Studentmangment.studentmanagement.entity.GradeDetails;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.entity.StudentCourseDetails;
import com.Studentmangment.studentmanagement.entity.Teacher;
import com.Studentmangment.studentmanagement.service.CourseService;
import com.Studentmangment.studentmanagement.service.GradeDetailsService;
import com.Studentmangment.studentmanagement.service.StudentCourseDetailsService;
import com.Studentmangment.studentmanagement.service.StudentService;
import com.Studentmangment.studentmanagement.service.TeacherService;

@RestController
@RequestMapping("/api/admin")
public class AdminRestController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private StudentCourseDetailsService studentCourseDetailsService;

    @Autowired
    private GradeDetailsService gradeDetailsService;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        List<Student> students = studentService.findAllStudents();
        List<Teacher> teachers = teacherService.findAllTeachers();
        List<Course> courses = courseService.findAllCourses();

        AdminDashboardDto dto = new AdminDashboardDto();
        dto.setTotalStudents(students != null ? students.size() : 0);
        dto.setTotalTeachers(teachers != null ? teachers.size() : 0);
        dto.setTotalCourses(courses != null ? courses.size() : 0);

        List<StudentItemDto> recentStudents = new ArrayList<>();
        if (students != null) {
            int count = 0;
            for (Student s : students) {
                if (count++ >= 5) break;
                recentStudents.add(new StudentItemDto(
                    s.getId(), s.getUserName(), s.getFirstName(), s.getLastName(), s.getEmail(),
                    s.getCourses() != null ? s.getCourses().size() : 0
                ));
            }
        }
        dto.setRecentStudents(recentStudents);

        List<TeacherItemDto> recentTeachers = new ArrayList<>();
        if (teachers != null) {
            int count = 0;
            for (Teacher t : teachers) {
                if (count++ >= 5) break;
                recentTeachers.add(new TeacherItemDto(
                    t.getId(), t.getUserName(), t.getFirstName(), t.getLastName(), t.getEmail(),
                    t.getCourses() != null ? t.getCourses().size() : 0
                ));
            }
        }
        dto.setRecentTeachers(recentTeachers);

        List<CourseItemDto> recentCourses = new ArrayList<>();
        if (courses != null) {
            int count = 0;
            for (Course c : courses) {
                if (count++ >= 5) break;
                recentCourses.add(new CourseItemDto(
                    c.getId(), c.getCode(), c.getName(),
                    c.getTeacher() != null ? c.getTeacher().getId() : 0,
                    c.getTeacher() != null ? c.getTeacher().getFirstName() + " " + c.getTeacher().getLastName() : "Unassigned",
                    c.getStudents() != null ? c.getStudents().size() : 0
                ));
            }
        }
        dto.setRecentCourses(recentCourses);

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/students")
    public ResponseEntity<?> getStudents() {
        List<Student> students = studentService.findAllStudents();
        List<StudentItemDto> list = new ArrayList<>();
        if (students != null) {
            for (Student s : students) {
                list.add(new StudentItemDto(
                    s.getId(), s.getUserName(), s.getFirstName(), s.getLastName(), s.getEmail(),
                    s.getCourses() != null ? s.getCourses().size() : 0
                ));
            }
        }
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/students/{studentId}")
    public ResponseEntity<?> deleteStudent(@PathVariable("studentId") int studentId) {
        List<StudentCourseDetails> list = studentCourseDetailsService.findByStudentId(studentId);
        if (list != null) {
            for (StudentCourseDetails scd : list) {
                int gradeId = scd.getGradeDetails().getId();
                studentCourseDetailsService.deleteByStudentId(studentId);
                gradeDetailsService.deleteById(gradeId);
            }
        }
        studentService.deleteById(studentId);
        return ResponseEntity.ok("{\"message\": \"Student deleted successfully\"}");
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

        java.util.Map<String, Object> res = new java.util.HashMap<>();
        res.put("studentId", student.getId());
        res.put("studentName", student.getFirstName() + " " + student.getLastName());
        res.put("enrolledCourses", enrolled);
        res.put("availableCourses", available);

        return ResponseEntity.ok(res);
    }

    @PostMapping("/students/{studentId}/courses")
    public ResponseEntity<?> enrollStudentInCourse(@PathVariable("studentId") int studentId, @RequestBody EnrollStudentDto dto) {
        int courseId = dto.getCourseId();
        StudentCourseDetails sc = new StudentCourseDetails(studentId, courseId, new ArrayList<Assignment>(), new GradeDetails());
        studentCourseDetailsService.save(sc);
        return ResponseEntity.ok("{\"message\": \"Student enrolled in course successfully\"}");
    }

    @DeleteMapping("/students/{studentId}/courses/{courseId}")
    public ResponseEntity<?> removeStudentFromCourse(@PathVariable("studentId") int studentId, @PathVariable("courseId") int courseId) {
        StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(studentId, courseId);
        if (scd != null) {
            int gradeId = scd.getGradeDetails().getId();
            studentCourseDetailsService.deleteByStudentAndCourseId(studentId, courseId);
            gradeDetailsService.deleteById(gradeId);
        }
        return ResponseEntity.ok("{\"message\": \"Student removed from course successfully\"}");
    }

    @GetMapping("/teachers")
    public ResponseEntity<?> getTeachers() {
        List<Teacher> teachers = teacherService.findAllTeachers();
        List<TeacherItemDto> list = new ArrayList<>();
        if (teachers != null) {
            for (Teacher t : teachers) {
                list.add(new TeacherItemDto(
                    t.getId(), t.getUserName(), t.getFirstName(), t.getLastName(), t.getEmail(),
                    t.getCourses() != null ? t.getCourses().size() : 0
                ));
            }
        }
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/teachers/{teacherId}")
    public ResponseEntity<?> deleteTeacher(@PathVariable("teacherId") int teacherId) {
        Teacher teacher = teacherService.findByTeacherId(teacherId);
        if (teacher == null) return ResponseEntity.notFound().build();

        if (teacher.getCourses() != null && !teacher.getCourses().isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"Cannot delete teacher with assigned courses! Reassign courses first.\"}");
        }

        teacherService.deleteTeacherById(teacherId);
        return ResponseEntity.ok("{\"message\": \"Teacher deleted successfully\"}");
    }

    @GetMapping("/courses")
    public ResponseEntity<?> getCourses() {
        List<Course> courses = courseService.findAllCourses();
        List<CourseItemDto> list = new ArrayList<>();
        if (courses != null) {
            for (Course c : courses) {
                list.add(new CourseItemDto(
                    c.getId(), c.getCode(), c.getName(),
                    c.getTeacher() != null ? c.getTeacher().getId() : 0,
                    c.getTeacher() != null ? c.getTeacher().getFirstName() + " " + c.getTeacher().getLastName() : "Unassigned",
                    c.getStudents() != null ? c.getStudents().size() : 0
                ));
            }
        }
        return ResponseEntity.ok(list);
    }

    @PostMapping("/courses")
    public ResponseEntity<?> createCourse(@Valid @RequestBody CourseCreateDto dto) {
        Teacher teacher = teacherService.findByTeacherId(dto.getTeacherId());
        if (teacher == null) {
            return ResponseEntity.badRequest().body("{\"error\": \"Teacher not found with ID " + dto.getTeacherId() + "\"}");
        }

        Course course = new Course();
        course.setCode(dto.getCode());
        course.setName(dto.getName());
        course.setTeacher(teacher);
        courseService.save(course);

        return ResponseEntity.ok("{\"message\": \"Course created successfully\", \"courseId\": " + course.getId() + "}");
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
                    int gradeId = scd.getGradeDetails().getId();
                    studentCourseDetailsService.deleteByStudentAndCourseId(student.getId(), courseId);
                    gradeDetailsService.deleteById(gradeId);
                }
            }
        }

        courseService.deleteCourseById(courseId);
        return ResponseEntity.ok("{\"message\": \"Course deleted successfully\"}");
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

        java.util.Map<String, Object> res = new java.util.HashMap<>();
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
        StudentCourseDetails sc = new StudentCourseDetails(studentId, courseId, new ArrayList<Assignment>(), new GradeDetails());
        studentCourseDetailsService.save(sc);
        return ResponseEntity.ok("{\"message\": \"Student added to course successfully\"}");
    }

    @DeleteMapping("/courses/{courseId}/students/{studentId}")
    public ResponseEntity<?> removeStudentFromCourseByAdmin(@PathVariable("courseId") int courseId, @PathVariable("studentId") int studentId) {
        StudentCourseDetails scd = studentCourseDetailsService.findByStudentAndCourseId(studentId, courseId);
        if (scd != null) {
            int gradeId = scd.getGradeDetails().getId();
            studentCourseDetailsService.deleteByStudentAndCourseId(studentId, courseId);
            gradeDetailsService.deleteById(gradeId);
        }
        return ResponseEntity.ok("{\"message\": \"Student removed from course successfully\"}");
    }
}
