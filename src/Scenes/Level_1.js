class Level_1 extends Phaser.Scene {
    constructor() {
        super("level1Scene");
    }

    init() {
        this.SCALE = 2.0;
        this.PARTICLE_VELOCITY = 50;
    }

    create() {
        this.startTime = this.time.now;
        this.timeText = this.add.text(10, 10, 'Time: 0:0:0:0\n\n', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setScrollFactor(0).setDepth(5);

        this.map = this.add.tilemap("platformer-level-1");
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        this.background = this.add.tileSprite(0, 0, this.map.widthInPixels, this.map.heightInPixels, "background").setOrigin(0, 0).setDepth(-1);
        
        // Set world bounds
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.backgroundLayer = this.map.createLayer("Background", this.tileset, 0, 0).setDepth(0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0).setDepth(3);
        this.groundLayer.setCollisionByProperty({ collides: true });

        this.foregroundLayer = this.map.createLayer("Foreground", this.tileset, 0, 0).setDepth(5);

        const objectsLayer = this.map.getObjectLayer('Objects');
        const startPoint = objectsLayer.objects.find(obj => obj.name === "startPoint");
        this.spawnPoint = { x: startPoint.x, y: startPoint.y };

        // Add this in the create method after initializing the objectsLayer
        const endPointData = objectsLayer.objects.find(obj => obj.name === "endPoint");
        if (endPointData) {
            this.endPoint = this.physics.add.sprite(endPointData.x, endPointData.y, null).setOrigin(0, 0).setVisible(false);
            this.endPoint.body.setAllowGravity(false);
            this.endPoint.body.setImmovable(true);
        }

        // Add checkpoints
        this.checkPoints = this.physics.add.group();
        objectsLayer.objects.forEach(obj => {
            if (obj.name === 'checkPoint') {
                const checkpointSprite = this.checkPoints.create(obj.x, obj.y - 18, 'tilemap_sheet', 111);
                checkpointSprite.setOrigin(0, 0);
                checkpointSprite.body.setAllowGravity(false);
                checkpointSprite.body.setImmovable(true);
                checkpointSprite.anims.play('flag');
            }
        });

        // Initialize waterFallTrap
        this.waterFallTrap = this.physics.add.group();
        objectsLayer.objects.forEach(obj => {

            if (obj.name === 'waterfall') {
                const waterfall = this.waterFallTrap.create(obj.x, obj.y - 18, 'tilemap_sheet', 54).setOrigin(0, 0).setDepth(4);
                waterfall.properties = obj.properties;
                waterfall.anims.play('waterfallMotion')

            }
            if (obj.name === 'waterfallBottom') {
                const waterfall = this.waterFallTrap.create(obj.x, obj.y - 18, 'tilemap_sheet', 74).setOrigin(0, 0).setDepth(4);
                waterfall.properties = obj.properties;
                waterfall.anims.play('waterfallBottomMotion')
            }
        });

        // safeZone creation for waterFall trap
        const safeZoneData = objectsLayer.objects.find(obj => obj.name === "safeZone");
        if (safeZoneData) {
            this.safeZone = this.physics.add.sprite(safeZoneData.x - 10, safeZoneData.y, null).setOrigin(0, 0).setVisible(false);

            const targetX = safeZoneData.properties.find(prop => prop.name === "targetX").value;
            this.safeZone.setData('targetX', targetX);
            this.safeZone.body.setAllowGravity(false);
            this.safeZone.body.setImmovable(true);

            // Set the size of the safeZone to match the Tiled object
            const safeZoneWidth = safeZoneData.width;
            const safeZoneHeight = safeZoneData.height;
            this.safeZone.body.setSize(safeZoneWidth, safeZoneHeight);

            // Move the safeZone back and forth
            this.tweens.add({
                targets: this.safeZone,
                x: targetX + 40,
                duration: 8000,
                yoyo: true,
                repeat: -1,
                ease: 'Linear'
            });
        }

        // Call the waterfall cascade function
        this.updateWaterfallVisibility();

        // Initialize keys and locks
        this.keys = this.physics.add.group();
        this.locks = this.physics.add.group();

        objectsLayer.objects.forEach(obj => {
            if (obj.name === 'key') {
                const key = this.keys.create(obj.x + 18, obj.y, 'tilemap_sheet', 27).setOrigin(0, 0).setAngle(90).setDepth(4);
                key.setData('following', false);
                const lockTarget = obj.properties.find(prop => prop.name === 'lockTarget');
                if (lockTarget) {
                    key.setData('lockTarget', lockTarget.value);
                }
            }
            if (obj.name === 'lock') {
                const lock = this.locks.create(obj.x, obj.y - 18, 'tilemap_sheet', 28).setOrigin(0, 0);
                const lockTarget = obj.properties.find(prop => prop.name === 'lockTarget');
                const pipeTarget = obj.properties.find(prop => prop.name === 'pipeTarget');
                if (lockTarget) {
                    lock.setData('lockTarget', lockTarget.value);
                }
                if (pipeTarget) {
                    lock.setData('pipeTarget', pipeTarget.value);
                }
            }
        });

        // Add drop platforms
        this.dropPlatforms = this.physics.add.group();
        objectsLayer.objects.forEach(obj => {
            if (obj.name === 'dropPlatformA' || obj.name === 'dropPlatformB' || obj.name === 'dropPlatformC') {
                let frame = 0;
                if (obj.name === 'dropPlatformA') frame = 48;
                if (obj.name === 'dropPlatformB') frame = 49;
                if (obj.name === 'dropPlatformC') frame = 50;
                const platform = this.dropPlatforms.create(obj.x, obj.y - 18, 'tilemap_sheet', frame)
                    .setOrigin(0, 0)
                    .setImmovable(true);
                platform.body.allowGravity = false;
            }
        });

        this.player = new Player(this, this.spawnPoint.x, this.spawnPoint.y, "platformer_characters", "tile_0000.png");
        this.player.sprite.setDepth(3); // Set player sprite depth here

        // Initialize WarpPipes
        this.warpPipeHandler = new WarpPipe(this);
        this.warpPipeHandler.initializePipes(objectsLayer); // Initialize pipes

        // Initialize Falling Platforms
        FallingPlatform.initializePlatforms(this);

        // Initialize Moving Platforms
        const movingLayer = this.map.getObjectLayer('MovingObjects');
        this.movingPlatforms = new MovingPlatform(this);
        this.movingPlatforms.initializePlatforms(movingLayer);
        this.physics.add.collider(this.player.sprite, this.movingPlatforms.platforms, this.handlePlatformCollision, null, this);

        // Initialize Waters
        const waterLayer = this.map.getObjectLayer('WaterObjects');
        this.waters = new Waters(this);
        this.waters.initializeWaters(waterLayer);

        // Initialize Switches
        const switchLayer = this.map.getObjectLayer('Switches');
        this.switches = new Switches(this);
        this.switches.initializeSwitches(switchLayer);

        // Initialize Messages
        this.messages = new Messages(this);
        this.messages.initializeSigns(objectsLayer); // Initialize signs

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player.sprite, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.warpPipeHandler.currentPipe && this.physics.overlap(this.player.sprite, this.warpPipeHandler.currentPipe)) {
                this.warpPipeHandler.handleWarp(this.player.sprite, this.warpPipeHandler.currentPipe);
            }

            if (this.messages.currentSign && this.physics.overlap(this.player.sprite, this.messages.currentSign)) {
                this.messages.showInfo();
            }

            if (this.switches.currentSwitch && this.physics.overlap(this.player.sprite, this.switches.currentSwitch)) {
                this.switches.handleSwitch(this.switches.currentSwitch);
            }
        });
        
        this.physics.world.drawDebug = !this.physics.world.drawDebug;
        /*
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic.clear();
        });

        this.input.keyboard.on('keydown-R', () => {
            this.player.respawn(this.spawnPoint);
        });

        this.input.keyboard.on('keydown-S', () => {
            this.player.playerStatus();
        });
        */

        // Create water splash particle effect
        my.vfx.waterSplash = this.add.particles(0, 0, "kenny-particles", {
            frame: ['muzzle_02.png', 'muzzle_03.png'],
            random: true,
            scale: { start: 0.2, end: 0.1 },
            maxAliveParticles: 8,
            lifespan: 350,
            gravityY: -500,
            alpha: { start: 1, end: 0.1 }
        });
        my.vfx.waterSplash.stop();

        // Add collider for tiles with danger property
        this.groundLayer.forEachTile(tile => {
            if (tile.properties.danger) {
                this.physics.add.collider(this.player.sprite, tile, this.handleDangerTileCollision, null, this);
            }
        });

        // Should I have just used one?
        this.physics.add.collider(this.player.sprite, this.groundLayer, this.handleDangerTileCollision, null, this);
        this.physics.add.collider(this.player.sprite, this.dropPlatforms);
        this.physics.add.overlap(this.player.sprite, this.endPoint, this.handleWinCondition, null, this);
        this.physics.add.overlap(this.player.sprite, this.waterFallTrap, this.handleWaterFallCollision, null, this);
        this.physics.add.overlap(this.player.sprite, this.keys, this.collectKey, null, this);
        this.physics.add.overlap(this.player.sprite, this.locks, this.unlockPipe, null, this);
    }

    handleDangerTileCollision(playerSprite, tileOrObject) {
        if (tileOrObject.properties && tileOrObject.properties.danger) {
            this.player.respawn(this.spawnPoint);
        }
    }

    handlePlatformCollision(player, platform) {
        if (player.body.touching.down && platform.body.touching.up) {
            this.playerOnPlatform = platform;
        }
    }

    collectKey(player, key) {
        key.setData('following', true);
        key.body.setAllowGravity(false);
        key.body.setImmovable(true);
    }

    unlockPipe(player, lock) {
        const key = this.keys.getChildren().find(key => key.getData('following') && key.getData('lockTarget') === lock.getData('lockTarget'));
        if (key) {
            const pipeTarget = lock.getData('pipeTarget');
            this.warpPipeHandler.activatePipe(pipeTarget);
            key.destroy();
            lock.destroy();
        }
    }

    activateDropPlatformTweenDown(platform) {
        const originalY = platform.y;
        const dropDistance = 18 * 5;

        this.tweens.add({
            targets: platform,
            y: originalY + dropDistance,
            duration: 2000,
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    this.activateDropPlatformTweenUp(platform);
                });
            }
        });
    }

    activateDropPlatformTweenUp(platform) {
        const originalY = platform.y;
        const dropDistance = -18 * 5;

        this.tweens.add({
            targets: platform,
            y: originalY + dropDistance,
            duration: 2000,
            onComplete: () => {
                this.time.delayedCall(2000, () => {
                    this.activateDropPlatformTweenDown(platform);
                });
            }
        });
    }

    handleCameraSlowFollow() {
        // Temporarily slow down the camera follow speed
        this.cameras.main.stopFollow();
        this.tweens.add({
            targets: this.cameras.main,
            scrollX: this.player.sprite.x - this.cameras.main.width / 2,
            scrollY: this.player.sprite.y - this.cameras.main.height / 2,
            duration: 1000,
            ease: 'Sine.easeOut',
            onComplete: () => {
                // Restore the normal camera follow speed
                this.cameras.main.startFollow(this.player.sprite, true, 0.25, 0.25);
            }
        });
    }

    splashVFX(posX, posY) {
        my.vfx.waterSplash.emitParticleAt(posX, posY - 15, 10);
    }

    updateWaterfallVisibility() {
        const waterFalls = this.waterFallTrap.getChildren();

        waterFalls.forEach(waterfall => {
            if (this.physics.overlap(this.safeZone, waterfall)) {
                waterfall.setVisible(false).setActive(false);
            } else {
                waterfall.setVisible(true).setActive(true);
            }
        });
    }

    handleWaterFallCollision(player, waterfall) {
        if (waterfall.visible) {
            this.player.respawn(this.spawnPoint, true);
        }
    }

    handleWinCondition(player, endPoint) {
        const elapsedTime = this.time.now - this.startTime;
    
        const totalSeconds = Math.floor(elapsedTime / 1000);
        const milliseconds = (elapsedTime % 1000).toFixed(0); // Shorten milliseconds
        const seconds = totalSeconds % 60;
        const minutes = Math.floor(totalSeconds / 60) % 60;
        const hours = Math.floor(totalSeconds / 3600);
    
        const timeText = `Time: ${hours}h ${minutes}m ${seconds}s ${milliseconds}ms\n\n`;
    
        const winText = this.cache.json.get('gameText').gameWin;
    
        const winningText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, timeText + winText, {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(5).setScrollFactor(0);
    
        this.player.sprite.body.enable = false;
    
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.restart();
        });
    }    

    update() {
        this.player.update();

        // Update MovingPlatforms
        this.movingPlatforms.update(this.player.sprite);

        // Update Messages
        this.messages.update(this.player.sprite);

        // Check overlap for checkPoint
        this.physics.world.overlap(this.player.sprite, this.checkPoints, (player, checkPoint) => {
            this.spawnPoint = { x: checkPoint.x, y: checkPoint.y };
        });

        // Check overlap for WarpPipe
        this.physics.world.overlap(this.player.sprite, this.warpPipeHandler.pipes, (player, pipe) => {
            this.warpPipeHandler.currentPipe = pipe;
        });

        this.updateWaterfallVisibility();

        // Make the keys follow the player
        this.keys.getChildren().forEach(key => {
            if (key.getData('following')) {
                key.x = this.player.sprite.x + 10;
                key.y = this.player.sprite.y - 32; // Adjust height as needed
            }
        });

        // Update the timer
        const elapsedTime = this.time.now - this.startTime;
        const hours = Math.floor(elapsedTime / 3600000);
        const minutes = Math.floor((elapsedTime % 3600000) / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        const milliseconds = elapsedTime % 1000;
        this.timeText.setText(`Time: ${hours}:${minutes}:${seconds}:${milliseconds}`);
    }
}