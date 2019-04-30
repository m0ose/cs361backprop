/**
 *
 * tests
 *
 *
 */
import { Connection, Network } from "./connection.js";

export function test() {
  var n1 = new Connection(3, 5);
  n1.connect(0, 0, 1);
  n1.connect(1, 1, 2);
  n1.connect(2, 2, 3);
  n1.connect(0, 4, 1);
  n1.connect(1, 4, 1);
  n1.connect(2, 4, 1);
  console.log(n1.weights);
  let p2 = n1.forwardPropogate([1, 1, 1]).activations;
  console.log({ activations: p2, weights: n1.weights });
  console.assert(p2[4] == 3);
  console.assert(p2[1] == 2);
  //
  let c2 = new Connection(6, 6);
  c2.identity([0, 1, 2], 3);
  c2.connectList([[3, 3], [4, 4], [5, 5]], 5);
  console.log(c2);
  // try XOR
  let nxor = new Network();
  let c3 = new Connection(3, 3);
  c3.connectListToOne([1, 2], 1, -1);
  c3.connectListToOne([1, 2], 2, 1);
  c3.connect(0, 0, 1);
  c3.connect(0, 1, 1);
  c3.connect(0, 2, -1);
  nxor.addConnection(c3);
  let c4 = new Connection(3, 1);
  c4.connect(0, 0, 1);
  c4.connect(1, 0, -1);
  c4.connect(2, 0, -2);
  nxor.addConnection(c4);
  for (var i of [0, 1]) {
    for (var j of [0, 1]) {
      let res = nxor.forwardPropogate([1, i, j]);
      let solution = res.activations[2][0];
      console.assert(i ^ (j == solution), "xor fail");
      console.log(i, "xor", j, "  = ", solution);
    }
  }
  let canxor = nxor.draw();
  document.body.appendChild(canxor);
  //
  // computeGradient
  var defaultInput = [1, 2, 3, 4, 5, 6, 7]; // [0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0]; // 5, 13, 2
  const net = new Network();
  const input = [1].concat(defaultInput);
  let c1 = new Connection(7, 11); //give me some space
  c1.fullyConnect(undefined, true);
  net.addConnection(c1);
  c2 = new Connection(11, 13);
  c2.fullyConnect(undefined, true);
  net.addConnection(c2);
  c3 = new Connection(13, 3);
  c3.fullyConnect(undefined, true);
  net.addConnection(c3);
  let bob = net.forwardPropogate(input);
  console.log({
    weights: net.connections,
    activations: bob.activations,
    zs: bob.zs
  });
  let grr = net.calculateGradient(
    [4, 5, 6],
    bob.activations,
    bob.zs,
    net.connections,
    [1, 2, 3]
  );
  console.log("gradient maybe", grr);
}

setTimeout(test, 10);
