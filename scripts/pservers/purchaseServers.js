export async function main(ns, ram = ns.args[0], serversToBuy = ns.args[1], upgrade = ns.args[2]) {
  //serversToBuy is kinda jank, only really for buying your first server
  
  ram = Math.pow(2, ram);
  var servers = ns.getPurchasedServers();
  var numServers = servers.length;
  if (!(upgrade === true)) {
    var i = numServers;
    if (serversToBuy == undefined || serversToBuy == 0) {
      serversToBuy = ns.getPurchasedServerLimit();
    }
    while (i < serversToBuy) {
      if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
        let name = "pserv-" + i.toString().padStart(2, '0');
        let hostname = ns.purchaseServer(name, ram);
        ns.scp("hackManager.js", hostname);
        ns.scp("managerHack.js", hostname);
        ns.scp("managerGrow.js", hostname);
        ns.scp("managerWeaken.js", hostname);
        ns.scp("track.js", hostname);
        ns.scp("growAnalyze.js", hostname);
        ns.scp("weakenAnalyze.js", hostname);
        ns.scp("functions.js", hostname);
        ++i;
      }
      await ns.sleep(1000);
    }
    ns.alert("-Maximum Servers Reached-");
  } else if (upgrade === true) {
    for (var i = 0; i < numServers; i++) {
      if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerUpgradeCost(servers[i], ram)) {
        ns.upgradePurchasedServer(servers[i], ram)
      }
    }
    ns.alert("-All Servers Upgraded-");
  }
}
