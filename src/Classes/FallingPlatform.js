class FallingPlatform {
    constructor(scene, platform) {
        this.scene = scene;
        this.platform = platform;
        this.originalPosition = { x: platform.x, y: platform.y };

        // Set the platform properties
        this.platform.x;
        this.platform.y;
        scene.physics.world.enable(this.platform);
        this.platform.body.setAllowGravity(false);
        this.platform.body.setImmovable(true);

        this.isShaking = false; // Track if the platform is shaking
        this.isFalling = false; // Track if the platform is falling

        // Add overlap detection
        this.scene.physics.add.collider(this.scene.player.sprite, this.platform, (player, platform) => {
            if (!this.isShaking && !this.isFalling) {
                this.startShaking();
            }
        }, null, this);
    }

    startShaking() {
        this.isShaking = true;

        // Shake the platform horizontally
        this.scene.tweens.add({
            targets: this.platform,
            x: this.platform.x + 5,
            ease: 'Quad.easeInOut',
            duration: 100,
            yoyo: true,
            repeat: 5,
            onComplete: () => {
                this.isShaking = false;
                this.triggerFall();
            }
        });
    }

    triggerFall() {
        this.isFalling = true;

        // Make the platform fall
        this.platform.body.setAllowGravity(true);
        this.platform.body.setVelocityY(300);  // Increase this value for faster fall
        this.scene.time.delayedCall(8000, () => {
            this.resetPlatform();
        });
    }

    resetPlatform() {
        this.isFalling = false;

        // Reset the platform to its original position
        this.platform.body.setAllowGravity(false);
        this.platform.body.setVelocity(0);
        this.platform.setPosition(this.originalPosition.x, this.originalPosition.y);
        this.platform.body.updateFromGameObject();  // Update the physics body to match the new position
    }

    static initializePlatforms(scene) {
        // Find falling platforms in the "BreakableObjects" layer
        scene.fallingPlatforms = scene.map.createFromObjects("BreakableObjects", {
            name: "fallingBlockA",
            key: "tilemap_sheet",
            frame: 146
        });

        // Convert them into Arcade Physics sprites and set their properties
        scene.fallingPlatforms.forEach(platform => {
            scene.add.existing(platform);
            new FallingPlatform(scene, platform);
        });
    }
}