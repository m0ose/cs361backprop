
class connection {
    constructor(sizeA, sizeB) {
        this.weights = this.zeros(sizeA, sizeB);
    }
    connect(nodeA, nodeB, weight) {
        this.weights[nodeA][nodeB] = weight;
    }
    connectList(list, weight) {
        for (var i of list) {
            this.connect(i[0], i[1], weight)
        }
    }
    connectListToOne(list, nodeB, weight) {
        for (var i of list) {
            this.connect(i, nodeB, weight)
        }
    }
    identity(list, weight = 1) {
        for (var i of list) {
            this.connect(i, i, weight)
        }
    }

    get(nodeA, nodeB) {
        return this.weights[nodeA][nodeB]
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
        let result = numeric.dot(neuronsA, this.weights);
        result = RELU(result)
        return result;
    }

    toString() {
        return this.weights;
    }

}

class Network {
    constructor() {
        this.connections = []
    }
    addConnection(conx) {
        this.connections.push(conx)
    }
    forwardPropogate(arr) {
        let activations = [arr]
        for (var i = 0; i < this.connections.length; i++) {
            let conx = this.connections[i]
            let a = conx.forwardPropogate(activations[i])
            activations.push(a)
        }
        return activations
    }

    /**
     * XOR 
     * @param {*} connectIndex Index of the start connection layer
     * @param {*} l1x l1 index for x
     * @param {*} l1y l1 index for y
     * @param {*} l2  where to store middle for l2
     * @param {*} l3 where to put output of xor
     */
    makeXOR(connectIndex, l1x, l1y, l2, l3) {
        let c1 = this.connections[connectIndex]
        c1.connectListToOne([l1x, l1y], l2, -1)
        c1.connectListToOne([l1x, l1y], l2 + 1, 1)
        c1.connect(0, l2, 1)
        c1.connect(0, l2 + 1, -1)
        let c2 = this.connections[connectIndex + 1]
        c2.connect(0, l3, 1)
        c2.connect(l2, l3, -1)
        c2.connect(l2 + 1, l3, -2)
    }

    differenceLayer(connectIndex, xindex, yindex, outindex, bits = 6) {
        let c = this.connections[connectIndex]
        for (let i = 0; i < bits; i++) {
            let indx2 = bits - i - 1
            c.connect(xindex + indx2, outindex, 2 ** (bits - indx2 - 1))
            c.connect(yindex + indx2, outindex, -(2 ** (bits - indx2 - 1)))
        }
    }

    draw() {
        var maxNeurons = 0
        this.connections.forEach((conx) => {
            maxNeurons = Math.max(maxNeurons, conx.weights.length)
        })
        let w = 300
        let h = 100
        var can = document.createElement('canvas')
        can.width = w * this.connections.length
        can.height = h * maxNeurons
        let ctx = can.getContext('2d')
        ctx.strokeStyle = '#000'
        for (var x = 0; x < this.connections.length; x++) {
            let conx = this.connections[x]
            for (var i = 0; i < conx.weights.length; i++) {
                let row = conx.weights[i]
                for (var j = 0; j < row.length; j++) {
                    if (row[j] !== 0) {
                        ctx.beginPath()
                        if (row[j] < 0) ctx.strokeStyle = '#009'
                        if (row[j] > 0) ctx.strokeStyle = '#900'
                        let xl = x * w
                        let xr = xl + w
                        let yl = i * h
                        let yr = j * h
                        ctx.moveTo(xl, yl)
                        ctx.lineTo(xr, yr)
                        ctx.stroke()
                        ctx.closePath()
                    }
                }
            }
        }
        //console.log(can)
        return can
    }
}

function RELU(arr) {
    return arr.map((a) => { return Math.max(0, a) })
}

/**
 * 
 * tests
 * 
 * 
 */
function test() {
    var n1 = new connection(3, 5);
    n1.connect(0, 0, 1)
    n1.connect(1, 1, 2)
    n1.connect(2, 2, 3)
    n1.connect(0, 4, 1)
    n1.connect(1, 4, 1)
    n1.connect(2, 4, 1)
    console.log(n1.weights)
    let p2 = n1.forwardPropogate([1, 1, 1])
    console.log(p2)
    console.assert(p2[4] == 3)
    console.assert(p2[1] == 2)
    //
    let c2 = new connection(6, 6)
    c2.identity([0, 1, 2], 3)
    c2.connectList([[3, 3], [4, 4], [5, 5]], 5)
    console.log(c2)
    // try XOR
    let nxor = new Network()
    let c3 = new connection(3, 3)
    c3.connectListToOne([1, 2], 1, -1)
    c3.connectListToOne([1, 2], 2, 1)
    c3.connect(0, 0, 1)
    c3.connect(0, 1, 1)
    c3.connect(0, 2, -1)
    nxor.addConnection(c3)
    let c4 = new connection(3, 1)
    c4.connect(0, 0, 1)
    c4.connect(1, 0, -1)
    c4.connect(2, 0, -2)
    nxor.addConnection(c4)
    for (var i of [0, 1]) {
        for (var j of [0, 1]) {
            let res = nxor.forwardPropogate([1, i, j])
            let solution = res[2][0]
            console.assert(i ^ j == solution, 'xor fail')
            console.log(i, 'xor', j, '  = ', solution)
        }
    }
    let canxor = nxor.draw()
    document.body.appendChild(canxor)
}
setTimeout(test, 10)
