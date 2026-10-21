package com.Studentmangment.studentmanagement.dto;

import java.util.ArrayList;
import java.util.List;

public class ParentCallingDashboardStatsDto {
    private int totalStudentsRequiringAttention;
    private int studentsLowAttendance;
    private int studentsLowMarks;
    private int callsCompleted;
    private int callsUnanswered;
    private int callsInterrupted;
    private int followUpsRequired;
    private List<ParentCallRecordDto> recentActivity = new ArrayList<>();
    private RiskThresholdConfig activeThresholds;
    private OllamaAiStatusDto aiStatus;

    public ParentCallingDashboardStatsDto() {}

    public int getTotalStudentsRequiringAttention() {
        return totalStudentsRequiringAttention;
    }

    public void setTotalStudentsRequiringAttention(int totalStudentsRequiringAttention) {
        this.totalStudentsRequiringAttention = totalStudentsRequiringAttention;
    }

    public int getStudentsLowAttendance() {
        return studentsLowAttendance;
    }

    public void setStudentsLowAttendance(int studentsLowAttendance) {
        this.studentsLowAttendance = studentsLowAttendance;
    }

    public int getStudentsLowMarks() {
        return studentsLowMarks;
    }

    public void setStudentsLowMarks(int studentsLowMarks) {
        this.studentsLowMarks = studentsLowMarks;
    }

    public int getCallsCompleted() {
        return callsCompleted;
    }

    public void setCallsCompleted(int callsCompleted) {
        this.callsCompleted = callsCompleted;
    }

    public int getCallsUnanswered() {
        return callsUnanswered;
    }

    public void setCallsUnanswered(int callsUnanswered) {
        this.callsUnanswered = callsUnanswered;
    }

    public int getCallsInterrupted() {
        return callsInterrupted;
    }

    public void setCallsInterrupted(int callsInterrupted) {
        this.callsInterrupted = callsInterrupted;
    }

    public int getFollowUpsRequired() {
        return followUpsRequired;
    }

    public void setFollowUpsRequired(int followUpsRequired) {
        this.followUpsRequired = followUpsRequired;
    }

    public List<ParentCallRecordDto> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<ParentCallRecordDto> recentActivity) {
        this.recentActivity = recentActivity;
    }

    public RiskThresholdConfig getActiveThresholds() {
        return activeThresholds;
    }

    public void setActiveThresholds(RiskThresholdConfig activeThresholds) {
        this.activeThresholds = activeThresholds;
    }

    public OllamaAiStatusDto getAiStatus() {
        return aiStatus;
    }

    public void setAiStatus(OllamaAiStatusDto aiStatus) {
        this.aiStatus = aiStatus;
    }
}
