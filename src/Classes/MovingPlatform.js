class MovingPlatform {
    constructor(scene) {
        this.scene = scene;
        this.moving = false;

        // Create group for moving platforms
        this.platforms = this.scene.physics.add.group();
    }

    initializePlatforms(movingLayer) {
        movingLayer.objects.forEach(obj => {
            let movingSprite;
            if (obj.name === 'movingBlockA') {
                movingSprite = this.platforms.create(obj.x, obj.y - 18, 'tilemap_sheet', 48);
            } else if (obj.name === 'movingBlockB') {
                movingSprite = this.platforms.create(obj.x, obj.y - 18, 'tilemap_sheet', 49);
            } else if (obj.name === 'movingBlockC') {
                movingSprite = this.platforms.create(obj.x, obj.y - 18, 'tilemap_sheet', 50);
            }

            // Set properties from Tiled
            const properties = obj.properties || [];
            movingSprite.setData('originalX', obj.x);
            movingSprite.setData('originalY', obj.y - 18);
            movingSprite.setData('repeat', properties.find(prop => prop.name === 'repeat')?.value || false);
            movingSprite.setData('speed', properties.find(prop => prop.name === 'speed')?.value || 1000);
            movingSprite.setData('targetX', properties.find(prop => prop.name === 'targetX')?.value || obj.x);
            movingSprite.setData('targetY', properties.find(prop => prop.name === 'targetY')?.value || obj.y);
            movingSprite.setData('active', properties.find(prop => prop.name === 'active')?.value || false);
            movingSprite.setData('platformTarget', properties.find(prop => prop.name === 'platformTarget')?.value || null);
            movingSprite.setData('direction', 1); // Initially moving right
            movingSprite.setDepth(4);

            movingSprite.setOrigin(0, 0);
            movingSprite.body.setAllowGravity(false);
            movingSprite.body.setImmovable(true);

            // Start moving if active
            if (movingSprite.getData('active')) {
                this.startMoving(movingSprite);
            }
        });
    }

    startMoving(platform) {

        console.log('moving: ', platform.moving);
        if (!platform.moving) {
            platform.moving = true;

            const originalX = platform.getData('originalX');
            const targetX = platform.getData('targetX');
            const originalY = platform.getData('originalY');
            const targetY = platform.getData('targetY');
            const speed = platform.getData('speed');
            const repeat = platform.getData('repeat');

            const distanceX = targetX - originalX;
            const distanceY = targetY - originalY;
            const duration = speed; // Duration in milliseconds

            // Determine movement direction
            const moveHorizontally = originalX !== targetX;
            const moveVertically = originalY !== targetY;

            if (moveHorizontally) {
                const velocityX = distanceX / (duration / 1000); // Calculate velocity

                this.scene.tweens.add({
                    targets: platform,
                    x: targetX,
                    ease: 'Linear',
                    duration: speed,
                    yoyo: repeat,
                    repeat: -1,
                    onStart: () => {
                        platform.body.velocity.x = velocityX;
                    },
                    onUpdate: () => {
                        const currentX = platform.x;
                        const prevX = platform.getData('prevX') || originalX;

                        if (currentX > prevX) {
                            platform.setData('direction', 1); // Moving right
                        } else if (currentX < prevX) {
                            platform.setData('direction', -1); // Moving left
                        }

                        platform.setData('prevX', currentX); // Update previous X position
                    },
                    onYoyo: () => {
                        platform.setData('direction', platform.getData('direction') * -1); // Flip direction
                    },
                    onComplete: () => {
                        platform.setData('direction', platform.getData('direction') * -1); // Reset direction
                    }
                });
            } else if (moveVertically) {
                this.scene.tweens.add({
                    targets: platform,
                    y: targetY - 18,
                    ease: 'Linear',
                    duration: 1000,
                    yoyo: repeat,
                    repeat: -1,
                });
            }
        }
    }

    update(player) {
        this.platforms.getChildren().forEach(platform => {
            if (player.body.touching.down && platform.body.touching.up && platform.body.velocity.x != 0) {
                const platformDirection = platform.getData('direction');
                player.setX(player.x + platformDirection / 2.6);
            }
        });
    }
}