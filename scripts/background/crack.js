export async function main(ns, target = ns.args[0]) {
  var count = 0;
  if (ns.fileExists("SQLInject.exe", "home")) {
    ns.sqlinject(target);
    ++count;
  }
  if (ns.fileExists("HTTPWorm.exe", "home")) {
    ns.httpworm(target);
    ++count;
  }
  if (ns.fileExists("relaySMTP.exe", "home")) {
    ns.relaysmtp(target);
    ++count;
  }
  if (ns.fileExists("FTPCrack.exe", "home")) {
    ns.ftpcrack(target);
    ++count;
  }
  if (ns.fileExists("BruteSSH.exe", "home")) {
    ns.brutessh(target);
    ++count;
  }
  if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(target) && count >= ns.getServerNumPortsRequired(target)) {
    ns.nuke(target);
  } else {
    ns.print("Not Able to Nuke ", target);
    ns.tail();
    await ns.sleep(1500);
    ns.closeTail();
  }
}
