SELECT * FROM jengadb.Project;

SELECT p.name, u. FROM jengadb.Project p LEFT JOIN jengadb.User u on p.userId = u.id;