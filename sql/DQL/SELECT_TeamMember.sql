SELECT * FROM jengadb.TeamMember;

SELECT t.name AS teamName,
       CONCAT(m.firstName, " ", m.lastName) AS memberName
FROM jengadb.TeamMember tm
LEFT JOIN jengadb.Team t on tm.teamId = t.id
LEFT JOIN jengadb.Member m on tm.memberId = m.id
ORDER BY t.name;

SELECT t.name AS teamName,
       CONCAT(m.firstName, " ", m.lastName) AS memberName
FROM jengadb.TeamMember tm
LEFT JOIN jengadb.Team t on tm.teamId = t.id
LEFT JOIN jengadb.Member m on tm.memberId = m.id
WHERE t.name = 'Blue Sky Thinking';
