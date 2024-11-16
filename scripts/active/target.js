import {
  target
} from './functions.js'


export async function main(ns, depth = ns.args[0]) {
  if (!(typeof depth == 'number')) {
    depth = 1;
  }
  await target(ns, (depth + 1), false, true);
}
