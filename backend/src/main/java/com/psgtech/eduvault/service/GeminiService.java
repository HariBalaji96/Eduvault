package com.psgtech.eduvault.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.psgtech.eduvault.dto.AiAnalysisDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiAnalysisDTO analyzeCode(String code, String language) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("API key is not configured.");
        }

        String url = "https://api.groq.com/openai/v1/chat/completions";

        String prompt = "Analyze the following " + language + " code. Provide the Time Complexity, Space Complexity, and Tips for optimal solution. " +
                "Return ONLY a valid JSON object without markdown formatting, with exactly these three string keys: \"timeComplexity\", \"spaceComplexity\", and \"tips\".\n" +
                "Code:\n" + code;

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> requestBodyMap = new HashMap<>();
        requestBodyMap.put("model", "openai/gpt-oss-20b");
        requestBodyMap.put("messages", List.of(message));

        try {
            String requestBody = objectMapper.writeValueAsString(requestBodyMap);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            String responseText = root.path("choices").get(0).path("message").path("content").asText();

            // Cleanup markdown if present (e.g., ```json ... ```)
            responseText = responseText.replaceAll("(?s)```json\\s*(.*?)\\s*```", "$1");
            responseText = responseText.replaceAll("(?s)```\\s*(.*?)\\s*```", "$1");

            JsonNode parsedResponse = objectMapper.readTree(responseText);
            AiAnalysisDTO dto = new AiAnalysisDTO();
            dto.setTimeComplexity(parsedResponse.path("timeComplexity").asText());
            dto.setSpaceComplexity(parsedResponse.path("spaceComplexity").asText());
            dto.setTips(parsedResponse.path("tips").asText());
            return dto;
        } catch (Exception e) {
            throw new RuntimeException("Failed to analyze code with Groq: " + e.getMessage());
        }
    }

    public com.psgtech.eduvault.dto.AiEvaluationResultDTO autoEvaluateDescriptiveAnswer(String questionText, String modelAnswer, String studentAnswer, double maxMarks) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("API key is not configured.");
        }

        String url = "https://api.groq.com/openai/v1/chat/completions";

        String prompt = "You are an AI assistant grading a student's descriptive answer.\n" +
                "Question: " + questionText + "\n" +
                "Model Answer / Key: " + modelAnswer + "\n" +
                "Student Answer: " + studentAnswer + "\n" +
                "Max Marks: " + maxMarks + "\n\n" +
                "Grade the student's answer based on how well it matches the model answer.\n" +
                "Return ONLY a valid JSON object without markdown formatting, with exactly two keys:\n" +
                "\"score\" (a number representing the marks awarded out of max marks)\n" +
                "\"feedback\" (a string with a short constructive feedback note explaining the score).\n";

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> requestBodyMap = new HashMap<>();
        requestBodyMap.put("model", "openai/gpt-oss-20b");
        requestBodyMap.put("messages", List.of(message));
        requestBodyMap.put("temperature", 0.1);

        try {
            String requestBody = objectMapper.writeValueAsString(requestBodyMap);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            String responseText = root.path("choices").get(0).path("message").path("content").asText();

            responseText = responseText.replaceAll("(?s)```json\\s*(.*?)\\s*```", "$1");
            responseText = responseText.replaceAll("(?s)```\\s*(.*?)\\s*```", "$1");

            JsonNode parsedResponse = objectMapper.readTree(responseText);
            com.psgtech.eduvault.dto.AiEvaluationResultDTO dto = new com.psgtech.eduvault.dto.AiEvaluationResultDTO();
            dto.setScore(parsedResponse.path("score").asDouble());
            dto.setFeedback(parsedResponse.path("feedback").asText());
            return dto;
        } catch (Exception e) {
            throw new RuntimeException("Failed to evaluate answer with Groq: " + e.getMessage());
        }
    }
}
