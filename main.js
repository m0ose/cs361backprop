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
  // im going to call the output of this x
  ////
  // test
  const t1 = net.forwardPropogate(n1)[4]
  //console.log(t1)
  console.assert(t1[24] == 0 && t1[23] == 1 && t1[22] == 0 && t1[21] == 1 && t1[20] == 0 && t1[19] == 0, "triple xor fail")
  //
  const c5 = new connection(25, 56)
  c5.identity([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])
  const c6 = new connection(56, 37)
  c6.identity([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18])
  net.addConnection(c5)
  net.addConnection(c6)
  // a xor x
  net.makeXOR(4, 1, 19, 19, 19)
  net.makeXOR(4, 2, 20, 21, 20)
  net.makeXOR(4, 3, 21, 23, 21)
  net.makeXOR(4, 4, 22, 25, 22)
  net.makeXOR(4, 5, 23, 27, 23)
  net.makeXOR(4, 6, 24, 29, 24)
  // a xor x
  net.makeXOR(4, 7, 19, 31, 25)
  net.makeXOR(4, 8, 20, 32, 26)
  net.makeXOR(4, 9, 21, 34, 27)
  net.makeXOR(4, 10, 22, 36, 28)
  net.makeXOR(4, 11, 23, 38, 29)
  net.makeXOR(4, 12, 24, 40, 30)
  // a xor x
  net.makeXOR(4, 13, 19, 42, 31)
  net.makeXOR(4, 14, 20, 44, 32)
  net.makeXOR(4, 15, 21, 46, 33)
  net.makeXOR(4, 16, 22, 48, 34)
  net.makeXOR(4, 17, 23, 50, 35)
  net.makeXOR(4, 18, 24, 52, 36)
  const t2 = net.forwardPropogate(n1)[6]
  console.log(t2)
  console.assert(t2[24] == 1 && t2[23] == 1 && t2[22] == 1 && t2[21] == 1 && t2[20] == 0 && t2[19] == 0, "a xor x fail")
  ////
  // the xor with a,b,c and x is done
  ////
  const c7 = new connection(37, 37)
  c7.identity([0, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36])
  net.addConnection(c7)
  net.differenceLayer(6, 1, 19, 1)
  net.differenceLayer(6, 7, 25, 2)
  net.differenceLayer(6, 13, 31, 3)
  const t3 = net.forwardPropogate(n1)[7]
  console.log(t3)
  console.assert(t3[2] == 6, 'diff layer fail')
  ////
  // The diff layer is done. diffs are in 1,2,3 and the (a xor x) -> 19..25
  //  (b xor x) -> 25..31
  //  (c xor x) -> 31..37
  ////
  const c8 = new connection(37, 37)
  c8.identity([0])
  const c9 = new connection(37, 37)
  c9.identity([0])
  const c10 = new connection(37, 37)
  c10.identity([0])
  const c11 = new connection(37, 37)
  c11.identity([0])
  c11.connect(1, 3, 1)
  net.addConnection(c8)
  net.addConnection(c9)
  net.addConnection(c10)
  net.addConnection(c11)
  net.ifAthenXelseY(7, 1, 19, 25, 4, 5)
  net.ifAthenXelseY(7, 2, 25, 31, 11, 12)
  //
  // next if then else
  const c12 = new connection(37, 19)
  c12.identity([0, 1, 2])
  const c13 = new connection(19, 19)
  c13.identity([0, 1, 2])
  const c14 = new connection(19, 19)
  c14.identity([0, 1, 2])
  const c15 = new connection(19, 19)
  c15.identity([0, 1, 2])
  net.addConnection(c12)
  net.addConnection(c13)
  net.addConnection(c14)
  net.addConnection(c15)
  net.ifAthenXelseY(11, 3, 5, 12, 4, 6)
  const t4 = net.forwardPropogate(n1)[15]
  console.log(t4)
  //
  ////
  // final layers for output.
  //   a is in 1 and b is in 2
  //   [1] a
  //   [2] not a and b
  //   [3] not a and not b
  ////
  const c16 = new connection(19, 19)
  c16.identity([0, 1, 2, 6, 7, 8, 9, 10, 11], 1)
  c16.connect(0, 3, 1)
  c16.connect(0, 4, 1)
  c16.connect(1, 3, -10)
  c16.connect(2, 4, -10)
  const c17 = new connection(19, 9)
  c17.connect(1, 0, 1)
  c17.connect(0, 1, -1)
  c17.connect(0, 2, -1)
  c17.connect(3, 1, 1)
  c17.connect(4, 1, 1)
  c17.connect(2, 2, 1)
  c17.connect(3, 2, 1)
  c17.connectList([[6, 3], [7, 4], [8, 5], [9, 6], [10, 7], [11, 8]], 1)
  net.addConnection(c16)
  net.addConnection(c17)
  const c18 = new connection(9, 9)
  c18.identity([0, 3, 4, 5, 6, 7, 8])
  c18.connect(1, 2, 1)
  c18.connect(2, 1, 1)
  net.addConnection(c18)
  const tFinal = net.forwardPropogate(n1)
  console.log(tFinal)

















  document.body.appendChild(net.draw())


}

setTimeout(main, 20)