SELECT * FROM jengadb.Project;

SELECT p.name, p.goalDescription,
       p.status,
       CONCAT(u.firstName, " ", u.lastName) as fullName
FROM jengadb.Project p
    LEFT JOIN jengadb.User u on p.userId = u.id;

-- Project Team Members
SELECT p.name as projectName,
       t.name AS teamName,
       CONCAT(m.firstName, " ", m.lastName) AS memberName
FROM jengadb.Project p
LEFT JOIN Team t on p.id = t.projectId
LEFT JOIN TeamMember tm on tm.teamId = t.id
LEFT JOIN Member m on tm.memberId = m.id
WHERE t.name = 'Blue Sky Thinking';