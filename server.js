const inquirer = require('inquirer')
const mysql = require('mysql')

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'employeetracker_db'
});

connection.connect(err => {
    if (err) throw err
    console.log(`Connected to mySQL ${connection.config.database} on thread ${connection.threadId}`)
    runMenu()
});

//
// prompt user for add, view, update by department, role or employee

const mainMenu = ['Add', 'View', 'Update', 'Exit'];
const subMenu = ['Department', 'Role', 'Employee', 'Exit'];
let mainMenuChoice = "";
let mainMenuId;
let dept_list = [];
let role_list = [];
let manager_list = [];
let sql_view_string = "";

// 
// main menu

const runMenu = () => {
    inquirer.prompt([
        {
            name: 'action',
            type: 'list',
            message: 'Please select one of the following |-- HR --| functions:',
            choices: mainMenu
        }
    ]).then(answer => {
        console.log(answer)

        mainMenuChoice = answer.action + " by?";
        if (answer.action === mainMenu[0]) {
            mainMenuId = 0;
            subMenu_prompt();
        } else if (answer.action === mainMenu[1]) {
            mainMenuId = 1;
            subMenu_prompt();
        } else if (answer.action === mainMenu[2]) {
            mainMenuId = 2;
            subMenu_prompt();
        } else {
            exit();
        }
    })

    //
    // sub menu option - department, role, employee

    const subMenu_prompt = () => {
        inquirer.prompt([
            {
                name: "option",
                type: "list",
                message: mainMenuChoice,
                choices: subMenu
            }
        ]).then(answer => {
            console.log(answer)
            if (answer.option === subMenu[0]) {
                //
                // department option

                //
                // add 
                if (mainMenuId == 0)
                    department_prompt();
                //
                // view 
                else (mainMenuId == 1)
                view_table("select id as Id, name as Department from department");

            } else if (answer.option === subMenu[1]) {
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

            } else if (answer.option === subMenu[2]) {
                //
                // employee opttion

                //
                //add
                if (mainMenuId == 0)
                    employee_prompt();

                //
                // view                     
                else if (mainMenuId == 1)
                    view_table("select e.id as EmployeeId, concat(e.last_name, ', ',e.first_name) as EmployeeName " +
                        ", r.role as Role " +
                        ", d.name as Department " +
                        ", manager_id " +
                        " from employee e inner join role r on e.role_id = r.id " +
                        "inner join department d on r.department_id = d.id;");

            } else {
                exit();
            }
        })
    }

    //
    // view anything just send he sql string

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
            console.log(answer)
            connection.query("insert into department (name) values (?)", answer.name, (err, result) => {
                if (err) throw (err)
                //console.table(result)
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
            //console.table(dept_list)
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
            console.log(answer)

            let dept_id = answer.whichdepartment.substring(0, answer.whichdepartment.indexOf("-"));
            console.log("department id: ", dept_id);

            connection.query("insert into role set ?",
                {
                    role: answer.role,
                    salary: answer.salary,
                    department_id: dept_id
                }, (err, result) => {
                    if (err) throw (err)
                    //console.table(result)
                    runMenu()
                })
        })
    }

    //
    // create a new employee

    const employee_prompt = () => {
        //
        // get a list of roles

        get_role_list();

        // connection.query("select id, role from role order by id", (err, result) => {
        //     if (err) throw (err)

        //     //console.log(result);
        //     //role_list = [];
        //     result.forEach(element => {
        //         role_list.push(`${element.id}-${element.role}`);
        //     });
        // })

        //
        // get a list of possible managers

        get_manager_list();

        // connection.query("select id, concat(last_name, ', ',first_name) as Manager from employee", (err, result) => {
        //     if (err) throw (err)

        //     console.log(result);
        //     role_list = [];
        //     result.forEach(element => {
        //         manager_list.push(`${element.id}-${element.Manager}`);
        //     });
        // })

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
            console.log(answer)

            let role_id = answer.whichrole.substring(0, answer.whichrole.indexOf("-"));
            console.log("role id: ", role_id);
            let manager_id = answer.whichmanager.substring(0, answer.whichmanager.indexOf("-"));
            console.log("manager id: ", manager_id);

            connection.query("insert into employee set ?",
                {
                    first_name: answer.firstname,
                    last_name: answer.lastname,
                    role_id: role_id,
                    manager_id: manager_id
                }, (err, result) => {
                    if (err) throw (err)
                    //console.table(result)
                    runMenu()
                })

        })

    }

    const get_manager_list = () => {
        connection.query("select id, concat(last_name, ', ',first_name) as Manager from employee", (err, result) => {
            if (err) throw (err)

            //console.log(result);
            //role_list = [];
            result.forEach(element => {
                manager_list.push(`${element.id}-${element.Manager}`);
            });
        })
    }

    const get_role_list = () => {
        connection.query("select id, role from role order by id", (err, result) => {
            if (err) throw (err)

            //console.log(result);
            //role_list = [];
            result.forEach(element => {
                role_list.push(`${element.id}-${element.role}`);
            });
        })
    }

    const exit = () => {
        console.log('exit')        
        process.exit()
    }
}