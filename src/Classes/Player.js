class Player {
    constructor(scene, x, y, texture, frame) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, texture, frame);
        this.sprite.setCollideWorldBounds(true);

        // Set gravity to a very low value for slow downward drift
        this.sprite.body.setGravityY(500);

        // Swimming control parameters
        this.SWIM_ACCELERATION = 55;
        this.MAX_SWIM_SPEED = 150;
        this.DRAG = 300; // Lower drag for water resistance

        this.cursors = scene.input.keyboard.createCursorKeys();
    }

    update() {
        // Reset acceleration at each frame
        this.sprite.body.setAcceleration(0, 0);

        // Upward movement
        if (this.cursors.up.isDown) {
            this.sprite.body.setAccelerationY(-this.SWIM_ACCELERATION);
        }
        // Downward movement
        if (this.cursors.down.isDown) {
            this.sprite.body.setAccelerationY(this.SWIM_ACCELERATION);
        }
        // Rightward movement
        if (this.cursors.right.isDown) {
            this.sprite.body.setAccelerationX(this.SWIM_ACCELERATION);
        }
        // Leftward movement
        if (this.cursors.left.isDown) {
            this.sprite.body.setAccelerationX(-this.SWIM_ACCELERATION);
        }

        // Apply drag to simulate water resistance
        this.sprite.body.setDrag(this.DRAG, this.DRAG);

        // Cap the speed in both X and Y directions
        this.sprite.body.velocity.x = Phaser.Math.Clamp(this.sprite.body.velocity.x, -this.MAX_SWIM_SPEED, this.MAX_SWIM_SPEED);
        this.sprite.body.velocity.y = Phaser.Math.Clamp(this.sprite.body.velocity.y, -this.MAX_SWIM_SPEED, this.MAX_SWIM_SPEED);
    }

    playerStatus() {
        console.log(this.sprite.body);
    }
}
