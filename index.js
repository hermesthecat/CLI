#!/usr/bin/env node
const os = require("os");
const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const CliRequests = require("./src/Request");
const StorageConfig = require("./src/StorageConfigs");
const cli_color = require("cli-color");
const js_yaml = require("js-yaml");

global.esm_modules = {
  ora: () => {}
}

async function LoginRequest() {
  const _FistSettings = (await inquirer.prompt([
    {
      type: "input",
      name: "domain",
      message: "Enter domain or external IP:",
      default: "localhost"
    },
    {
      type: "input",
      name: "port",
      message: "Enter port for server API:",
      default: 3000
    },
    {
      type: "input",
      name: "email",
      message: "Enter your email:"
    },
    {
      type: "password",
      name: "password",
      message: "Enter your password:",
      mask: "*"
    }
  ]));
  try {
    const _GetToken = await CliRequests.Json(`http://${_FistSettings.domain}:${_FistSettings.port}/Auth/GetToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email: _FistSettings.email,
        password: _FistSettings.password
      })
    });
    if (!(_GetToken.token)) throw new Error("Token is not found");
    StorageConfig.AddToken(_FistSettings.domain, _FistSettings.port, _GetToken.token);
    return {
      domain: _FistSettings.domain,
      port: _FistSettings.port,
      token: _GetToken.token
    }
  } catch (e) {
    const Res = await inquirer.prompt([
      {
        type: "list",
        name: "try",
        message: "Try again?",
        choices: [{name: "Yes", value: "yes"}, {name: "No", value: "no"}]
      }
    ]);
    if (Res.try === "yes") return LoginRequest();
    else {
      console.log(e);
      console.log("\n\n\n", "Exiting ...");
      process.exit(1);
    }
  }
}

async function menu(Token = null, Domain = null, Port = null) {
  // Print Host Info
  const GetHostInfo = await CliRequests.Json(`http://${Domain}:${Port}/`);
  console.log(cli_color.greenBright("Host Info:", "\n   API Version:", GetHostInfo.api.version, "\n   CPU:", GetHostInfo.host.cpu.model, ", Core:", GetHostInfo.host.cpu.cores,  "\n   Arch:", GetHostInfo.host.Arch, ", System:", GetHostInfo.host.System));

  // Print Process Avaibles and Reuning
  const ProcessStatus = await CliRequests.Json(`http://${Domain}:${Port}/Services`);
  console.log(cli_color.cyanBright("Processes:"));
  // openssh
  console.log(cli_color.greenBright("   OpenSSH Server:", ProcessStatus.openssh.running ? "Running," : "Not Running,", "Enabled:", ProcessStatus.openssh.enabled ? "Yes" : "No"));
  // dropbear
  console.log(cli_color.greenBright("   Dropbear Server:", ProcessStatus.dropbear.running ? "Running," : "Not Running,", "Enabled:", ProcessStatus.dropbear.enabled ? "Yes" : "No"));
  // squid
  console.log(cli_color.greenBright("   Squid Proxy:", ProcessStatus.squid.running ? "Running," : "Not Running,", "Enabled:", ProcessStatus.squid.enabled ? "Yes" : "No"));
  // wireguard
  console.log(cli_color.greenBright("   WireGuard Server:", ProcessStatus.wireguard.running ? "Running," : "Not Running,", "Enabled:", ProcessStatus.wireguard.enabled ? "Yes," : "No,", "Avaible:", ProcessStatus.wireguard.avaible ? "Yes" : "No"));

  const Res = await inquirer.prompt([
    {
      type: "list",
      name: "menu",
      message: "Select menu:",
      choices: [
        {name: "Wireguard (VPN)", value: "wireguard"},
        {name: "OpenSSH (SSH Tunnel)", value: "openssh"},
        {name: "Dropbear (SSH Tunnel)", value: "dropbear"},
        {name: "Squid (Proxy Server)", value: "squid"},
        {name: "Exit", value: "exit"}
      ]
    }
  ]);
  switch (Res.menu) {
    case "wireguard":
      const ResToken = await wireguard_menu(Token, Domain, Port);
      break;
    case "logout":
      break;
    case "exit":
      console.log("Exiting ...");
      process.exit(0);
  }
}

async function wireguard_menu(Token = null, Domain = null, Port = null) {
  const ora = (await import("ora")).default;
  const Config = await CliRequests.Json(`http://${Domain}:${Port}/Wireguard/Config?Token=${Token}`);
  console.log(cli_color.cyanBright("WireGuard:"));
  console.log(cli_color.greenBright(
      "   Public Key:", Config.PublicKey,
    "\n   Private Key:", Config.PrivateKey,
    "\n   Endpoint:", (Config.Endpoint ? Config.Endpoint : "Not Configured") + ",", "Port:", Config.port,
    "\n   Interface IPv4 Base:", Config.v4.ip + "/" + Config.v4.subnet + ",", "Interface IPv6 Base:", Config.v6.ip + "/" + Config.v6.subnet
  ));
  const Res = await inquirer.prompt([
    {
      type: "list",
      name: "menu",
      message: "Select menu:",
      choices: [
        {name: "Edit Config", value: "config"},
        {name: "Add Peer ", value: "add"},
        {name: "Remove Peer", value: "remove"},
        {name: "Get Config", value: "get"},
        {name: "Exit", value: "exit"}
      ]
    }
  ]);
  switch (Res.menu) {
    case "config":
      const WireguardBaseConfig = js_yaml.load((await inquirer.prompt([
        {
          type: "editor",
          name: "config",
          message: "Enter config:",
          default: js_yaml.dump(Config)
        }
      ])).config);
      const Status = ora().start();
      try {
        await CliRequests.Json(`http://${Domain}:${Port}/Config/wireguard`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            Token: Token,
            Config: WireguardBaseConfig
          }),
        });
        Status.succeed("Config Saved");
      } catch (e) {
        Status.fail("Error");
        console.log(e);
        await wireguard_menu(Token, Domain, Port);
      }
      break;
    case "add":
      await wireguard_add_menu(Token, Domain, Port);
      break;
    case "remove":
      await wireguard_remove_menu(Token, Domain, Port);
      break;
    case "get":
      await wireguard_get_menu(Token, Domain, Port);
      break;
    case "exit":
      console.log("Exiting ...");
      process.exit(0);
  }
}

