package com.psgtech.eduvault;

import com.psgtech.eduvault.service.GeminiService;
import com.psgtech.eduvault.dto.AiAnalysisDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.junit.jupiter.api.Test;

@SpringBootTest
public class GeminiServiceTest {

    @Autowired
    private GeminiService geminiService;

    @Test
    public void testAnalyze() {
        try {
            System.out.println("Starting AI analysis test...");
            AiAnalysisDTO dto = geminiService.analyzeCode("class Main {}", "java");
            System.out.println("SUCCESS: " + dto);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}
