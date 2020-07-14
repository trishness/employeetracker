var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "Pagliachii3#",

    database: "employee_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadID);
    init();
});

function init() {
    inquirer.prompt(
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["Add a department", "Add a role", "Add an employee", "Update employee roles", "Exit"],
            name: "init"
        }
    )
        .then(function (response) {
            console.log(response);

            if (response.init === "Add a department") {
                inquirer.prompt(
                    {
                        type: "input",
                        message: "What is the name of the department?",
                        name: "departmentName"
                    }
                )
                    .then(function (departmentAnswer) {
                        console.log(departmentAnswer);
                        connection.query(
                            "INSERT INTO department SET ?",
                            {
                                name: departmentAnswer.departmentName
                            },
                            function (err, res) {
                                if (err) throw err;
                                console.log(res.affectedRow + " department added!\n");
                            }
                        ); init();
                    })
            }
            else if (response.init === "Add a role") {
                connection.query("SELECT * FROM department", function (err, res) {
                    if (err) throw err
                    const myDepartments = res.map(function (dep) {
                        return ({
                            name: dep.name,
                            value: dep.id
                        })
                    })
                    inquirer.prompt(
                        [
                            {
                                type: "input",
                                message: "What is the title of the role?",
                                name: "roleTitle"
                            },
                            {
                                type: "input",
                                message: "What is the salary of the role?",
                                name: "roleSalary"
                            },
                            {
                                type: "list",
                                message: "What is the department ID that the role is being added to?",
                                name: "roleDepartment",
                                choices: myDepartments
                            }
                        ]
                    )
                        .then(function (roleAnswer) {
                            console.log(roleAnswer);
                            connection.query(
                                "INSERT INTO role SET ?",
                                {
                                    title: roleAnswer.roleTitle,
                                    salary: roleAnswer.roleSalary,
                                    department_id: roleAnswer.roleDepartment
                                },
                                function (err, res) {
                                    if (err) throw err;
                                    console.log(res.affectedRow + " role added!\n");
                                }
                            ); init();
                        })
                })

            }
            else if (response.init === "Add an employee") {
                connection.query("SELECT * FROM role", function (err, res) {
                    if (err) throw err;
                    const myRole = res.map(function (role) {
                        return ({
                            name: role.title,
                            value: role.id
                        })
                    })
                    connection.query("SELECT * FROM employee", function (error, result) {
                        if (error) throw error;
                        const myManager = result.map(function (employee) {
                            return ({
                                name: `${employee.first_name} ${employee.last_name}`,
                                value: employee.id
                            })
                        })
                        myManager.unshift({
                            name:"None",
                            value:""
                        })

                        inquirer.prompt(
                            [
                                {
                                    type: "input",
                                    message: "What is the employee's first name?",
                                    name: "empFirstName"
                                },
                                {
                                    type: "input",
                                    message: "What is the employee's last name?",
                                    name: "empLastName"
                                },
                                {
                                    type: "list",
                                    message: "What is the role ID of this employee?", //foreign key
                                    name: "empRole",
                                    choices: myRole
                                },
                                {
                                    type: "list",
                                    message: "Who is this employee's manager?", //foreign key
                                    name: "empManager",
                                    choices: myManager
                                }
                            ]
                        )
                                .then(function (empAnswer) {
                                    console.log(empAnswer);
                                    if (myManager=""){
                                        connection.query(
                                            "INSERT INTO employee SET ?",
                                            {
                                                first_name: empAnswer.empFirstName,
                                                last_name: empAnswer.empLastName,
                                                role_id: empAnswer.empRole,
                                                manager_id: NULL
                                            },
                                            function (err, res) {
                                                if (err) throw err;
                                                console.log(res.affectedRow + " employee added!\n")
                                            }
                                        )}
                                    else{
                                    connection.query(
                                        "INSERT INTO employee SET ?",
                                        {
                                            first_name: empAnswer.empFirstName,
                                            last_name: empAnswer.empLastName,
                                            role_id: empAnswer.empRole,
                                            manager_id: empAnswer.empManager
                                        },
                                        function (err, res) {
                                            if (err) throw err;
                                            console.log(res.affectedRow + " employee added!\n")
                                        }
                                    )}; init();
                                })
                        
                    })
                })

            }
            else if (response.init === "Update employee roles") {
                inquirer.prompt(
                    [
                        {
                            type: "input",
                            message: "What is the title of the role you would like to update?",
                            name: "updateRole"
                        },
                        {
                            type: "input",
                            message: "What is the role's new salary?",
                            name: "updateRoleSalary"
                        }
                    ]
                )
                    .then(function (updateRoleAnswer) {
                        console.log(updateRoleAnswer)
                        connection.query(
                            "UPDATE role SET ? WHERE ?",
                            [
                                {
                                    title: updateRoleAnswer.updateRole
                                },
                                {
                                    salary: updateRoleAnswer.updateRoleSalary
                                }
                            ],
                            function (err, res) {
                                if (err) throw err;
                                console.log(res.affectedRows + " role updated!\n");
                                init();
                            }
                        )
                    })
            }
            else {
                console.log("Selecting all departments, roles and employees...\n"); //maybe move each of these up to their respective functions so it displays after being updated
                connection.query("SELECT * FROM department", function (err, res) {
                    if (err) throw err;
                    console.table(res);
                });
                connection.query("SELECT * FROM role", function (err, res) {
                    if (err) throw err;
                    console.table(res);
                });
                connection.query("SELECT * FROM employee", function (err, res) { //add a view question to the initial prompt for this instead?
                    if (err) throw err;
                    console.table(res);
                })
                connection.end();
            }
        })
}