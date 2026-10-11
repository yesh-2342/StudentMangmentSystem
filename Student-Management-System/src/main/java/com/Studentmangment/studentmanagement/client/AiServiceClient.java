package com.Studentmangment.studentmanagement.client;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.Studentmangment.studentmanagement.dto.ai.AiModelInfoDto;
import com.Studentmangment.studentmanagement.dto.ai.AiSimulationResponseDto;
import com.Studentmangment.studentmanagement.dto.ai.PythonAiPredictPayload;
import com.Studentmangment.studentmanagement.dto.ai.StudentAiPredictionDto;

@Component
public class AiServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(AiServiceClient.class);

    private final RestTemplate restTemplate;
    private final String aiServiceUrl;

    public AiServiceClient(@Value("${ai.service.url:http://localhost:8000}") String aiServiceUrl) {
        this.aiServiceUrl = aiServiceUrl.replaceAll("/+$", "");
        
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(10000);
        this.restTemplate = new RestTemplate(factory);
        logger.info("AiServiceClient configured with target URL: {}", this.aiServiceUrl);
    }

    public Map<String, Object> checkHealth() {
        String url = aiServiceUrl + "/health";
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getBody();
        } catch (Exception ex) {
            logger.warn("AI Service health probe failed at {}: {}", url, ex.getMessage());
            Map<String, Object> degraded = new HashMap<>();
            degraded.put("status", "DOWN");
            degraded.put("service", "Deep Learning Academic Intelligence Microservice");
            degraded.put("error", "AI service unreachable at " + aiServiceUrl);
            return degraded;
        }
    }

    public AiModelInfoDto getModelInfo() {
        String url = aiServiceUrl + "/api/ai/model-info";
        try {
            ResponseEntity<AiModelInfoDto> response = restTemplate.getForEntity(url, AiModelInfoDto.class);
            return response.getBody();
        } catch (HttpStatusCodeException ex) {
            throw new ResponseStatusException(ex.getStatusCode(), "AI service returned error: " + ex.getResponseBodyAsString());
        } catch (ResourceAccessException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI Prediction Microservice is unavailable at " + aiServiceUrl);
        }
    }

    public StudentAiPredictionDto predict(PythonAiPredictPayload payload) {
        String url = aiServiceUrl + "/api/ai/predict";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<PythonAiPredictPayload> request = new HttpEntity<>(payload, headers);

            ResponseEntity<StudentAiPredictionDto> response = restTemplate.postForEntity(url, request, StudentAiPredictionDto.class);
            return response.getBody();
        } catch (HttpStatusCodeException ex) {
            logger.error("AI service error during predict: {}", ex.getResponseBodyAsString());
            throw new ResponseStatusException(ex.getStatusCode(), "AI Prediction error: " + ex.getResponseBodyAsString());
        } catch (ResourceAccessException ex) {
            logger.warn("AI service unreachable for prediction: {}", ex.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Deep Learning AI service is currently unavailable. Please ensure the Python service is running on " + aiServiceUrl);
        }
    }

    public Map<String, Object> predictBatch(List<PythonAiPredictPayload> records) {
        String url = aiServiceUrl + "/api/ai/predict/batch";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> body = Collections.singletonMap("records", records);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            return response.getBody();
        } catch (HttpStatusCodeException ex) {
            throw new ResponseStatusException(ex.getStatusCode(), "AI Batch error: " + ex.getResponseBodyAsString());
        } catch (ResourceAccessException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Deep Learning AI service is unavailable at " + aiServiceUrl);
        }
    }

    public AiSimulationResponseDto simulate(Map<String, Object> simulationRequest) {
        String url = aiServiceUrl + "/api/ai/simulate";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(simulationRequest, headers);

            ResponseEntity<AiSimulationResponseDto> response = restTemplate.postForEntity(url, request, AiSimulationResponseDto.class);
            return response.getBody();
        } catch (HttpStatusCodeException ex) {
            throw new ResponseStatusException(ex.getStatusCode(), "AI Simulation error: " + ex.getResponseBodyAsString());
        } catch (ResourceAccessException ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Deep Learning AI service is unavailable at " + aiServiceUrl);
        }
    }

    public String getAiServiceUrl() {
        return aiServiceUrl;
    }
}
