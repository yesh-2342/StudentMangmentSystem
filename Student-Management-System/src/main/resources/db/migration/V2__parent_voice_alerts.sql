-- Project 577 - AI-Powered Parent Phone Call Alerts & Academic Risk System
-- Database Migration V2: Parent Contacts, Academic Alerts, and Call Records

-- 1. Parent/Guardian Contacts & Communication Preferences
CREATE TABLE IF NOT EXISTS parent_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    guardian_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(50) NOT NULL DEFAULT 'GUARDIAN',
    phone_number VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    preferred_language VARCHAR(30) DEFAULT 'en-IN',
    consent_status VARCHAR(30) NOT NULL DEFAULT 'CONSENTED',
    opt_out_date DATETIME NULL,
    last_contacted_at DATETIME NULL,
    notes VARCHAR(1000),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_parent_student_id (student_id),
    INDEX idx_parent_phone (phone_number),
    CONSTRAINT fk_parent_contact_student FOREIGN KEY (student_id) REFERENCES student (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Academic Alerts (At-Risk Student Alerts)
CREATE TABLE IF NOT EXISTS academic_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NULL,
    course_name VARCHAR(150),
    risk_level VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    risk_factors VARCHAR(500) NOT NULL,
    attendance_percent DOUBLE,
    grade_average DOUBLE,
    missing_assignments INT DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'ELIGIBLE',
    reviewed_by VARCHAR(100),
    reviewed_at DATETIME NULL,
    recommended_action VARCHAR(500),
    script_preview VARCHAR(2000),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_alert_student (student_id),
    INDEX idx_alert_status (status),
    INDEX idx_alert_risk_level (risk_level),
    CONSTRAINT fk_alert_student FOREIGN KEY (student_id) REFERENCES student (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Parent Call Records (Real & Simulated Call Executions & Outcomes)
CREATE TABLE IF NOT EXISTS parent_call_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alert_id INT NULL,
    student_id INT NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    guardian_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(50),
    phone_number VARCHAR(30) NOT NULL,
    call_type VARCHAR(30) NOT NULL DEFAULT 'SIMULATED',
    provider VARCHAR(30) NOT NULL DEFAULT 'SIMULATION',
    provider_call_sid VARCHAR(100),
    idempotency_key VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(40) NOT NULL DEFAULT 'QUEUED',
    initiated_by VARCHAR(100) NOT NULL,
    initiated_at DATETIME NOT NULL,
    answered_at DATETIME NULL,
    ended_at DATETIME NULL,
    duration_seconds INT NULL,
    identity_verified BOOLEAN DEFAULT FALSE,
    consent_given BOOLEAN DEFAULT FALSE,
    follow_up_requested BOOLEAN DEFAULT FALSE,
    call_summary VARCHAR(2000),
    conversation_transcript VARCHAR(5000),
    error_code VARCHAR(50),
    error_message VARCHAR(500),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_call_student (student_id),
    INDEX idx_call_alert (alert_id),
    INDEX idx_call_status (status),
    INDEX idx_call_idempotency (idempotency_key),
    INDEX idx_call_provider_sid (provider_call_sid),
    CONSTRAINT fk_call_student FOREIGN KEY (student_id) REFERENCES student (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
