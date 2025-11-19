
CREATE USER 'db_user1'@'database-jenga.chkkkcwy0yjl.us-east-2.rds.amazonaws.com' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON jengadb.* TO 'db_user1'@'database-jenga.chkkkcwy0yjl.us-east-2.rds.amazonaws.com';


CREATE USER 'db_user2'@'%' IDENTIFIED BY '@StrongP@$$123';
GRANT ALL PRIVILEGES ON jengadb.* TO 'db_user2'@'%';
FLUSH PRIVILEGES;
