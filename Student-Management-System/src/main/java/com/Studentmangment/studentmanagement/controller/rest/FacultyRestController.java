package com.Studentmangment.studentmanagement.controller.rest;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Studentmangment.studentmanagement.service.AcademicPortalService;

@RestController
@RequestMapping("/api/v1/faculty")
public class FacultyRestController {

    @Autowired
    private AcademicPortalService academicPortalService;

    @GetMapping("/available-for-consultation")
    public ResponseEntity<List<Map<String, Object>>> getAvailableForConsultation() {
        return ResponseEntity.ok(academicPortalService.facultyMembers());
    }
}
