#!/usr/bin/env node
const login = require("./src/login");
const home = require("./src/home");

async function RenderCLI() {
  const UserConfig = await login();
  while (true) {
    console.log("\n");
    try {await home(UserConfig.host, UserConfig.token);} catch (e) {}
  }
}
RenderCLI();