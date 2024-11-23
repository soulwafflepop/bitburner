import {
  abbr
} from './functions.js'

export async function main(ns) {
  ns.disableLog('ALL');
  checkPreviousInstance(ns);
  const end = Boolean(ns.args[0]); //0 for false, 1 for true
  const hashes = Boolean(ns.args[1]); //0 for false, 1 for true
  const hshRt = Boolean(ns.args[2]); //0 for false, 1 for true
  const karma = Boolean(ns.args[3]); //0 for false, 1 for true
  const doc = eval('document');
  const hook0 = doc.getElementById('overview-extra-hook-0');
  const hook1 = doc.getElementById('overview-extra-hook-1');

  while (true) {
    ns.clearLog();
    var moneyProduction = getProduction(ns);
    if (end == false || ns.args[0] == undefined) {
      try {
        const headers = [];
        const values = [];

        if (hashes == true || ns.args[0] == undefined) {
          headers.push("Hashes");
          values.push("#" + abbr(ns.hacknet.numHashes().toPrecision(5), 3));
          ns.print("Tracking Hashes: true");
        } else { ns.print("Tracking Hashes: false"); }
        if (hshRt == true || ns.args[0] == undefined) {
          headers.push("HshRt");
          values.push("$" + abbr(moneyProduction.toPrecision(5)) + '/sec');
          ns.print("Tracking Hash Rate: true");
        } else { ns.print("Tracking Hash Rate: false"); }
        if (karma == true || ns.args[0] == undefined) {
          headers.push("Karma");
          values.push("-" + abbr(Math.abs(ns.heart.break()), 3))
          ns.print("Tracking Karma: true");
        } else { ns.print("Tracking Karma: false"); }

        hook0.innerText = headers.join(" \n");
        hook1.innerText = values.join("\n");
      } catch (err) {
        ns.print("ERROR: Update Skipped: " + String(err));
      }
    } else if (end == true) {
      try {
        const headers = [];
        const values = [];

        hook0.innerText = headers.join(" \n");
        hook1.innerText = values.join("\n");
      } catch (err) {
        ns.print("ERROR: Update Skipped: " + String(err));
      }
      break;
    }
    await ns.sleep(250);
  }
}

function getProduction(ns) {
  const ratioMoney = 1e6 / 4.00; //$1mil per 4 hashes
  const currentNodes = ns.hacknet.numNodes();
  // loops for all hacknet servers, adds productions together
  var totalProduction = 0;
  for (var i = 0; i < currentNodes; i++) {
    let nodeStats = ns.hacknet.getNodeStats(i);
    let product = nodeStats.production;
    totalProduction = totalProduction + product;
  }

  var moneyProduction = totalProduction * ratioMoney
  return moneyProduction;
}

function checkPreviousInstance(ns) {
  //kill previous versions of script
  const self_name = ns.getScriptName();
  const kill_list = [];
  for (const process of ns.ps()) {
    if (process.filename === self_name && process.pid !== ns.pid) {
      kill_list.push(process.pid);
    }
  }
  for (const pid of kill_list) {
    if (!ns.kill(pid)) {
      ns.tprint(`ERROR: Existing instance of ${self_name} with PID ${pid} is unkillable. Aborting.`);
      ns.exit();
    }
  }
  ns.tprint(`INFO: Previous instances of ${self_name} killed: ${kill_list.join(", ")}`);
}
