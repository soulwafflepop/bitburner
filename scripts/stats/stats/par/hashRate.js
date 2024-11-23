import {
  abbr
} from '/functions.js'

export async function main(ns, remove = Boolean(ns.args[3])) {
  var hook0 = ns.args[0];
  var hook1 = ns.args[1];
  var hv = ns.args[2];
  var headers = hv[0];
  var values = hv[1];

  var moneyProduction = production(ns);

  try {
    headers.push("HshRt");
    values.push("$" + abbr(moneyProduction.toPrecision(5)) + '/sec');


    hook0.innerText = headers.join(" \n");
    hook1.innerText = values.join("\n");
  } catch (err) {
    ns.print("ERROR: Update Skipped: " + String(err));
  }
  hv = [headers, values];
  return hv;
}

async function production(ns) {
  const ratioMoney = 1e6 / 4.00; //$1mil per 4 hashes
  const currentNodes = ns.hacknet.numNodes();
  var totalProduction = 0;
  for (var i = 0; i < currentNodes; i++) {
    let nodeStats = ns.hacknet.getNodeStats(i);
    let product = nodeStats.production;
    totalProduction = totalProduction + product;
  }
  var moneyProduction = totalProduction * ratioMoney;
  return moneyProduction;
}
