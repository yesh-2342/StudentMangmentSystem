package com.Studentmangment.studentmanagement.dto;

public class RiskThresholdConfig {
    private double attendanceThreshold = 75.0; // percent
    private double marksThreshold = 40.0;       // percent
    private int missingAssignmentsThreshold = 1; // count
    private String preferredLanguage = "en-IN";
    private String defaultTemplate = "Hello, this is the automated academic support assistant from Project 577 College of Engineering. I am calling to share a routine academic progress update and check if you would like to discuss support options.";
    private String ollamaModel = "llama3";
    private String ollamaEndpoint = "http://localhost:11434";

    public RiskThresholdConfig() {}

    public RiskThresholdConfig(double attendanceThreshold, double marksThreshold, int missingAssignmentsThreshold) {
        this.attendanceThreshold = attendanceThreshold;
        this.marksThreshold = marksThreshold;
        this.missingAssignmentsThreshold = missingAssignmentsThreshold;
    }

    public double getAttendanceThreshold() {
        return attendanceThreshold;
    }

    public void setAttendanceThreshold(double attendanceThreshold) {
        this.attendanceThreshold = attendanceThreshold;
    }

    public double getMarksThreshold() {
        return marksThreshold;
    }

    public void setMarksThreshold(double marksThreshold) {
        this.marksThreshold = marksThreshold;
    }

    public int getMissingAssignmentsThreshold() {
        return missingAssignmentsThreshold;
    }

    public void setMissingAssignmentsThreshold(int missingAssignmentsThreshold) {
        this.missingAssignmentsThreshold = missingAssignmentsThreshold;
    }

    public String getPreferredLanguage() {
        return preferredLanguage;
    }

    public void setPreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }

    public String getDefaultTemplate() {
        return defaultTemplate;
    }

    public void setDefaultTemplate(String defaultTemplate) {
        this.defaultTemplate = defaultTemplate;
    }

    public String getOllamaModel() {
        return ollamaModel;
    }

    public void setOllamaModel(String ollamaModel) {
        this.ollamaModel = ollamaModel;
    }

    public String getOllamaEndpoint() {
        return ollamaEndpoint;
    }

    public void setOllamaEndpoint(String ollamaEndpoint) {
        this.ollamaEndpoint = ollamaEndpoint;
    }
}
