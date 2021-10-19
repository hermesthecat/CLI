const Request = require("../lib/Request");
const inquirer = require("inquirer");

async function RemoveUser(host = "", Token = "") {
  const SSH_Home = require("./home");
  const UserList = await Request.Json(`http://${host}/ssh/List?Token=${Token}`);
  const WaitPrompt = await inquirer.prompt({
    type: "list",
    name: "User",
    message: "Select User:",
    choices: [
      "Back",
      ...UserList.map((User) => User.username)
    ]
  });

  if (WaitPrompt.User === "Back") return SSH_Home(host, Token);

  const ConfirmPrompt = await inquirer.prompt({
    type: "confirm",
    name: "Confirm",
    message: `Are you sure you want to remove ${WaitPrompt.User}?`
  });
  if (ConfirmPrompt.Confirm) {
    await Request.Text(`http://${host}/ssh/Remove?Token=${Token}&Username=${WaitPrompt.User}`);
    console.log("User Removed");
  }

  return await SSH_Home(host, Token);
}

// Export
module.exports = RemoveUser;