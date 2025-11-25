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

SELECT t.name AS teamName,
       CONCAT(m.firstName, " ", m.lastName) AS memberName
FROM jengadb.TeamMember tm
LEFT JOIN jengadb.Team t on tm.teamId = t.id
LEFT JOIN jengadb.Member m on tm.memberId = m.id
WHERE t.id = 1;



CREATE PROCEDURE sp_getTeamMembers(IN inTeamName VARCHAR(64))
BEGIN
    SELECT m.id,
           CONCAT(m.firstName, " ", m.lastName) AS memberName
    FROM jengadb.TeamMember tm
    LEFT JOIN jengadb.Team t on tm.teamId = t.id
    LEFT JOIN jengadb.Member m on tm.memberId = m.id
    WHERE t.name = inTeamName;
END;

SET @inTeamName = "Mustang Team";
CALL sp_getTeamMembers(@inTeamName);

CREATE PROCEDURE sp_getNumTeamMembersByTeamName(IN inTeamName VARCHAR(64))
BEGIN
    SELECT COUNT(*) AS numberOfTeamMembers
    FROM jengadb.TeamMember tm
    LEFT JOIN jengadb.Team t on tm.teamId = t.id
    LEFT JOIN jengadb.Member m on tm.memberId = m.id
    -- WHERE t.name = inTeamName;
    GROUP BY t.name HAVING t.name = inTeamName;
END;

SET @inTeamName = "Mustang Team";
CALL sp_getNumTeamMembersByTeamName(@inTeamName);