use fungood_db;

create table users(
	user_id varchar(50) primary key,
    user_pw varchar(100) not null,
    user_name varchar(50) not null,
    email varchar(100) not null,
    phone varchar(20) not null,
    birth date not null,
    is_active char(1) not null,
    user_reg_date date not null,
    user_role varchar(50) not null,
    
    constraint uq_users_email unique (email),
    constraint uq_users_phone unique (phone),
    
    constraint chk_users_is_active check (is_active in ('Y', 'N'))
);

-- alter table users add column role varchar(50);
-- alter table users change column role user_role varchar(50);
-- alter table users modify column user_role varchar(50) not null;

desc users;

insert into users values ('userA', '12345', '유저A', 'usera@test.com', '010-1111-1111', '1992-07-08', 'Y', curdate(), 'ROLE_USER');
insert into users values ('adminA', '12345', '관리자A', 'admina@test.com', '010-0000-1111', '1988-08-18', 'Y', curdate(), 'ROLE_ADMIN');
delete from users where user_id = 'userA';
select * from users;
