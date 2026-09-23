-- 03_triggers_events.sql
USE bloodbank_db;

-- Enable the event scheduler (needs to be ON for scheduled events to run)
SET GLOBAL event_scheduler = ON;

DELIMITER //

CREATE EVENT IF NOT EXISTS expire_old_units
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    UPDATE BloodUnit
    SET status = 'expired'
    WHERE expiry_date < CURDATE()
      AND status = 'available';

END //

DELIMITER ;