DROP TABLE IF EXISTS jengadb.GenerationHistory;

CREATE TABLE jengadb.GenerationHistory(
    fkProjectId INT NOT NULL,
    fkPromptId INT NOT NULL,
    llmResponse TEXT,
    dateTimeCreated datetime DEFAULT CURRENT_TIMESTAMP,
    dateTimeModified datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (fkProjectId, fkPromptId),
    FOREIGN KEY (fkProjectId) REFERENCES jengadb.Project(id),
    FOREIGN KEY (fkPromptId) REFERENCES jengadb.Prompts(id)
)


SELECT * FROM jengadb.Prompts;