class Messages {
    constructor(scene) {
        this.scene = scene;

        // Create the prompt and info texts
        this.promptText = this.scene.add.text(0, 0, 'Press SPACE', {
            fontSize: '12px', // Increased font size for better readability
            fill: '#ffffff',
            stroke: '#000000', // Adding stroke to make the text stand out
            strokeThickness: 3
        }).setOrigin(0.25).setVisible(false).setDepth(5);
        
        this.infoText = this.scene.add.text(0, 0, '', {
            fontSize: '12px', // Increased font size for better readability
            fill: '#ffffff',
            stroke: '#000000', // Adding stroke to make the text stand out
            strokeThickness: 3,
            wordWrap: { width: 200, useAdvancedWrap: true }  // Set word wrap properties
        }).setOrigin(0.25).setVisible(false).setDepth(5);

        this.currentSign = null;

        // Create signs group
        this.signs = this.scene.physics.add.group({});

        // Load messages from JSON file
        this.messages = this.scene.cache.json.get('gameText');
    }

    initializeSigns(objectsLayer) {
        objectsLayer.objects.forEach(obj => {
            if (obj.name === 'sign') {
                const sign = this.signs.create(obj.x-7, obj.y-7, null).setSize(obj.width, obj.height);
                const messageKey = obj.properties.find(prop => prop.name === 'text').value;
                sign.message = this.messages[messageKey];
                sign.setOrigin(0, 0);
                sign.body.setAllowGravity(false);
                sign.body.setImmovable(true);
                sign.visible = false; // Invisible collision body
            }
        });

        // Add overlap detection
        this.scene.physics.add.overlap(this.scene.player.sprite, this.signs, (player, sign) => {
            this.showPrompt(player, sign);
        }, null, this);
    }

    showPrompt(player, sign) {
        if (!this.infoText.visible) {
            this.currentSign = sign;
            this.promptText.setPosition(sign.x, sign.y - 20).setVisible(true); // Adjusted position for better visibility
        }
    }

    showInfo() {
        if (this.currentSign) {
            this.infoText.setPosition(this.currentSign.x, this.currentSign.y - 40).setText(this.currentSign.message).setVisible(true);
            this.promptText.setVisible(false);
        }
    }

    hideInfo() {
        this.infoText.setVisible(false);
        this.promptText.setVisible(false);
        this.currentSign = null;
    }

    update(player) {
        if (this.currentSign && !this.scene.physics.overlap(player, this.currentSign)) {
            this.hideInfo();
        }
    }
}
