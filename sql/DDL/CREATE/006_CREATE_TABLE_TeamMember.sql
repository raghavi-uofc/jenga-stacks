DROP TABLE IF EXISTS jengadb.TeamMember;

CREATE TABLE jengadb.TeamMember(
    teamId INT NOT NULL,
    memberId INT NOT NULL,
    PRIMARY KEY (teamId, memberId),
    FOREIGN KEY (teamId) REFERENCES jengadb.Team(id),
    FOREIGN KEY (memberId) REFERENCES jengadb.Member(id)
)