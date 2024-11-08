class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");
        
        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load background image
        this.load.image("background", "industrial_background.jpg");
    }

    create() {

        // ...and pass to the next Scene
        this.scene.start("mainScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}
