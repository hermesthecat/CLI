const inquirer = require("inquirer");
const Request = require("./lib/Request");
const StorageConfigs = require("./lib/StorageConfigs");
const Args = require("minimist")(process.argv.slice(2));

async function login() {
  const Tokens = StorageConfigs.GetConfig();
  if (Tokens.length === 0) {
    const waitUserInputs = await inquirer.prompt([
      {
        type: "input",
        name: "host",
        message: "Enter the host of the server:",
        default: "localhost"
      },
      {
        type: "input",
        name: "port",
        message: "Enter the port of the server:",
        default: "3000"
      }
    ]);

    let IsInitPassworld = false;

    try {
      const CheckIsFistLogin = await Request.Json(`http://${waitUserInputs.host}:${waitUserInputs.port}/auth`);
      if (CheckIsFistLogin.FistTokenRegister) IsInitPassworld = true;
    } catch (err) {
      throw new Error("Unable to verify that the server is running")
    }

    if (IsInitPassworld) {
      console.log("\n", "Initial Token Register", "\n");
      const waitRegisterUser = await inquirer.prompt([
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
      ]);
      const UserRegister = await Request.Json(`http://${waitUserInputs.host}:${waitUserInputs.port}/auth/Register?Email=${waitRegisterUser.email}&Passworld=${waitRegisterUser.password}`);
      return StorageConfigs.AddToken(`${waitUserInputs.host}:${waitUserInputs.port}`, UserRegister.token, true);
    }

    const user_login = await inquirer.prompt([
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
    ]);

    // Get Token
    try {
      const waitBackendResponse = await Request.Json(`http://${waitUserInputs.host}:${waitUserInputs.port}/auth/GetToken?Email=${user_login.email}&Passworld=${user_login.password}`);
      // Save Config
      return StorageConfigs.AddToken(`${waitUserInputs.host}:${waitUserInputs.port}`, waitBackendResponse.token);
    } catch (err) {
      console.log(err);
      return await login();
    }
  } else {
    if (Tokens.length === 1 && Args.no_auto_login === undefined) {
      return Tokens[0];
    } else {
      const waitUserInputs = await inquirer.prompt([
        {
          type: "list",
          name: "host",
          message: "Select the host of the server:",
          choices: Tokens.map((token, index) => ({
            name: `${token.host} >>:<< ${token.token}`,
            value: index
          }))
        }
      ]);
      return Tokens[waitUserInputs.host];
    }
  }
}

// Export
module.exports = login;