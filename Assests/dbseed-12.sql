-- department
-- id - INT PRIMARY KEY
-- name - VARCHAR(30) to hold department name

-- role
--   id - INT PRIMARY KEY
--   title -  VARCHAR(30) to hold role title
--   salary -  DECIMAL to hold role salary
--   department_id -  INT to hold reference to department role belongs to

-- employee
--   id - INT PRIMARY KEY
--   first_name - VARCHAR(30) to hold employee first name
--   last_name - VARCHAR(30) to hold employee last name
--   role_id - INT to hold reference to role employee has
--   manager_id - INT to hold reference to another employee that manages the employee being Created. This field may be null if the employee has no manager

set sql_safe_updates = 0;

create database employeetracker_db;

use employeetracker_db;

create table department (
 id int not null auto_increment,
 name varchar(30) not null,
 primary key (id));

create table role (
	id int not null auto_increment,
    primary key (id),
    role varchar(30) not null,
    salary decimal,
    department_id int not null,
    FOREIGN KEY (department_id)
        REFERENCES department(id)
        );
    
create table employee (
	id int not null auto_increment,
    primary key (id),
    first_name varchar(30) not null,
    last_name varchar(30) not null,
    role_id int not null,
    manager_id int,
    FOREIGN KEY (role_id)
        REFERENCES role(id)
	#FOREIGN KEY (manager_id)
        #REFERENCES employee(id)
        );

##-------------------------
## working area for testing
##-------------------------
select * from department;

select * from role;

select * from employee;


delete from employee;
delete from role;
delete from department where id=4;

insert into department (name) values ("");
insert into role (role, salary, department_id) values ("", 0, 1);

insert into employee (first_name, last_name, role_id) values ("Manager", "No", 1);

select e.*, m.first_name + "  " + m.last_name from employee e
left join employee m on e.manager_id = m.id;

select role,  concat('$',salary) as salary, name as department from role r inner join department d on r.department_id = d.id;

select e.id as EmployeeId, concat(e.last_name, ', ',e.first_name) as EmployeeName
, r.role as Role
, d.name as Department
, e2.last_name as Manager
from employee e inner join role r on e.role_id = r.id
	inner join department d on r.department_id = d.id
    left outer join employee e2 on e.manager_id = e2.id;
    
select d.*, r.* from department d
inner join role r on r.department_id = d.id;    

select d.name as Department, sum(r.salary) as 'Total Budget'
from employee e
inner join role r on e.role_id = r.id
inner join department d on r.department_id = d.id
where r.id > 1
group by d.name;
    
select * from employee where  id = cast("5" as signed);
    
    
    
