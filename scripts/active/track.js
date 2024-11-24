import {
  abbr, findLargest, serverList
} from './functions.js'


export async function main(ns, target = ns.args[0], hideTail = ns.args[1]) {
  if (!(ns.args[0] === undefined)) {
    var target = ns.args[0];
  } else {
    var target = await findTarget(ns);
  }
  if (ns.getServerMaxMoney(target) == 0 || ns.getServerMaxMoney(target) == undefined) {
    ns.alert("-Server Not Applicable-");
  } else {
    ns.disableLog("sleep");
    if (!(hideTail == true)) {
      ns.tail();
      ns.moveTail(930, 0);
    }
    while (true) {
      ns.clearLog();
      var maxMoney = ns.getServerMaxMoney(target);
      var currentMoney = ns.getServerMoneyAvailable(target);
      var moneyThresh = 0.75 * ns.getServerMaxMoney(target);

      var minSecurity = ns.getServerMinSecurityLevel(target);
      var currentSecurity = ns.getServerSecurityLevel(target);
      var securityThresh = 5 + ns.getServerMinSecurityLevel(target);
      ns.clearLog();

      ns.print("~Tracking '", target, "'~");
      ns.print("- - - - - - - - - -");
      ns.print("Maximum Money:");
      ns.print("$", abbr(maxMoney));
      ns.print("Current Money:");
      ns.print("$", abbr(currentMoney));
      //ns.print("Money Threshold:");
      //ns.print("$", abbr(moneyThresh));
      ns.print("- - - - - - - - - -");
      ns.print("Minumum Security:");
      ns.print(minSecurity);
      ns.print("Current Security:");
      ns.print(currentSecurity);
      //ns.print("Security Threshold:");
      //ns.print(securityThresh);
      ns.print("- - - - - - - - - -");
      /*
      if (currentMoney >= moneyThresh) {
        var enoughMoney = true;
      } else {
        var enoughMoney = false;
      }
      if (currentSecurity <= securityThresh) {
        var enoughWeak = true;
      } else {
        var enoughWeak = false;
      }
      if (enoughMoney == true && enoughWeak == true) {
        ns.print("~Able to Hack~");
      } else if (enoughMoney == true && enoughWeak == false) {
        ns.print("~Need to Weaken~");
      } else if (enoughMoney == false && enoughWeak == true) {
        ns.print("~Need to Grow~");
      } else {
        ns.print("~Need to Weaken and Grow~");
      }
      ns.print("- - - - - - - - - -");
      */
      await ns.sleep(50);
    }
  }
}

//copy of target.js, for function use
async function findTarget(ns) {
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
  return largestServer;
}
