const inquirer = require("inquirer");
const Request = require("../lib/Request");

async function home(host = "", Token = "") {
  const ssh_monitor = require("./ssh_monitor");
  const ssh_add_user = require("./AddUser");
  const remove_user = require("./RemoveUser");
  const ChangePassword = require("./ChangePassword");
  const Main = require("../home");
  const UserList = await Request.Json(`http://${host}/ssh/List?Token=${Token}`);

  console.log(`Users: ${UserList.length}`)

  const waitSSHInput = await inquirer.prompt({
    type: "list",
    name: "ssh",
    message: "What do you want to do?",
    choices: [
      {
        name: "Add User",
        value: "1"
      },
      {
        name: "Remove User",
        value: "2"
      },
      {
        name: "SSH Monitor",
        value: "3"
      },
      {
        name: "Update/Change User Password",
        value: "4"
      },
      {
        name: "Back",
        value: "-1"
      }
    ]
  });

  // --------------------------
  if (waitSSHInput.ssh === "1") return await ssh_add_user(host, Token);
  else if (waitSSHInput.ssh === "2") return await remove_user(host, Token);
  else if (waitSSHInput.ssh === "3") return await ssh_monitor(host, Token);
  else if (waitSSHInput.ssh === "-1") return await Main(host, Token);
  else if (waitSSHInput.ssh === "4") return await ChangePassword(host, Token);
  else return await home(host, Token);
}

// Export
module.exports = home;
