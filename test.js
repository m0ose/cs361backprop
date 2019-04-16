
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
//setTimeout(test, 10)
