class MainScene extends Phaser.Scene {
    constructor() {
        super("mainScene");
    }

    create() {
        // Set up background
        let background = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');
        background.setDisplaySize(this.game.config.width, this.game.config.height);

        // Create a transparent blue rectangle for the water area
        this.waterArea = this.add.rectangle(0, this.game.config.height, this.game.config.width * 2, this.game.config.height, 0x0000ff).setAlpha(0.3);
        this.physics.add.existing(this.waterArea, true); // Static body

        // Instantiate the player
        this.player = new Player(this, 500, 500, "platformer_characters", "tile_0000.png");

        // Set up overlap detection to detect when player enters water
        this.physics.add.overlap(this.player.sprite, this.waterArea, () => {
            if (!this.player.inWater) {  // Only call if not already in water
                this.player.playerInWater(true);
            }
        });
    }

    update() {
        // Check if the player has left the water area by comparing positions
        const playerBounds = this.player.sprite.getBounds();
        const waterBounds = this.waterArea.getBounds();

        if (!Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, waterBounds) && this.player.inWater) {
            this.player.playerInWater(false);
        }

        this.player.update();
    }
}
