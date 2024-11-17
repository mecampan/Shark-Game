class MainScene extends Phaser.Scene {
    constructor() {
        super("mainScene");
    }

    create() {
        this.createBackground();
        this.setupScoreDisplay();
        this.timerSetUp();
        this.gameOver = false;

        this.snapSound = this.sound.add('snapSound');

        // Instantiate the player
        this.player = new Player(this, 500, 500, "shark1");
        document.getElementById('description').innerHTML = 
            '<h1>Controls</h1>WASD or Arrow Keys to Move<br>Move out of Water to \'Jump\'';

        // Create water area
        this.createWaterArea();

        // Initialize enemy arrays and spawn timers
        this.enemies = [];
        this.waterEnemies = [];

        // Set spawn properties
        this.initializeSpawnTimers();

        // Player enters water detection
        this.physics.add.overlap(this.player.sprite, this.waterArea, () => {
            if (!this.player.inWater) {
                this.player.playerInWater(true);
            }
        });
    }

    // --- Setup Functions ---

    createBackground() {
        let background = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');
        background.setDisplaySize(this.game.config.width, this.game.config.height);
    }

    setupScoreDisplay() {
        this.playerScore = 0;
        this.scoreText = this.add.text(this.cameras.main.centerX + 330, this.cameras.main.centerY - 270, `Score: ${this.playerScore.toString().padStart(8, '0')}`, {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(5).setScrollFactor(0);

        this.scoreMultiplier = 1;
        this.scoreMultiplierText = this.add.text(this.cameras.main.centerX + 460, this.cameras.main.centerY - 270, `X${this.scoreMultiplier}`, {
            fontSize: '22px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(5).setScrollFactor(0);
    }

    createWaterArea() {
        this.waterArea = this.add.rectangle(0, this.game.config.height + 62, this.game.config.width * 2, this.game.config.height, 0x0000ff)
            .setAlpha(0.3)
            .setDepth(1);
        this.physics.add.existing(this.waterArea, true);
    }

    initializeSpawnTimers() {
        this.maxEnemies = 20;
        this.enemySpawnDelay = 3000;
        this.minimumSpawnDelay = 500;
        this.spawnTimer = this.time.addEvent({
            delay: this.enemySpawnDelay,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        this.maxWaterEnemies = 8;
        this.currentMaxWaterEnemies = 1;
        this.spawnWaterEnemyTimer = this.time.addEvent({
            delay: 7000,
            callback: this.spawnWaterEnemy,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: 30000,
            callback: () => {
                if (this.currentMaxWaterEnemies < this.maxWaterEnemies) {
                    this.currentMaxWaterEnemies++;
                }
            },
            loop: true
        });
    }

    // --- Enemy Functions ---

    spawnEnemy() {
        if (this.enemies.length >= this.maxEnemies) return;

        const spawnOnLeft = Phaser.Math.Between(0, 1) === 0;
        const x = spawnOnLeft ? -50 : this.game.config.width + 50;
        const y = Phaser.Math.Between(50, this.game.config.height - 350);

        let bird = this.add.sprite(x, y, "seagull").setScale(1).setFlipX(spawnOnLeft ? true : false);

        bird.points = 100;
        bird.speed = spawnOnLeft ? Phaser.Math.Between(50, 200) : -Phaser.Math.Between(50, 200);

        this.physics.add.existing(bird);
        bird.body.setVelocityX(bird.speed);
        this.enemies.push(bird);

        // Gradually increase spawn rate
        if (this.enemySpawnDelay > this.minimumSpawnDelay) {
            this.enemySpawnDelay -= 50;
            this.spawnTimer.reset({
                delay: this.enemySpawnDelay,
                callback: this.spawnEnemy,
                callbackScope: this,
                loop: true
            });
        }
    }

    spawnWaterEnemy() {
        if (this.waterEnemies.length >= this.currentMaxWaterEnemies) return;

        const spawnOnLeft = Phaser.Math.Between(0, 1) === 0;
        const x = spawnOnLeft ? -50 : this.game.config.width + 50;
        const y = Phaser.Math.Between(this.game.config.height / 2 + 100, this.game.config.height - 50);

        let waterEnemy = this.add.sprite(x, y, "shark1").setScale(2).setFlipX(spawnOnLeft ? true : false).setDepth(0); // Depth set behind water area
        waterEnemy.setTint(0x444444);
        waterEnemy.speed = spawnOnLeft ? Phaser.Math.Between(30, 50) : -Phaser.Math.Between(30, 50);

        this.physics.add.existing(waterEnemy);
        waterEnemy.body.setVelocityX(waterEnemy.speed);
        this.waterEnemies.push(waterEnemy);
    }

    removeOffScreenEnemies() {
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.x > this.game.config.width + 100 || enemy.x < -100) {
                enemy.destroy();
                return false;
            }
            return true;
        });

        this.waterEnemies = this.waterEnemies.filter(waterEnemy => {
            if (waterEnemy.x > this.game.config.width + 100 || waterEnemy.x < -100) {
                waterEnemy.destroy();
                return false;
            }
            return true;
        });
    }

    // --- Collision Functions ---

    checkEnemyCollisions() {
        this.enemies = this.enemies.filter(enemy => {
            if (this.collides(this.player.sprite, enemy)) {
                this.snapSound.play();
                this.updateScore(enemy.points);
                enemy.destroy();

                if (this.player.sprite.scale < 3) {
                    this.player.sprite.setScale(this.player.sprite.scale + 0.1);
                }
                return false;
            }
            return true;
        });
    }

    checkWaterEnemyCollisions() {
        if (this.player.isInvincible) return;

        for (let i = 0; i < this.waterEnemies.length; i++) {
            let waterEnemy = this.waterEnemies[i];
            if (this.collides(this.player.sprite, waterEnemy)) {
                if (this.player.sprite.scale > 1) {
                    this.player.sprite.setScale(this.player.sprite.scale - 0.4);
                }
                this.player.invincibilityFrame();
                break;
            }
        }
    }

    collides(a, b) {
        return (
            Math.abs(a.x - b.x) <= (a.displayWidth / 2 + b.displayWidth / 2) &&
            Math.abs(a.y - b.y) <= (a.displayHeight / 2 + b.displayHeight / 2)
        );
    }

    // --- Utility Functions ---

    updateScore(points) {
        this.playerScore += (points * this.scoreMultiplier);
        this.scoreText.setText(`Score: ${this.playerScore.toString().padStart(8, '0')}`);
        this.scoreMultiplier++;
        this.scoreMultiplierText.setText(`X${this.scoreMultiplier}`);

        this.time.delayedCall(3000, () => {
            this.scoreMultiplier = 1;
            this.scoreMultiplierText.setText(`X${this.scoreMultiplier}`);
        });
    }

    // --- Timer Setup ---
    timerSetUp() {
        this.remainingTime = 180; // 3 minutes in seconds

        this.timerText = this.add.text(10, 10, `Time: 03:00`, {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0).setDepth(5).setScrollFactor(0);

        this.time.addEvent({
            delay: 1000, // Every second
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    updateTimer() {
        if (this.gameOver) return;

        this.remainingTime--;
        const minutes = Math.floor(this.remainingTime / 60).toString().padStart(2, '0');
        const seconds = (this.remainingTime % 60).toString().padStart(2, '0');
        this.timerText.setText(`Time: ${minutes}:${seconds}`);

        if (this.remainingTime <= 0) {
            this.triggerGameOver();
        }
    }

    triggerGameOver() {
        this.gameOver = true;

        // Stop all enemies
        this.enemies.forEach(enemy => enemy.destroy());
        this.waterEnemies.forEach(enemy => enemy.destroy());

        // Display "Game Over"
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        this.add.text(centerX, centerY, "GAME OVER", {
            fontSize: '48px',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(10);

        this.add.text(centerX, centerY + 50, `Score: ${this.playerScore}`, {
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);

        this.add.text(centerX, centerY + 100, "Press [Enter] to Restart", {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);

        // Listen for Enter key to restart
        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.restart();
        });
    }    

    update() {
        if (this.gameOver) return;

        const playerBounds = this.player.sprite.getBounds();
        const waterBounds = this.waterArea.getBounds();

        if (!Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, waterBounds) && this.player.inWater) {
            this.player.playerInWater(false);
            this.player.turboJump();
        }

        this.removeOffScreenEnemies();
        this.checkEnemyCollisions();
        this.checkWaterEnemyCollisions();
        this.player.update();
    }
}
