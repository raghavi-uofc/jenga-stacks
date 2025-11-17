SELECT * FROM jengadb.TeamMember;

SELECT t.name AS teamName,
       CONCAT(m.firstName, " ", m.lastName) AS memberName
FROM jengadb.TeamMember tm
LEFT JOIN jengadb.Team t on tm.fkTeamId = t.id
LEFT JOIN jengadb.Member m on tm.fkMemberId = m.id
ORDER BY t.name;

SELECT t.name AS teamName,
       CONCAT(m.firstName, " ", m.lastName) AS memberName
FROM jengadb.TeamMember tm
LEFT JOIN jengadb.Team t on tm.fkTeamId = t.id
LEFT JOIN jengadb.Member m on tm.fkMemberId = m.id
WHERE t.name = 'Agile Aces';
