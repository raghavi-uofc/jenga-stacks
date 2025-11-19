DROP TABLE IF EXISTS jengadb.Member;

CREATE TABLE jengadb.Member(
    id INT NOT NULL AUTO_INCREMENT,
    firstName VARCHAR (64) NOT NULL,
    lastName VARCHAR (64) NOT NULL,
    dateTimeCreated datetime DEFAULT CURRENT_TIMESTAMP,
    dateTimeModified datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

