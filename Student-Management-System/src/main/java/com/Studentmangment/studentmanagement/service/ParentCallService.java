package com.Studentmangment.studentmanagement.service;

import java.util.List;
import java.util.Map;

import com.Studentmangment.studentmanagement.dto.CallInitiationRequestDto;
import com.Studentmangment.studentmanagement.dto.ParentCallRecordDto;
import com.Studentmangment.studentmanagement.dto.SimulatedSessionTurnRequestDto;
import com.Studentmangment.studentmanagement.dto.SimulatedSessionTurnResponseDto;
import com.Studentmangment.studentmanagement.dto.TelephonyConfigDto;

public interface ParentCallService {
    ParentCallRecordDto initiateCall(CallInitiationRequestDto request, String initiatedBy);
    ParentCallRecordDto startSimulatedSession(int studentId, Integer alertId, String initiatedBy);
    ParentCallRecordDto startSimulatedSession(int studentId, Integer alertId, String initiatedBy, String language, String academicConcerns);
    SimulatedSessionTurnResponseDto handleTurn(SimulatedSessionTurnRequestDto turnRequest);
    ParentCallRecordDto endSimulatedSession(int callId, String reason);
    ParentCallRecordDto endSimulatedSession(int callId, String status, String reason, String outcome, Boolean followUpRequested, java.time.LocalDate followUpDate, String followUpNotes);
    List<ParentCallRecordDto> getAllCallHistory();
    ParentCallRecordDto getCallRecordById(int callId);
    List<ParentCallRecordDto> getFollowUpRequests();
    String handleStatusWebhook(Map<String, String> payload, String signatureHeader);
    String handleVoiceWebhook(Map<String, String> payload, String signatureHeader);
    TelephonyConfigDto getTelephonyConfig();
}
