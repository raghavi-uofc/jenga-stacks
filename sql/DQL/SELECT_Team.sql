SELECT * FROM jengadb.Team;

SELECT p.name as projectName,
       t.name as teamName
FROM jengadb.Project p
LEFT JOIN jengadb.Team t on p.id = t.fkProjectId;