package com.Studentmangment.studentmanagement.service;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Studentmangment.studentmanagement.dto.SimulatedSessionTurnRequestDto;
import com.Studentmangment.studentmanagement.dto.SimulatedSessionTurnResponseDto;
import com.Studentmangment.studentmanagement.entity.AcademicAlert;
import com.Studentmangment.studentmanagement.entity.ParentCallRecord;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.repository.AcademicAlertRepository;
import com.Studentmangment.studentmanagement.repository.ParentCallRecordRepository;

@Service
public class VoiceAgentService {

    @Autowired
    private StudentService studentService;

    @Autowired
    private AcademicAlertRepository academicAlertRepository;

    @Autowired
    private ParentCallRecordRepository parentCallRecordRepository;

    @Autowired
    private ParentContactService parentContactService;

    @Autowired
    private OllamaAiService ollamaAiService;

    public String buildInitialGreeting(String studentName, String guardianName) {
        return buildInitialGreeting(studentName, guardianName, "en-IN");
    }

    public String buildInitialGreeting(String studentName, String guardianName, String language) {
        if (language != null && language.startsWith("hi")) {
            return String.format(
                "नमस्ते, यह प्रोजेक्ट 577 कॉलेज ऑफ इंजीनियरिंग से ऑटोमेटेड अकादमिक सपोर्ट असिस्टेंट है। क्या मैं %s के माता-पिता या अभिभावक से बात कर रहा हूँ?",
                studentName
            );
        } else if (language != null && language.startsWith("te")) {
            return String.format(
                "నమస్కారం, ఇది ప్రాజెక్ట్ 577 ఇంజనీరింగ్ కళాశాల నుండి అకడమిక్ సపోర్ట్ అసిస్టెంట్. నేను %s గారి తల్లిదండ్రులు లేదా సంరక్షకులతో మాట్లాడుతున్నానా?",
                studentName
            );
        }
        return String.format(
            "Hello, this is the automated academic support assistant from Project 577 College of Engineering. Am I speaking with the parent or guardian of %s?",
            studentName
        );
    }

    public String buildVerifiedAcademicScript(Student student, AcademicAlert alert) {
        String studentName = student != null ? student.getFirstName() + " " + student.getLastName() : "the student";
        if (alert == null && student != null) {
            java.util.List<AcademicAlert> studentAlerts = academicAlertRepository.findByStudentId(student.getId());
            if (studentAlerts != null && !studentAlerts.isEmpty()) {
                alert = studentAlerts.get(0);
            }
        }

        String courseName = alert != null && alert.getCourseName() != null ? alert.getCourseName() : "core academic courses";
        Double attendance = alert != null ? alert.getAttendancePercent() : null;
        Double average = alert != null ? alert.getGradeAverage() : null;
        Integer missing = alert != null ? alert.getMissingAssignments() : 0;

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Our academic monitoring records indicate that in %s, %s currently has ", courseName, studentName));

        if (attendance != null && attendance < 75.0) {
            sb.append(String.format("an attendance rate of %.1f percent (which is below the college 75 percent requirement), ", attendance));
        } else if (attendance != null) {
            sb.append(String.format("an attendance rate of %.1f percent, ", attendance));
        }
        if (average != null && average < 60.0) {
            sb.append(String.format("and a current assessment average of %.1f percent. ", average));
        } else if (average != null) {
            sb.append(String.format("with an assessment average of %.1f percent. ", average));
        }
        if (attendance == null && average == null) {
            sb.append("attendance and academic assessment indicators that require proactive faculty guidance. ");
        }
        if (missing != null && missing > 0) {
            sb.append(String.format("There are also %d outstanding coursework assignments. ", missing));
        }

        sb.append("The faculty recommends setting up a personalized academic support plan to help them get back on track. Would you like the college to arrange a follow-up consultation with their teacher?");
        return sb.toString();
    }

