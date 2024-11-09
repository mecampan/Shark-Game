//
// Created: 11/6/2024
// Phaser: 3.70.0
//
// Shark Game
//
// Art assets from Kenny Assets "Shape Characters" set:
// https://kenney.nl/assets/shape-characters
//
// Art background from OpenGameArt.Org
// https://opengameart.org/content/industrial-background-2d
//
// Music Attribution:
// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: false  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            tileBias: 24,
            debug: true,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: 1000,
    height: 600,
    scene: [Load, MainScene]
}

var cursors;
const SCALE = 2.0;
var my = { sprite: {}, text: {}, vfx: {} };

const game = new Phaser.Game(config);