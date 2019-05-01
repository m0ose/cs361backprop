/**
 *
 * Neural Network for Nim
 *
 * This is the network used to play an optimal game of nim. It spits out garbage if the postion is loosing.
 *
 * Cody Smith
 * 2019
 *
 */
import { Connection } from "./connection.js";
import { Network } from "./Network.js";

export function main(p1, p2, p3) {
  let input2 = [1]
    .concat(p1)
    .concat(p2)
    .concat(p3);
  let net = mainNetwork();
  let result = net.forwardPropogate(input2);

  return result;
}

export function mainNetwork() {
  var defaultInput = [0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0]; // 5, 13, 2
  const net = new Network();
  const n1 = [1].concat(defaultInput);
  const c1 = new Connection(19, 32); //give me some space
  c1.fullyConnect(undefined, true);
  net.addConnection(c1);
  const c2 = new Connection(32, 32);
  c2.fullyConnect(undefined, true);
  net.addConnection(c2);
  const c3 = new Connection(32, 1);
  c3.fullyConnect(undefined, true);
  net.addConnection(c3);

  const tFinal = net.forwardPropogate(n1);
  console.log({
    weights: net.connections,
    activations: tFinal.activations,
    zs: tFinal.zs
  });
  return net;
}
