class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png"); // Packed tilemap
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj"); // Tilemap in JSON

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        // Load background image
        this.load.image("background", "industrial_background.jpg")

        // Load messages JSON file
        this.load.json("gameText", "gameText.json");

        // Load background music
        this.load.audio('backgroundMusic', 'Ethernight_Club.ogg');
    }

    create() {
        // Play the background music and set it to loop
        this.backgroundMusic = this.sound.add('backgroundMusic', { loop: true });
        this.backgroundMusic.play();

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

        this.anims.create({
            key: 'waterMotion',
            frames: this.anims.generateFrameNumbers('tilemap_sheet', { frames: [53, 33] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'waterfallMotion',
            frames: this.anims.generateFrameNumbers('tilemap_sheet', { frames: [54, 55] }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'waterfallTopMotion',
            frames: this.anims.generateFrameNumbers('tilemap_sheet', { frames: [34, 35] }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'waterfallBottomMotion',
            frames: this.anims.generateFrameNumbers('tilemap_sheet', { frames: [74, 75] }),
            frameRate: 10,
            repeat: -1
        });

        // ...and pass to the next Scene
        this.scene.start("level1Scene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}
