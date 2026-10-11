package com.Studentmangment.studentmanagement.dto.ai;

import java.io.Serializable;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AiSimulationResponseDto implements Serializable {
    private static final long serialVersionUID = 1L;

    @JsonProperty("baseline_predicted_score")
    @JsonAlias("baselinePredictedScore")
    private Double baselinePredictedScore;

    @JsonProperty("baseline_risk_level")
    @JsonAlias("baselineRiskLevel")
    private String baselineRiskLevel;

    @JsonProperty("simulated_predicted_score")
    @JsonAlias("simulatedPredictedScore")
    private Double simulatedPredictedScore;

    @JsonProperty("simulated_risk_level")
    @JsonAlias("simulatedRiskLevel")
    private String simulatedRiskLevel;

    @JsonProperty("score_differential")
    @JsonAlias("scoreDifferential")
    private Double scoreDifferential;

    @JsonProperty("risk_transition")
    @JsonAlias("riskTransition")
    private String riskTransition;

    @JsonProperty("key_drivers")
    @JsonAlias("keyDrivers")
    private List<String> keyDrivers;

    @JsonProperty("educational_guidance")
    @JsonAlias("educationalGuidance")
    private String educationalGuidance;

    @JsonProperty("model_version")
    @JsonAlias("modelVersion")
    private String modelVersion;

    @JsonProperty("timestamp")
    private String timestamp;

    public AiSimulationResponseDto() {}

    public Double getBaselinePredictedScore() { return baselinePredictedScore; }
    public void setBaselinePredictedScore(Double baselinePredictedScore) { this.baselinePredictedScore = baselinePredictedScore; }

    public String getBaselineRiskLevel() { return baselineRiskLevel; }
    public void setBaselineRiskLevel(String baselineRiskLevel) { this.baselineRiskLevel = baselineRiskLevel; }

    public Double getSimulatedPredictedScore() { return simulatedPredictedScore; }
    public void setSimulatedPredictedScore(Double simulatedPredictedScore) { this.simulatedPredictedScore = simulatedPredictedScore; }

    public String getSimulatedRiskLevel() { return simulatedRiskLevel; }
    public void setSimulatedRiskLevel(String simulatedRiskLevel) { this.simulatedRiskLevel = simulatedRiskLevel; }

    public Double getScoreDifferential() { return scoreDifferential; }
    public void setScoreDifferential(Double scoreDifferential) { this.scoreDifferential = scoreDifferential; }

    public String getRiskTransition() { return riskTransition; }
    public void setRiskTransition(String riskTransition) { this.riskTransition = riskTransition; }

    public List<String> getKeyDrivers() { return keyDrivers; }
    public void setKeyDrivers(List<String> keyDrivers) { this.keyDrivers = keyDrivers; }

    public String getEducationalGuidance() { return educationalGuidance; }
    public void setEducationalGuidance(String educationalGuidance) { this.educationalGuidance = educationalGuidance; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
