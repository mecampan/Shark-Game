// Michael Campanile
// Created: 5/10/2024
// Phaser: 3.70.0
//
// Water Boy
//
// Art assets from Kenny Assets "Shape Characters" set:
// https://kenney.nl/assets/shape-characters
//
// Art assets from Kenny Assets "Pixel Platformer" set:
// https://kenney.nl/assets/pixel-platformer
//
// Art background from OpenGameArt.Org
// https://opengameart.org/content/industrial-background-2d
//
// Music Attribution:
// "Ethernight Club" Kevin MacLeod (incompetech.com)
// Licensed under Creative Commons: By Attribution 4.0 License
// http://creativecommons.org/licenses/by/4.0/  
// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
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
    width: 1440,
    height: 900,
    scene: [Load, Level_1]
}

var cursors;
const SCALE = 2.0;
var my = { sprite: {}, text: {}, vfx: {} };

const game = new Phaser.Game(config);