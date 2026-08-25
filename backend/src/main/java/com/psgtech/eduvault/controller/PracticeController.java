package com.psgtech.eduvault.controller;

import com.psgtech.eduvault.dto.assessment.CodeExecutionResultDTO;
import com.psgtech.eduvault.dto.assessment.CodeSubmitRequest;
import com.psgtech.eduvault.entity.CodingTestCase;
import com.psgtech.eduvault.entity.User;
import com.psgtech.eduvault.repository.UserRepository;
import com.psgtech.eduvault.service.CodeExecutionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/practice")
public class PracticeController {

    private final CodeExecutionService codeExecutionService;
    private final UserRepository userRepository;

    public PracticeController(CodeExecutionService codeExecutionService, UserRepository userRepository) {
        this.codeExecutionService = codeExecutionService;
        this.userRepository = userRepository;
    }

    @PostMapping("/execute")
    public ResponseEntity<CodeExecutionResultDTO> executeCode(
            @Valid @RequestBody PracticeExecuteRequest request,
            Authentication auth) {
        User student = userRepository.findByEmail(auth.getName()).orElseThrow();
        
        // Create a single dummy test case for practice execution to capture stdout
        List<CodingTestCase> tempCases = new java.util.ArrayList<>();
        CodingTestCase ctc = new CodingTestCase();
        ctc.setId(System.nanoTime()); // Dummy ID for matching in response
        ctc.setInput(request.getInput() != null ? request.getInput() : "");
        ctc.setExpectedOutput("");
        ctc.setHidden(false);
        tempCases.add(ctc);

        return ResponseEntity.ok(codeExecutionService.execute(student, null, request.getLanguage(), request.getCode(), tempCases));
    }
}
