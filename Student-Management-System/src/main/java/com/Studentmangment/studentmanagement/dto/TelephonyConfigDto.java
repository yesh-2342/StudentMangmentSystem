package com.Studentmangment.studentmanagement.dto;

import java.util.List;

public class TelephonyConfigDto {
    private String activeMode; // SIMULATION, LIVE
    private String providerName; // SIMULATION, EXOTEL, TWILIO
    private boolean simulationAvailable;
    private boolean liveProviderAvailable;
    private String callerId;
    private String webhookUrl;
    private String feasibilityNotice;
    private List<String> supportedLanguages;

    public TelephonyConfigDto() {}

    public String getActiveMode() { return activeMode; }
    public void setActiveMode(String activeMode) { this.activeMode = activeMode; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public boolean isSimulationAvailable() { return simulationAvailable; }
    public void setSimulationAvailable(boolean simulationAvailable) { this.simulationAvailable = simulationAvailable; }

    public boolean isLiveProviderAvailable() { return liveProviderAvailable; }
    public void setLiveProviderAvailable(boolean liveProviderAvailable) { this.liveProviderAvailable = liveProviderAvailable; }

    public String getCallerId() { return callerId; }
    public void setCallerId(String callerId) { this.callerId = callerId; }

    public String getWebhookUrl() { return webhookUrl; }
    public void setWebhookUrl(String webhookUrl) { this.webhookUrl = webhookUrl; }

    public String getFeasibilityNotice() { return feasibilityNotice; }
    public void setFeasibilityNotice(String feasibilityNotice) { this.feasibilityNotice = feasibilityNotice; }

    public List<String> getSupportedLanguages() { return supportedLanguages; }
    public void setSupportedLanguages(List<String> supportedLanguages) { this.supportedLanguages = supportedLanguages; }
}
