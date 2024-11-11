export async function main(ns, sleepTime = ns.args[1]) {
  await ns.hack(ns.args[0], {additionalMsec: sleepTime});
}
