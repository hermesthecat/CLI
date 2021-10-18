const Request = require("../lib/Request");
const inquirer = require("inquirer");

async function AddUser(host = "", Token = "") {
  const SSH_Home = require("./home");
  const UserList = await Request.Json(`http://${host}/ssh/List?Token=${Token}`);
  const waitAdd = await inquirer.prompt([
    {
      type: "input",
      name: "username",
      message: "Username:",
      validate: function(value) {
        if (!value) {
          return "Please enter a username";
        } else if (UserList.find(user => user.username === value)) {
          return "Username already exists";
        } else {
          return true;
        }
      }
    },
    {
      type: "password",
      name: "password",
      message: "Password:",
      mask: "*",
      validate: function(value) {
        if (!value) {
          return "Please enter a password";
        } else if (value.length < 8) {
          return "Password must be at least 8 characters";
        } else{
          return true;
        }
      }
    },
    {
      type: "number",
      name: "days",
      message: "Days:",
      default: 30
    },
    {
      type: "number",
      name: "connections",
      message: "Connections:",
      default: 2
    }
  ]);

  const { username, password, days, connections } = waitAdd;
  try {
    await Request.Text(`http://${host}/ssh/Add?Token=${Token}&Username=${username}&Password=${password}&Days=${days}&Connections=${connections}`);
    console.log("User added");
  } catch (err) {
    if (/Username already exists/gi.test(err.Body)) {
      console.log("Username already exists");
    } else {
      console.log(err);
      console.log("User not added");
    }
  }
  return await SSH_Home(host, Token);
}

// Export
module.exports = AddUser;