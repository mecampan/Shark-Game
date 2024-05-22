class Player {
    constructor(scene, x, y, texture, frame) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, texture, frame);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.setGravityY(1500);

        this.JUMP_VELOCITY = -400;
        this.ACCELERATION = 200;
        this.VELOCITY = 150;
        this.DRAG = 1500;

        this.health = 3;

        this.cursors = scene.input.keyboard.createCursorKeys();

        // Add splash sound effect to player
        this.splashSound = this.scene.sound.add('splash');
    }

    update() {
        if (this.cursors.left.isDown) {
            this.sprite.body.setVelocityX(-this.VELOCITY);
            this.sprite.setFlipX(false);
            this.sprite.anims.play('walk', true);
        } else if (this.cursors.right.isDown) {
            this.sprite.body.setVelocityX(this.VELOCITY);
            this.sprite.setFlipX(true);
            this.sprite.anims.play('walk', true);
        } else {
            this.sprite.body.setAccelerationX(0);
            this.sprite.body.setDragX(this.DRAG);
            this.sprite.anims.play('idle');
        }

        if (!this.sprite.body.blocked.down) {
            this.sprite.anims.play('jump');
        }
        if (this.sprite.body.blocked.down && Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.sprite.body.setVelocityY(this.JUMP_VELOCITY);
        }
    }

    respawn(spawnPoint, desu) {
        // Play splash sound effect
        if (this.splashSound) {
            this.splashSound.play();
        } else {
            console.error('Splash sound not loaded');
        }

        // Prevent the player from moving during respawn
        this.sprite.body.setAllowGravity(false);
        this.sprite.body.setVelocityX(0);
        this.sprite.body.setVelocityY(0);
        this.sprite.body.setAccelerationX(0);
        this.sprite.body.setAccelerationY(0);
        this.sprite.body.checkCollision.none = true; // Enable collisions
        this.sprite.body.moves = false;

        // Delayed call to teleport the player
        this.scene.time.delayedCall(1000, () => {
            this.sprite.setPosition(spawnPoint.x, spawnPoint.y);
            this.sprite.body.setAllowGravity(true);
            this.scene.handleCameraSlowFollow();
            this.sprite.setVisible(true);
            this.sprite.body.checkCollision.none = false; // Enable collisions
            this.sprite.body.moves = true;
        });

        // Make player invisible if desu is true
        if (desu) {
            this.sprite.setVisible(false);
            this.sprite.body.checkCollision.none = true; // Disable collisions
        }

        else {
            // Create a tween for sinking effect if desu is false
            this.scene.tweens.add({
                targets: this.sprite,
                y: this.sprite.y + 40,  // Sinks down by 40 pixels
                duration: 950,         // Duration of 1 second
            });
        }
    }

    playerStatus() {
        console.log(this.sprite.body);
    }
}
