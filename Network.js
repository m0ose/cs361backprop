import { Connection, RELUprime } from "./connection.js";

/**
 *
 * Basiacally a collection of connections and some helpers
 *
 *
 */
export class Network {
  constructor() {
    this.connections = [];
  }
  addConnection(conx) {
    this.connections.push(conx);
  }
  /**
   *
   * @param {Array} arr Input
   * @param {*} bias
   */
  forwardPropogate(arr, bias = 0) {
    let activations = [arr];
    let zs = [arr];
    for (var i = 0; i < this.connections.length; i++) {
      let conx = this.connections[i];
      let a = conx.forwardPropogate(activations[i], bias);
      activations.push(a.activations);
      zs.push(a.z);
      for (var n of a.activations) {
        if (isNaN(n)) {
          throw "Nan encountered";
        }
      }
      for (var n of a.z) {
        if (isNaN(n)) {
          throw "Nan encountered";
        }
      }
    }
    return { activations, zs };
  }

  duplicate() {
    let res = new Network();
    for (var c of this.connections) {
      let size = c.size();
      let con = new Connection(size[0], size[1]);
      res.addConnection(con);
    }
    return res;
  }

  backPropogation(batch, learningRate = 0.0000001, biasNeurons = true) {
    let acc = this.duplicate();
    for (var b of batch) {
      let fwd = this.forwardPropogate(b.input);
      let gradient = this.calculateGradient(
        b.output,
        fwd.activations,
        fwd.zs,
        this.connections //this.getWeights()
      );
      for (var i = 0; i < acc.connections.length; i++) {
        let r = gradient.dCdWs[i + 1];
        // scale value
        let r2 = r.map(a => {
          return numeric.mulVS(a, (1 / batch.length) * learningRate);
        });
        var s = [];
        let q = acc.connections[i].weights;
        for (var j = 0; j < r2.length; j++) {
          let tmp = numeric.addVV(r2[j], q[j]);
          s.push(tmp);
        }
        acc.connections[i].weights = s;
      }
    }
    ////
    // finally add weights plus accumulation of gradients
    //     It turns out numeric cant add matrices 😕
    //
    let result = this.duplicate();
    for (var j = 0; j < result.connections.length; j++) {
      let newWeights = [];
      for (var i = 0; i < result.connections[j].weights.length; i++) {
        let tmp = numeric.addVV(
          acc.connections[j].weights[i],
          this.connections[j].weights[i]
        );
        newWeights.push(tmp);
      }
      result.connections[j].weights = newWeights;
    }
    if (biasNeurons) result.maintainBiasNeurons();
    //console.log(result, this);
    this.connections = result.connections;
  }

  getWeights() {
    return this.connections.map(a => {
      return a.weights;
    });
  }

  /**
   *
   * Calculate the gradient for every weight
   *
   * @param {Array} expectedOutput
   * @param {Array} activations
   * @param {Array} zs
   * @param {Array} weights
   * @param {Array} bias
   */
  calculateGradient(expectedOutput, activations, zs, weights) {
    let dcdb = [];
    let dCdWs = [];
    const opErrors = [];
    let weights2 = [[]].concat(weights); //Change indices.  Weights have a length of one less than the activations becuase i included the input values
    //
    // calculate final cost
    const actLast = activations[activations.length - 1];
    const C = new Array(actLast.length);
    const Cprime = new Array(actLast.length);
    for (let i = 0; i < actLast.length; i++) {
      C[i] = (1 / 2) * (expectedOutput[i] - actLast[i]) ** 2;
      Cprime[i] = expectedOutput[i] - actLast[i];
    }
    let reluP = RELUprime(zs[zs.length - 1]);
    const opErrL = hadamardProduct(Cprime, reluP);
    // record final cost
    opErrors[zs.length - 1] = opErrL;
    //
    // Compute intermediate change in cost in terms of weights
    //
    for (let i = activations.length - 1; i >= 1; i--) {
      if (i < activations.length - 1) {
        let wiPlus1 = weights2[i + 1]; // this is i+1
        let opErriPlus1 = opErrors[i + 1];
        let rz = RELUprime(zs[i]);
        let tmp = numeric.dot(wiPlus1.weights, opErriPlus1);
        let opErri = hadamardProduct(tmp, rz);
        opErrors[i] = opErri;
      }
      dcdb[i] = opErrors[i];
      let dcdw_jk = new Connection(
        activations[i - 1].length,
        activations[i].length
      );
      for (var k = 0; k < activations[i].length; k++) {
        for (var j = 0; j < activations[i - 1].length; j++) {
          let delta = activations[i - 1][j] * opErrors[i][k];
          dcdw_jk.connect(j, k, delta);
        }
      }

      dCdWs[i] = dcdw_jk.weights;
    }
    return { dcdb, dCdWs, error: opErrL };
  }

  maintainBiasNeurons(bias = 1) {
    for (var n = 0; n < this.connections.length - 1; n++) {
      let c = this.connections[n];
      for (var i = 1; i < c.weights.length; i++) {
        c.connect(i, 0, 0);
      }
      //for (var j = 0; j < c.weights[0].length; j++) {
      //}
    }
    for (var c2 of this.connections) {
      c2.connect(0, 0, bias);
    }
    this.connections[this.connections.length - 1].connect(0, 0, 0);
  }

  /**
   * Draw. returns a Canvas
   * @param {*} w
   * @param {*} h
   */
  draw(w = 150, h = 50) {
    var maxNeurons = 0;
    this.connections.forEach(conx => {
      maxNeurons = Math.max(maxNeurons, conx.weights.length);
    });
    var can = document.createElement("canvas");
    can.width = w * this.connections.length;
    can.height = h * maxNeurons;
    let ctx = can.getContext("2d");
    ctx.strokeStyle = "#000";
    for (var x = 0; x < this.connections.length; x++) {
      let conx = this.connections[x];
      for (var i = 0; i < conx.weights.length; i++) {
        let row = conx.weights[i];
        for (var j = 0; j < row.length; j++) {
          //   if (Math.abs(row[j]) > 0.001) {
          ctx.beginPath();
          if (Math.abs(row[j] < 0.001)) ctx.strokeStyle = "#aaa";
          else if (row[j] == 1) ctx.strokeStyle = "#00f";
          else if (row[j] < 0) ctx.strokeStyle = "#092";
          else if (row[j] > 0) ctx.strokeStyle = "#900";

          let xl = x * w;
          let xr = xl + w;
          let yl = i * h;
          let yr = j * h;
          ctx.moveTo(xl, yl);
          ctx.lineTo(xr, yr);
          ctx.fillRect(xl, yl, 4, 4);
          ctx.fillRect(xr, yr, 4, 4);
          ctx.stroke();
          ctx.closePath();
        }
        // }
      }
    }
    return can;
  }
}

/**
 * Helper function
 * @param {Array} a
 * @param {Array} b
 */
export function hadamardProduct(a, b) {
  const y = new Array(a.length);
  for (var i = 0; i < a.length; i++) {
    y[i] = a[i] * b[i];
  }
  return y;
}
