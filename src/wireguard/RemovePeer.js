const Request = require("../lib/Request");
const inquirer = require("inquirer");

async function removePeer(host = "", Token = "") {
  const Wireguard_Home = require("./home");
  const users = (await Request.Json(`http://${host}/Wireguard/Config?Token=${Token}`)).Peers;
  const WaitUserSelect = await inquirer.prompt({
    type: "list",
    name: "Peer",
    message: "Select Peer:",
    choices: [
      "Back",
      ...users.map(user => user.User)
    ]
  });

  if (WaitUserSelect.Peer === "Back") return Wireguard_Home(host, Token);
  else {
    const WaitUserConfirm = await inquirer.prompt({
      type: "confirm",
      name: "Confirm",
      message: `Are you sure you want to remove Peer: ${WaitUserSelect.Peer}?`
    });

    if (WaitUserConfirm.Confirm) {
      const result = await Request.Json(`http://${host}/Wireguard/Remove?Token=${Token}&User=${WaitUserSelect.Peer}`);

      if (result.Status === "Removed") {
        console.log("\nPeer Removed Successfully!\n");
        return removePeer(host, Token);
      } else {
        console.log("\nPeer Not Removed!\n");
        return removePeer(host, Token);
      }
    } else {
      return removePeer(host, Token);
    }
  }
}

// Exports
module.exports = removePeer;