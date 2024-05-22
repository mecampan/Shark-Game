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
    }

    update() {
        if (this.cursors.left.isDown) {
            //this.sprite.body.setAccelerationX(-this.ACCELERATION);
            this.sprite.body.setVelocityX(-this.VELOCITY);
            this.sprite.setFlipX(false);
            this.sprite.anims.play('walk', true);
        } else if (this.cursors.right.isDown) {
            //this.sprite.body.setAccelerationX(this.ACCELERATION);
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

    respawn(spawnPoint) {
        this.sprite.setPosition(spawnPoint.x, spawnPoint.y);
        this.sprite.body.setVelocityX(0);
        this.sprite.body.setVelocityY(0);
        this.sprite.body.setAccelerationX(0);
        this.sprite.body.setAccelerationY(0);
    }

    playerStatus() {
        console.log(this.sprite.body);
    }
}