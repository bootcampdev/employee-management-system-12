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

select * from department;

select * from role;

select * from employee;

insert into employee (first_name, last_name, role_id)
values ("nobdoy", "nobody", 8);

select e.*, m.first_name + "  " + m.last_name from employee e
left join employee m on e.manager_id = m.id;

select role,  concat('$',salary) as salary, name as department from role r inner join department d on r.department_id = d.id;

select e.id as EmployeeId, concat(e.last_name, ', ',e.first_name) as EmployeeName
, r.role as Role
, d.name as Department
, manager_id
from employee e inner join role r on e.role_id = r.id
	inner join department d on r.department_id = d.id
    left outer join employee e2 on e.manager_id = e2.id;
    
    
    
    
