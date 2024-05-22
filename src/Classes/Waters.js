class Waters {
    constructor(scene) {
        this.scene = scene;
        this.waterGroup = this.scene.physics.add.group({
            allowGravity: false,
            immovable: true,
        });
    }

    initializeWaters(waterLayer) {
        waterLayer.objects.forEach(obj => {
            let waterSprite;

            if (obj.name === 'water') {
                waterSprite = this.createWaterSprite(obj, 'tilemap_sheet', 33, 'waterMotion');
            } else if (obj.name === 'waterfall') {
                waterSprite = this.createWaterSprite(obj, 'tilemap_sheet', 54, 'waterfallMotion');
            } else if (obj.name === 'waterfallTop') {
                waterSprite = this.createWaterSprite(obj, 'tilemap_sheet', 34, 'waterfallTopMotion');
            } else if (obj.name === 'waterfallBottom') {
                waterSprite = this.createWaterSprite(obj, 'tilemap_sheet', 74, 'waterfallBottomMotion');
            }

            if (waterSprite) {
                this.addProperties(waterSprite, obj.properties);
                this.setCollision(waterSprite, obj.properties);
            }
        });
    }

    createWaterSprite(obj, texture, frame, animation) {
        const sprite = this.waterGroup.create(obj.x, obj.y, texture, frame);
        sprite.setOrigin(0, 1);
        sprite.anims.play(animation);
        return sprite;
    }

    addProperties(sprite, properties) {
        if (properties) {
            sprite.properties = properties;
            const depthProperty = properties.find(prop => prop.name === 'depth');
            if (depthProperty) {
                sprite.setDepth(depthProperty.value);
            }
        }
    }

    setCollision(sprite, properties) {
        if (properties) {
            const dangerProperty = properties.find(prop => prop.name === 'danger');
            if (dangerProperty) {
                this.scene.physics.add.collider(this.scene.player.sprite, sprite, this.scene.handleDangerTileCollision, null, this.scene);
            }
        }
    }

    update() {
        // Add any update logic here if needed
    }
}