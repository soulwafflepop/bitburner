import {
  timeOfDay, msToTime, openServerList
} from '/functions.js'
const INBTIME = 200; //ms of time between HWGW
const MNYTARGET = 0.5; //percent of money to hack away

export async function main(ns, target = String(ns.args[0]), saveRam = ns.args[1], hideTail = Boolean(ns.args[2])) {
  const hostname = ns.getHostname();
  var maxRam;
  const serverList = await openServerList(ns);
  var checkTarget = false;
  for (var i = 0; i < serverList.length; i++) {
    if (target == serverList[i]) {
      checkTarget = true;
    }
  }
  if (checkTarget == false) {
    ns.alert("Enter Valid Target");
    ns.kill();
  }
  if (typeof saveRam != 'number' || saveRam < 0) {
    ns.alert("Enter Valid RAM to Save");
    ns.kill();
  } else {
    var freeRam = ns.getServer(hostname).maxRam - ns.getServerUsedRam(hostname);
    maxRam = freeRam - saveRam;
  }
  if (maxRam < 7) {
    ns.alert("Not Enough RAM");
    ns.kill();
  }

  ns.clearLog();
  ns.disableLog('ALL');
  ns.print("---INITIATING BATCH MANAGER---");

  if (!(hideTail == true)) {
    ns.tail();
    ns.moveTail(430, 0);
  }
  const trackPID = ns.exec("track.js", hostname, 1, target, hideTail);


  await setServerUp(ns, target, maxRam, true);


  while (true) { //hacking loop
    //resetting variables
    freeRam = ns.getServer(hostname).maxRam - ns.getServerUsedRam(hostname);
    maxRam = freeRam - saveRam;
    var maxThreads = Math.floor(maxRam / 1.75);
    var player = ns.getPlayer();
    var server = ns.getServer(target);
    var cores = hostname == "home" ? ns.getServer(hostname).cpuCores : 1;

    const maxMoney = ns.getServerMaxMoney(target);
    const minSecurity = ns.getServerMinSecurityLevel(target);

    //calculating threads
    //var moneyCurrent = ns.getServerMoneyAvailable(target);
    var moneyTarget = MNYTARGET * maxMoney;
    var hackPct = ns.formulas.hacking.hackPercent(server, player);
    var numHackThreads = Math.ceil(((maxMoney - moneyTarget) / maxMoney) / hackPct);

    var hackSecurityIncrease = 0.002 * numHackThreads;
    var numWeaken1Threads = Math.ceil(hackSecurityIncrease / ns.weakenAnalyze(1, cores));

    var leftOverMoney = (1 - (ns.hackAnalyze(target) * numHackThreads)) * maxMoney;
    server.moneyAvailable = leftOverMoney;
    var numGrowThreads = ns.formulas.hacking.growThreads(server, player, maxMoney, cores);

    var growSecurityIncrease = 0.004 * numGrowThreads;
    var numWeaken2Threads = Math.ceil(growSecurityIncrease / ns.weakenAnalyze(1, cores));

    //decreasing threads if too large
    var tempMnyTarget = MNYTARGET;
    while ((numHackThreads + numWeaken1Threads + numGrowThreads + numWeaken2Threads) > maxThreads) {
      //var moneyCurrent = ns.getServerMoneyAvailable(target);
      var moneyTarget = tempMnyTarget * maxMoney;
      var hackPct = ns.formulas.hacking.hackPercent(server, player);
      var numHackThreads = Math.ceil(((maxMoney - moneyTarget) / maxMoney) / hackPct);

      var hackSecurityIncrease = 0.002 * numHackThreads;
      var numWeaken1Threads = Math.ceil(hackSecurityIncrease / ns.weakenAnalyze(1, cores));

      var leftOverMoney = (1 - (ns.hackAnalyze(target) * numHackThreads)) * maxMoney;
      server.moneyAvailable = leftOverMoney;
      var numGrowThreads = ns.formulas.hacking.growThreads(server, player, maxMoney, cores);

      var growSecurityIncrease = 0.004 * numGrowThreads;
      var numWeaken2Threads = Math.ceil(growSecurityIncrease / ns.weakenAnalyze(1, cores));

      tempMnyTarget *= 1.02; //decreases attempted money to hack if threads are too high
      if (tempMnyTarget > 0.99) {
        ns.alert("Thread Limit Error");
        ns.kill(trackPID);
        ns.kill();
      }
    }
    
    // executing batch:
    ns.print("Weakening(1) ", target + ": ", numWeaken1Threads + " threads");
    let sleepTime = 0; //starts immediately, first command in batch, offsets hack()
    ns.exec("managerWeaken.js", hostname, numWeaken1Threads, target, sleepTime);

    ns.print("Weakening(2) ", target + ": ", numWeaken2Threads + " threads");
    sleepTime = 2 * INBTIME; //starts 200ms (2 commands) after first weaken, offsets grow()
    ns.exec("managerWeaken.js", hostname, numWeaken2Threads, target, sleepTime);

    ns.print("Growing ", target + ": ", numGrowThreads + " threads");
    sleepTime = (ns.formulas.hacking.weakenTime(ns.getServer(target), player) + INBTIME) - (ns.formulas.hacking.growTime(server, player)); //sleep for (time to weaken + 100ms) - (time to grow)
    ns.exec("managerGrow.js", hostname, numGrowThreads, target, sleepTime);

    ns.print("Hacking ", target + ": ", numHackThreads + " threads");
    sleepTime = (ns.formulas.hacking.weakenTime(ns.getServer(target), player) - INBTIME) - (ns.formulas.hacking.hackTime(ns.getServer(target), player)); //sleep for (time to weaken - 100ms) - (time to hack)
    ns.exec("managerHack.js", hostname, numHackThreads, target, sleepTime);
    ns.print("- - -");

    await ns.sleep(1000); //sleep to offset batches
  }
}

//server setup function
async function setServerUp(ns, target, maxRam, msg) {
  const hostname = ns.getHostname();
  const maxMoney = ns.getServerMaxMoney(target);
  var currentMoney = ns.getServerMoneyAvailable(target);

  const minSecurity = ns.getServerMinSecurityLevel(target);
  var currentSecurity = ns.getServerSecurityLevel(target);

  ns.print("Server Setting Up...");
  while (currentMoney != maxMoney || currentSecurity != minSecurity) {
    var currentSecurity = ns.getServerSecurityLevel(target);
    var currentMoney = ns.getServerMoneyAvailable(target);
    var ttSleep = 0;
    var server = ns.getServer(target);
    var cores = ns.getServer(hostname).cpucores;
    var player = ns.getPlayer();

    if (currentMoney != maxMoney) {
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

    } else if (currentSecurity != minSecurity) {
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

  if (msg == true) {
    ns.tprint(target, " is set up!");
  }
}
