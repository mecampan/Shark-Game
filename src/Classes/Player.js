class Player {
    constructor(scene, x, y, texture) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, texture).setScale(1.5);
        this.sprite.setCollideWorldBounds(true);
        this.inWater = true;
        this.jumping = false;

        this.inWaterGravity = 0;
        this.inWaterDrag = 300;
        this.outWaterGravity = 800;
        this.outWaterDrag = 50;

        this.sprite.body.setGravityY(this.inWaterGravity);

        this.swimAcceleration = 200;
        this.maxSwimSpeed = 300;

        // Set up arrow keys and WASD keys
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = {
            up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };

        // Jump and chomp actions
        scene.input.keyboard.on('keydown-SPACE', () => {
            if (this.inWater && !this.jumping) {
                this.turboJump();
            }
            this.attemptChomp();
        });

        scene.input.keyboard.on('keydown-P', () => {
            console.log(this.sprite.body.velocity);
        });

        this.sprite.anims.play('swim');
    }

    playerInWater(isTrue) {
        this.inWater = isTrue;
        if (isTrue) {
            this.sprite.body.setGravityY(this.inWaterGravity);
        } else {
            this.sprite.body.setGravityY(this.outWaterGravity);
        }
    }

    turboJump() {
        this.jumping = true;

        this.sprite.body.setVelocity(
            this.sprite.body.velocity.x * 2,
            this.sprite.body.velocity.y * 2
        );

        this.scene.time.delayedCall(2000, () => {
            this.jumping = false;
        });
    }

    attemptChomp() {
        
    }

    update() {
        // Only apply movement if in water and not jumping
        if (this.inWater && !this.jumping) {
            this.sprite.body.setAcceleration(0, 0); // Reset acceleration each update

            // Horizontal movement
            if (this.cursors.right.isDown || this.wasd.right.isDown) {
                this.sprite.body.setAccelerationX(this.swimAcceleration);
                this.sprite.setFlipX(true);
            } else if (this.cursors.left.isDown || this.wasd.left.isDown) {
                this.sprite.body.setAccelerationX(-this.swimAcceleration);
                this.sprite.setFlipX(false);
            }

            // Vertical movement
            if (this.cursors.up.isDown || this.wasd.up.isDown) {
                this.sprite.body.setAccelerationY(-this.swimAcceleration);
            } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
                this.sprite.body.setAccelerationY(this.swimAcceleration);
            }
        }

        // Apply drag to simulate water resistance
        this.sprite.body.setDrag(this.inWaterDrag, this.inWaterDrag);

        // Cap speed to max swim speed in both directions
        if (!this.jumping) {
            this.sprite.body.velocity.x = Phaser.Math.Clamp(this.sprite.body.velocity.x, -this.maxSwimSpeed, this.maxSwimSpeed);
            this.sprite.body.velocity.y = Phaser.Math.Clamp(this.sprite.body.velocity.y, -this.maxSwimSpeed, this.maxSwimSpeed);
        }
    }
}
