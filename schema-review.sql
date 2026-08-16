-- Schema Review for Eduvault
-- (Auto-generated representation of JPA Entities)

CREATE TABLE assessment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    classroom_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    published_at DATETIME,
    deadline DATETIME,
    total_marks DOUBLE NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (classroom_id) REFERENCES classroom(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE question (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    marks DOUBLE NOT NULL,
    order_index INT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (assessment_id) REFERENCES assessment(id)
);

CREATE TABLE mcq_option (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (question_id) REFERENCES question(id)
);

CREATE TABLE descriptive_model_answer (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL UNIQUE,
    model_answer_text TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (question_id) REFERENCES question(id)
);

CREATE TABLE coding_question_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL UNIQUE,
    problem_statement TEXT NOT NULL,
    input_description TEXT NOT NULL,
    output_description TEXT NOT NULL,
    constraints TEXT,
    sample_input TEXT,
    sample_output TEXT,
    allowed_language VARCHAR(255),
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (question_id) REFERENCES question(id)
);

CREATE TABLE test_case (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coding_question_detail_id BIGINT NOT NULL,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (coding_question_detail_id) REFERENCES coding_question_detail(id)
);

CREATE TABLE submission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    submitted_at DATETIME,
    status VARCHAR(50) NOT NULL,
    total_score DOUBLE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (assessment_id) REFERENCES assessment(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE answer_response (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    mcq_selected_option_id BIGINT,
    descriptive_text TEXT,
    code_submitted TEXT,
    ai_score DOUBLE,
    ai_evaluation_notes TEXT,
    teacher_override_score DOUBLE,
    teacher_feedback TEXT,
    final_score DOUBLE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (submission_id) REFERENCES submission(id),
    FOREIGN KEY (question_id) REFERENCES question(id),
    FOREIGN KEY (mcq_selected_option_id) REFERENCES mcq_option(id)
);
