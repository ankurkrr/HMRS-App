-- ============================================================
-- HRMS Lite — MySQL Schema
-- Run this in MySQL Workbench to create the database schema.
-- ============================================================

-- Create the database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS hrms_lite CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE hrms_lite;

-- -----------------------------------------------------------
-- Table: employee
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee (
    id              CHAR(36)        NOT NULL PRIMARY KEY,
    employee_code   VARCHAR(20)     NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    department      VARCHAR(100)    NOT NULL,
    designation     VARCHAR(100)    DEFAULT NULL,
    date_of_joining DATE            NOT NULL,
    phone           VARCHAR(20)     DEFAULT NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- INV-1: email is globally unique
    CONSTRAINT uq_employee_email       UNIQUE (email),
    -- INV-2: employee_code is globally unique
    CONSTRAINT uq_employee_code        UNIQUE (employee_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for filtered queries
CREATE INDEX idx_employee_department ON employee (department);
CREATE INDEX idx_employee_is_active  ON employee (is_active);


-- -----------------------------------------------------------
-- Table: attendance
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    id              CHAR(36)        NOT NULL PRIMARY KEY,
    employee_id     CHAR(36)        NOT NULL,
    date            DATE            NOT NULL,
    status          VARCHAR(20)     NOT NULL,
    check_in        TIME            DEFAULT NULL,
    check_out       TIME            DEFAULT NULL,
    notes           TEXT            DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- INV-3: one attendance record per employee per date
    CONSTRAINT uq_attendance_emp_date  UNIQUE (employee_id, date),

    -- INV-4 + INV-8: FK with CASCADE delete
    CONSTRAINT fk_attendance_employee  FOREIGN KEY (employee_id)
        REFERENCES employee (id) ON DELETE CASCADE,

    -- INV-6: closed set of status values
    CONSTRAINT ck_attendance_status    CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for filtered/sorted queries
CREATE INDEX idx_attendance_date        ON attendance (date);
CREATE INDEX idx_attendance_employee_id ON attendance (employee_id);
CREATE INDEX idx_attendance_status      ON attendance (status);
