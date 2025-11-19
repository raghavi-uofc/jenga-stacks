DROP TABLE IF EXISTS jengadb.Timeframe;

CREATE TABLE jengadb.Timeframe(
    id BIGINT NOT NULL AUTO_INCREMENT,
    projectId INT NOT NULL,
    startTime datetime,
    endTime datetime,
    dateTimeCreated datetime DEFAULT CURRENT_TIMESTAMP,
    dateTimeModified datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (projectId) REFERENCES jengadb.Project(id)
)

CREATE TABLE Timeframe (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    projectId BIGINT NOT NULL COMMENT 'FK to Project table',
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    dateTimeCreated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dateTimeUpdated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE
);