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

export function RELUprime(arr) {
  if (!arr.length) arr = [arr];
  let funk = x => {
    if (x < 0) return 0;
    return 1;
  };
  return arr.map(funk);
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

  forwardPropogate(neuronsA) {
    let z = numeric.dot(numeric.transpose(this.weights), neuronsA);
    let activations = RELU(z);
    return { activations, z };
  }

  toString() {
    return this.weights;
  }

  size() {
    return [this.weights.length, this.weights[0].length];
  }
}
