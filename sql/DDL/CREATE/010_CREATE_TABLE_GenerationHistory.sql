DROP TABLE IF EXISTS jengadb.GenerationHistory;

CREATE TABLE jengadb.GenerationHistory(
    projectId INT NOT NULL,
    promptId INT NOT NULL,
    llmResponse TEXT,
    dateTimeCreated datetime DEFAULT CURRENT_TIMESTAMP,
    dateTimeModified datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (projectId, promptId),
    FOREIGN KEY (projectId) REFERENCES jengadb.Project(id),
    FOREIGN KEY (promptId) REFERENCES jengadb.Prompts(id)
)


SELECT * FROM jengadb.Prompts;