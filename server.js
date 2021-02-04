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

const mainMenu = ['Add', 'View', 'Update', 'Exit'];
const subMenu = ['Department', 'Role', 'Employee', 'Exit'];
let mainMenuChoice = "";

const runMenu = () => {
    inquirer.prompt([
        {
            name: 'action',
            type: 'list',
            message: 'Please select one of the following functions:',
            choices: mainMenu
        }
    ]).then(answer => {
        console.log(answer)
        mainMenuChoice = answer.action + " by?";
        if (answer.action === mainMenu[0]) {
            subMenu_prompt();
        } else if (answer.action === mainMenu[1]) {
            subMenu_prompt();
        } else if (answer.action === mainMenu[2]) {
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
                department_prompt();
            } else if (answer.option === subMenu[1]) {
                role_prompt();;
                // } else if (answer.option === subMenu[2]) {
                //     //rangeSearch();    
            } else {
                exit();
            }
        })
    }

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

    const role_prompt = () => {
        //
        // need a list of departments

        connection.query("select id, name from department order by name", (err, result) => {
            if (err) throw (err)
            console.table(result)
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
                choices: result
            },

        ]).then(answer => {
            console.log(answer)
            connection.query("insert into department (name) values (?)", answer.name, (err, result) => {
                if (err) throw (err)
                //console.table(result)
                runMenu()
            })
        })
    }


    const exit = () => {
        console.log('exit')
        process.exit()
    }
}