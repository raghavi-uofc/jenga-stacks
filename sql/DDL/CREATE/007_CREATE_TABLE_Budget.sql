DROP TABLE IF EXISTS jengadb.Budget;

CREATE TABLE jengadb.Budget(
    id INT NOT NULL,
    fkProjectId INT NOT NULL,
    floor DECIMAL(10,2),
    ceiling DECIMAL(10,2),
    PRIMARY KEY (id),
    FOREIGN KEY (fkProjectId) REFERENCES jengadb.Project(id)
)