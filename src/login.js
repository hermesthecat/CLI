const inquirer = require("inquirer");
const Request = require("./lib/Request");
const StorageConfigs = require("./lib/StorageConfigs");


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
    ]);

    // Get Token
    try {
      const waitBackendResponse = await Request.Json(`http://${waitUserInputs.host}:${waitUserInputs.port}/auth/GetToken?Email=${waitUserInputs.email}&Passworld=${waitUserInputs.password}`);
      // Save Config
      return StorageConfigs.AddToken(`${waitUserInputs.host}:${waitUserInputs.port}`, waitBackendResponse.token);
    } catch (err) {
      console.log(err);
      return await login();
    }
  } else {
    if (Tokens.length === 1) {
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