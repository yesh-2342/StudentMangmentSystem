package com.Studentmangment.studentmanagement.controller.rest;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Studentmangment.studentmanagement.dto.AcademicAlertDto;
import com.Studentmangment.studentmanagement.dto.CallInitiationRequestDto;
import com.Studentmangment.studentmanagement.dto.ParentCallRecordDto;
import com.Studentmangment.studentmanagement.dto.ParentContactDto;
import com.Studentmangment.studentmanagement.dto.TelephonyConfigDto;
import com.Studentmangment.studentmanagement.service.AcademicRiskService;
import com.Studentmangment.studentmanagement.service.ParentCallService;
import com.Studentmangment.studentmanagement.service.ParentContactService;

@RestController
@RequestMapping("/api/admin")
public class ParentAlertsRestController {

    @Autowired
    private AcademicRiskService academicRiskService;

    @Autowired
    private ParentCallService parentCallService;

    @Autowired
    private ParentContactService parentContactService;

    // ==========================================
    // 1. ACADEMIC ALERTS & AT-RISK SCANNING
    // ==========================================

    @GetMapping("/academic-alerts")
    public ResponseEntity<List<AcademicAlertDto>> getAcademicAlerts() {
        List<AcademicAlertDto> alerts = academicRiskService.scanAndGetAlerts();
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/academic-alerts/{id}")
    public ResponseEntity<?> getAcademicAlertById(@PathVariable("id") int id) {
        AcademicAlertDto alert = academicRiskService.getAlertById(id);
        if (alert == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(alert);
    }

    @PostMapping("/academic-alerts/{id}/review")
    public ResponseEntity<?> reviewAlert(@PathVariable("id") int id,
                                         @RequestBody(required = false) Map<String, String> body,
                                         Principal principal) {
        String reviewer = principal != null ? principal.getName() : "admin";
        String notes = body != null ? body.get("recommendedAction") : null;
        AcademicAlertDto reviewed = academicRiskService.reviewAlert(id, reviewer, notes);
        return ResponseEntity.ok(reviewed);
    }

    @PostMapping("/academic-alerts/{id}/dismiss")
    public ResponseEntity<?> dismissAlert(@PathVariable("id") int id,
                                          @RequestBody(required = false) Map<String, String> body,
                                          Principal principal) {
        String reviewer = principal != null ? principal.getName() : "admin";
        String reason = body != null ? body.get("reason") : "Acknowledged by administrator";
        AcademicAlertDto dismissed = academicRiskService.dismissAlert(id, reviewer, reason);
        return ResponseEntity.ok(dismissed);
    }

    // ==========================================
    // 2. CALL INITIATION (REAL OR SIMULATION)
    // ==========================================

    @PostMapping("/academic-alerts/{id}/call")
    public ResponseEntity<?> initiateAlertCall(@PathVariable("id") int id,
                                               @RequestBody(required = false) CallInitiationRequestDto body,
                                               Principal principal) {
        AcademicAlertDto alert = academicRiskService.getAlertById(id);
        if (alert == null) {
            return ResponseEntity.notFound().build();
        }

        CallInitiationRequestDto request = body != null ? body : new CallInitiationRequestDto();
        request.setAlertId(id);
        request.setStudentId(alert.getStudentId());

        String initiatedBy = principal != null ? principal.getName() : "admin";
        try {
            ParentCallRecordDto record = parentCallService.initiateCall(request, initiatedBy);
            return ResponseEntity.ok(record);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================================
    // 3. CALL HISTORY & FOLLOW-UPS
    // ==========================================

    @GetMapping("/call-history")
    public ResponseEntity<List<ParentCallRecordDto>> getCallHistory() {
        return ResponseEntity.ok(parentCallService.getAllCallHistory());
    }

    @GetMapping("/call-history/{id}")
    public ResponseEntity<?> getCallRecordById(@PathVariable("id") int id) {
        ParentCallRecordDto record = parentCallService.getCallRecordById(id);
        if (record == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(record);
    }

    @GetMapping("/call-followups")
    public ResponseEntity<List<ParentCallRecordDto>> getFollowUpRequests() {
        return ResponseEntity.ok(parentCallService.getFollowUpRequests());
    }

    // ==========================================
    // 4. GUARDIAN CONTACTS & OPT-OUTS
    // ==========================================

    @GetMapping("/parent-contacts")
    public ResponseEntity<List<ParentContactDto>> getParentContacts() {
        return ResponseEntity.ok(parentContactService.getAllContacts());
    }

    @PutMapping("/parent-contacts/{id}")
    public ResponseEntity<?> updateParentContact(@PathVariable("id") int id,
                                                 @Valid @RequestBody ParentContactDto dto) {
        ParentContactDto saved = parentContactService.saveOrUpdateContact(dto);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/parent-contacts/opt-out")
    public ResponseEntity<?> recordParentOptOut(@RequestBody Map<String, Object> body) {
        if (!body.containsKey("studentId")) {
            return ResponseEntity.badRequest().body(Map.of("error", "studentId is required"));
        }
        int studentId = Integer.parseInt(body.get("studentId").toString());
        String reason = body.get("reason") != null ? body.get("reason").toString() : "Admin registered opt-out";
        ParentContactDto updated = parentContactService.recordOptOut(studentId, reason);
        return ResponseEntity.ok(updated);
    }

    // ==========================================
    // 5. TELEPHONY CONFIG & FEASIBILITY
    // ==========================================

    @GetMapping("/telephony/config")
    public ResponseEntity<TelephonyConfigDto> getTelephonyConfig() {
        return ResponseEntity.ok(parentCallService.getTelephonyConfig());
    }
}
