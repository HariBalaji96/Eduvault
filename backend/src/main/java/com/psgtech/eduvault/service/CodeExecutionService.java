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
import java.util.stream.Collectors;

@Service
public class CodeExecutionService {

    private final CodeExecutionRepository codeExecutionRepository;
    private final StreakService streakService;

    public CodeExecutionService(CodeExecutionRepository codeExecutionRepository, StreakService streakService) {
        this.codeExecutionRepository = codeExecutionRepository;
        this.streakService = streakService;
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

            if (compiled && testCases != null) {
                // Execution Phase
                for (CodingTestCase testCase : testCases) {
                    String[] execCmd = getExecutionCommand(language, tempDir.toAbsolutePath().toString());
                    ProcessResult execResult = runCommand(tempDir.toFile(), testCase.getInput(), 5, execCmd);

                    String rawActualOutput = execResult.stdout != null ? execResult.stdout : "";
                    String normalizedActual = normalizeOutput(rawActualOutput);
                    String normalizedExpected = normalizeOutput(testCase.getExpectedOutput());

                    boolean passed = false;
                    if (execResult.exitCode == 0 && normalizedActual.equals(normalizedExpected)) {
                        passed = true;
                        passedCount++;
                    }

                    results.add(TestCaseResultDTO.builder()
                            .testCaseId(testCase.getId())
                            .input(testCase.getInput())
                            .expectedOutput(normalizedExpected)
                            .passed(passed)
                            .actualOutput(normalizedActual)
                            .stderr(execResult.stderr != null ? execResult.stderr.trim() : "")
                            .isHidden(testCase.isHidden())
                            .build());
                }
            }

            com.psgtech.eduvault.dto.streak.StudentStreakDTO streakDTO = null;

            if (student != null) {
                // Save Execution Record for both practice and assessment coding executions
                CodeExecution execRecord = new CodeExecution();
                execRecord.setStudent(student);
                execRecord.setQuestion(question);
                execRecord.setLanguage(language);
                execRecord.setCode(code);
                execRecord.setCompiled(compiled);
                execRecord.setCompileError(compileError);
                execRecord.setPassedCount(passedCount);
                int totalCases = testCases != null ? testCases.size() : 0;
                execRecord.setTotalCount(totalCases);
                execRecord.setStatus(compiled ? ((totalCases == 0 || passedCount == totalCases) ? ExecutionStatus.SUCCESS : ExecutionStatus.FAILED) : ExecutionStatus.COMPILE_ERROR);
                execRecord.setExecutedAt(LocalDateTime.now());
                codeExecutionRepository.save(execRecord);

                // Update student daily coding streak
                streakDTO = streakService.recordExecution(student);
            }

            return CodeExecutionResultDTO.builder()
                    .compiled(compiled)
                    .compileError(compileError)
                    .results(results)
                    .currentStreak(streakDTO != null ? streakDTO.getCurrentStreak() : null)
                    .highestStreak(streakDTO != null ? streakDTO.getHighestStreak() : null)
                    .streakUpdated(streakDTO != null && streakDTO.isActiveToday())
                    .streakMessage(streakDTO != null ? streakDTO.getMessage() : null)
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
            case "javascript":
            case "js": return "solution.js";
            case "python": return "script.py";
            case "cpp": return "main.cpp";
            default: throw new IllegalArgumentException("Unsupported language: " + language);
        }
    }

    private String[] getExecutionCommand(String language, String tempDirPath) {
        switch (language.toLowerCase()) {
            case "java": return new String[]{"java", "Main"};
            case "javascript":
            case "js": return new String[]{"node", "solution.js"};
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
                String fullInput = input.endsWith("\n") ? input : input + "\n";
                os.write(fullInput.getBytes());
                os.flush();
            } catch (IOException e) {
                // Ignore broken pipe exceptions when the process exits before reading input
            }
        } else {
            try {
                process.getOutputStream().close();
            } catch (IOException ignored) {}
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

    private String normalizeOutput(String str) {
        if (str == null) {
            return "";
        }
        return str.replace("\r\n", "\n")
                  .replace("\r", "\n")
                  .lines()
                  .map(String::stripTrailing)
                  .collect(Collectors.joining("\n"))
                  .trim();
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
