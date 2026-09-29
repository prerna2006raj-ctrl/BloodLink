USE bloodbank_db;

DROP PROCEDURE IF EXISTS AllotBloodUnit;

DELIMITER //

CREATE PROCEDURE AllotBloodUnit(
    IN p_request_id INT,
    IN p_unit_id INT,
    OUT p_result VARCHAR(50)
)
BEGIN
    DECLARE v_status VARCHAR(20);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result = 'FAILED: Unit already allotted';
    END;

    START TRANSACTION;

    SELECT status INTO v_status
    FROM BloodUnit
    WHERE unit_id = p_unit_id
    FOR UPDATE;

    IF v_status = 'available' THEN
        INSERT INTO Allotment (request_id, unit_id) VALUES (p_request_id, p_unit_id);
        UPDATE BloodUnit SET status = 'allotted' WHERE unit_id = p_unit_id;
        COMMIT;
        SET p_result = 'SUCCESS: Unit allotted';
    ELSE
        ROLLBACK;
        SET p_result = CONCAT('FAILED: Unit is ', v_status);
    END IF;
END //

DELIMITER ;