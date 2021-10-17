const inquirer = require("inquirer");
const ssh_monitor = require("./ssh_monitor");

async function home(host = "", Token = "") {
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
      }
    ]
  });

  // --------------------------
  if (waitSSHInput.ssh === "1") throw new Error("Not Implemented");
  else if (waitSSHInput.ssh === "2") throw new Error("Not Implemented");
  else if (waitSSHInput.ssh === "3") return await ssh_monitor(host, Token);
  else return await home(host, Token);
}

// Export
module.exports = home;