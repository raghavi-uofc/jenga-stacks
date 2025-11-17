DROP TABLE IF EXISTS jengadb.Skillset;

CREATE TABLE jengadb.Skillset(
    id INT NOT NULL,
    fk_memberId INT NOT NULL,
    skill VARCHAR (64) NOT NULL,
    category VARCHAR (64) NOT NULL,
    description VARCHAR(256) NOT NULL,
    level VARCHAR (32) NOT NULL,
    dateTimeCreated datetime DEFAULT CURRENT_TIMESTAMP,
    dateTimeModified datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (fk_memberId) REFERENCES jengadb.Member(id)
)