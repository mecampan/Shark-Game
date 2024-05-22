class Switches {
    constructor(scene) {
        this.scene = scene;
        this.switches = this.scene.physics.add.group();
        this.currentSwitch = null;
        this.dropPlatformsActivated = false; // Flag to check if drop platforms have been activated
    }

    initializeSwitches(objectsLayer) {
        objectsLayer.objects.forEach(obj => {
            if (obj.name === 'switch') {
                const switchSprite = this.switches.create(obj.x, obj.y - 18, 'tilemap_sheet', 64);
                switchSprite.setOrigin(0, 0);
                switchSprite.setInteractive();
                switchSprite.setData('on', obj.properties.find(prop => prop.name === 'on')?.value || false);
                switchSprite.setData('pipeTarget', obj.properties.find(prop => prop.name === 'pipeTarget')?.value || null);
                switchSprite.setData('platformTarget', obj.properties.find(prop => prop.name === 'platformTarget')?.value || null);

                // Combine waterTarget and waterPuzzle into a single array
                let waterTargets = [];
                const waterTarget = obj.properties.find(prop => prop.name === 'waterTarget')?.value;
                if (typeof waterTarget === 'string') {
                    waterTargets = waterTargets.concat(waterTarget.split(',').map(Number));
                }
                switchSprite.setData('waterTargets', waterTargets);
                switchSprite.setDepth(3); // Set depth if necessary
                switchSprite.body.setAllowGravity(false);
                switchSprite.body.setImmovable(true);
            }
        });

        // Add overlap detection with the player
        this.scene.physics.add.overlap(this.scene.player.sprite, this.switches, (player, switchSprite) => {
            this.currentSwitch = switchSprite;
        }, null, this);
    }

    handleSwitch(switchSprite) {
        // Check if the puzzle is solved before toggling
        if (this.isPuzzleSolved()) {
            return; // Do nothing if the puzzle is solved
        }

        // Toggle the tile index
        const tileIndex = switchSprite.frame.name === 64 ? 66 : 64;
        switchSprite.setFrame(tileIndex);

        // Toggle the 'on' state
        const currentState = switchSprite.getData('on');
        switchSprite.setData('on', !currentState);

        // Handle the pipe target
        const pipeTarget = switchSprite.getData('pipeTarget');
        if (pipeTarget) {
            this.scene.warpPipeHandler.activatePipe(pipeTarget);
        }

        // Handle the water targets
        const waterTargets = switchSprite.getData('waterTargets');
        if (waterTargets.length > 0) {
            this.toggleWater(waterTargets);
        }

        // Handle the platform target
        const platformTarget = switchSprite.getData('platformTarget');
        if (platformTarget) {
            this.togglePlatform(platformTarget, !currentState);
        }
    }

    toggleWater(waterTargets) {
        const waterObjects = this.scene.waters.waterGroup.getChildren();
        const toBeDestroyed = [];

        // First, toggle the visibility of all target water objects
        waterObjects.forEach(waterObject => {
            if (waterObject.properties) {
                const waterIDProperty = waterObject.properties.find(prop => prop.name === 'waterTarget');
                if (waterIDProperty && waterTargets.includes(waterIDProperty.value)) {

                    // Toggle visibility
                    waterObject.visible = !waterObject.visible;

                    // Destroy water objects with waterTarget 1 or 9 if they are no longer visible
                    if (!waterObject.visible && (waterIDProperty.value == 1 || waterIDProperty.value == 9)) {
                        toBeDestroyed.push(waterObject);
                    }
                }
            }
        });

        // Now destroy the marked objects
        toBeDestroyed.forEach(waterObject => {
            waterObject.destroy();
        });

        // Check if all water objects with waterTarget 2-7 are no longer visible
        const checkPuzzle = waterObjects.every(waterObject => {
            const waterIDProperty = waterObject.properties?.find(prop => prop.name === 'waterTarget');
            if (waterIDProperty && waterIDProperty.value >= 2 && waterIDProperty.value <= 7) {
                return !waterObject.visible;
            }
            return true;
        });

        // If the puzzle is solved, destroy water objects with waterTarget 2-8
        if (checkPuzzle) {
            const puzzleObjectsToDestroy = [];
            waterObjects.forEach(waterObject => {
                const waterIDProperty = waterObject.properties?.find(prop => prop.name === 'waterTarget');
                if (waterIDProperty && waterIDProperty.value >= 2 && waterIDProperty.value <= 8) {
                    puzzleObjectsToDestroy.push(waterObject);
                }
            });

            // Destroy the puzzle objects
            puzzleObjectsToDestroy.forEach(waterObject => {
                waterObject.destroy();
            });

            // Ensure platforms only activate once
            if (!this.dropPlatformsActivated) {
                this.activateDropPlatformsOnce();
                this.dropPlatformsActivated = true; // Set the flag to true to prevent reactivation
            }
        }
    }
    
    togglePlatform(platformTarget, state) {
        this.scene.movingPlatforms.platforms.getChildren().forEach(platform => {
            if (platform.getData('platformTarget') === platformTarget && !platform.getData('active')) {
                platform.setData('active', state);
                this.scene.movingPlatforms.startMoving(platform);
            }
        });
    }

    activateDropPlatformsOnce() {
        this.scene.dropPlatforms.getChildren().forEach(platform => {
            this.scene.activateDropPlatformTweenDown(platform);
        });
    }

    isPuzzleSolved() {
        // Logic to determine if the puzzle is solved
        // This should return true if the puzzle is solved, false otherwise
        // You can implement your own logic here based on your puzzle requirements
        return false; // Placeholder logic
    }

    update(player) {
        if (this.currentSwitch && this.scene.physics.overlap(player, this.currentSwitch)) {
            this.handleSwitch(this.currentSwitch);
        }
    }
}
