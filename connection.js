
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
            for (var n of a) {
                //console.assert(!isNaN(n))
                if (isNaN(n)) {
                    throw 'Nan encountered'
                }
            }
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

    ifAthenXelseY(connectIndex, a, xstart, ystart, temp, outBits, bits = 6) {
        let c1 = this.connections[connectIndex]
        c1.connect(0, a, 1)
        c1.connect(a, a, -2)
        for (var i = 0; i < bits; i++) {
            c1.connect(xstart + i, xstart + i, 1)
            c1.connect(ystart + i, ystart + i, 1)
        }
        let c2 = this.connections[connectIndex + 1]
        c2.connect(a, a, -1)
        c2.connect(0, a, 1)
        c2.connect(a, temp, 1)
        for (var i = 0; i < bits; i++) {
            c2.connect(xstart + i, xstart + i, 1)
            c2.connect(ystart + i, ystart + i, 1)
        }
        let c3 = this.connections[connectIndex + 2]
        c3.connect(a, a, 1)
        for (var i = 0; i < bits; i++) {
            c3.connect(a, ystart + i, -10000)
            c3.connect(temp, xstart + i, -10000)
            c3.connect(xstart + i, xstart + i, 1)
            c3.connect(ystart + i, ystart + i, 1)
        }
        let c4 = this.connections[connectIndex + 3]
        c4.connect(a, a, 1)
        for (var i = 0; i < bits; i++) {
            c4.connect(xstart + i, outBits + i, 1)
            c4.connect(ystart + i, outBits + i, 1)
        }
    }

    draw() {
        var maxNeurons = 0
        this.connections.forEach((conx) => {
            maxNeurons = Math.max(maxNeurons, conx.weights.length)
        })
        let w = 150
        let h = 50
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
                        ctx.fillRect(xl, yl, 4, 4)
                        ctx.fillRect(xr, yr, 4, 4)
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
    //
    // if then else
    //
    let nifelse = new Network()
    let d1 = new connection(5, 5)
    d1.identity([0])
    let d2 = new connection(5, 5)
    d2.identity([0])
    let d3 = new connection(5, 5)
    d3.identity([0])
    let d4 = new connection(5, 3)
    d4.identity([0])
    nifelse.addConnection(d1)
    nifelse.addConnection(d2)
    nifelse.addConnection(d3)
    nifelse.addConnection(d4)
    nifelse.ifAthenXelseY(0, 1, 3, 4, 2, 2, 1)
    let cancan = nifelse.draw()
    document.body.appendChild(cancan)
    let res1 = nifelse.forwardPropogate([1, 1, 0, 123, 404])[4]
    let res0 = nifelse.forwardPropogate([1, 0, 0, 123, 404])[4]
    console.assert(res1[1] == 1 && res1[2] == 123, 'ifthen else fail', res1)
    console.assert(res0[1] == 0 && res0[2] == 404, 'ifthen else fail', res0)
    console.log('ifthenelse', res1)

}
setTimeout(test, 10)
