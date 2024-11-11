export async function main(ns) {
  var servers = ns.getPurchasedServers();
  for (var i = 0; i < servers.length; i++) {
    let hostname = servers[i];
    ns.scp("hackManager.js", hostname);
    ns.scp("managerHack.js", hostname);
    ns.scp("managerGrow.js", hostname);
    ns.scp("managerWeaken.js", hostname);
    ns.scp("track.js", hostname);
    ns.scp("growAnalyze.js", hostname);
    ns.scp("weakenAnalyze.js", hostname);
    ns.scp("functions.js", hostname);
  }
}
