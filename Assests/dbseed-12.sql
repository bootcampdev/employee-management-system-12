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
        REFERENCES role(id),
	FOREIGN KEY (manager_id)
        REFERENCES employee(id)
        );

    
    
    
