-- 01_bloodbank_schema.sql
CREATE DATABASE IF NOT EXISTS bloodbank_db;
USE bloodbank_db;

-- Donor
CREATE TABLE Donor (
    donor_id       INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    blood_group    ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,
    phone          VARCHAR(15),
    latitude       DECIMAL(9,6),
    longitude      DECIMAL(9,6),
    last_donated   DATE
);

-- Blood Bank (storage center)
CREATE TABLE BloodBank (
    bank_id        INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    latitude       DECIMAL(9,6),
    longitude      DECIMAL(9,6)
);

-- Blood Unit (individual bag — FIFO/expiry table)
CREATE TABLE BloodUnit (
    unit_id        INT AUTO_INCREMENT PRIMARY KEY,
    donor_id       INT NOT NULL,
    bank_id        INT NOT NULL,
    blood_group    ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,
    collected_date DATE NOT NULL,
    expiry_date    DATE NOT NULL,
    status         ENUM('available','allotted','expired','discarded') DEFAULT 'available',
    FOREIGN KEY (donor_id) REFERENCES Donor(donor_id),
    FOREIGN KEY (bank_id) REFERENCES BloodBank(bank_id)
);

-- Hospital
CREATE TABLE Hospital (
    hospital_id    INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    latitude       DECIMAL(9,6),
    longitude      DECIMAL(9,6)
);

-- Blood Request (emergency request from hospital)
CREATE TABLE BloodRequest (
    request_id     INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id    INT NOT NULL,
    blood_group    ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-') NOT NULL,
    units_needed   INT NOT NULL,
    urgency        ENUM('critical','normal') DEFAULT 'normal',
    request_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status         ENUM('pending','fulfilled','partial','cancelled') DEFAULT 'pending',
    FOREIGN KEY (hospital_id) REFERENCES Hospital(hospital_id)
);

-- Allotment (the actual match — UNIQUE on unit_id prevents double-allotment)
CREATE TABLE Allotment (
    allotment_id   INT AUTO_INCREMENT PRIMARY KEY,
    request_id     INT NOT NULL,
    unit_id        INT NOT NULL UNIQUE,
    allotted_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES BloodRequest(request_id),
    FOREIGN KEY (unit_id) REFERENCES BloodUnit(unit_id)
);