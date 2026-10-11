package com.Studentmangment.studentmanagement.service;

import java.util.List;
import java.util.Map;

import com.Studentmangment.studentmanagement.dto.ai.AiModelInfoDto;
import com.Studentmangment.studentmanagement.dto.ai.AiSimulationRequestDto;
import com.Studentmangment.studentmanagement.dto.ai.AiSimulationResponseDto;
import com.Studentmangment.studentmanagement.dto.ai.StudentAiPredictionDto;

public interface AiPredictionService {

    Map<String, Object> checkHealth();

    AiModelInfoDto getModelInfo();

    StudentAiPredictionDto getStudentPrediction(int studentId, Integer courseId);

    List<StudentAiPredictionDto> getCoursePredictions(int courseId);

    AiSimulationResponseDto simulateStudentScenario(AiSimulationRequestDto request);

    Map<String, Object> getInstitutionalAiAnalytics();
}
