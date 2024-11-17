//
// Created: 11/6/2024
// Phaser: 3.70.0
//
// Shark Game
//
// Sound Attribution:
// https://freesound.org/people/Jofae/sounds/353067/
// Creative Commons 0
// 
// Music Attribution:
// "Cruising for Goblins" Kevin MacLeod (incompetech.com)
// Licensed under Creative Commons: By Attribution 4.0 License
// http://creativecommons.org/licenses/by/4.0/
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
            debug: false,
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