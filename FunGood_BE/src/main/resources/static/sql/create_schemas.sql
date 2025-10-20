create user 'FunGood'@'%' identified by '12345';
create database FunGood_db;
grant all privileges on FunGood_db.* to 'FunGood'@'%';
flush privileges;
