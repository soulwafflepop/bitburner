export async function main(ns) {
  var servers = ns.getPurchasedServers();
  for (var i = 0; i < servers.length; i++) {
    ns.killall(servers[0]);
  }
  ns.tprint("---All Scripts on PSERVERS Killed---");
}
