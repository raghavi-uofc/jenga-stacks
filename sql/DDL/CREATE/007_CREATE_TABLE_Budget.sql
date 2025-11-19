DROP TABLE IF EXISTS jengadb.Budget;

CREATE TABLE jengadb.Budget(
    id INT NOT NULL,
    projectId INT NOT NULL,
    floor DECIMAL(10,2),
    ceiling DECIMAL(10,2),
    PRIMARY KEY (id),
    FOREIGN KEY (projectId) REFERENCES jengadb.Project(id)
)