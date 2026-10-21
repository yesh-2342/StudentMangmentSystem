package com.Studentmangment.studentmanagement.controller.rest;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Studentmangment.studentmanagement.service.ParentCallService;

@RestController
@RequestMapping("/api/telephony/webhooks")
public class TelephonyWebhookRestController {

    @Autowired
    private ParentCallService parentCallService;

    @PostMapping(value = "/status", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> handleStatusWebhook(@RequestParam Map<String, String> payload,
                                                      @RequestHeader(value = "X-Exotel-Signature", required = false) String signature) {
        String response = parentCallService.handleStatusWebhook(payload, signature);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/voice", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> handleVoiceWebhook(@RequestParam Map<String, String> payload,
                                                     @RequestHeader(value = "X-Exotel-Signature", required = false) String signature) {
        String response = parentCallService.handleVoiceWebhook(payload, signature);
        return ResponseEntity.ok(response);
    }
}
