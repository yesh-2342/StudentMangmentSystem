package com.Studentmangment.studentmanagement.dto.ai;

import java.io.Serializable;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class AiModelInfoDto implements Serializable {
    private static final long serialVersionUID = 1L;

    @JsonProperty("model_name")
    @JsonAlias("modelName")
    private String modelName;

    @JsonProperty("model_version")
    @JsonAlias("modelVersion")
    private String modelVersion;

    @JsonProperty("framework")
    private String framework;

    @JsonProperty("architecture")
    private Object architecture;

    @JsonProperty("input_features")
    @JsonAlias("inputFeatures")
    private List<String> inputFeatures;

    @JsonProperty("training_dataset_summary")
    @JsonAlias("trainingDatasetSummary")
    private Map<String, Object> trainingDatasetSummary;

    @JsonProperty("evaluation_metrics")
    @JsonAlias("evaluationMetrics")
    private Map<String, Object> evaluationMetrics;

    @JsonProperty("baseline_comparison")
    @JsonAlias("baselineComparison")
    private Map<String, Object> baselineComparison;

    @JsonProperty("trained_at")
    @JsonAlias("trainedAt")
    private String trainedAt;

    @JsonProperty("status")
    private String status;

    public AiModelInfoDto() {}

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }

    public String getFramework() { return framework; }
    public void setFramework(String framework) { this.framework = framework; }

    public Object getArchitecture() { return architecture; }
    public void setArchitecture(Object architecture) { this.architecture = architecture; }

    public List<String> getInputFeatures() { return inputFeatures; }
    public void setInputFeatures(List<String> inputFeatures) { this.inputFeatures = inputFeatures; }

    public Map<String, Object> getTrainingDatasetSummary() { return trainingDatasetSummary; }
    public void setTrainingDatasetSummary(Map<String, Object> trainingDatasetSummary) { this.trainingDatasetSummary = trainingDatasetSummary; }

    public Map<String, Object> getEvaluationMetrics() { return evaluationMetrics; }
    public void setEvaluationMetrics(Map<String, Object> evaluationMetrics) { this.evaluationMetrics = evaluationMetrics; }

    public Map<String, Object> getBaselineComparison() { return baselineComparison; }
    public void setBaselineComparison(Map<String, Object> baselineComparison) { this.baselineComparison = baselineComparison; }

    public String getTrainedAt() { return trainedAt; }
    public void setTrainedAt(String trainedAt) { this.trainedAt = trainedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
