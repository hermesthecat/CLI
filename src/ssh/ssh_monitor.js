const readline = require("readline");
const Request = require("../lib/Request");
const cli_color = require("cli-color");

function CalculateTimeConnected (DateReciceve = new Date(), CurrentDate = new Date()) {
  let Difference = CurrentDate.getTime() - DateReciceve.getTime();
  const Values = [
    {
      name: "seconds",
      value: 1000,
      correct_value: 60
    },
    {
      name: "minutes",
      value: 60,
      correct_value: 60
    },
    {
      name: "hours",
      value: 60,
      correct_value: 60
    },
    {
      name: "days",
      value: 24,
      correct_value: 24
    },
    {
      name: "weeks",
      value: 7,
      correct_value: 7
    },
    {
      name: "months",
      value: 30,
      correct_value: 30
    },
    {
      name: "years",
      value: 12,
      correct_value: 12
    }
  ];
  let NameAndValue = "";
  let TimeRange = 0;
  for (let vlu of Values) {
    if (Difference >= vlu.value) {
      Difference = Difference / vlu.value;
      NameAndValue = `${Math.floor(Difference % vlu.correct_value)} ${vlu.name} ${NameAndValue}`;
      TimeRange++;
    } else break;
  }
  return NameAndValue;
}

async function Home(host = "", Token = "") {
  let BreakFromReadLine = false;
  readline.emitKeypressEvents(process.stdin);
  process.stdin.on("keypress", function (ch, key) {
    // console.log("got \"keypress\"", key);
    if (key && key.ctrl && key.name === "d") {
      if (BreakFromReadLine) return;
      process.stdin.pause();
      BreakFromReadLine = true;
    }
  });
  process.stdin.setRawMode(true);
  process.stdin.resume();
  while (true) {
    try {
      if (BreakFromReadLine) {
        break
      }
      console.clear();
      console.log(cli_color.greenBright("SSH Monitor"));
      console.log(cli_color.greenBright("Press ctrl + d to exit SSH Monitor (Have to wait a while to go back to the main screen)"));
      const SshMonitorResult = await Request.Json(`http://${host}/ssh/Monitor?Token=${Token}`);
      const UsersList = await Request.Json(`http://${host}/ssh/List?Token=${Token}`);
      const BackendData = new Date(SshMonitorResult.BackendDate);
      for (const User of UsersList.map(a => a.username)) {
        const UserData = SshMonitorResult[User];
        const UserInfoFromList = UsersList.find(a => a.username === User);
        let Mess = `${cli_color.redBright(User)} -> Current Connections: ${cli_color.blueBright(UserData.connections.length)}, Max Connections: ${UserInfoFromList.connections === 0 ? cli_color.redBright("Unlimited") : cli_color.yellowBright(UserInfoFromList.connections)}, Time Connected: `;
        let TimeCC = 0
        for (let Connections of UserData.connections) {
          const CalculatedTime = new Date(Connections.node_Date);
          TimeCC += CalculatedTime.getTime() - TimeCC
        }
        TimeCC !== 0 ? Mess += cli_color.greenBright(CalculateTimeConnected(new Date(TimeCC), BackendData)) : Mess += cli_color.redBright("No Connected")
        console.log(Mess);
      }
    } catch (err) {
      console.log(cli_color.redBright(err));
    }
    // wait seconds
    await new Promise(resolve => setTimeout(resolve, 1.5 * 1000));
  }
  return;
}

// Export
module.exports = Home;
