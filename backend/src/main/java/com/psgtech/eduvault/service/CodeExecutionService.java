package com.psgtech.eduvault.service;

import com.psgtech.eduvault.dto.assessment.CodeExecutionResultDTO;
import com.psgtech.eduvault.dto.assessment.TestCaseResultDTO;
import com.psgtech.eduvault.entity.CodeExecution;
import com.psgtech.eduvault.entity.CodingTestCase;
import com.psgtech.eduvault.entity.ExecutionStatus;
import com.psgtech.eduvault.entity.Question;
import com.psgtech.eduvault.entity.User;
import com.psgtech.eduvault.repository.CodeExecutionRepository;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class CodeExecutionService {

    private final CodeExecutionRepository codeExecutionRepository;

    public CodeExecutionService(CodeExecutionRepository codeExecutionRepository) {
        this.codeExecutionRepository = codeExecutionRepository;
    }

    public CodeExecutionResultDTO execute(User student, Question question, String language, String code, List<CodingTestCase> testCases) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("eduvault_exec_");
            String fileName = getFileName(language);
            Files.writeString(tempDir.resolve(fileName), code);

            boolean compiled = true;
            String compileError = null;

            // Compilation Phase
            if (language.equalsIgnoreCase("java")) {
                ProcessResult compileResult = runCommand(tempDir.toFile(), null, 10, "javac", fileName);
                if (compileResult.exitCode != 0) {
                    compiled = false;
                    compileError = compileResult.stderr.isEmpty() ? compileResult.stdout : compileResult.stderr;
                }
            } else if (language.equalsIgnoreCase("cpp")) {
                ProcessResult compileResult = runCommand(tempDir.toFile(), null, 10, "g++", fileName, "-o", "main");
                if (compileResult.exitCode != 0) {
                    compiled = false;
                    compileError = compileResult.stderr.isEmpty() ? compileResult.stdout : compileResult.stderr;
                }
            }

            List<TestCaseResultDTO> results = new ArrayList<>();
            int passedCount = 0;

            if (compiled) {
                // Execution Phase
                for (CodingTestCase testCase : testCases) {
                    String[] execCmd = getExecutionCommand(language, tempDir.toAbsolutePath().toString());
                    ProcessResult execResult = runCommand(tempDir.toFile(), testCase.getInput(), 5, execCmd);

                    boolean passed = false;
                    String actualOutput = execResult.stdout.trim();
                    if (execResult.exitCode == 0 && actualOutput.equals(testCase.getExpectedOutput().trim())) {
                        passed = true;
                        passedCount++;
                    }

                    results.add(TestCaseResultDTO.builder()
                            .testCaseId(testCase.getId())
                            .passed(passed)
                            .actualOutput(actualOutput)
                            .stderr(execResult.stderr.trim())
                            .isHidden(testCase.isHidden())
                            .build());
                }
            }

            if (question != null) {
                // Save Execution Record
                CodeExecution execRecord = new CodeExecution();
                execRecord.setStudent(student);
                execRecord.setQuestion(question);
                execRecord.setLanguage(language);
                execRecord.setCode(code);
                execRecord.setCompiled(compiled);
                execRecord.setCompileError(compileError);
                execRecord.setPassedCount(passedCount);
                execRecord.setTotalCount(testCases.size());
                execRecord.setStatus(compiled ? (passedCount == testCases.size() ? ExecutionStatus.SUCCESS : ExecutionStatus.FAILED) : ExecutionStatus.COMPILE_ERROR);
                execRecord.setExecutedAt(LocalDateTime.now());
                codeExecutionRepository.save(execRecord);
            }

            return CodeExecutionResultDTO.builder()
                    .compiled(compiled)
                    .compileError(compileError)
                    .results(results)
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return CodeExecutionResultDTO.builder().compiled(false).compileError("Server Error: " + e.getMessage()).build();
        } finally {
            if (tempDir != null) {
                deleteDirectory(tempDir.toFile());
            }
        }
    }

    private String getFileName(String language) {
        switch (language.toLowerCase()) {
            case "java": return "Main.java";
            case "python": return "script.py";
            case "cpp": return "main.cpp";
            default: throw new IllegalArgumentException("Unsupported language: " + language);
        }
    }

    private String[] getExecutionCommand(String language, String tempDirPath) {
        switch (language.toLowerCase()) {
            case "java": return new String[]{"java", "Main"};
            case "python": return new String[]{"py", "script.py"};
            case "cpp": return new String[]{"./main"};
            default: throw new IllegalArgumentException("Unsupported language");
        }
    }

    private static class ProcessResult {
        int exitCode;
        String stdout;
        String stderr;
    }

    private ProcessResult runCommand(File workingDir, String input, int timeoutSeconds, String... command) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.directory(workingDir);
        Process process = pb.start();

        if (input != null && !input.isEmpty()) {
            try (OutputStream os = process.getOutputStream()) {
                os.write(input.getBytes());
                os.flush();
            } catch (IOException e) {
                // Ignore broken pipe exceptions when the process exits before reading input
            }
        }

        boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            ProcessResult res = new ProcessResult();
            res.exitCode = -1;
            res.stdout = "";
            res.stderr = "Execution timed out after " + timeoutSeconds + " seconds.";
            return res;
        }

        ProcessResult res = new ProcessResult();
        res.exitCode = process.exitValue();
        res.stdout = new String(process.getInputStream().readAllBytes());
        res.stderr = new String(process.getErrorStream().readAllBytes());
        return res;
    }

    private void deleteDirectory(File dir) {
        if (dir.isDirectory()) {
            File[] files = dir.listFiles();
            if (files != null) {
                for (File file : files) {
                    deleteDirectory(file);
                }
            }
        }
        dir.delete();
    }
}
