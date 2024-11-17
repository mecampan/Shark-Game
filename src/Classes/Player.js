class Player {
    constructor(scene, x, y, texture) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, texture).setScale(1.5);
        this.inWater = true;
        this.jumping = false;
        this.isInvincible = false;

        // Sound effects
        this.splashSound = this.scene.sound.add('splash1').setVolume(1.5);;
        this.splashSound2 = this.scene.sound.add('splash2').setVolume(1.5);;
        this.splashSound3 = this.scene.sound.add('splash3').setVolume(1.5);;
        this.snapSound2 = this.scene.sound.add('snapSound2').setVolume(0.5);;

        // Physics settings
        this.inWaterGravity = 0;
        this.inWaterDrag = 300;
        this.outWaterGravity = 800;
        this.outWaterDrag = 50;
        this.sprite.body.setGravityY(this.inWaterGravity);
        this.swimAcceleration = 200;
        this.maxSwimSpeed = 300;

        // Controls
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = {
            up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };

        // Chomp cooldown
        this.lastChompTime = 0;
        this.sprite.anims.play('swim');
    }

    // Water entry/exit
    playerInWater(isTrue) {
        isTrue ? this.splashSound2.play() : this.splashSound3.play();
        this.inWater = isTrue;
        this.sprite.body.setGravityY(isTrue ? this.inWaterGravity : this.outWaterGravity);
        isTrue ? this.sprite.body.setVelocity(this.sprite.body.velocity.x * 0.5, this.sprite.body.velocity.y * 0.7) : 0;
    }

    // Boost jump out of water
    turboJump() {
        if (!this.jumping) {
            this.jumping = true;
            this.sprite.body.setVelocity(this.sprite.body.velocity.x * 1.1, this.sprite.body.velocity.y * 2.0);
            this.scene.time.delayedCall(2000, () => this.jumping = false);
        }
    }

    // Chomp action with cooldown
    attemptChomp() {
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastChompTime >= 100) {
            this.lastChompTime = currentTime;
            return true;
        }
        return false;
    }

    // Invincibility effect with blinking animation
    invincibilityFrame() {
        if(!this.isInvincible) {
            this.scene.jawChompEffect();
            this.snapSound2.play();
        }

        this.isInvincible = true;
        let blinkCounter = 0;
        const blinkTimer = this.scene.time.addEvent({
            delay: 300,
            callback: () => {
                this.sprite.visible = !this.sprite.visible;
                blinkCounter++;
                if (blinkCounter >= 6) {
                    this.sprite.visible = true;
                    this.isInvincible = false;
                    blinkTimer.remove();
                }
            },
            loop: true
        });
    }

    // Screen wrap for X-axis, clamp Y to stay on screen
    playerScreenWrap() {
        if (this.sprite.x < 0) {
            this.sprite.x = this.scene.game.config.width;
        } else if (this.sprite.x > this.scene.game.config.width) {
            this.sprite.x = 0;
        }

        this.sprite.y = Phaser.Math.Clamp(this.sprite.y, 0, this.scene.game.config.height - 10);
    }

    // Player movement and control handling
    update() {
        this.playerScreenWrap();

        if (this.inWater) {
            this.sprite.body.setAcceleration(0, 0);

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

        // Apply water resistance and limit speed
        this.sprite.body.setDrag(this.inWaterDrag, this.inWaterDrag);
        if (!this.jumping) {
            this.sprite.body.velocity.x = Phaser.Math.Clamp(this.sprite.body.velocity.x, -this.maxSwimSpeed, this.maxSwimSpeed);
            this.sprite.body.velocity.y = Phaser.Math.Clamp(this.sprite.body.velocity.y, -this.maxSwimSpeed, this.maxSwimSpeed);
        }
    }
}
