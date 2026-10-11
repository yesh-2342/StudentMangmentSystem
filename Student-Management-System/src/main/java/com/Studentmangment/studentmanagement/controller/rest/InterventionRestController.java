package com.Studentmangment.studentmanagement.controller.rest;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.Studentmangment.studentmanagement.dto.InterventionCaseRequestDto;
import com.Studentmangment.studentmanagement.service.InterventionCaseService;

@RestController
@RequestMapping("/api/interventions")
public class InterventionRestController {

    @Autowired
    private InterventionCaseService interventionCaseService;

    @GetMapping
    public ResponseEntity<?> getInterventions() {
        try {
            return ResponseEntity.ok(interventionCaseService.findVisibleCases());
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"error\": \"" + ex.getMessage() + "\"}");
        }
    }

    @PostMapping
    public ResponseEntity<?> createIntervention(@Valid @RequestBody InterventionCaseRequestDto request) {
        try {
            return ResponseEntity.ok(interventionCaseService.createCase(request));
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"error\": \"" + ex.getMessage() + "\"}");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateIntervention(@PathVariable("id") int id, @Valid @RequestBody InterventionCaseRequestDto request) {
        try {
            return ResponseEntity.ok(interventionCaseService.updateCase(id, request));
        } catch (AccessDeniedException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("{\"error\": \"" + ex.getMessage() + "\"}");
        }
    }
}
