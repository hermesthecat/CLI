const Request = require("../lib/Request");
const inquirer = require("inquirer");

async function AddUser(host = "", Token = "") {
  const SSH_Home = require("./home");
  const UserList = await Request.Json(`http://${host}/ssh/List?Token=${Token}`);
  const waitAdd = await inquirer.prompt([
    {
      type: "list",
      name: "username",
      message: "Username:",
      choices: UserList.map(user => user.username)
    },
    {
      type: "password",
      name: "password",
      message: "New Password:",
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
    }
  ]);

  const { username, password } = waitAdd;
  try {
    await Request.Text(`http://${host}/ssh/UpdatePassword?Token=${Token}&Username=${username}&Passworld=${password}`);
    console.log("Passworld Updated");
  } catch (err) {
    console.log(err);
  }
  return await SSH_Home(host, Token);
}

// Export
module.exports = AddUser;
