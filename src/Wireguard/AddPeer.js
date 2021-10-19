const Request = require("../lib/Request");
const inquirer = require("inquirer");

async function addPeer(host = "", Token = "") {
  const Wireguard_Home = require("./home");
  const users = (await Request.Json(`http://${host}/Wireguard/Config?Token=${Token}`)).Peers;
  const UserInput = await inquirer.prompt([
    {
      type: "input",
      name: "username",
      message: "Enter the username of the peer you want to add:",
      validate: function(value) {
        if (!value) return "Please enter a username";
        else if (users.find(user => user.User === value.trim())) return "This username is already in use";
        else return true;
      }
    }
  ]);
  const { username } = UserInput;
  try {
    await Request.Json(`http://${host}/Wireguard/Add?Token=${Token}&User=${username}`);
    console.log(`Successfully added peer ${username}`);
    return Wireguard_Home(host, Token);
  } catch (err) {
    if (String(err).includes("exists")) {
      console.log("Peer already exists");
      return await addPeer(host, Token);
    }
    console.log(err);
    return Wireguard_Home(host, Token);
  }
}

// Export
module.exports = addPeer;