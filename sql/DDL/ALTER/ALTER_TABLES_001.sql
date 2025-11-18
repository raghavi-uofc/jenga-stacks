ALTER TABLE jengadb.TeamMember
RENAME COLUMN fk_memberId TO fkMemberId;

ALTER TABLE jengadb.TeamMember
RENAME COLUMN fk_teamId TO fkTeamId;