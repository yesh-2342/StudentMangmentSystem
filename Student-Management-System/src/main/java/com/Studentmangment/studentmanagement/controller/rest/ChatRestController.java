package com.Studentmangment.studentmanagement.controller.rest;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Studentmangment.studentmanagement.dto.ChatMessageDto;
import com.Studentmangment.studentmanagement.dto.ChatRequestDto;
import com.Studentmangment.studentmanagement.dto.ChatResponseDto;
import com.Studentmangment.studentmanagement.service.ChatService;

@RestController
@RequestMapping("/api/chat")
public class ChatRestController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/message")
    public ResponseEntity<?> sendMessage(@RequestBody ChatRequestDto request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User session is unauthenticated."));
        }
        if (request == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty."));
        }

        ChatResponseDto response = chatService.processMessage(principal.getName(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<String> suggestions = chatService.getSuggestedPrompts(principal.getName());
        return ResponseEntity.ok(suggestions);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessageDto>> getHistory(@RequestParam(value = "sessionId", required = false) String sessionId,
                                                           Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        List<ChatMessageDto> history = chatService.getSessionHistory(principal.getName(), sessionId);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetSession(@RequestBody(required = false) Map<String, String> body, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String sessionId = body != null ? body.get("sessionId") : null;
        if (sessionId != null) {
            chatService.clearSession(principal.getName(), sessionId);
        }
        return ResponseEntity.ok(Map.of("message", "Chat session reset successfully."));
    }
}
