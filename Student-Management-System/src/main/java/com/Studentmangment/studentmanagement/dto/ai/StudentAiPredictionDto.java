package com.Studentmangment.studentmanagement.dto.ai;

import java.io.Serializable;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class StudentAiPredictionDto implements Serializable {
    private static final long serialVersionUID = 1L;

    @JsonProperty("student_id")
    @JsonAlias("studentId")
    private Integer studentId;

    @JsonProperty("course_id")
    @JsonAlias("courseId")
    private Integer courseId;

    @JsonProperty("student_name")
    @JsonAlias("studentName")
    private String studentName;

    @JsonProperty("course_name")
    @JsonAlias("courseName")
    private String courseName;

    @JsonProperty("predicted_score")
    @JsonAlias("predictedScore")
    private Double predictedScore;

    @JsonProperty("performance_category")
    @JsonAlias("performanceCategory")
    private String performanceCategory;

    @JsonProperty("risk_level")
    @JsonAlias("riskLevel")
    private String riskLevel;

    @JsonProperty("confidence_score")
    @JsonAlias("confidenceScore")
    private Double confidenceScore;

    @JsonProperty("key_contributing_factors")
    @JsonAlias("keyContributingFactors")
    private List<String> keyContributingFactors;

    @JsonProperty("feature_contributions")
    @JsonAlias("featureContributions")
    private List<AiFeatureContributionDto> featureContributions;

    @JsonProperty("recommended_actions")
    @JsonAlias("recommendedActions")
    private List<String> recommendedActions;

    @JsonProperty("model_version")
    @JsonAlias("modelVersion")
    private String modelVersion;

    @JsonProperty("prediction_timestamp")
    @JsonAlias("predictionTimestamp")
    private String predictionTimestamp;

    @JsonProperty("evaluation_metrics")
    @JsonAlias("evaluationMetrics")
    private Map<String, Object> evaluationMetrics;

    public StudentAiPredictionDto() {}

    public Integer getStudentId() { return studentId; }
    public void setStudentId(Integer studentId) { this.studentId = studentId; }

    public Integer getCourseId() { return courseId; }
    public void setCourseId(Integer courseId) { this.courseId = courseId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public Double getPredictedScore() { return predictedScore; }
    public void setPredictedScore(Double predictedScore) { this.predictedScore = predictedScore; }

    public String getPerformanceCategory() { return performanceCategory; }
    public void setPerformanceCategory(String performanceCategory) { this.performanceCategory = performanceCategory; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public List<String> getKeyContributingFactors() { return keyContributingFactors; }
    public void setKeyContributingFactors(List<String> keyContributingFactors) { this.keyContributingFactors = keyContributingFactors; }

    public List<AiFeatureContributionDto> getFeatureContributions() { return featureContributions; }
    public void setFeatureContributions(List<AiFeatureContributionDto> featureContributions) { this.featureContributions = featureContributions; }

    public List<String> getRecommendedActions() { return recommendedActions; }
    public void setRecommendedActions(List<String> recommendedActions) { this.recommendedActions = recommendedActions; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public String getPredictionTimestamp() { return predictionTimestamp; }
    public void setPredictionTimestamp(String predictionTimestamp) { this.predictionTimestamp = predictionTimestamp; }

    public Map<String, Object> getEvaluationMetrics() { return evaluationMetrics; }
    public void setEvaluationMetrics(Map<String, Object> evaluationMetrics) { this.evaluationMetrics = evaluationMetrics; }
}
