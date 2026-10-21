package com.Studentmangment.studentmanagement.service;

import java.util.concurrent.atomic.AtomicReference;

import org.springframework.stereotype.Service;

import com.Studentmangment.studentmanagement.dto.RiskThresholdConfig;

@Service
public class AcademicRiskConfigService {

    private final AtomicReference<RiskThresholdConfig> configRef = new AtomicReference<>(new RiskThresholdConfig());

    public RiskThresholdConfig getConfig() {
        return configRef.get();
    }

    public RiskThresholdConfig updateConfig(RiskThresholdConfig newConfig) {
        if (newConfig == null) return configRef.get();

        RiskThresholdConfig current = configRef.get();
        if (newConfig.getAttendanceThreshold() > 0) {
            current.setAttendanceThreshold(newConfig.getAttendanceThreshold());
        }
        if (newConfig.getMarksThreshold() > 0) {
            current.setMarksThreshold(newConfig.getMarksThreshold());
        }
        if (newConfig.getMissingAssignmentsThreshold() >= 0) {
            current.setMissingAssignmentsThreshold(newConfig.getMissingAssignmentsThreshold());
        }
        if (newConfig.getPreferredLanguage() != null && !newConfig.getPreferredLanguage().trim().isEmpty()) {
            current.setPreferredLanguage(newConfig.getPreferredLanguage().trim());
        }
        if (newConfig.getDefaultTemplate() != null && !newConfig.getDefaultTemplate().trim().isEmpty()) {
            current.setDefaultTemplate(newConfig.getDefaultTemplate().trim());
        }
        if (newConfig.getOllamaModel() != null && !newConfig.getOllamaModel().trim().isEmpty()) {
            current.setOllamaModel(newConfig.getOllamaModel().trim());
        }
        if (newConfig.getOllamaEndpoint() != null && !newConfig.getOllamaEndpoint().trim().isEmpty()) {
            current.setOllamaEndpoint(newConfig.getOllamaEndpoint().trim());
        }

        configRef.set(current);
        return current;
    }
}
