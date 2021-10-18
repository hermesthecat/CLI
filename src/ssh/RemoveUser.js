const Request = require("../lib/Request");
const inquirer = require("inquirer");

async function RemoveUser(host = "", Token = "") {
  const SSH_Home = require("./home");
  const UserList = await Request.Json(`http://${host}/ssh/List?Token=${Token}`);
  const WaitPrompt = await inquirer.prompt([
    {
      type: "list",
      name: "User",
      message: "Select User:",
      choices: UserList.map((User) => User.username),
    },
    {
      type: "confirm",
      name: "Confirm",
      message: "Are you sure?"
    }
  ]);

  if (WaitPrompt.Confirm) {
    await Request.Text(`http://${host}/ssh/Remove?Token=${Token}&Username=${WaitPrompt.User}`);
    console.log("User Removed");
  }

  return await SSH_Home(host, Token);
}

// Export
module.exports = RemoveUser;