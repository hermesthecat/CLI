const os = require("os");
const fs = require("fs");
const path = require("path");

// File Storage
let ConfigPath = path.join(os.homedir(), ".config", "http_injector_cli.json");
if (process.platform === "win32") ConfigPath = path.join(os.homedir(), "AppData", "Roaming", "http_injector_cli.json");
else if (process.platform === "darwin") ConfigPath = path.join(os.homedir(), "Library", "Preferences", "http_injector_cli.json");

// Base Config
let Config = {
  tokens: {}
}

// Load Config
if (fs.existsSync(ConfigPath)) Config = JSON.parse(fs.readFileSync(ConfigPath));
else fs.writeFileSync(ConfigPath, JSON.stringify(Config, null, 2));

// Save Config
function SaveConfig() {
  fs.writeFileSync(ConfigPath, JSON.stringify(Config, null, 2));
}

// Add Token
function AddToken(domain, Port, token) {
  if (Config.tokens[domain]) throw new Error("Token already exists for domain: " + domain);
  Config.tokens[domain] = {
    port: Port || 3000,
    token: token
  };
  SaveConfig();
  return Config.tokens[domain];
}

// Remove Token
function RemoveToken(domain) {
  if (!Config.tokens[domain]) throw new Error("Token does not exist for domain: " + domain);
  delete Config.tokens[domain];
  SaveConfig();
  return domain;
}

// Export
module.exports = {
  GetConfig: () => Config,
  SaveConfig,
  AddToken,
  RemoveToken
}