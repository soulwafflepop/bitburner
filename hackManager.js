import {
  timeOfDay, msToTime
} from './functions.js'

export async function main(ns, target = String(ns.args[0]), saveRam = ns.args[1], hideTail = Boolean(ns.args[2])) {
  ns.clearLog();
  ns.print("-------INITIATING BATCH MANAGER-------");
  if (typeof saveRam != 'number') {
    ns.alert("-Enter RAM to Save-");
    ns.kill();
  }
  ns.disableLog('ALL');
  if (!(hideTail == true)) {
    ns.tail();
    ns.moveTail(450, 0);
  }
  const hostname = ns.getHostname();
  ns.exec("track.js", hostname, 1, target, hideTail);
  const maxMoney = ns.getServerMaxMoney(target);
  const minSecurity = ns.getServerMinSecurityLevel(target);
  var maxRam = ns.getServer().maxRam - ns.getServerUsedRam(hostname) - saveRam;
  if (maxRam <= 0) {
    ns.alert("-Trying to Save Too Much Ram-");
    ns.kill();
  }
  var maxThreads = maxRam / 1.75;
  await setServerUp(ns, target, maxMoney, minSecurity, maxRam, true); //gets target to min security and max money

  while (true) {
    var currentSecurity = ns.getServerSecurityLevel(target);
    var currentMoneyAvailable = ns.getServerMoneyAvailable(target);
    if ((currentMoneyAvailable < (maxMoney - 100000)) || (currentSecurity > (minSecurity + 1))) {
      await ns.sleep(100);
      if ((currentMoneyAvailable < (maxMoney - 100000)) || (currentSecurity > (minSecurity + 1))) {
        await ns.sleep(100);
        if ((currentMoneyAvailable < (maxMoney - 100000)) || (currentSecurity > (minSecurity + 1))) {
          await ns.sleep(100);
          if ((currentMoneyAvailable < (maxMoney - 100000)) || (currentSecurity > (minSecurity + 1))) {
            await setServerUp(ns, target, maxMoney, minSecurity, maxRam);
          }
        }
      }
    }


    ns.disableLog('sleep');
    // // batch loop:
    //setting variables:
    var player = ns.getPlayer();
    var cores = ns.getServer().cpuCores || 1;
    var server = ns.getServer(target);
    var maxRam = ns.getServer().maxRam - ns.getServerUsedRam(hostname) - saveRam;
    var maxThreads = maxRam / 1.75;

    var moneyCurrent = ns.getServerMoneyAvailable(target);
    var moneyTarget = 0.5 * maxMoney;
    var hackPct = ns.formulas.hacking.hackPercent(server, player);
    var numHackThreads = Math.ceil(((moneyCurrent - moneyTarget) / moneyCurrent) / hackPct);
    //ns.print("hack threads: ", numHackThreads);

    var hackSecurityIncrease = 0.002 * numHackThreads;
    var numWeaken1Threads = Math.ceil(hackSecurityIncrease / ns.weakenAnalyze(1, cores));
    //ns.print("weaken1 threads: ", numWeaken1Threads);



    var leftOverMoney = (1 - (ns.hackAnalyze(target) * numHackThreads)) * maxMoney;
    server.moneyAvailable = leftOverMoney;
    var numGrowThreads = ns.formulas.hacking.growThreads(server, player, maxMoney, cores);
    //ns.print("grow threads: ", numGrowThreads);



    var growSecurityIncrease = 0.004 * numGrowThreads
    var numWeaken2Threads = Math.ceil(growSecurityIncrease / ns.weakenAnalyze(1, cores));
    //ns.print("weaken2 threads: ", numWeaken2Threads);


    while ((numHackThreads + numWeaken1Threads + numGrowThreads + numWeaken2Threads) > maxThreads) {
      //decreasing thread counts if exceeding ram capacity
      numHackThreads = Math.floor(numHackThreads * 0.9);
      numWeaken1Threads = Math.floor(numWeaken1Threads * 0.9);
      numGrowThreads = Math.floor(numGrowThreads * 0.9);
      numWeaken2Threads = Math.floor(numWeaken2Threads * 0.9);
      await ns.sleep(10);
    }

    while ((numWeaken1Threads == 0) || (numWeaken2Threads == 0) || (numGrowThreads == 0) || (numHackThreads == 0)) {
      //repeats code if threads are too low
      player = ns.getPlayer();
      cores = ns.getServer().cpuCores || 1;
      server = ns.getServer(target);
      maxRam = ns.getServer().maxRam - ns.getServerUsedRam(hostname) - saveRam;
      maxThreads = maxRam / 1.75;

      moneyCurrent = ns.getServerMoneyAvailable(target);
      moneyTarget = 0.5 * maxMoney;
      hackPct = ns.formulas.hacking.hackPercent(server, player);
      numHackThreads = Math.ceil(((moneyCurrent - moneyTarget) / moneyCurrent) / hackPct);
      //ns.print("hack threads: ", numHackThreads);

      hackSecurityIncrease = 0.002 * numHackThreads;
      numWeaken1Threads = Math.ceil(hackSecurityIncrease / ns.weakenAnalyze(1, cores));
      //ns.print("weaken1 threads: ", numWeaken1Threads);



      leftOverMoney = (1 - (ns.hackAnalyze(target) * numHackThreads)) * maxMoney;
      server.moneyAvailable = leftOverMoney;
      numGrowThreads = ns.formulas.hacking.growThreads(server, player, maxMoney, cores);
      //ns.print("grow threads: ", numGrowThreads);



      growSecurityIncrease = 0.004 * numGrowThreads
      numWeaken2Threads = Math.ceil(growSecurityIncrease / ns.weakenAnalyze(1, cores));
      //ns.print("weaken2 threads: ", numWeaken2Threads);

      while ((numHackThreads + numWeaken1Threads + numGrowThreads + numWeaken2Threads) > maxThreads) {
        //decreasing thread counts if exceeding ram capacity
        numHackThreads = Math.floor(numHackThreads * 0.9);
        numWeaken1Threads = Math.floor(numWeaken1Threads * 0.9);
        numGrowThreads = Math.floor(numGrowThreads * 0.9);
        numWeaken2Threads = Math.floor(numWeaken2Threads * 0.9);
        await ns.sleep(10);
      }
      await ns.sleep(250);
    }

    var currentSecurity = ns.getServerSecurityLevel(target);
    var currentMoneyAvailable = ns.getServerMoneyAvailable(target);
    if ((currentMoneyAvailable < (maxMoney - 100000)) || (currentSecurity > (minSecurity + 1))) {
      await ns.sleep(100);
      if ((currentMoneyAvailable < (maxMoney - 100000)) || (currentSecurity > (minSecurity + 1))) {
        await ns.sleep(100);
        if ((currentMoneyAvailable < (maxMoney - 100000)) || (currentSecurity > (minSecurity + 1))) {
          await ns.sleep(100);
          if ((currentMoneyAvailable < (maxMoney - 100000)) || (currentSecurity > (minSecurity + 1))) {
            await setServerUp(ns, target, maxMoney, minSecurity, maxRam);
          }
        }
      }
    }

    // executing batch:
    ns.print("Weakening(1) ", target + " with ", numWeaken1Threads + " threads");
    let sleepTime = 0; //starts immediately, first command in batch, offsets hack()
    ns.exec("managerWeaken.js", hostname, numWeaken1Threads, target, sleepTime);

    ns.print("Weakening(2) ", target + " with ", numWeaken2Threads + " threads");
    sleepTime = 40; //starts 40ms (2 commands) after first weaken, offsets grow()
    ns.exec("managerWeaken.js", hostname, numWeaken2Threads, target, sleepTime);

    ns.print("Growing ", target + " with ", numGrowThreads + " threads");
    sleepTime = (ns.formulas.hacking.weakenTime(ns.getServer(target), player) + 20) - (ns.formulas.hacking.growTime(server, player)); //sleep for (time to weaken + 20ms) - (time to grow)
    ns.exec("managerGrow.js", hostname, numGrowThreads, target, sleepTime);

    ns.print("Hacking ", target + " with ", numHackThreads + " threads");
    sleepTime = (ns.formulas.hacking.weakenTime(ns.getServer(target), player) - 20) - (ns.formulas.hacking.hackTime(ns.getServer(target), player)); //sleep for (time to weaken - 20ms) - (time to hack)
    ns.exec("managerHack.js", hostname, numHackThreads, target, sleepTime);
    ns.print("- - -");


    if (numHackThreads <= 0) {
      await setServerUp(ns, target, maxMoney, minSecurity, maxRam);
    }

    await ns.sleep(50); //sleep to offset batches
    ns.enableLog('sleep');
  }
}

async function setServerUp(ns, target, maxMoney, minSecurity, maxRam, first) {
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
