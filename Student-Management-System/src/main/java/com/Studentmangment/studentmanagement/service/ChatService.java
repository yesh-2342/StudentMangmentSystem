package com.Studentmangment.studentmanagement.service;

import java.util.List;
import com.Studentmangment.studentmanagement.dto.ChatMessageDto;
import com.Studentmangment.studentmanagement.dto.ChatRequestDto;
import com.Studentmangment.studentmanagement.dto.ChatResponseDto;

public interface ChatService {
    ChatResponseDto processMessage(String username, ChatRequestDto request);
    List<String> getSuggestedPrompts(String username);
    List<ChatMessageDto> getSessionHistory(String username, String sessionId);
    void clearSession(String username, String sessionId);
}
