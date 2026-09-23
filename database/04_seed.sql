-- 04_seed.sql
USE bloodbank_db;

-- Blood Banks
INSERT INTO BloodBank (name, latitude, longitude) VALUES
('City Central Blood Bank', 30.3398, 76.3869),
('Rajpura Blood Center', 30.4830, 76.5940);

-- Hospitals
INSERT INTO Hospital (name, latitude, longitude) VALUES
('Chitkara Hospital', 30.5150, 76.6560),
('Patiala General Hospital', 30.3398, 76.3869);

-- Donors
INSERT INTO Donor (name, blood_group, phone, latitude, longitude, last_donated) VALUES
('Amit Sharma', 'O-', '9876500001', 30.3398, 76.3869, '2026-06-01'),
('Priya Verma', 'A+', '9876500002', 30.4830, 76.5940, '2026-07-15'),
('Rahul Singh', 'B+', '9876500003', 30.3398, 76.3869, '2026-05-20'),
('Neha Kaur', 'AB+', '9876500004', 30.4830, 76.5940, '2026-08-01'),
('Karan Mehta', 'O+', '9876500005', 30.3398, 76.3869, '2026-04-10');

-- Blood Units (mix of expiry dates to test FIFO)
INSERT INTO BloodUnit (donor_id, bank_id, blood_group, collected_date, expiry_date, status) VALUES
(1, 1, 'O-', '2026-08-01', '2026-09-12', 'available'),  -- close to expiry
(1, 1, 'O-', '2026-09-10', '2026-10-22', 'available'),  -- fresher
(2, 2, 'A+', '2026-08-20', '2026-10-01', 'available'),
(3, 1, 'B+', '2026-08-25', '2026-10-06', 'available'),
(4, 2, 'AB+', '2026-09-01', '2026-10-13', 'available'),
(5, 1, 'O+', '2026-08-15', '2026-09-26', 'available');