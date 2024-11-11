import {
  abbr
} from './functions.js'

export async function main(ns, target = ns.args[0], ttw = ns.args[1]) {
  if (ns.args[0] === undefined) {
    ns.alert("Enter an Argument");
  } else {
    // sets thresholds
    const moneyThresh = 0.75 * ns.getServerMaxMoney(target);
    const securityThresh = 5 + ns.getServerMinSecurityLevel(target);
    if (!(ns.args[1] === undefined)) {
      await ns.sleep(ttw);
    }
    // hacking loop
    while (true) {
      if (ns.getServerSecurityLevel(target) > securityThresh) {
        ns.print("~~~WEAKENING TARGET~~~");
        ns.print("Security Threshold: ", securityThresh);
        await ns.weaken(target);
      } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
        ns.print("~~~GROWING TARGET~~~");
        ns.print("Money Threshold: $", abbr(moneyThresh));
        ns.print("- - - - -");
        await ns.grow(target);
      } else {
        ns.print("~~~HACKING TARGET~~~");
        await ns.hack(target);
      }
      ns.print("- - - - -");
      ns.getServerSecurityLevel(target);
      ns.getServerMinSecurityLevel(target);
      ns.print("Security Threshold: ", securityThresh);
      ns.print("- - - - -");
      ns.getServerMoneyAvailable(target);
      ns.print("Money Threshold: $", abbr(moneyThresh));
      ns.print("- - - - -");
    }
  }
}
