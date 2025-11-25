USE jengadb;
SET @prompt_id = 0;
CALL sp_add_prompt(
    1,
    'Test prompt for ENSF 607/608 project',
    @prompt_id
);
SELECT @prompt_id AS NewPromptId;
SET @history_id = 0;
CALL sp_add_generation_history(
    1,
    @prompt_id,
    'Sample LLM response for testing',
    @history_id
);
SELECT @history_id AS NewHistoryId;
CALL sp_get_generation_history_by_project(1);