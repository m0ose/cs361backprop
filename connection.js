/**
 * Neural network
 *
 * Cody Smith
 * 2019
 * made for cs362
 *
 *
 */

function RELU(arr) {
  return arr.map(a => {
    return Math.max(0, a);
  });
}

function RELUprime(arr) {
  return arr.map(x => {
    if (x < 0) return 0;
    return 1;
  });
}

/**
 *
 * connections between network levels
 *
 */
export class Connection {
  constructor(sizeA, sizeB) {
    this.weights = this.zeros(sizeA, sizeB);
  }
  connect(nodeA, nodeB, weight) {
    this.weights[nodeA][nodeB] = weight;
  }
  connectList(list, weight) {
    for (var i of list) {
      this.connect(i[0], i[1], weight);
    }
  }
  connectListToOne(list, nodeB, weight) {
    for (var i of list) {
      this.connect(i, nodeB, weight);
    }
  }
  identity(list, weight = 1) {
    for (var i of list) {
      this.connect(i, i, weight);
    }
  }

  fullyConnect(weight = 1, random = false) {
    for (var i = 0; i < this.weights.length; i++) {
      for (var j = 0; j < this.weights[0].length; j++) {
        let w = weight;
        if (random) w = Math.random();
        this.weights[i][j] = w;
      }
    }
  }

  get(nodeA, nodeB) {
    return this.weights[nodeA][nodeB];
  }

  // zeros
  zeros(m, n) {
    let res = [];
    for (var i = 0; i < m; i++) {
      let row = new Array(n);
      for (var j = 0; j < n; j++) {
        row[j] = 0;
      }
      res.push(row);
    }
    return res;
  }

  forwardPropogate(neuronsA, bias = 0) {
    let z = numeric.dot(numeric.transpose(this.weights), neuronsA);
    z = numeric.addSV(bias, z);
    let activations = RELU(z);
    return { activations, z };
  }

  toString() {
    return this.weights;
  }
}

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
  calculateGradient(expectedOutput, activations, zs, weights, bias) {
    let dcdb = [];
    let dCdWs = [];
    const opErrors = [];
    let weights2 = [[]].concat(weights); //but weights have a length of one less than the activations becuase i included the input values
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
    return { dcdb, dCdWs };
  }

  maintainBiasNeurons(bias = 1) {
    for (var c of this.connections) {
      for (var i = 1; i < c.weights.length; i++) {
        c.connect(i, 0, 0);
      }
      for (var j = 0; j < c.weights[0].length; j++) {
        c.connect(0, j, bias);
      }
    }
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
          if (row[j] !== 0) {
            ctx.beginPath();
            if (row[j] < 0) ctx.strokeStyle = "#092";
            if (row[j] > 0) ctx.strokeStyle = "#900";
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
        }
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
