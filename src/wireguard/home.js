const Request = require("../lib/Request");
const inquirer = require("inquirer");

async function home(host = "", Token = "") {
  const Back = require("../home");
  const AddPeer = require("./AddPeer");
  const RemovePeer = require("./RemovePeer");
  const UserConfig = require("./UserConfig");
  const MoreOptions = [];

  try {
    const CheckAvaibleWireguard = await Request.Json(`http://${host}/Wireguard`);
    if (CheckAvaibleWireguard.Avaible) {
      MoreOptions.push({
        name: "Add Peer",
        value: "Add"
      },
      {
        name: "Remove Peer",
        value: "Remove"
      });
    }
  } catch (e) {
    console.log("Cannot connect to API");
  }

  const WaitUser = await inquirer.prompt({
    type: "list",
    name: "options",
    message: "What do you want to do?",
    choices: [
      ...MoreOptions,
      {
        name: "User Config",
        value: "UserConfig"
      },
      {
        name: "Back",
        value: "Back"
      }
    ]
  });

  if (WaitUser.options === "Back") return Back(host, Token);
  else if (WaitUser.options === "UserConfig") return await UserConfig(host, Token);
  else if (WaitUser.options === "Add") return await AddPeer(host, Token);
  else if (WaitUser.options === "Remove") return await RemovePeer(host, Token);
  else return Back(host, Token);
}

// Exports
module.exports = home;