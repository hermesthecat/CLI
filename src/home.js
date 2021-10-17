const Request = require("./lib/Request");
const inquirer = require("inquirer");

// Import home´s module
const SSH_Home = require("./ssh/home");

function FixTime(time = 0) {
  const Values = [
    {
      name: "seconds",
      value: 1000
    },
    {
      name: "minutes",
      value: 60
    },
    {
      name: "hours",
      value: 60
    },
    {
      name: "days",
      value: 24
    },
    {
      name: "weeks",
      value: 7
    },
    {
      name: "months",
      value: 30
    },
    {
      name: "years",
      value: 12
    }
  ];
  let TimeRange = 0;
  for (let vlu of Values) {
    if (time >= vlu.value) {
      time = time / vlu.value;
      TimeRange++;
    } else break;
  }
  return {
    time: parseInt(time),
    timeRange: Values[TimeRange].name
  }
}

async function Home(host = "localhost:3000", Token = "tks_aaaaaaaaaaaaaaaaaaaaaaaaa_ofvp") {
  const Info = await Request.Json(`http://${host}`);
  const DateS = FixTime(Info.host.uptime);

  console.log(`Name: ${Info.host.name}\t Arch: ${Info.host.arch}\t Kernel Release: ${Info.host.release}\t Uptime: ${DateS.time} ${DateS.timeRange}`);
  console.log(`CPU Cores: ${Info.host.cpus.length}\t\t CPU Model: ${Info.host.cpus[0].model}`);

  const questinfo = await (inquirer.prompt({
    type: "list",
    name: "option",
    message: "Select Option:",
    choices: [
      {
        name: "Wireguard",
        value: "1"
      },
      {
        name: "SSH",
        value: "2"
      },
      {
        name: "Exit",
        value: "3"
      }
    ]
  }));

  if (questinfo.option == "1") return "wireguard";
  else if (questinfo.option == "2") return await SSH_Home(host, Token);
  else if (questinfo.option == "3") process.exit(0);
  else return await Home(host, Token);
}

// Export
module.exports = Home;