DROP TABLE IF EXISTS jengadb.Team;

CREATE TABLE jengadb.Team(
    id INT NOT NULL,
    projectId INT NOT NULL,
    name VARCHAR (64) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (projectId) REFERENCES jengadb.Project(id)
)