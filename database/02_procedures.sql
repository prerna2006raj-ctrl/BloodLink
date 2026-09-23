-- 02_procedures.sql
USE bloodbank_db;

DELIMITER //

CREATE PROCEDURE FindMatchingUnits(
    IN p_blood_group VARCHAR(3),
    IN p_units_needed INT
)
BEGIN
    CREATE TEMPORARY TABLE compatible_groups (bg VARCHAR(3));

    IF p_blood_group = 'O-' THEN
        INSERT INTO compatible_groups VALUES ('O-');
    ELSEIF p_blood_group = 'O+' THEN
        INSERT INTO compatible_groups VALUES ('O-'),('O+');
    ELSEIF p_blood_group = 'A-' THEN
        INSERT INTO compatible_groups VALUES ('O-'),('A-');
    ELSEIF p_blood_group = 'A+' THEN
        INSERT INTO compatible_groups VALUES ('O-'),('O+'),('A-'),('A+');
    ELSEIF p_blood_group = 'B-' THEN
        INSERT INTO compatible_groups VALUES ('O-'),('B-');
    ELSEIF p_blood_group = 'B+' THEN
        INSERT INTO compatible_groups VALUES ('O-'),('O+'),('B-'),('B+');
    ELSEIF p_blood_group = 'AB-' THEN
        INSERT INTO compatible_groups VALUES ('O-'),('A-'),('B-'),('AB-');
    ELSEIF p_blood_group = 'AB+' THEN
        INSERT INTO compatible_groups VALUES ('O-'),('O+'),('A-'),('A+'),('B-'),('B+'),('AB-'),('AB+');
    END IF;

    SELECT unit_id, blood_group, collected_date, expiry_date
    FROM BloodUnit
    WHERE blood_group IN (SELECT bg FROM compatible_groups)
      AND status = 'available'
      AND expiry_date >= CURDATE()
    ORDER BY expiry_date ASC
    LIMIT p_units_needed;

    DROP TEMPORARY TABLE compatible_groups;
END //

DELIMITER ;