DROP TABLE IF EXISTS jengadb.TeamMember;

CREATE TABLE jengadb.TeamMember(
    fkTeamId INT NOT NULL,
    fkMemberId INT NOT NULL,
    PRIMARY KEY (fkTeamId, fkMemberId),
    FOREIGN KEY (fkTeamId) REFERENCES jengadb.Team(id),
    FOREIGN KEY (fkMemberId) REFERENCES jengadb.Member(id)
)