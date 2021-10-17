#!/usr/bin/env node
const login = require("./src/login");
const home = require("./src/home");

async function RenderCLI() {
  const UserConfig = await login();
  return await home(UserConfig.host, UserConfig.token);
}
RenderCLI();