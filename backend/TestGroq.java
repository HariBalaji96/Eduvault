import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

public class TestGroq {
    public static void main(String[] args) throws Exception {
        String apiKey = System.getenv("GROQ_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            System.out.println("GROQ_API_KEY is not set in environment.");
            return;
        }
        String url = "https://api.groq.com/openai/v1/chat/completions";
        
        String prompt = "Analyze the following java code. Return ONLY a valid JSON object without markdown formatting, with exactly these three string keys: \"timeComplexity\", \"spaceComplexity\", and \"tips\".\nCode:\nclass Main {}";
        
        ObjectMapper objectMapper = new ObjectMapper();
        RestTemplate restTemplate = new RestTemplate();
        
        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> requestBodyMap = new HashMap<>();
        requestBodyMap.put("model", "qwen-3.8-27b");
        requestBodyMap.put("messages", List.of(message));

        String requestBody = objectMapper.writeValueAsString(requestBodyMap);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            System.out.println("Raw text: " + response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