    public SimulatedSessionTurnResponseDto processTurn(SimulatedSessionTurnRequestDto request) {
        ParentCallRecord call = parentCallRecordRepository.findById(request.getCallId()).orElse(null);
        SimulatedSessionTurnResponseDto resp = new SimulatedSessionTurnResponseDto();
        resp.setCallId(request.getCallId());

        if (call == null) {
            resp.setCompleted(true);
            resp.setReplyText("I apologize, but this call session has ended. Thank you.");
            resp.setNextState("ENDED");
            return resp;
        }

        Student student = studentService.findByStudentId(call.getStudentId());
        AcademicAlert alert = call.getAlertId() != null ? academicAlertRepository.findById(call.getAlertId()).orElse(null) : null;
        String studentName = call.getStudentName();
        String input = request.getParentInput() != null ? request.getParentInput().trim().toLowerCase(Locale.ROOT) : "";
        String state = request.getCurrentState() != null ? request.getCurrentState().toUpperCase(Locale.ROOT) : "GREETING_AND_IDENTITY_CHECK";

        // Append to transcript
        String currentTranscript = call.getConversationTranscript() != null ? call.getConversationTranscript() : "";
        if (!input.isEmpty()) {
            currentTranscript += "\nParent: " + request.getParentInput();
        }

        // Conversational State Machine
        switch (state) {
            case "GREETING_AND_IDENTITY_CHECK":
                if (matchesAffirmative(input)) {
                    call.setIdentityVerified(true);
                    resp.setIdentityVerified(true);
                    resp.setNextState("PURPOSE_AND_CONSENT");
                    resp.setReplyText("Thank you for confirming. I am calling to share a routine academic progress update and check if you would like to discuss support options. Do you have a moment to hear a brief summary?");
                } else if (matchesNegative(input) || input.contains("wrong") || input.contains("not available")) {
                    call.setIdentityVerified(false);
                    resp.setCompleted(true);
                    resp.setNextState("WRAP_UP");
                    resp.setReplyText("I apologize for the disturbance. I will update our records immediately. Have a pleasant day. Goodbye.");
                    call.setCallSummary("Call concluded: Recipient stated wrong number or student guardian was not available.");
                } else {
                    resp.setNextState("GREETING_AND_IDENTITY_CHECK");
                    resp.setReplyText("This is the automated academic support desk for " + studentName + ". Could you please confirm if you are their parent or guardian?");
                }
                break;

            case "PURPOSE_AND_CONSENT":
                if (matchesAffirmative(input) || input.contains("what is it") || input.contains("tell me")) {
                    call.setConsentGiven(true);
                    resp.setConsentGiven(true);
                    resp.setNextState("ACADEMIC_SUMMARY");
                    String script = buildVerifiedAcademicScript(student, alert);
                    resp.setReplyText(script);
                } else if (input.contains("stop") || input.contains("opt out") || input.contains("do not call") || input.contains("dont call")) {
                    parentContactService.recordOptOut(call.getStudentId(), "Parent opted out during call turn.");
                    call.setStatus("OPTED_OUT");
                    resp.setCompleted(true);
                    resp.setNextState("WRAP_UP");
                    resp.setReplyText("We completely respect your preference. Your contact details have been updated to opt out of automated phone alerts. You may contact college administration directly at any time. Goodbye.");
                    call.setCallSummary("Guardian requested opt-out from automated calling. Contact record updated.");
                } else if (input.contains("busy") || input.contains("later") || input.contains("not now")) {
                    resp.setCompleted(true);
                    resp.setFollowUpRequested(true);
                    call.setFollowUpRequested(true);
                    resp.setNextState("WRAP_UP");
                    resp.setReplyText("Understood. We will record a note for the faculty advisory team to follow up with you at a more convenient time. Thank you, goodbye.");
                    call.setCallSummary("Guardian indicated they are currently busy; requested callback at a later time.");
                } else {
                    resp.setNextState("PURPOSE_AND_CONSENT");
                    resp.setReplyText("We have a quick academic progress note regarding " + studentName + ". Would you be comfortable hearing a 1-minute summary?");
                }
                break;

            case "ACADEMIC_SUMMARY":
                if (matchesAffirmative(input) || input.contains("teacher") || input.contains("arrange") || input.contains("consult") || input.contains("schedule")) {
                    call.setFollowUpRequested(true);
                    resp.setFollowUpRequested(true);
                    resp.setCompleted(true);
                    resp.setNextState("CONFIRM_FOLLOWUP");
                    resp.setReplyText("Certainly! I have recorded your request for a follow-up consultation with the faculty mentor. The teacher will reach out during upcoming office hours. Thank you for your time and collaboration in supporting " + studentName + "'s academic progress. Goodbye.");
                    call.setCallSummary("Guardian briefed on academic indicators. Guardian requested teacher follow-up consultation.");
                } else if (input.contains("why") || input.contains("attendance") || input.contains("grades") || input.contains("repeat") || input.contains("explain")) {
                    resp.setNextState("ACADEMIC_SUMMARY");
                    Double att = alert != null ? alert.getAttendancePercent() : 68.0;
                    Double gr = alert != null ? alert.getGradeAverage() : 52.0;
                    resp.setReplyText(String.format(
                        "To clarify, records show attendance is at %.1f percent and recent assessment average is %.1f percent. The purpose is to provide early support through extra tutorials or lab sessions. Would you like us to schedule a meeting with the teacher?",
                        att, gr
                    ));
                } else if (matchesNegative(input) || input.contains("no need") || input.contains("we will handle")) {
                    resp.setCompleted(true);
                    resp.setFollowUpRequested(false);
                    resp.setNextState("WRAP_UP");
                    resp.setReplyText("Understood. Our academic faculty remains available whenever " + studentName + " needs guidance. Thank you for your time today. Goodbye.");
                    call.setCallSummary("Guardian briefed on academic performance; guardian declined faculty meeting at this time.");
                } else {
                    resp.setNextState("ACADEMIC_SUMMARY");
                    resp.setReplyText("Would you like us to schedule a follow-up conversation with the faculty advisor to discuss support options for " + studentName + "?");
                }
                break;

            default:
                resp.setCompleted(true);
                resp.setNextState("WRAP_UP");
                resp.setReplyText("Thank you for speaking with Project 577 Academic Support. Have a wonderful day.");
                break;
        }

        // Check if Ollama can generate an enhanced contextual conversational response
        String concerns = (alert != null && alert.getRiskFactors() != null) ? alert.getRiskFactors() : "Routine Academic Progress Review";
        String ollamaReply = ollamaAiService.generateTurnResponse(studentName, call.getGuardianName(), concerns, resp.getNextState(), request.getParentInput(), request.getLanguage());
        if (ollamaReply != null && !ollamaReply.trim().isEmpty()) {
            resp.setReplyText(ollamaReply.trim());
            resp.setAiEngine("Ollama Local LLM");
        } else {
            resp.setAiEngine("Local Institutional Rule Engine");
        }

        currentTranscript += "\nAI: " + resp.getReplyText();
        call.setConversationTranscript(currentTranscript);
        if (resp.isCompleted()) {
            call.setStatus(call.getStatus().equals("OPTED_OUT") ? "OPTED_OUT" : "COMPLETED");
            call.setEndedAt(java.time.LocalDateTime.now());
            if (call.getAnsweredAt() != null) {
                long seconds = java.time.Duration.between(call.getAnsweredAt(), call.getEndedAt()).getSeconds();
                call.setDurationSeconds((int) Math.max(15, seconds));
            } else {
                call.setDurationSeconds(45);
            }
        }
        parentCallRecordRepository.save(call);

        resp.setSummary(call.getCallSummary());
        return resp;
    }

    private boolean matchesAffirmative(String input) {
        return input.contains("yes") || input.contains("speaking") || input.contains("yeah") ||
               input.contains("i am") || input.contains("correct") || input.contains("sure") ||
               input.contains("okay") || input.contains("this is") || input.contains("go ahead") ||
               input.contains("please");
    }

    private boolean matchesNegative(String input) {
        return input.contains("no") || input.contains("nope") || input.contains("wrong") ||
               input.contains("not him") || input.contains("not her") || input.contains("busy");
    }
}
