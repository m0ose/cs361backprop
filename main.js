var input = [0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0]; // 5, 13, 2
var connections = [];

function main() {
  const net = new Network()
  const n1 = [1].concat(input)
  const c1 = new connection(19, 32)
  c1.identity([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])
  net.addConnection(c1)
  const c2 = new connection(32, 25)
  c2.identity([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])
  net.addConnection(c2)
  const c3 = new connection(25, 32)
  c3.identity([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])
  net.addConnection(c3)
  const c4 = new connection(32, 25)
  c4.identity([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])
  net.addConnection(c4)
  // make xors
  net.makeXOR(0, 1, 7, 19, 19)
  net.makeXOR(0, 2, 8, 20, 20)
  net.makeXOR(0, 3, 9, 21, 21)
  net.makeXOR(0, 4, 10, 22, 22)
  net.makeXOR(0, 5, 11, 23, 23)
  net.makeXOR(0, 6, 12, 24, 24)
  // next set of xors
  net.makeXOR(2, 19, 13, 20, 19)
  net.makeXOR(2, 20, 14, 22, 20)
  net.makeXOR(2, 21, 15, 24, 21)
  net.makeXOR(2, 22, 16, 26, 22)
  net.makeXOR(2, 23, 17, 28, 23)
  net.makeXOR(2, 24, 18, 30, 24)
  // the first triple xor is now on level 4 starting at indexes 19..24


  let r1 = net.forwardPropogate(n1)
  console.log(r1)

  document.body.appendChild(net.draw())


}

setTimeout(main, 20)