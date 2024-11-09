class Player {
    constructor(scene, x, y, texture, frame) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, texture, frame);
        this.sprite.setCollideWorldBounds(true);
        this.inWater = true;
        this.jumping = false;

        this.inWaterGravity = 305;
        this.inWaterDrag = 300
        this.outWaterGravity = 530;
        this.outWaterDrag = 500;

        this.sprite.body.setGravityY(this.inWaterGravity);

        this.SWIM_ACCELERATION = 500;
        this.MAX_SWIM_SPEED = 150;
        this.DRAG = 300;

        this.cursors = scene.input.keyboard.createCursorKeys();
        scene.input.keyboard.on('keydown-SPACE', () => {
            if (this.inWater && !this.jumping) {
                this.turboJump();
            }
        });

        scene.input.keyboard.on('keydown-P', () => {
            console.log(this.sprite.body.velocity);
        });
    }

    playerInWater(isTrue) {
        this.inWater = isTrue;
        if (isTrue) {
            this.sprite.body.setGravityY(this.inWaterGravity);
        }
        else {
            this.sprite.body.setGravityY(this.outWaterGravity);
        }
    }

    turboJump() {
        this.jumping = true;
    
        this.sprite.body.setVelocity(
            this.sprite.body.velocity.x * 4,
            this.sprite.body.velocity.y * 4
        );
    
        this.scene.time.delayedCall(2000, () => {
            this.jumping = false;
        });
    }
    

    update() {
        console.log(this.inWater);
        if ((this.cursors.up.isDown || this.cursors.down.isDown || this.cursors.left.isDown || this.cursors.right.isDown) && this.inWater && !this.jumping) {
            if (this.cursors.up.isDown) {
                this.sprite.body.setAccelerationY(-this.SWIM_ACCELERATION);
            }
            if (this.cursors.down.isDown) {
                this.sprite.body.setAccelerationY(this.SWIM_ACCELERATION);
            }
            if (this.cursors.right.isDown) {
                this.sprite.body.setAccelerationX(this.SWIM_ACCELERATION);
            }
            if (this.cursors.left.isDown) {
                this.sprite.body.setAccelerationX(-this.SWIM_ACCELERATION);
            }
        }

        else {
            this.sprite.body.setAccelerationX(0);
            this.sprite.body.setAccelerationY(0);
        }

        // Apply drag to simulate water resistance
        this.sprite.body.setDrag(this.DRAG, this.DRAG);

        // Cap the speed in both X and Y directions
        if (!this.jumping) {
            this.sprite.body.velocity.x = Phaser.Math.Clamp(this.sprite.body.velocity.x, -this.MAX_SWIM_SPEED, this.MAX_SWIM_SPEED);
            this.sprite.body.velocity.y = Phaser.Math.Clamp(this.sprite.body.velocity.y, -this.MAX_SWIM_SPEED, this.MAX_SWIM_SPEED);
        }
    }

    playerStatus() {
        console.log(this.sprite.body);
    }
}
