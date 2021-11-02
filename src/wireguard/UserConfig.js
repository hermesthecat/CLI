const Request = require("../lib/Request");
const inquirer = require("inquirer");
const cli_color = require("cli-color");
const path  = require("path");
const fs = require("fs");
const os = require("os");

async function getUserConfig(host = "", Token = "") {
  const Wireguard_Home = require("./home");
  const users = (await Request.Json(`http://${host}/Wireguard/Config?Token=${Token}`)).Peers;
  const user = await inquirer.prompt([
    {
      type: "list",
      name: "user",
      message: "Select a user:",
      choices: users.map(user => user.User),
    },
    {
      type: "list",
      name: "ConfigType",
      message: "Select a config type:",
      choices: [
        "wireguard",
        "json",
        "openwrt",
        "yaml"
      ],
    }
  ]);

  const config = await Request.Text(`http://${host}/Wireguard/UserConfig/${user.ConfigType}?Token=${Token}&User=${user.user}`);
  console.log();
  console.log(cli_color.red(config));
  let FileType = ".txt"
  if (user.ConfigType == "json") FileType = ".json";
  else if (user.ConfigType == "yaml") FileType = ".yaml";
  else if (user.ConfigType == "openwrt") FileType = "";
  else if (user.ConfigType == "wireguard") FileType = ".conf";
  const TempFile = path.resolve(os.tmpdir(), `Wireguard_${user.user}${FileType}`);
  fs.writeFileSync(TempFile, config);
  console.log(cli_color.green(`Config saved to ${TempFile}`));
  console.log();
  return Wireguard_Home(host, Token);
}

// Export
module.exports = getUserConfig;