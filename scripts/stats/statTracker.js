export async function main(ns, stat = ns.args[0]) {
  const doc = eval('document');
  const hook0 = doc.getElementById('overview-extra-hook-0');
  const hook1 = doc.getElementById('overview-extra-hook-1');
  var headers = [];
  var values = [];
  var hv = [headers, values];
  if (stat == undefined) {
    ns.exec("stats/hashCount.js", "home", 1, hook0, hook1, hv);
    hv = ns.exec("stats/par/hashCount.js", "home", 1, hook0, hook1, hv);

    ns.exec("stats/hashRate.js", "home", 1, hook0, hook1, hv);
    hv = ns.exec("stats/par/hashRate.js", "home", 1, hook0, hook1, hv);

    ns.exec("stats/karma.js", "home", 1, hook0, hook1, hv);
    hv = ns.exec("stats/par/karma.js", "home", 1, hook0, hook1, hv);

  } else if (stat == 'hashes' || stat == 'hash' || stat == 'h') {
    ns.exec("stats/hashCount.js", "home", 1, hook0, hook1, hv);
    hv = ns.exec("stats/par/hashCount.js", "home", 1, hook0, hook1, hv);

  } else if (stat == 'rate' || stat == 'hrate' || stat == 'hr' || stat == "hashrate") {
    ns.exec("stats/hashRate.js", "home", 1, hook0, hook1, hv);
    hv = ns.exec("stats/par/hashRate.js", "home", 1, hook0, hook1, hv);

  } else if (stat == 'karma' || stat == 'k' || stat == 'kar') {
    ns.exec("stats/karma.js", "home", 1, hook0, hook1, hv);
    hv = ns.exec("stats/par/karma.js", "home", 1, hook0, hook1, hv);

  }
  if (stat == 'end' || stat == 'e' || stat == 'del' || stat == 'delete') {
    ns.exec("stats/hashCount.js", "home", 1, hook0, hook1, hv, true);
    ns.exec("stats/hashRate.js", "home", 1, hook0, hook1, hv, true);
    ns.exec("stats/karma.js", "home", 1, hook0, hook1, hv, true);
  }
}
