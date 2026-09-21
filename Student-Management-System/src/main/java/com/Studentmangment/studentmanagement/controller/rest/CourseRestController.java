package com.Studentmangment.studentmanagement.controller.rest;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Studentmangment.studentmanagement.dto.StudentCourseDto;
import com.Studentmangment.studentmanagement.entity.Course;
import com.Studentmangment.studentmanagement.service.CourseService;

@RestController
@RequestMapping("/api/courses")
public class CourseRestController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public ResponseEntity<?> getAllCourses() {
        List<Course> courses = courseService.findAllCourses();
        List<StudentCourseDto> dtos = new ArrayList<>();
        if (courses != null) {
            for (Course c : courses) {
                StudentCourseDto dto = new StudentCourseDto();
                dto.setId(c.getId());
                dto.setCode(c.getCode());
                dto.setName(c.getName());
                dto.setTeacherName(c.getTeacher() != null ? c.getTeacher().getFirstName() + " " + c.getTeacher().getLastName() : "Unassigned");
                dto.setTotalAssignments(c.getStudents() != null ? c.getStudents().size() : 0); // enrolled students
                dtos.add(dto);
            }
        }
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<?> getCourseById(@PathVariable("courseId") int courseId) {
        Course c = courseService.findCourseById(courseId);
        if (c == null) return ResponseEntity.notFound().build();

        StudentCourseDto dto = new StudentCourseDto();
        dto.setId(c.getId());
        dto.setCode(c.getCode());
        dto.setName(c.getName());
        dto.setTeacherName(c.getTeacher() != null ? c.getTeacher().getFirstName() + " " + c.getTeacher().getLastName() : "Unassigned");
        dto.setTotalAssignments(c.getStudents() != null ? c.getStudents().size() : 0);

        return ResponseEntity.ok(dto);
    }
}
