DROP TABLE IF EXISTS jengadb.GenerationFeedback;

CREATE TABLE jengadb.GenerationFeedback(
    generationHistoryId INT NOT NULL,
    userId INT NOT NULL,
    feedbackMessage TEXT,
    dateTimeCreated datetime DEFAULT CURRENT_TIMESTAMP,
    dateTimeModified datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (generationHistoryId, userId),
    FOREIGN KEY (generationHistoryId) REFERENCES jengadb.Project(id),
    FOREIGN KEY (userId) REFERENCES jengadb.Prompts(id)
)