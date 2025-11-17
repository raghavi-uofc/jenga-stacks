DROP TABLE IF EXISTS jengadb.Timeframe;

CREATE TABLE jengadb.Timeframe(
    id INT NOT NULL,
    fkProjectId INT NOT NULL,
    startTime datetime,
    endTime datetime,
    dateTimeCreated datetime DEFAULT CURRENT_TIMESTAMP,
    dateTimeModified datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (fkProjectId) REFERENCES jengadb.Project(id)
)