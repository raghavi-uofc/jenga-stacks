CREATE DATABASE IF NOT EXISTS jengadb;


-- user creation
CREATE USER IF NOT EXISTS 'jengaapp'@'%' IDENTIFIED BY 'jengapassword';
GRANT ALL ON jengadb.* TO 'jengaapp'@'%';