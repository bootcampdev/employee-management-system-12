const inquirer = require('inquirer')
const mysql = require('mysql')

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'topsongs_db'
});

connection.connect(err => {
    if (err) throw err
    console.log(`Connected to mySQL on thread ${connection.threadId}`)
    runSearch()
});

const choices = ['Find songs by Artist', 'Find Artists who appear more than once', 'Find data within a specific range', 'Find by song name','Exit'];