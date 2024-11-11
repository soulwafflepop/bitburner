// repository for functions

//returns the time of day in milliseconds
export function timeOfDay() {
  var now = new Date();
  var hrs = now.getHours();
  if (hrs >= 12) {
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
  // finds largest value in an array (max money), returns the index
  let max = arr[0];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > max) {
      max = arr[i];
    }
  }
  if (typeof dpt === "number") {
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
  let iLocation = arr.indexOf(max);
  return iLocation;
}

//finds the best servers to hack, returns an array
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
  }
  if (printer == true) {
    var iLargestMoneys = findLargest(ns, moneys);
    var largestMoneys = moneys[iLargestMoneys]
    var largestServer = openServersTotal[iLargestMoneys];
    ns.tprint("Optimal Target (1): ", largestServer, " with ", abbr(largestMoneys));
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
  return servers;
}

//abbreviates numbers to simple notation
export function abbr(val) {
  if (val < 1e3) {
    return val;
  } else if (val >= 1e3 && val < 1e6) {
    return ((val / 1e3).toFixed(2) + "K");
  } else if (val >= 1e6 && val < 1e9) {
    return ((val / 1e6).toFixed(2) + "M");
  } else if (val >= 1e9 && val < 1e12) {
    return ((val / 1e9).toFixed(2) + "B");
  } else {
    return ((val / 1e12).toFixed(2) + "T");
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
export async function setServerUp(ns, target, maxMoney, minSecurity, maxRam, first) {
  var currentMoneyAvailable = ns.getServerMoneyAvailable(target);
  var currentSecurity = ns.getServerSecurityLevel(target);
  var hostname = ns.getHostname();
  ns.print("- - - - -");
  while ((currentMoneyAvailable < (maxMoney - 1000)) || (currentSecurity > (minSecurity + 0.1))) {
    var currentSecurity = ns.getServerSecurityLevel(target);
    var currentMoneyAvailable = ns.getServerMoneyAvailable(target);
    var ttSleep = 0;
    var server = ns.getServer(target);
    var cores = ns.getServer(hostname).cpucores;
    var player = ns.getPlayer();
    if (currentMoneyAvailable < (maxMoney - 1000)) { //grows to max if not at near max
      var growThread = ns.formulas.hacking.growThreads(server, player, maxMoney, cores);
      if ((growThread * 1.75) > maxRam) { //if threads to grow to max require too much RAM, will only do as many threads as possible
        var growThread = Math.floor(maxRam / 1.75);
      }
      ttSleep = ns.formulas.hacking.growTime(server, player);
      var time = timeOfDay();

      ns.print("Growing(SU): ", target, " with ", growThread, " threads");
      ns.print("...for ", ns.tFormat(ttSleep));
      ns.print("...until ", msToTime(time + ttSleep));
      
      ns.exec("managerGrow.js", hostname, growThread, target, 0); //grows target if not at max money
      
      ns.print("- - - - -");
      await ns.sleep(ttSleep + 1000);
    } else if (currentSecurity > (minSecurity + 0.1)) { //weakens security if money is near max and security isnt near lowest
      let startSL = server.hackDifficulty;
      let endSL = server.minDifficulty;
      var weakenThread = Math.ceil((startSL - endSL) / ns.weakenAnalyze(1, cores));
      if ((weakenThread * 1.75) > maxRam) { //if threads to weaken to min require too much RAm, will only do as many threads as possible
        var weakenThread = Math.floor(maxRam / 1.75);
      }
      ttSleep = ns.formulas.hacking.weakenTime(server, player);
      var time = timeOfDay();
      
      ns.print("Weakening(SU): ", target, " with ", weakenThread, " threads");
      ns.print("...for ", ns.tFormat(ttSleep));
      ns.print("...until ", msToTime(time + ttSleep));
      
      ns.exec("managerWeaken.js", hostname, weakenThread, target, 0); //weakens target if not at min security
      
      ns.print("- - - - -");
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
*/
