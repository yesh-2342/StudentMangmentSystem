package com.Studentmangment.studentmanagement.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.Studentmangment.studentmanagement.dto.OllamaAiStatusDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class OllamaAiService {

    private static final Logger logger = LoggerFactory.getLogger(OllamaAiService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    private AcademicRiskConfigService riskConfigService;

    public OllamaAiService(RestTemplateBuilder builder) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofMillis(1500))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public OllamaAiStatusDto checkStatus() {
        String endpoint = riskConfigService.getConfig().getOllamaEndpoint();
        String activeModel = riskConfigService.getConfig().getOllamaModel();

        OllamaAiStatusDto status = new OllamaAiStatusDto();
        status.setEndpoint(endpoint);
        status.setActiveModel(activeModel);
        status.setLocalRuleEngineAvailable(true);
        status.setSpeechRecognitionAvailable(true);
        status.setSpeechSynthesisAvailable(true);
        status.setRecommendedCommand("ollama run " + activeModel);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    endpoint + "/api/tags",
                    HttpMethod.GET,
                    null,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                status.setOllamaAvailable(true);
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode modelsNode = root.get("models");
                List<String> models = new ArrayList<>();
                if (modelsNode != null && modelsNode.isArray()) {
                    for (JsonNode m : modelsNode) {
                        if (m.has("name")) {
                            models.add(m.get("name").asText());
                        }
                    }
                }
                status.setAvailableModels(models);
                if (models.contains(activeModel) || models.stream().anyMatch(m -> m.startsWith(activeModel))) {
                    status.setStatusMessage("Local Ollama engine connected. Active model '" + activeModel + "' is ready for live inference.");
                } else if (!models.isEmpty()) {
                    status.setActiveModel(models.get(0));
                    status.setStatusMessage("Local Ollama connected with models: " + String.join(", ", models));
                } else {
                    status.setStatusMessage("Local Ollama service running. No models downloaded yet. Run: 'ollama pull " + activeModel + "'");
                }
            } else {
                status.setOllamaAvailable(false);
                status.setStatusMessage("Ollama endpoint responded with HTTP " + response.getStatusCodeValue());
            }
        } catch (Exception e) {
            status.setOllamaAvailable(false);
            status.setStatusMessage("Local Ollama service is not running on " + endpoint + ". Browser simulated session is utilizing the zero-cost institutional rule engine fallback.");
        }

        return status;
    }

    public String generateTurnResponse(String studentName, String guardianName, String academicConcerns,
                                       String currentState, String parentInput, String language) {
        String endpoint = riskConfigService.getConfig().getOllamaEndpoint();
        String model = riskConfigService.getConfig().getOllamaModel();

        String langInstruction = "English";
        if (language != null) {
            if (language.startsWith("hi")) langInstruction = "Hindi (using clear Devanagari or polite Romanized Hindi)";
            else if (language.startsWith("te")) langInstruction = "Telugu (using polite conversational Telugu)";
        }

        String systemPrompt = String.format(
            "You are the AI Academic Support Assistant representing Project 577 College of Engineering.\n" +
            "You are speaking in a simulated voice conversation with %s, parent/guardian of student %s.\n" +
            "Verified Academic Concern: %s.\n" +
            "Current Call State: %s.\n" +
            "CRITICAL RULES:\n" +
            "1. Be polite, respectful, and non-judgmental. Do NOT threaten, blame, or shame the student or family.\n" +
            "2. Never fabricate facts, grades, or administrative actions.\n" +
            "3. Offer constructive support options, such as organizing a teacher consultation or office hours meeting.\n" +
            "4. Keep your answer brief (1 to 3 sentences maximum) suitable for audio text-to-speech.\n" +
            "5. Respond in: %s.",
            guardianName != null ? guardianName : "the guardian",
            studentName != null ? studentName : "the student",
            academicConcerns != null ? academicConcerns : "Academic progress review",
            currentState != null ? currentState : "CONVERSATION",
            langInstruction
        );

        String userPrompt = String.format(
            "The parent just said: \"%s\". Please generate the next spoken AI assistant response:",
            parentInput != null ? parentInput : "Hello"
        );

        try {
            Map<String, Object> reqBody = new HashMap<>();
            reqBody.put("model", model);
            reqBody.put("system", systemPrompt);
            reqBody.put("prompt", userPrompt);
            reqBody.put("stream", false);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    endpoint + "/api/generate",
                    entity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if (root.has("response")) {
                    String reply = root.get("response").asText().trim();
                    if (!reply.isEmpty()) {
                        return reply;
                    }
                }
            }
        } catch (Exception e) {
            logger.debug("Ollama generation not available, falling back to rule engine: {}", e.getMessage());
        }

        return null; // Fallback to rule engine
    }
}
