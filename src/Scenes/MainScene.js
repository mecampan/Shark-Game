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
        document.getElementById('description').innerHTML = '<h1>Controls</h2><br>WASD or Arrow Keys to Move<br>SPACE: Boost';

        // Create a blue rectangle for the water area
        this.waterArea = this.add.rectangle(0, this.game.config.height, this.game.config.width * 2, this.game.config.height, 0x0000ff).setAlpha(0.3);
        this.physics.add.existing(this.waterArea, true); // Static body

        // Array to store multiple enemy birds
        this.enemies = [];
        for (let i = 0; i < 10; i++) {  // Adjust the number of enemies as needed
            let bird = this.add.rectangle(
                Phaser.Math.Between(50, this.game.config.width - 100),
                Phaser.Math.Between(50, this.game.config.height - 350),
                10, 10, 0xffffff
            );
            bird.points = 100;  // Points awarded for chomping this bird
            this.physics.add.existing(bird, true);
            this.enemies.push(bird); 
        }

        // Set up overlap detection to detect when player enters water
        this.physics.add.overlap(this.player.sprite, this.waterArea, () => {
            if (!this.player.inWater) {  // Only call if not already in water
                this.player.playerInWater(true);
            }
        });
    }

    updateScore(points) {
        console.log("Player touching the bird");

        this.playerScore += (points * this.scoreMultiplier);
        this.scoreText.setText(`Score: ${this.playerScore.toString().padStart(8, '0')}`);
        this.scoreMultiplier += 1;
        this.scoreMultiplierText.setText(`X${this.scoreMultiplier}`);

        this.time.delayedCall(3000, () => {
            this.scoreMultiplier = 1;
            this.scoreMultiplierText.setText(`X${this.scoreMultiplier}`);
        });
    }

    checkEnemyCollisions() {
        // Check for collisions between player and each enemy
        for (let i = 0; i < this.enemies.length; i++) {
            let enemy = this.enemies[i];
            if (this.collides(this.player.sprite, enemy)) {
                // Update score and handle enemy deletion or repositioning
                this.updateScore(enemy.points);
                
                // Remove the enemy from the scene and array
                enemy.destroy();
                this.enemies.splice(i, 1); // Remove enemy from array
                i--; // Adjust index to account for removed element
            }
        }
    }

    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth / 2 + b.displayWidth / 2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight / 2 + b.displayHeight / 2)) return false;
        return true;
    }

    update() {
        // Check if the player has left the water area by comparing positions
        const playerBounds = this.player.sprite.getBounds();
        const waterBounds = this.waterArea.getBounds();

        if (!Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, waterBounds) && this.player.inWater) {
            this.player.playerInWater(false);
        }

        // Handle enemy collisions
        this.checkEnemyCollisions();

        // Update player
        this.player.update();
    }
}