async function Render(){
  const Session = {
    Token: null,
    Domain: null,
    Port: null
  }
  if (Object.getOwnPropertyNames(StorageConfig.GetConfig().tokens).length === 0) {
    const ResToken = await LoginRequest();
    Session.Token = ResToken.token;
    Session.Domain = ResToken.domain;
    Session.Port = ResToken.port;
  } else if (Object.getOwnPropertyNames(StorageConfig.GetConfig().tokens).length === 1) {
    let Ses = Object.getOwnPropertyNames(StorageConfig.GetConfig().tokens)[0]
    Session.Token = StorageConfig.GetConfig().tokens[Ses].token;
    Session.Domain = Ses;
    Session.Port = StorageConfig.GetConfig().tokens[Ses].port;
  } else {
    const ResToken = await inquirer.prompt([
      {
        type: "list",
        name: "domain",
        message: "Select domain:",
        choices: Object.getOwnPropertyNames(StorageConfig.GetConfig().tokens)
      }
    ]);
    Session.Token = StorageConfig.GetConfig().tokens[ResToken.domain].token;
    Session.Domain = ResToken.domain;
    Session.Port = StorageConfig.GetConfig().tokens[ResToken.domain].port;
  }
  try {await menu(Session.Token, Session.Domain, Session.Port);} catch (e) {await menu(Session.Token, Session.Domain, Session.Port);}
}
Render();