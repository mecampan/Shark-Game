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

        // Load individual shark frames
        this.load.image("shark1", "sharkSprite/Shark1.png");
        this.load.image("shark2", "sharkSprite/Shark2.png");
        this.load.image("shark3", "sharkSprite/Shark3.png");
        this.load.image("shark4", "sharkSprite/Shark4.png");
        this.load.image("shark5", "sharkSprite/Shark5.png");
        this.load.image("shark6", "sharkSprite/Shark6.png");
        this.load.image("shark7", "sharkSprite/Shark7.png");
        this.load.image("shark8", "sharkSprite/Shark8.png");

        this.load.audio("splash1", "splash2.ogg");
        this.load.audio("splash2", "splash3.ogg");

    }

    create() {
        this.anims.create({
            key: 'swim',
            frames: [
                { key: "shark1" },
                { key: "shark2" },
                { key: "shark3" },
                { key: "shark4" },
                { key: "shark5" },
                { key: "shark6" },
                { key: "shark7" },
                { key: "shark8" }
            ],
            frameRate: 10,
            repeat: -1
        });

        this.scene.start("mainScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}
