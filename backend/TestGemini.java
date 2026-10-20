import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

public class TestGemini {
    public static void main(String[] args) throws Exception {
        String apiKey = System.getenv("GEMINI_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            System.out.println("GEMINI_API_KEY is not set in environment.");
            return;
        }
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + apiKey;
        
        String prompt = "Analyze the following java code. Provide the Time Complexity, Space Complexity, and Tips for optimal solution. Return ONLY a valid JSON object without markdown formatting, with exactly these three string keys: \"timeComplexity\", \"spaceComplexity\", and \"tips\".\nCode:\nclass Main {}";
        
        ObjectMapper objectMapper = new ObjectMapper();
        RestTemplate restTemplate = new RestTemplate();
        
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> part = new HashMap<>();
        part.put("parts", List.of(textPart));

        Map<String, Object> requestBodyMap = new HashMap<>();
        requestBodyMap.put("contents", List.of(part));

        String requestBody = objectMapper.writeValueAsString(requestBodyMap);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
        JsonNode root = objectMapper.readTree(response.getBody());
        String responseText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        
        System.out.println("Raw text: " + responseText);
        
        responseText = responseText.replaceAll("(?s)```json\\s*(.*?)\\s*```", "$1");
        responseText = responseText.replaceAll("(?s)```\\s*(.*?)\\s*```", "$1");

        JsonNode parsedResponse = objectMapper.readTree(responseText);
        System.out.println("Parsed: " + parsedResponse.toString());
    }
}
