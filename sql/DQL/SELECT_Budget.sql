SELECT * FROM jengadb.Budget;

SELECT p.name as projectName,
       b.floor as budgetFloor,
       b.ceiling as budgetCieling
FROM jengadb.Project p
LEFT JOIN jengadb.Budget b on p.id = b.fkProjectId;