DROP TABLE IF EXISTS jengadb.Prompts;

CREATE TABLE jengadb.Prompts(
    id INT NOT NULL,
    fkProjectId INT NOT NULL,
    prompt VARCHAR(1024) NOT NULL,
    version VARCHAR(24) NOT NULL,
    dateTimeCreated datetime DEFAULT CURRENT_TIMESTAMP,
    dateTimeModified datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (fkProjectId) REFERENCES jengadb.Project(id)
)