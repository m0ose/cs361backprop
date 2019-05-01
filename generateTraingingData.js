/**
 * Generate NIM games
 */

var allData = undefined;
var oldPileSize = undefined;

/**
 * Like a struct for moves
 */
class Move {
  constructor(p1, p2, p3, isWin) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.isWin = isWin;
  }
}

/**
 * Generate all possible games
 * @param {Number} pileSize
 */
export function generateAllGames(pileSize = 64) {
  var result = new Array(pileSize ** 3);
  for (var i1 = 0; i1 < pileSize; i1++) {
    for (var i2 = 0; i2 < pileSize; i2++) {
      for (var i3 = 0; i3 < pileSize; i3++) {
        var xorAll = i1 ^ i2 ^ i3; // this is XOR in Javascript
        var r1 = i1 ^ xorAll;
        var r2 = i2 ^ xorAll;
        var r3 = i3 ^ xorAll;
        var isWin = 0;
        if (r1 < i1) isWin = 1;
        if (r2 < i2) isWin = 2;
        if (r3 < i3) isWin = 3;
        result[i1 * pileSize ** 2 + i2 * pileSize + i3] = new Move(
          i1,
          i2,
          i3,
          isWin
        );
      }
    }
  }
  return result;
}

/**
 * get a portion of the possible moves.
 *   Almost all combos are winning
 *      0.984375 are winners
 *      0.015625 are losers
 * So this function returns half winners & half losers, In hopes of training it better.
 * @param {Number} size
 * @param {Number} pileSize
 */
export function getBatch(size = 100, pileSize = 64) {
  if (!allData || pileSize != oldPileSize) {
    allData = generateAllGames(pileSize);
    oldPileSize = pileSize;
  }
  let winners = allData.filter(a => {
    return a.isWin > 0;
  });
  let losers = allData.filter(a => {
    return a.isWin <= 0;
  });
  let loserSize = Math.ceil(size);
  let result = []
    .concat(selectN(loserSize, losers))
    .concat(selectN(size, winners));
  result = shuffle(result);
  return result;
}

export function convertBatchToInputAndOutput(batch) {
  let res = [];
  for (var b of batch) {
    let b1 = toBinary(b.p1);
    let b2 = toBinary(b.p2);
    let b3 = toBinary(b.p3);
    let input = [1]
      .concat(b1)
      .concat(b2)
      .concat(b3);
    let output = [1, b.isWin, 100 * Math.min(1, b.isWin)];
    res.push({ input, output });
  }
  return res;
}

function toBinary(n) {
  let str = n.toString(2).padStart(6, "0");
  let fu = str.split("").map(a => {
    return parseInt(a);
  });
  return fu;
}

function selectN(n, pile) {
  // generate some unique indices
  let step = Math.floor(pile.length / (4 * n));
  let pool = [];
  for (var i = 0; i < pile.length; i += Math.round(1 + Math.random() * step)) {
    pool.push(i);
  }
  // suffle
  let pool2 = shuffle(pool);
  let batchIndices = pool2.slice(0, n);
  let result = batchIndices.map(a => {
    return pile[a];
  });
  return result;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
