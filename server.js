const inquirer = require('inquirer')
const mysql = require('mysql')
const q = require('q');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'employeetracker_db'
});

connection.connect(err => {
    if (err) throw err
    console.log(`Connected to mySQL ${connection.config.database} on thread ${connection.threadId} \n`)
    runMenu()
});

//
// prompt user for add, view, update, delete, for department, role or employee

const mainMenu = ['Add', 'View', 'Update', 'Delete', 'Department Budget', 'Exit'];
const subMenu = ['Department', 'Role', 'Employee', 'Exit'];
let mainMenuChoice = "";
let mainMenuId;
let dept_list = [];
let role_list = [];
let manager_list = [];

// 
// main menu

const runMenu = () => {
    inquirer.prompt([
        {
            name: 'action',
            type: 'list',
            message: 'Welcome to |-- HR Employee Management --|  Please select one of the following operations:\n',
            choices: mainMenu
        }
    ]).then(answer => {       
        mainMenuChoice = answer.action + " for?";
        if (answer.action === mainMenu[0]) {
            //
            // add
            mainMenuId = 0;
            subMenu_prompt();
        } else if (answer.action === mainMenu[1]) {
            //
            // view
            mainMenuId = 1;
            subMenu_prompt();
        } else if (answer.action === mainMenu[2]) {
            //
            // update
            mainMenuId = 2;
            subMenu_prompt();
        } else if (answer.action === mainMenu[3]) {
            //
            // delete
            mainMenuId = 3;
            subMenu_prompt();
        } else if (answer.action === mainMenu[4]) {
            //
            // view department budget
            mainMenuId = 3;
            view_table(
                "select d.name as Department, concat('$',sum(r.salary)) as 'Total Budget' " +
                "from employee e inner join role r on e.role_id = r.id " +
                "inner join department d on r.department_id = d.id " +
                "where r.id > 1 group by d.name;"
            );
        } else {
            exit();
        }
    })

    //
    // sub menu options - department, role, employee

    const subMenu_prompt = () => {
        inquirer.prompt([
            {
                name: "option",
                type: "list",
                message: mainMenuChoice,
                choices: subMenu
            }
        ]).then(answer => {
            if (answer.option === subMenu[0]) {
                //
                // department option
                //
                // add 
                if (mainMenuId == 0)
                    department_prompt();
                //
                // view 
                else if (mainMenuId == 1)

                    view_table("select id as Id, name as Department from department where id > 1");
            }
            else if (answer.option === subMenu[1]) {
                //
                // role option

                //
                // add 
                if (mainMenuId == 0)
                    role_prompt();

                //
                // view                     
                else if (mainMenuId == 1)
                    view_table("select role as Role, concat('$',salary) as Salary, name as Department from role r inner join department d on r.department_id = d.id");
            }
            else if (answer.option === subMenu[2]) {
                //
                // employee option
                //
                // add
                if (mainMenuId == 0) {
                    //employee_prompt();
                    get_manager_list()
                        .then(get_role_list)
                        .then(employee_prompt);
                }
                //
                // view                     
                else if (mainMenuId == 1) {
                    view_table("select e.id as EmployeeId, concat(e.last_name, ', ',e.first_name) as EmployeeName " +
                        ", r.role as Role " +
                        ", d.name as Department " +
                        ", e2.last_name as Manager " +
                        "from employee e inner join role r on e.role_id = r.id " +
                        "inner join department d on r.department_id = d.id " +
                        "left outer join employee e2 on e.manager_id = e2.id;");
                }
                //
                // update employee role
                else if (mainMenuId == 2) {

                    get_manager_list()
                        .then(get_role_list)
                        .then(employee_update_prompt);
                }
                //
                // delete employee
                else if (mainMenuId == 3) {

                    get_manager_list()
                        .then(employee_delete_prompt);
                }
                else {
                    exit();
                }

            } else {
                exit();
            }
        })
    }

    //
    // view anything just send the sql string

    const view_table = (sqlstr) => {

        connection.query(sqlstr, (err, result) => {
            if (err) throw (err)
            console.table(result)
            runMenu()
        })
    }

    //
    // create a new department 

    const department_prompt = () => {
        inquirer.prompt([
            {
                name: "name",
                type: "input",
                message: "Department name?"
            }
        ]).then(answer => {           
            connection.query("insert into department (name) values (?)", answer.name, (err, result) => {
                if (err) throw (err)
               
                runMenu()
            })
        })
    }

    //
    // create a new role

    const role_prompt = () => {
        //
        // need a list of departments

        connection.query("select id, name from department order by id", (err, result) => {
            if (err) throw (err)

            result.forEach(element => {
                dept_list.push(`${element.id}-${element.name}`);
            });

            dept_list = [];
        })

        inquirer.prompt([
            {
                name: "role",
                type: "input",
                message: "Define their role:"
            },
            {
                name: "salary",
                type: "input",
                message: "Salary $"
            },
            {
                name: "whichdepartment",
                type: "list",
                message: "Department:",
                choices: dept_list
            },

        ]).then(answer => {

            let dept_id = answer.whichdepartment.substring(0, answer.whichdepartment.indexOf("-"));

            connection.query("insert into role set ?",
                {
                    role: answer.role,
                    salary: answer.salary,
                    department_id: dept_id
                }, (err, result) => {
                    if (err) throw (err)

                    runMenu()
                })
        })
    }

    //
    // delete employee

    const employee_delete_prompt = () => {
        inquirer.prompt([
            {
                name: "whichemployee",
                type: "list",
                message: "Select employee:",
                choices: manager_list
            }

        ]).then(answer => {
           
            let emp_id = parseInt( answer.whichemployee.substring(0, answer.whichemployee.indexOf("-")));
            let sqlstr = `delete from employee where id = ${emp_id}`;

            connection.query(sqlstr, (err, result) => {
                if (err) throw (err)  

                runMenu()
            })
        })
    }

    //
    // update employee role

    const employee_update_prompt = () => {
        inquirer.prompt([
            {
                name: "whichemployee",
                type: "list",
                message: "Select employee:",
                choices: manager_list
            },
            {
                name: "whichrole",
                type: "list",
                message: "Select Employee new role:",
                choices: role_list
            }

        ]).then(answer => {

            let role_id = answer.whichrole.substring(0, answer.whichrole.indexOf("-"));
            let emp_id = answer.whichemployee.substring(0, answer.whichemployee.indexOf("-"));

            connection.query("update employee set role_id = ? where id = ?", [role_id, emp_id], (err, result) => {
                if (err) throw (err) 

                runMenu()
            })
        })
    }

    //
    // create new employee

    const employee_prompt = () => {
        inquirer.prompt([
            {
                name: "firstname",
                type: "input",
                message: "First name:"
            },
            {
                name: "lastname",
                type: "input",
                message: "Last name"
            },
            {
                name: "whichrole",
                type: "list",
                message: "Employee role:",
                choices: role_list
            },
            {
                name: "whichmanager",
                type: "list",
                message: "Manager:",
                choices: manager_list
            }

        ]).then(answer => {

            let role_id = answer.whichrole.substring(0, answer.whichrole.indexOf("-"));
            let manager_id = answer.whichmanager.substring(0, answer.whichmanager.indexOf("-"));

            connection.query("insert into employee set ?",
                {
                    first_name: answer.firstname,
                    last_name: answer.lastname,
                    role_id: role_id,
                    manager_id: manager_id
                }, (err, result) => {
                    if (err) throw (err)

                    runMenu()
                })
        })
    }


    const get_manager_list = () => {
        //
        // using Q for my promise to return data
        let deferred = q.defer();

        manager_list = [];
        connection.query("select id, concat(last_name, ', ',first_name) as Employee from employee", (err, result) => {
            //if (err) throw (err)
            if (err) deferred.reject(err);
           
            result.forEach(element => {
                manager_list.push(`${element.id}-${element.Employee}`);
            });
            
            deferred.resolve();

        })
        return deferred.promise;
    }

    const get_role_list = () => {
        //
        // using Q for my promise to return data
        let deferred = q.defer();

        role_list = [];
        connection.query("select id, role from role where id > 1 order by id", (err, result) => {
            if (err) throw (err)
          
            result.forEach(element => {
                role_list.push(`${element.id}-${element.role}`);
            });
           
            deferred.resolve();
        })
        return deferred.promise;
    }

    const exit = () => {
        console.log('Thank you for use of |-- HR Management System --|')
        process.exit()
    }
}