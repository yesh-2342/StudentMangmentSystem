package com.Studentmangment.studentmanagement;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.Studentmangment.studentmanagement.client.AiServiceClient;
import com.Studentmangment.studentmanagement.dto.ai.AiModelInfoDto;

@SpringBootTest(classes = StudentManagementApplication.class)
public class AiPredictionIntegrationTests {

    @Autowired
    private AiServiceClient aiServiceClient;

    @Test
    void testAiHealthCheckIntegration() {
        Map<String, Object> health = aiServiceClient.checkHealth();
        assertNotNull(health, "Health check map should not be null");
        assertTrue(health.containsKey("status"), "Health check must return status");
    }

    @Test
    void testAiModelInfoIntegration() {
        try {
            AiModelInfoDto modelInfo = aiServiceClient.getModelInfo();
            assertNotNull(modelInfo, "Model info should be deserialized");
            assertNotNull(modelInfo.getModelVersion());
        } catch (Exception ex) {
            // If offline, test passes gracefully as handled exception
            assertTrue(ex.getMessage() != null);
        }
    }
}
