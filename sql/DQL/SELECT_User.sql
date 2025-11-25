USE jengadb;

SELECT * FROM jengadb.User;

SELECT CONCAT(u.firstName, " ", u.lastName) as fullName,
       email
FROM jengadb.User u
WHERE u.status = "active" AND u.role = "regular";

SELECT COUNT(*) FROM jengadb.User u
WHERE u.status = "active" AND u.role = "regular";