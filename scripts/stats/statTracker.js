import {
  abbr
} from './functions.js'

export async function main(ns) {
  const end = Boolean(ns.args[0]); //0 for false, 1 for true
  const hashes = Boolean(ns.args[1]); //0 for false, 1 for true
  const hshRt = Boolean(ns.args[2]); //0 for false, 1 for true
  const karma = Boolean(ns.args[3]); //0 for false, 1 for true
  const doc = eval('document');
  const hook0 = doc.getElementById('overview-extra-hook-0');
  const hook1 = doc.getElementById('overview-extra-hook-1');

  while (true) {
    var moneyProduction = getProduction(ns);
    if (ns.args[0] == undefined) { //runs hashes, hshRt, and karma
      try {
        const headers = [];
        const values = [];

        headers.push("Hashes");
        values.push("#" + abbr(ns.hacknet.numHashes().toPrecision(5)));

        headers.push("HshRt");
        values.push("$" + abbr(moneyProduction.toPrecision(5)) + '/sec');

        headers.push("Karma");
        values.push(abbr(ns.heart.break()))

        hook0.innerText = headers.join(" \n");
        hook1.innerText = values.join("\n");
      } catch (err) {
        ns.print("ERROR: Update Skipped: " + String(err));
      }
    } else {
      if (hashes == true) {
        try {
          const headers = [];
          const values = [];

          headers.push("Hashes");
          values.push("#" + abbr(ns.hacknet.numHashes().toPrecision(5)));

          hook0.innerText = headers.join(" \n");
          hook1.innerText = values.join("\n");
        } catch (err) {
          ns.print("ERROR: Update Skipped: " + String(err));
        }
      }
      if (hshRt == true) {
        try {
          const headers = [];
          const values = [];

          headers.push("HshRt");
          values.push("$" + abbr(moneyProduction.toPrecision(5)) + '/sec');

          hook0.innerText = headers.join(" \n");
          hook1.innerText = values.join("\n");
        } catch (err) {
          ns.print("ERROR: Update Skipped: " + String(err));
        }
      }
      if (karma == true) {
        try {
          const headers = [];
          const values = [];

          headers.push("Karma");
          values.push(abbr(ns.heart.break()));

          hook0.innerText = headers.join(" \n");
          hook1.innerText = values.join("\n");
        } catch (err) {
          ns.print("ERROR: Update Skipped: " + String(err));
        }
      }
    }
    if (end == true) {
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
