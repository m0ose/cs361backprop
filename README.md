# Neural Network Nim game

Cody Smith. 2019

## Usage:
Most of the code is in [main.js](./main.js) or [connections.js](./connection.js) . Also, [index.html](./index.html) has some user interface code.
### From the web
This is written in javascript and can be run from the web page https://m0ose.github.io/cs362_neuralNIM/index.html .
### Locally
Download/unzip the [files](https://github.com/m0ose/cs362_neuralNIM/archive/master.zip) to a directory and then open index.html. file->open->[directory]/index.html . Note: I have only tested this in the Chrome browser.

## How it works
![nim network](./Photos/nim_net2.png)

This is a hand trained neural network that can play an optimal move in nim. If no optimal move is found then it's output is not defined. It might not even play a valid move at that point. 

It required designing a few XOR layers a difference layers and some if-then-else layers out of weighted edges, a tedious but rewarding task.

This uses numeric.js for a matrix representaion and a dot product



