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

setTimeout(testBackPropToy, 1);

function plot(x, y) {
  var ctx = document.getElementById("myChart");
  var myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: x,
      datasets: [
        {
          label: "error",
          data: y,
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        yAxes: [
          {
            type: "logarithmic",
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    }
  });
}

export function testBackProp() {
  const net = new Network();
  window.nimNet = net;
  const c1 = new Connection(19, 19);
  c1.fullyConnect();
  net.addConnection(c1);
  const c2 = new Connection(19, 32);
  c2.fullyConnect();
  net.addConnection(c2);
  const c3 = new Connection(32, 32);
  c3.fullyConnect();
  net.addConnection(c3);
  const c4 = new Connection(32, 19);
  c4.fullyConnect();
  net.addConnection(c4);
  const c5 = new Connection(19, 4);
  c5.fullyConnect();
  net.addConnection(c5);
  const c6 = new Connection(4, 4);
  c6.fullyConnect();
  net.addConnection(c6);
  const c7 = new Connection(4, 1);
  c7.fullyConnect();
  net.addConnection(c7);
  net.maintainBiasNeurons();
  //
  //Object.freeze(net);
  var LEARNINGRATE = 0.00000000000005;
  var myLearningRate = LEARNINGRATE;
  let iters = [];
  let errors = [];
  function iterate(n = 0) {
    if (n > 1000) {
      plot(iters, errors);
      let can = net.draw();
      can.id = "flubber";
      let div = document.getElementById("flubber");
      if (div) document.body.removeChild(div);
      document.body.appendChild(can);
      console.log("net", net);
      return;
    }

    let batch = getBatch(300);
    myLearningRate = LEARNINGRATE * (0.5 * Math.random());
    if (errors[errors.length - 1] < 2) myLearningRate = myLearningRate * 0.01;
    let binaryBatch = convertBatchToInputAndOutput(batch);
    net.backPropogation(binaryBatch, myLearningRate, true);
    console.log(n);
    // test
    let batch2 = getBatch(50);
    let binaryBatch2 = convertBatchToInputAndOutput(batch2);
    let errorSum = 0;
    for (var b of binaryBatch2) {
      let fwd = net.forwardPropogate(b.input);
      errorSum += numeric.norm2(
        numeric.subVV(fwd.activations[fwd.activations.length - 1], b.output)
      );
    }
    errorSum = errorSum / batch2.length;

    iters.push(n);
    errors.push(errorSum);
    console.log({ errorSum });
    setTimeout(iterate, 1, n + 1);
  }

  iterate();
}

export function testBackPropToy() {
  const net = new Network();
  const c1 = new Connection(4, 4); //give me some space
  c1.fullyConnect(undefined, true);
  net.addConnection(c1);
  const c2 = new Connection(4, 2);
  c2.fullyConnect(undefined, true);
  net.addConnection(c2);
  window.addNet = net;
  //
  //
  function getAddBatch(n = 1000) {
    let res = [];
    for (var i = 0; i < n; i++) {
      let x = Math.random() * 10;
      let y = Math.random() * 10;
      let z = Math.random() * 10;
      res.push({ input: [1, x, y, z], output: [1, x + y + z / 2] });
    }
    return res;
  }
  let iters = [];
  let errors = [];
  function iterate(n = 0) {
    if (n > 3000) {
      plot(iters, errors);
      return;
    }

    let batch = getAddBatch(500);
    // let binaryBatch = convertBatchToInputAndOutput(batch);
    net.backPropogation(batch, 0.000001, false);
    console.log(n);
    // test
    let batch2 = getAddBatch(100);
    // let binaryBatch2 = convertBatchToInputAndOutput(batch2);
    let errorSum = 0;
    for (var b of batch2) {
      let fwd = net.forwardPropogate(b.input);
      errorSum += numeric.norm2(
        numeric.subVV(fwd.activations[fwd.activations.length - 1], b.output)
      );
    }
    errorSum = errorSum / batch2.length;
    iters.push(n);
    errors.push(errorSum);
    console.log({ errorSum });
    setTimeout(iterate, 1, n + 1);
  }

  iterate();

  let can = net.draw();
  can.id = "flubber";
  let div = document.getElementById("flubber");
  if (div) document.body.removeChild(div);
  document.body.appendChild(can);
  console.log("net", net);
}
