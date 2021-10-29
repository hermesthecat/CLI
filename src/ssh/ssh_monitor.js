const readline = require("readline");
const Request = require("../lib/Request");

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
      console.log("Press ctrl + d to exit Ssh Monitor");
      const UsersList = await Request.Json(`http://${host}/ssh/Monitor?Token=${Token}`);
      const BackendData = new Date(UsersList.BackendDate);
      for (const User of Object.getOwnPropertyNames(UsersList).filter(user => user !== "BackendDate")) {
        const UserData = UsersList[User];
        console.log(`${User} -- Connections: ${UserData.connections.length} -- >>:`);
        for (let Connections of UserData.connections) {
          const CalculatedTime = new Date(Connections.node_Date);
          console.log(`Connection :-> ${CalculateTimeConnected(CalculatedTime, BackendData)} <-:`);
        }
        console.log(`:<< ${User}`);
        console.log();
      }
    } catch (err) {}
    // wait seconds
    await new Promise(resolve => setTimeout(resolve, 4 * 1000));
  }
  return;
}

// Export
module.exports = Home;
