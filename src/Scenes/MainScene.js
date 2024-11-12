class MainScene extends Phaser.Scene {
    constructor() {
        super("mainScene");
    }

    create() {
        // Set up background
        let background = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');
        background.setDisplaySize(this.game.config.width, this.game.config.height);

        // Score setup
        this.playerScore = 0;
        this.scoreText = this.add.text(this.cameras.main.centerX + 330, this.cameras.main.centerY - 270, `Score: ${this.playerScore.toString().padStart(8, '0')}`, {
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(5).setScrollFactor(0);

        // Score Multiplier
        this.scoreMultiplier = 1;
        this.scoreMultiplierText = this.add.text(this.cameras.main.centerX + 460, this.cameras.main.centerY - 270, `X${this.scoreMultiplier}`, {
            fontSize: '22px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(5).setScrollFactor(0);

        // Instantiate the player
        this.player = new Player(this, 500, 500, "shark1");
        document.getElementById('description').innerHTML = '<h1>Controls</h2><br>WASD or Arrow Keys to Move<br>ENTER: Boost<br>SPACE: Chomp';
        
        // Create a blue rectangle for the water area
        this.waterArea = this.add.rectangle(0, this.game.config.height, this.game.config.width * 2, this.game.config.height, 0x0000ff).setAlpha(0.3);
        this.physics.add.existing(this.waterArea, true); // Static body

        // Array to store multiple enemy birds
        this.enemies = [];
        
        // Set initial spawn properties
        this.maxEnemies = 20;
        this.enemySpawnDelay = 3000;  // Initial delay between spawns
        this.minimumSpawnDelay = 500; // Minimum delay between spawns
        this.spawnTimer = this.time.addEvent({ delay: this.enemySpawnDelay, callback: this.spawnEnemy, callbackScope: this, loop: true });

        // Set up overlap detection to detect when player enters water
        this.physics.add.overlap(this.player.sprite, this.waterArea, () => {
            if (!this.player.inWater) {  // Only call if not already in water
                this.player.playerInWater(true);
            }
        });

        // Set up chomp action on spacebar press
        this.input.keyboard.on('keydown-SPACE', () => {
            this.checkEnemyCollisions();  // Check for collisions with spacebar press
        });
    }

    updateScore(points) {
        this.playerScore += (points * this.scoreMultiplier);
        this.scoreText.setText(`Score: ${this.playerScore.toString().padStart(8, '0')}`);
        this.scoreMultiplier += 1;
        this.scoreMultiplierText.setText(`X${this.scoreMultiplier}`);

        this.time.delayedCall(3000, () => {
            this.scoreMultiplier = 1;
            this.scoreMultiplierText.setText(`X${this.scoreMultiplier}`);
        });
    }

    spawnEnemy() {
        if (this.enemies.length >= this.maxEnemies) return; // Limit the number of enemies on screen

        const spawnOnLeft = Phaser.Math.Between(0, 1) === 0;
        const x = spawnOnLeft ? -50 : this.game.config.width + 50;
        const y = Phaser.Math.Between(50, this.game.config.height - 350);

        let bird = this.add.rectangle(x, y, 10, 10, 0xffffff);
        bird.points = 100;
        const speed = Phaser.Math.Between(50, 200);
        bird.speed = spawnOnLeft ? speed : -speed;

        this.physics.add.existing(bird);
        bird.body.setVelocityX(bird.speed);

        this.enemies.push(bird);

        if (this.enemySpawnDelay > this.minimumSpawnDelay) {
            this.enemySpawnDelay -= 50;
            this.spawnTimer.reset({ delay: this.enemySpawnDelay, callback: this.spawnEnemy, callbackScope: this, loop: true });
        }
    }

    checkEnemyCollisions() {
        // Check for collisions between player and each enemy
        for (let i = 0; i < this.enemies.length; i++) {
            let enemy = this.enemies[i];
            if (this.collides(this.player.sprite, enemy) && this.player.attemptChomp(enemy)) {
                this.updateScore(enemy.points);
                enemy.destroy();
                this.enemies.splice(i, 1);
                i--;
            }
        }
    }

    removeOffScreenEnemies() {
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            const isOffScreenRight = enemy.x > this.game.config.width + 100;
            const isOffScreenLeft = enemy.x < -100;

            if (isOffScreenRight || isOffScreenLeft) {
                enemy.destroy();
                this.enemies.splice(i, 1);
                i--;
            }
        }
    }

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth / 2 + b.displayWidth / 2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight / 2 + b.displayHeight / 2)) return false;
        return true;
    }

    playerScreenWrap(){
        // Custom X-axis wrap
        if (this.player.sprite.x < 0) {
            this.player.sprite.x = this.game.config.width;
        } else if (this.player.sprite.x > this.game.config.width) {
            this.player.sprite.x = 0;
        }

        // Y-axis clamping to prevent going through the ground
        const minY = 0;  // Adjust if you have a higher "ground" level
        const maxY = this.game.config.height - 10;
        this.player.sprite.y = Phaser.Math.Clamp(this.player.sprite.y, minY, maxY);
    }

    update() {
        const playerBounds = this.player.sprite.getBounds();
        const waterBounds = this.waterArea.getBounds();

        this.playerScreenWrap();

        if (!Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, waterBounds) && this.player.inWater) {
            this.player.playerInWater(false);
            this.player.turboJump();
        }

        this.removeOffScreenEnemies();
        this.player.update();
    }
}
