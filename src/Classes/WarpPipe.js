class WarpPipe {
    constructor(scene) {
        this.scene = scene;
        this.canWarp = true; // To control the warp trigger
        this.pipes = null; // Initialize pipes as null, will be set in initializePipes

        // Define the properties
        this.pipeID = null;
        this.target = null;
        this.warpAble = null;
        this.pipeTarget = null;
    }

    initializePipes(objectsLayer) {
        this.pipes = this.scene.physics.add.group({
            allowGravity: false,
            immovable: true
        });

        objectsLayer.objects.forEach(obj => {
            if (obj.properties) {
                this.pipeID = obj.properties.find(prop => prop.name === 'pipeID')?.value || null;
                this.target = obj.properties.find(prop => prop.name === 'target')?.value || null;
                this.warpAble = obj.properties.find(prop => prop.name === 'warpAble')?.value !== undefined ? obj.properties.find(prop => prop.name === 'warpAble').value : true;
                this.pipeTarget = obj.properties.find(prop => prop.name === 'pipeTarget')?.value || null;

                //console.log(`Initializing Pipe: ID=${this.pipeID}, Target=${this.target}, WarpAble=${this.warpAble}, PipeTarget=${this.pipeTarget}`);

                if (this.pipeID && this.target) {
                    const pipe = this.pipes.create(obj.x - 7, obj.y - 7, null).setSize(obj.width, obj.height);
                    pipe.setData('pipeID', this.pipeID);
                    pipe.setData('target', this.target);
                    pipe.setData('pipeTarget', this.pipeTarget);
                    pipe.setData('warpAble', this.warpAble);
                    pipe.setOrigin(0, 0);
                    pipe.body.setAllowGravity(false);
                    pipe.body.setImmovable(true);
                    pipe.visible = false; // Make the pipe invisible

                    //console.log(`Initialized Pipe - ID: ${pipe.getData('pipeID')}, Target: ${pipe.getData('target')}, PipeTarget: ${pipe.getData('pipeTarget')}, WarpAble: ${pipe.getData('warpAble')}`);
                }
            }
        });

        // Add overlap detection
        this.scene.physics.add.overlap(this.scene.player.sprite, this.pipes, (player, pipe) => {
            this.scene.currentPipe = pipe;
        }, null, this);
    }

    handleWarp(playerSprite, pipe) {
        //console.log("Warp attempt:");
        //console.log(`Current Pipe WarpAble: ${pipe.getData('warpAble')}`);

        if (this.canWarp && pipe.getData('warpAble')) {
            const targetPipe = this.pipes.getChildren().find(p => p.getData('pipeID') === pipe.getData('target'));

            //console.log("Checking target pipe...");
            //console.log(`Target Pipe Exists: ${!!targetPipe}`);

            if (targetPipe) {
                //console.log(`Target Pipe WarpAble: ${targetPipe.getData('warpAble')}`);

                if (targetPipe.getData('warpAble')) {
                    //console.log("Warping player...");
                    playerSprite.setPosition(targetPipe.x + 14, targetPipe.y + 14);
                    this.canWarp = false; // Prevent continuous triggering
                    this.scene.time.delayedCall(1000, () => { this.canWarp = true; }); // Re-enable warp after delay
                } else {
                    //console.log("Target pipe is not warpAble.");
                }
            } else {
                //console.log("No target pipe found.");
            }
        } else {
            //console.log("Warp conditions not met.");
        }
    }

    activatePipe(pipeTarget) {
        //console.log(`Activating pipes with PipeTarget: ${pipeTarget}`);

        this.pipes.getChildren().forEach(pipe => {
            if (pipe.getData('pipeTarget') == pipeTarget) {
                pipe.setData('warpAble', true);
                //console.log(`Pipe ID: ${pipe.getData('pipeID')} set to warpAble: ${pipe.getData('warpAble')}`);
            }
        });
    }
}
