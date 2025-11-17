DROP TABLE IF EXISTS jengadb.Project;

CREATE TABLE jengadb.Project(
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR (64) NOT NULL,
    goalDescription VARCHAR (256) NOT NULL,
    status VARCHAR (32) NOT NULL,
    fkUserId INT NOT NULL,
    dateTimeCreated datetime DEFAULT CURRENT_TIMESTAMP,
    dateTimeModified datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (fkUserId) REFERENCES jengadb.User(id)
)