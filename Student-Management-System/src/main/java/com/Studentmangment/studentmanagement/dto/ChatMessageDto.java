package com.Studentmangment.studentmanagement.dto;

import java.time.Instant;
import java.util.List;

public class ChatMessageDto {
    private String id;
    private String sender; // "USER" or "ASSISTANT"
    private String text;
    private Instant timestamp;
    private boolean verifiedRecord;
    private String category;
    private List<String> evidenceItems;
    private List<String> suggestedNextActions;

    public ChatMessageDto() {
        this.timestamp = Instant.now();
    }

    public ChatMessageDto(String id, String sender, String text, boolean verifiedRecord, String category) {
        this.id = id;
        this.sender = sender;
        this.text = text;
        this.timestamp = Instant.now();
        this.verifiedRecord = verifiedRecord;
        this.category = category;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isVerifiedRecord() {
        return verifiedRecord;
    }

    public void setVerifiedRecord(boolean verifiedRecord) {
        this.verifiedRecord = verifiedRecord;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<String> getEvidenceItems() {
        return evidenceItems;
    }

    public void setEvidenceItems(List<String> evidenceItems) {
        this.evidenceItems = evidenceItems;
    }

    public List<String> getSuggestedNextActions() {
        return suggestedNextActions;
    }

    public void setSuggestedNextActions(List<String> suggestedNextActions) {
        this.suggestedNextActions = suggestedNextActions;
    }
}
