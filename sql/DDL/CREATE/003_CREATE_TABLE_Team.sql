DROP TABLE IF EXISTS jengadb.Team;

CREATE TABLE jengadb.Team(
    id INT NOT NULL,
    fkProjectId INT NOT NULL,
    name VARCHAR (64) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (fkProjectId) REFERENCES jengadb.Project(id)
)