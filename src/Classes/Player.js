class Player {
    constructor(scene, x, y, texture) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, texture).setScale(1.5);
        //this.sprite.setCollideWorldBounds(true);
        this.inWater = true;
        this.jumping = false;

        this.splashSound = this.scene.sound.add('splash1');
        this.splashSound2 = this.scene.sound.add('splash2');

        this.inWaterGravity = 0;
        this.inWaterDrag = 300;
        this.outWaterGravity = 800;
        this.outWaterDrag = 50;

        this.sprite.body.setGravityY(this.inWaterGravity);
        this.swimAcceleration = 200;
        this.maxSwimSpeed = 300;

        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = {
            up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };

        this.lastChompTime = 0;
        this.sprite.anims.play('swim');
    }

    playerInWater(isTrue) {
        if(isTrue){
            this.splashSound.play();
        }
        else{
            this.splashSound2.play();
        }
        this.inWater = isTrue;
        this.sprite.body.setGravityY(isTrue ? this.inWaterGravity : this.outWaterGravity);
    }

    turboJump() {
        if(!this.jumping){
            this.jumping = true;
            this.sprite.body.setVelocity(this.sprite.body.velocity.x * 1.2, this.sprite.body.velocity.y * 1.8);
            this.scene.time.delayedCall(2000, () => {
                this.jumping = false;
            });
        }
    }

    attemptChomp() {
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastChompTime >= 500) {
            this.lastChompTime = currentTime;
            return true;
        }
        return false;
    }

    update() {
        if (this.inWater) {
            this.sprite.body.setAcceleration(0, 0);
            if (this.cursors.right.isDown || this.wasd.right.isDown) {
                this.sprite.body.setAccelerationX(this.swimAcceleration);
                this.sprite.setFlipX(true);
            } else if (this.cursors.left.isDown || this.wasd.left.isDown) {
                this.sprite.body.setAccelerationX(-this.swimAcceleration);
                this.sprite.setFlipX(false);
            }

            if (this.cursors.up.isDown || this.wasd.up.isDown) {
                this.sprite.body.setAccelerationY(-this.swimAcceleration);
            } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
                this.sprite.body.setAccelerationY(this.swimAcceleration);
            }
        }

        this.sprite.body.setDrag(this.inWaterDrag, this.inWaterDrag);

        if (!this.jumping) {
            this.sprite.body.velocity.x = Phaser.Math.Clamp(this.sprite.body.velocity.x, -this.maxSwimSpeed, this.maxSwimSpeed);
            this.sprite.body.velocity.y = Phaser.Math.Clamp(this.sprite.body.velocity.y, -this.maxSwimSpeed, this.maxSwimSpeed);
        }
    }
}