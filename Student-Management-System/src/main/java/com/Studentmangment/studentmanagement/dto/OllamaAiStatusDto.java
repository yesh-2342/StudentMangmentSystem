package com.Studentmangment.studentmanagement.dto;

import java.util.ArrayList;
import java.util.List;

public class OllamaAiStatusDto {
    private boolean ollamaAvailable;
    private String endpoint;
    private String activeModel;
    private List<String> availableModels = new ArrayList<>();
    private String statusMessage;
    private boolean localRuleEngineAvailable = true;
    private boolean speechRecognitionAvailable = true;
    private boolean speechSynthesisAvailable = true;
    private String recommendedCommand;

    public OllamaAiStatusDto() {}

    public boolean isOllamaAvailable() {
        return ollamaAvailable;
    }

    public void setOllamaAvailable(boolean ollamaAvailable) {
        this.ollamaAvailable = ollamaAvailable;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getActiveModel() {
        return activeModel;
    }

    public void setActiveModel(String activeModel) {
        this.activeModel = activeModel;
    }

    public List<String> getAvailableModels() {
        return availableModels;
    }

    public void setAvailableModels(List<String> availableModels) {
        this.availableModels = availableModels;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    public boolean isLocalRuleEngineAvailable() {
        return localRuleEngineAvailable;
    }

    public void setLocalRuleEngineAvailable(boolean localRuleEngineAvailable) {
        this.localRuleEngineAvailable = localRuleEngineAvailable;
    }

    public boolean isSpeechRecognitionAvailable() {
        return speechRecognitionAvailable;
    }

    public void setSpeechRecognitionAvailable(boolean speechRecognitionAvailable) {
        this.speechRecognitionAvailable = speechRecognitionAvailable;
    }

    public boolean isSpeechSynthesisAvailable() {
        return speechSynthesisAvailable;
    }

    public void setSpeechSynthesisAvailable(boolean speechSynthesisAvailable) {
        this.speechSynthesisAvailable = speechSynthesisAvailable;
    }

    public String getRecommendedCommand() {
        return recommendedCommand;
    }

    public void setRecommendedCommand(String recommendedCommand) {
        this.recommendedCommand = recommendedCommand;
    }
}
