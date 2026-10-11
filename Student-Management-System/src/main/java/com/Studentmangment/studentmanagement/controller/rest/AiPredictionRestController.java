package com.Studentmangment.studentmanagement.controller.rest;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Studentmangment.studentmanagement.dto.ai.AiModelInfoDto;
import com.Studentmangment.studentmanagement.dto.ai.AiSimulationRequestDto;
import com.Studentmangment.studentmanagement.dto.ai.AiSimulationResponseDto;
import com.Studentmangment.studentmanagement.dto.ai.StudentAiPredictionDto;
import com.Studentmangment.studentmanagement.service.AiPredictionService;

@RestController
@RequestMapping("/api/ai")
public class AiPredictionRestController {

    @Autowired
    private AiPredictionService aiPredictionService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(aiPredictionService.checkHealth());
    }

    @GetMapping("/model-info")
    public ResponseEntity<AiModelInfoDto> modelInfo() {
        return ResponseEntity.ok(aiPredictionService.getModelInfo());
    }

    @GetMapping("/students/{studentId}/prediction")
    public ResponseEntity<StudentAiPredictionDto> studentPrediction(
            @PathVariable("studentId") int studentId,
            @RequestParam(value = "courseId", required = false) Integer courseId) {
        return ResponseEntity.ok(aiPredictionService.getStudentPrediction(studentId, courseId));
    }

    @PostMapping("/students/{studentId}/simulate")
    public ResponseEntity<AiSimulationResponseDto> simulateScenario(
            @PathVariable("studentId") int studentId,
            @RequestBody(required = false) AiSimulationRequestDto request) {
        if (request == null) request = new AiSimulationRequestDto();
        request.setStudentId(studentId);
        return ResponseEntity.ok(aiPredictionService.simulateStudentScenario(request));
    }

    @GetMapping("/courses/{courseId}/predictions")
    public ResponseEntity<List<StudentAiPredictionDto>> coursePredictions(
            @PathVariable("courseId") int courseId) {
        return ResponseEntity.ok(aiPredictionService.getCoursePredictions(courseId));
    }

    @GetMapping("/analytics/institutional")
    public ResponseEntity<Map<String, Object>> institutionalAnalytics() {
        return ResponseEntity.ok(aiPredictionService.getInstitutionalAiAnalytics());
    }
}
