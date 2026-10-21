package com.Studentmangment.studentmanagement.controller.rest;

import java.security.Principal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Studentmangment.studentmanagement.dto.ParentCallRecordDto;
import com.Studentmangment.studentmanagement.dto.SimulatedSessionTurnRequestDto;
import com.Studentmangment.studentmanagement.dto.SimulatedSessionTurnResponseDto;
import com.Studentmangment.studentmanagement.service.ParentCallService;

@RestController
@RequestMapping("/api/demo")
public class VoiceSessionDemoRestController {

    @Autowired
    private ParentCallService parentCallService;

    @PostMapping("/voice-session")
    public ResponseEntity<?> startVoiceSession(@RequestBody Map<String, Object> body, Principal principal) {
        if (!body.containsKey("studentId")) {
            return ResponseEntity.badRequest().body(Map.of("error", "studentId is required"));
        }

        int studentId = Integer.parseInt(body.get("studentId").toString());
        Integer alertId = body.containsKey("alertId") && body.get("alertId") != null
                ? Integer.parseInt(body.get("alertId").toString())
                : null;

        String initiatedBy = principal != null ? principal.getName() : "demo-user";
        ParentCallRecordDto session = parentCallService.startSimulatedSession(studentId, alertId, initiatedBy);
        return ResponseEntity.ok(session);
    }

    @PostMapping("/voice-session/turn")
    public ResponseEntity<SimulatedSessionTurnResponseDto> handleVoiceTurn(@RequestBody SimulatedSessionTurnRequestDto turnRequest) {
        SimulatedSessionTurnResponseDto response = parentCallService.handleTurn(turnRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/voice-session/{id}/end")
    public ResponseEntity<?> endVoiceSession(@PathVariable("id") int id,
                                             @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : "Session terminated by user.";
        ParentCallRecordDto ended = parentCallService.endSimulatedSession(id, reason);
        return ResponseEntity.ok(ended);
    }
}
