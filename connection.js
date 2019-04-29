/**
 * Hand made neural network
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

  calculateGradient(expectedOutput, activations, bias) {
    const lastLayer = activations[activations.length - 1];
    const C = new Array(lastLayer.length);
    for (var i = 0; i < lastLayer.length; i++) {
      C = (expectedOutput[i] - lastLayer[i]) ** 2;
    }
  }

  differenceLayer(connectIndex, xindex, yindex, outindex, bits = 6) {
    let c = this.connections[connectIndex];
    for (let i = 0; i < bits; i++) {
      let indx2 = bits - i - 1;
      c.connect(xindex + indx2, outindex, 2 ** (bits - indx2 - 1));
      c.connect(yindex + indx2, outindex, -(2 ** (bits - indx2 - 1)));
    }
  }

  ifAthenXelseY(connectIndex, a, xstart, ystart, temp, outBits, bits = 6) {
    let c1 = this.connections[connectIndex];
    c1.connect(0, a, 1);
    c1.connect(a, a, -2);
    for (var i = 0; i < bits; i++) {
      c1.connect(xstart + i, xstart + i, 1);
      c1.connect(ystart + i, ystart + i, 1);
    }
    let c2 = this.connections[connectIndex + 1];
    c2.connect(a, a, -1);
    c2.connect(0, a, 1);
    c2.connect(a, temp, 1);
    for (var i = 0; i < bits; i++) {
      c2.connect(xstart + i, xstart + i, 1);
      c2.connect(ystart + i, ystart + i, 1);
    }
    let c3 = this.connections[connectIndex + 2];
    c3.connect(a, a, 1);
    for (var i = 0; i < bits; i++) {
      c3.connect(a, ystart + i, -10000);
      c3.connect(temp, xstart + i, -10000);
      c3.connect(xstart + i, xstart + i, 1);
      c3.connect(ystart + i, ystart + i, 1);
    }
    let c4 = this.connections[connectIndex + 3];
    c4.connect(a, a, 1);
    for (var i = 0; i < bits; i++) {
      c4.connect(xstart + i, outBits + i, 1);
      c4.connect(ystart + i, outBits + i, 1);
    }
  }

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

export function hadamardProduct(a, b) {
  const y = new Array(a.length);
  for (var i = 0; i < a.length; i++) {
    y = [i] = a[i] * b[i];
  }
  return y;
}
