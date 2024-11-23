// repository for functions

//returns the time of day in milliseconds
export function timeOfDay() {
  var now = new Date();
  var hrs = now.getHours();
  if (hrs >= 13) {
    hrs = hrs - 12;
  }
  let hrsMs = hrs * (3.6e6);
  var min = now.getMinutes();
  let minMs = min * (6e4);
  var sec = now.getSeconds();
  let secMs = sec * (1e3);
  let timeOfDay = hrsMs + minMs + secMs;
  return timeOfDay;
}

//formats milliseconds to hrs:min:sec
export function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
}

//removes empty arrays from a nested array
export function removeEmpty(ns, arr) {
  for (let i = arr.length - 1; i >= 0; i--) {
    var temp = arr[i];
    if (temp.length === 0) {
      arr.splice(i, 1);
    }
  }
  arr = arr.flat();
  return arr;
}

//finds the largest number in an array
export function findLargest(ns, arr, dpt) {
  //sets the first item of the array as the largest
  var max = arr[0];
  for (var i = 0; i < arr.length; i++) {
    //filters through all objects in array to find largest value
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  if (!(dpt > 1)) {
    //returns max if depth is 1 or undefined
    return arr.indexOf(max);
  }
  if (dpt > 1) {
    //will filter out the largest values, iterated dpt times, to return the 2nd, 3rd, 4th, etc largest value
    for (var i = 1; i < dpt; i++) {
      //removes largest value
      let indexOfMax = arr.indexOf(max);
      arr[indexOfMax] = 0;

      max = arr[0];
      for (var i = 0; i < arr.length; i++) {
        //filters through all objects in array to find largest value
        if (arr[i] > max) {
          max = arr[i];
        }
      }
    }
  }
  return arr.indexOf(max);
}

//finds the best servers to hack, returns an array
export async function target(ns, depth, exclFirst, printer) {
  var serversTotal = serverList(ns);
  var openServersTotal = [];
  var moneyList = [];
  var orderedServers = [];
  var orderedMoney = [];

  //attempts to open all servers
  for (var i = 0; i < serversTotal.length; i++) {
    if (ns.hasRootAccess(serversTotal[i]) == false) {
      ns.exec("crack.js", "home", 1, serversTotal[i])
      await ns.sleep(10);
    }
    //adds open servers to new array
    if (ns.hasRootAccess(serversTotal[i]) == true) {
      openServersTotal.push(serversTotal[i]);
    }
  }

  //creates a parallel array of maximum money
  for (var i = 0; i < openServersTotal.length; i++) {
    let temp = ns.getServerMaxMoney(openServersTotal[i]);
    moneyList.push(temp);
  }

  //creates new parallel arrays of servers with the most money in descending order
  for (var i = 0; i < moneyList.length; i++) {
    var iMax = findLargest(ns, moneyList, (i + 1));
    orderedServers.push(openServersTotal[iMax]);
    orderedMoney.push(moneyList[iMax]);
  }

  if (exclFirst == true) {
    orderedServers.splice(0, 1);
    orderedMoney.splice(0, 1);
    var iterate = 1;
  } else {
    var iterate = 0;
    depth = depth - 1;
  }

  if (printer == true) {
    for (var i = iterate; i < depth; i++) {
      ns.tprint("Optimal Target (", (i + 1), "): ", orderedServers[i], " with ", abbr(orderedMoney[i]))
    }
  }

  for (var i = 0; i < orderedServers.length; i++) {
    //copies scripts to servers
    ns.scp(["earlyHackTemplate.js", "managerHack.js", "managerGrow.js", "managerWeaken.js", "functions.js"], orderedServers[i], "home");
  }
  return orderedServers;
}

//abbreviates numbers to simple notation
export function abbr(val, places) {
  var plcs = 2;
  if (typeof places == 'number') {
    plcs = Math.floor(places);
  }
  if (val < 1e3) {
    return val.toFixed(plcs);
  } else if (val >= 1e3 && val < 1e6) {
    return ((val / 1e3).toFixed(plcs) + "K");
  } else if (val >= 1e6 && val < 1e9) {
    return ((val / 1e6).toFixed(plcs) + "M");
  } else if (val >= 1e9 && val < 1e12) {
    return ((val / 1e9).toFixed(plcs) + "B");
  } else {
    return ((val / 1e12).toFixed(plcs) + "T");
  }
}

//abbrevaites RAMs to simple notation
export function abbrRam(ram) {
  if (ram < 1e3) {
    return (ram.toFixed(2) + "GB");
  } else if (ram >= 1e3 && ram < 1e6) {
    return ((ram / 1e3).toFixed(2) + "TB");
  } else {
    return ((ram / 1e6).toFixed(2) + "PB");
  }
}


//generates a list of all servers
export function serverList(ns) {
  const servers = ["home"];
  for (const server of servers) {
    const others = ns.scan(server);
    for (const other of others) {
      if (!servers.includes(other)) servers.push(other);
    }
  }
  return servers;
}

//brings target server to maximum money and minimum security
export async function setServerUp(ns, target, maxMoney, minSecurity) {
  while ((currentMoneyAvailable < (maxMoney - 1000)) || (currentSecurity > (minSecurity + 0.1))) {
    var currentSecurity = ns.getServerSecurityLevel(target);
    var currentMoneyAvailable = ns.getServerMoneyAvailable(target);
    var ttSleep = 0;
    var server = ns.getServer(target);
    var cores = ns.getServer("home").cpucores;
    var player = ns.getPlayer();
    if (currentMoneyAvailable < (maxMoney - 1000)) {
      if (currentMoneyAvailable == maxMoney) {
        break;
      }
      var growThread = ns.formulas.hacking.growThreads(server, player, maxMoney, cores);
      if ((growThread * 1.75) > maxRam) {
        var growThread = Math.floor(maxRam / 1.75);
      }
      ns.print("Growing(SU): ", target, " with ", growThread, " threads");
      ns.exec("managerGrow.js", "home", growThread, target, 0); //grows target if not at max money
      ttSleep = ns.formulas.hacking.growTime(server, player);
      await ns.sleep(ttSleep + 1000);
    } else if (currentSecurity > (minSecurity + 0.1)) {
      if (currentSecurity == minSecurity) {
        break;
      }
      let startSL = server.hackDifficulty;
      let endSL = server.minDifficulty;
      var weakenThread = Math.ceil((startSL - endSL) / ns.weakenAnalyze(1, cores));
      if ((weakenThread * 1.75) > maxRam) {
        var weakenThread = Math.floor(maxRam / 1.75);
      }
      ns.print("Weakening(SU): ", target, " with ", weakenThread, " threads");
      ns.exec("managerWeaken.js", "home", weakenThread, target, 0); //weakens target if not at min security
      ttSleep = ns.formulas.hacking.weakenTime(server, player);
      await ns.sleep(ttSleep + 1000);
    }
  }
  ns.scp("managerHack.js", target);
  ns.scp("managerGrow.js", target);
  ns.scp("managerWeaken.js", target);

  if (first == true) {
    ns.tprint(target, " is set up!");
  }
}

//worker script
export async function main(ns, sleepTime = ns.args[1]) {
  await ns.hack(ns.args[0], { additionalMsec: sleepTime });
}


/* OLD FUNCTIONS-------------------------------
function serverList(ns) {
  // depth of 15 nodes
  var serversList = [];
  var server1 = ns.scan("home");
  serversList.push(server1);
  var server2 = []
  serversList.push(server2);
  var server3 = []
  serversList.push(server3);
  var server4 = []
  serversList.push(server4);
  var server5 = []
  serversList.push(server5);
  var server6 = []
  serversList.push(server6);
  var server7 = []
  serversList.push(server7);
  var server8 = []
  serversList.push(server8);
  var server9 = []
  serversList.push(server9);
  var server10 = []
  serversList.push(server10);
  var server11 = []
  serversList.push(server11);
  var server12 = []
  serversList.push(server12);
  var server13 = []
  serversList.push(server13);
  var server14 = []
  serversList.push(server14);
  var server15 = []
  serversList.push(server15);

  for (var i = 0; i < (serversList.length - 1); i++) {
    var scanning = serversList[i];
    var adding = serversList[i + 1];
    for (var j = 0; j < scanning.length; j++) {
      let tempScan = ns.scan(scanning[j]);
      tempScan.splice(0, 1);
      adding.push(tempScan);
    }
    adding = adding.flat();
    serversList[i + 1] = removeEmpty(ns, adding);
  }
  serversList = serversList.flat();
  serversList = removeEmpty(ns, serversList);
  return serversList;
}

function openPorts(ns, target) {
  if (ns.fileExists("SQLInject.exe", "home")) {
    ns.sqlinject(target);
  }
  if (ns.fileExists("HTTPWorm.exe", "home")) {
    ns.httpworm(target);
  }
  if (ns.fileExists("relaySMTP.exe", "home")) {
    ns.relaysmtp(target);
  }
  if (ns.fileExists("FTPCrack.exe", "home")) {
    ns.ftpcrack(target);
  }
  if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.brutessh(target);
  }
  ns.nuke(target);
}


export async function main(ns, depth = (ns.args[0] - 1)) {
  var serversTotal = serverList(ns);

  var openServersTotal = [];
  // attempts to open all available servers
  for (var i = 0; i < serversTotal.length; i++) {
    if (ns.hasRootAccess(serversTotal[i]) == false) {
      ns.exec("crack.js", "home", 1, serversTotal[i]);
      await ns.sleep(20);
    }
  }
  // creates a new array that consists only of servers with root access
  for (var i = 0; i < serversTotal.length; i++) {
    if (ns.hasRootAccess(serversTotal[i]) == true) {
      openServersTotal.push(serversTotal[i]);
    }
  }

  var moneys = [];
  for (var i = 0; i < openServersTotal.length; i++) {
    ns.exec("crack.js", "home", 1, openServersTotal[i]);
    var temp = ns.getServerMaxMoney(openServersTotal[i]);
    moneys.push(temp);
  }

  var iLargestMoneys = findLargest(ns, moneys);
  var largestMoneys = moneys[iLargestMoneys]
  var largestServer = openServersTotal[iLargestMoneys];
  ns.tprint("Optimal Target (1): ", largestServer, " with ", abbr(largestMoneys));
  if (typeof depth === "number") {
    for (var i = 0; i < depth; i++) {
      var iVarLargestMoneys = findLargest(ns, moneys, (i + 2));
      ns.tprint("Optimal Target (", (i + 2), "): ", openServersTotal[iVarLargestMoneys], " with ", abbr(moneys[iVarLargestMoneys]));
    }
  }
}


export async function target(ns, depth = (ns.args[0] - 1), exclFirst = ns.args[1], printer = ns.args[2]) {
  var serversTotal = serverList(ns);

  var openServersTotal = [];
  // attempts to open all available servers
  for (var i = 0; i < serversTotal.length; i++) {
    if (ns.hasRootAccess(serversTotal[i]) == false) {
      ns.exec("crack.js", "home", 1, serversTotal[i]);
      await ns.sleep(20);
    }
  }
  // creates a new array that consists only of servers with root access
  for (var i = 0; i < serversTotal.length; i++) {
    if (ns.hasRootAccess(serversTotal[i]) == true) {
      openServersTotal.push(serversTotal[i]);
    }
  }

  var moneys = [];
  for (var i = 0; i < openServersTotal.length; i++) {
    ns.exec("crack.js", "home", 1, openServersTotal[i]);
    let temp = ns.getServerMaxMoney(openServersTotal[i]);
    moneys.push(temp);
  }

  var servers = [];
  if (exclFirst == false) {
    var iVarLargestMoneys = findLargest(ns, moneys, (i + 1));
    servers.push(openServersTotal[iVarLargestMoneys]);

    ns.tprint(openServersTotal[iVarLargestMoneys]);
    ns.tprint(openServersTotal);
    ns.tprint(iVarLargestMoneys);


  }
  if (printer == true) {
    var iLargestMoneys = findLargest(ns, moneys);
    var largestMoneys = moneys[iLargestMoneys]
    var largestServer = openServersTotal[iLargestMoneys];
    ns.tprint("Optimal Target (1): ", largestServer, " with ", abbr(largestMoneys));
    ns.tprint(servers);

  }
  if (typeof depth === "number") {
    for (var i = 0; i < depth; i++) {
      var iVarLargestMoneys = findLargest(ns, moneys, (i + 2));
      servers.push(openServersTotal[iVarLargestMoneys]);
      if (printer == true) {
        ns.tprint("Optimal Target (", (i + 2), "): ", openServersTotal[iVarLargestMoneys], " with ", abbr(moneys[iVarLargestMoneys]));
      }
    }
  }
  ns.tprint("xxx", servers);
  servers = removeEmpty(ns, servers);
  for (var i = 0; i < servers.length; i++) {
    ns.scp(["earlyHackTemplate.js", "managerHack.js", "managerGrow.js", "managerWeaken.js", "functions.js"], servers[i], "home");
  }
  return servers;
}

export function findLargest(ns, arr, dpt) {
  // finds largest value in an array (max money), returns the index
  var max = arr[0];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  if (dpt > 1) {
    var tempArr = Array.from(arr);
    var iMax = arr.indexOf(max);
    // repeats until reached requested depth
    for (let i = 0; i < (dpt - 1); i++) {
      tempArr.splice(iMax, 1);
      // find largest value in tempArr
      var tempMax = tempArr[0];
      for (let x = 0; x < tempArr.length; x++) {
        if (tempArr[x] > tempMax) {
          tempMax = tempArr[x];
        }
      }
      // finds the largest value in tempArr, to splice on repeat
      iMax = tempArr.indexOf(tempMax);
    }
    // finds the dpt largest value in arr
    iMax = arr.indexOf(tempMax);
    max = arr[iMax];
  }
  if (dpt <= 0 || typeof dpt != 'number') {
    var max = arr[0];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] > max) {
        max = arr[i];
      }
    }
  }
  ns.tprint("anfwnefuo: ", max, "    ", iMax);
  let iLocation = arr.indexOf(max);
  return iLocation;
}
*/
