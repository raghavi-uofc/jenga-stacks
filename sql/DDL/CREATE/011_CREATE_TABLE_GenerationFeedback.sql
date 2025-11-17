DROP TABLE IF EXISTS jengadb.GenerationFeedback;

CREATE TABLE jengadb.GenerationFeedback(
    fkGenerationHistoryId INT NOT NULL,
    fkUserId INT NOT NULL,
    feedbackMessage TEXT,
    dateTimeCreated datetime DEFAULT CURRENT_TIMESTAMP,
    dateTimeModified datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (fkGenerationHistoryId, fkUserId),
    FOREIGN KEY (fkGenerationHistoryId) REFERENCES jengadb.Project(id),
    FOREIGN KEY (fkUserId) REFERENCES jengadb.Prompts(id)
)