package com.Studentmangment.studentmanagement.dto;

import java.util.List;

public class ChatResponseDto {
    private String sessionId;
    private ChatMessageDto message;
    private List<String> suggestions;

    public ChatResponseDto() {}

    public ChatResponseDto(String sessionId, ChatMessageDto message, List<String> suggestions) {
        this.sessionId = sessionId;
        this.message = message;
        this.suggestions = suggestions;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public ChatMessageDto getMessage() {
        return message;
    }

    public void setMessage(ChatMessageDto message) {
        this.message = message;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }
}
