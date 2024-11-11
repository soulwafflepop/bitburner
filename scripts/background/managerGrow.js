export async function main(ns, sleepTime = ns.args[1]) {
  await ns.grow(ns.args[0], {additionalMsec: sleepTime});
}
