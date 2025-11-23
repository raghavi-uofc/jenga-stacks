USE jengadb;
DROP PROCEDURE IF EXISTS sp_add_prompt;
DELIMITER $$
CREATE PROCEDURE sp_add_prompt (
    IN  p_projectId   BIGINT,
    IN  p_prompt      TEXT,
    OUT p_promptId    BIGINT
)
BEGIN
    DECLARE v_next_version INT;
    IF NOT EXISTS (SELECT 1 FROM Project WHERE id = p_projectId) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Project not found for given projectId.';
    END IF;
    SELECT COALESCE(MAX(version), 0) + 1
      INTO v_next_version
      FROM Prompt
     WHERE projectId = p_projectId;
    INSERT INTO Prompt (projectId, prompt, version)
    VALUES (p_projectId, p_prompt, v_next_version);
    SET p_promptId = LAST_INSERT_ID();
END$$
DELIMITER ;
DROP PROCEDURE IF EXISTS sp_add_generation_history;
DELIMITER $$
CREATE PROCEDURE sp_add_generation_history (
    IN  p_projectId     BIGINT,
    IN  p_promptId      BIGINT,
    IN  p_llmResponse   TEXT,
    OUT p_historyId     BIGINT
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Project WHERE id = p_projectId) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Project not found for given projectId.';
    END IF;
    IF NOT EXISTS (
        SELECT 1
          FROM Prompt
         WHERE id = p_promptId
           AND projectId = p_projectId
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Prompt not found for given promptId and projectId.';
    END IF;
    INSERT INTO GenerationHistory (projectId, promptId, llmResponse)
    VALUES (p_projectId, p_promptId, p_llmResponse);
    SET p_historyId = LAST_INSERT_ID();
END$$
DELIMITER ;
DROP PROCEDURE IF EXISTS sp_get_generation_history_by_project;
DELIMITER $$
CREATE PROCEDURE sp_get_generation_history_by_project (
    IN p_projectId BIGINT
)
BEGIN
    SELECT gh.id,
           gh.projectId,
           gh.promptId,
           p.prompt,
           p.version,
           gh.llmResponse,
           gh.dateTimeCreated,
           gh.dateTimeUpdated
      FROM GenerationHistory gh
      JOIN Prompt p ON gh.promptId = p.id
     WHERE gh.projectId = p_projectId
     ORDER BY gh.dateTimeCreated DESC, gh.id DESC;
END$$
DELIMITER ;