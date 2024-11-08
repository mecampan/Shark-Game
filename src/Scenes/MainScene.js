class MainScene extends Phaser.Scene {
    constructor() {
        super("mainScene");
    }

    init() {

    }

    create() {
        //this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        let background = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');
        background.setDisplaySize(this.game.config.width, this.game.config.height);

        this.player = new Player(this, 500, 500, "platformer_characters", "tile_0000.png");
        this.player.sprite.setDepth(3); // Set player sprite depth here

    }    

    update() {
        this.player.update();
    }
}