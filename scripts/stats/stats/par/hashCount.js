import {
  abbr
} from '/functions.js'

export async function main(ns) {
  var hook0 = ns.args[0];
  var hook1 = ns.args[1];
  var hv = ns.args[2];
  var headers = hv[0];
  var values = hv[1];
  try {
    headers.push("Hashes");
    values.push("#" + abbr(ns.hacknet.numHashes().toPrecision(5)));


    hook0.innerText = headers.join(" \n");
    hook1.innerText = values.join("\n");
  } catch (err) {
    ns.print("ERROR: Update Skipped: " + String(err));
  }
  
  hv = [headers, values];
  return hv;
}
