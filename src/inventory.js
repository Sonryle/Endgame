import { state } from "./state.js"
import { grid } from "./grid.js"
import { texturePack } from "./TexturePack.js"
import { ItemType, MinecraftItem } from "./Item.js"
import { ItemSlot, ArmourItemSlot } from "./ItemSlot.js"

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;

export class MiniPlayerModel {
    constructor(svg, xPos, yPos) {

        const canvasX = state.scale * 50;
        const canvasY = state.scale * 70;
        this.svg = svg;

        // Create foreign html element to store rendered element
        const foreignObject = this.svg.append('foreignObject')
            .attr('class', 'playerModelContainer')
            .attr('pointer-events', 'none')
            .attr('width', 50 * state.scale)
            .attr('height', 70 * state.scale)
            .attr('x', xPos)
            .attr('y', yPos)

        // Create renderer
        const renderer = new THREE.WebGLRenderer( {antialias: false});
        foreignObject.node().appendChild(renderer.domElement);
        renderer.setSize(canvasX, canvasY);
        
        const scale = 57.5 * state.scale;
        const camera = new THREE.OrthographicCamera(canvasX / -scale, canvasX / scale, canvasY / scale, canvasY / -scale, 1, 3);
        camera.position.z = 2.0; camera.position.y = 0.15;
        
        // Create scene
        this.scene = new THREE.Scene();

        // Create & Load player model
        this.ready = this.loadPlayerModel();

        // Start the render loop
        const animate = () => {
            requestAnimationFrame(animate);
            if (this.right_arm != null && this.left_arm != null) {
        	const d = new Date();
                let time = d.getSeconds() * 1000 + d.getMilliseconds();
                this.left_arm.rotation.z = (Math.sin(time / 750) - 1) / 15;
                this.right_arm.rotation.z = (Math.sin(time / 750) - 1) / -15;
            };
            renderer.render(this.scene, camera);
        };
        animate();

        // Add lights to the scene
        const topLight = new THREE.DirectionalLight(0xffffff, 7);
        topLight.position.set(-500, 500, 0) // Top Right
        this.scene.add(topLight);
        const ambientLight = new THREE.AmbientLight(0x333333, 40);
        this.scene.add(ambientLight);

        // Add callback for model rotation
        state.svg.node().addEventListener('mousemove', (event) => {
            if (this.object != null) {
                const ax = 0.8; // Bell function height at x = 0
                const ay = 1.0;
                const x = Math.max(Math.min((state.mouseX - xPos - this.svg.attr('x') - canvasX / 2) / 500, ax), -ax);
                const y = Math.max(Math.min((state.mouseY - yPos - this.svg.attr('y') - canvasY / 4) / 500, ay), -ay);
                const bellX = 1 / (1 + ((x / ax)*(x / ax)));
                const bellY = 1 / (1 + ((y / ay)*(y / ay)));
                this.object.rotation.y = x * bellX;
                this.object.rotation.x = y * bellY;
                this.head.rotation.y = x * bellX;
                this.head.rotation.x = y * bellY;
            }
        })

        renderer.render(this.scene, camera);
    }

    async loadPlayerModel() {
        this.object = null;
        this.head = null;
        this.left_arm = null;
        this.right_arm = null;
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync( './src/assets/models/PlayerSlim/Untitled.gltf' );
        this.scene.add( gltf.scene );
        gltf.scene.traverse((child) => {
            if (child.name == "SlimPlayerInnerLayer") {
                child.material.depthWrite = true;
                this.innerLayer = child;
            }
            if (child.name == "SlimPlayerOuterLayer") {
                child.material.depthWrite = false;
                this.outerLayer = child;
            }
            if (child.name == "Helmet") {
                child.material.depthWrite = true;
                child.material.opacity = 0.0;
                child.material.alphaTest = 0.5;
                this.helmet = child;
            }
            if (child.name == "Chestplate") {
                child.material.depthWrite = true;
                child.material.opacity = 0.0;
                child.material.alphaTest = 0.5;
                this.chestplate = child;
            }
            if (child.name == "Leggings") {
                child.material.depthWrite = true;
                child.material.opacity = 0.0;
                child.material.alphaTest = 0.5;
                this.leggings = child;
            }
            if (child.name == "Boots") {
                child.material.depthWrite = true;
                child.material.opacity = 0.0;
                child.material.alphaTest = 0.5;
                this.boots = child;
            }
            if (child.name == "Head")
                this.head = child;
            if (child.name == "ArmLeft")
                this.left_arm = child;
            if (child.name == "ArmRight")
                this.right_arm = child;
        });
        // If file is loaded, add it to scene
        this.object = gltf.scene;
    }
}

// Inventory has 44 possible slots for items
export class Inventory {
    constructor(svg, items) {
        this.svg = svg;
        this.cellScale = 18 * state.scale;
        this.slots = [];

        this.init(items);
    }

    async init(items) {

        // Create inventory image
        this.texture = this.svg.append('image');   
        this.texture.attr('href', texturePack.getPath("gui/container/inventory.png"));
        this.texture.attr('width', 256 * state.scale);
        this.texture.attr('height', 256 * state.scale);

        // Create Mini Player Model
        this.playerModel = new MiniPlayerModel(this.svg, (25 * state.scale), (8 * state.scale));
        await this.playerModel.ready;

        // Create item slots holding items
        this.initSlots(items)
    }

    initSlots(items) {

        // Crafting Result
        this.slots[0] = new ItemSlot(this.svg, 153 * state.scale, 27 * state.scale, null, ItemType.NONE);

        // Crafting Input
        let xOffset = 97 * state.scale;
        let yOffset = 17 * state.scale;
        this.slots[1] = new ItemSlot(this.svg, xOffset + 0 * this.cellScale, yOffset + 0 * this.cellScale)
        this.slots[2] = new ItemSlot(this.svg, xOffset + 1 * this.cellScale, yOffset + 0 * this.cellScale);
        this.slots[3] = new ItemSlot(this.svg, xOffset + 0 * this.cellScale, yOffset + 1 * this.cellScale);
        this.slots[4] = new ItemSlot(this.svg, xOffset + 1 * this.cellScale, yOffset + 1 * this.cellScale);

        // Armour
        xOffset = 7 * state.scale;
        yOffset = 7 * state.scale;
        this.slots[5] = new ArmourItemSlot(this.svg, xOffset, yOffset + 0 * this.cellScale, ItemType.HELMET, (item, itemType) => this.swapPlayerArmour(item, itemType));
        this.slots[6] = new ArmourItemSlot(this.svg, xOffset, yOffset + 1 * this.cellScale, ItemType.CHESTPLATE, (item, itemType) => this.swapPlayerArmour(item, itemType));
        this.slots[7] = new ArmourItemSlot(this.svg, xOffset, yOffset + 2 * this.cellScale, ItemType.LEGGINGS, (item, itemType) => this.swapPlayerArmour(item, itemType));
        this.slots[8] = new ArmourItemSlot(this.svg, xOffset, yOffset + 3 * this.cellScale, ItemType.BOOTS, (item, itemType) => this.swapPlayerArmour(item, itemType));

        // Main Inventory
        xOffset = 7 * state.scale;
        yOffset = 83 * state.scale;
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 9; x++) {
                let slotNum = 9 + x + (y * 9);
                this.slots[slotNum] = new ItemSlot( this.svg,
                                    xOffset + x * this.cellScale,
                                    yOffset + y * this.cellScale);
            }
        }

        // Hotbar
        xOffset = 7 * state.scale;
        yOffset = 141 * state.scale;
        for (let x = 0; x < 9; x++) {
            let slotNum = 36 + x;
            this.slots[slotNum] = new ItemSlot(this.svg,
                                xOffset + x * this.cellScale,
                                yOffset + 0 * this.cellScale);
        }

        // Offhand Slot
        this.slots[45] = new ItemSlot(this.svg, 76 * state.scale, 61 * state.scale, texturePack.getPath("gui/sprites/container/slot/shield.png"));

        // Fill every slot with respective item
	    items.forEach((value, index) => {
	        this.slots[index].setItem(value);
	    });
    }

    returnItems() {
        let items = [];
        this.slots.forEach((slot, index) => {
            items[index] = slot.item;
        });
        return items;
    }

    swapPlayerArmour(item, itemType) {

        switch (itemType) {
            case ItemType.HELMET:
                this.swapHelmet(item);
                break;
            case ItemType.CHESTPLATE:
                this.swapChestplate(item);
                break;
            case ItemType.LEGGINGS:
                this.swapLeggings(item);
                break;
            case ItemType.BOOTS:
                this.swapBoots(item);
                break;
        }
        return;
    }

    swapHelmet(item) {
        // Find out which texture to use
        let texturePath = null;
        if (item != null) {
            switch (item.name) {
                case "Netherite Helmet":
                    texturePath = texturePack.getPath("entity/equipment/humanoid/netherite.png");
                    break;
                case "Diamond Helmet":
                    texturePath = texturePack.getPath("entity/equipment/humanoid/diamond.png");
                    break;
                case "Golden Helmet":
                    texturePath = texturePack.getPath("entity/equipment/humanoid/gold.png");
                    break;
                case "Iron Helmet":
                    texturePath = texturePack.getPath("entity/equipment/humanoid/iron.png");
                    break;
            }
        }

        const textureLoader = new THREE.TextureLoader();
        if (texturePath == null) {
            this.playerModel.helmet.material.opacity = 0.0;
        } else {
            textureLoader.load(texturePath, (newTexture) => {
                newTexture.flipY = false;  // important for GLTF models
                newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
                newTexture.colorSpace = THREE.SRGBColorSpace;
                this.playerModel.helmet.material.opacity = 1.0;
                this.playerModel.helmet.material.map = newTexture;
                this.playerModel.helmet.material.needsUpdate = true;  // tells Three.js to re-render with new texture
                console.log(texturePath)
            });
        }
    }

    swapChestplate(item) {
        // Find out which texture to use
        let texturePath = null;
        if (item != null) {
            switch (item.name) {
                case "Netherite Chestplate":
                    texturePath = texturePack.getPath("entity/equipment/humanoid/netherite.png");
                    break;
                case "Diamond Chestplate":
                    texturePath = texturePack.getPath("entity/equipment/humanoid/diamond.png");
                    break;
                case "Golden Chestplate":
                    texturePath = texturePack.getPath("entity/equipment/humanoid/gold.png");
                    break;
                case "Iron Chestplate":
                    texturePath = texturePack.getPath("entity/equipment/humanoid/iron.png");
                    break;
            }
        }

        const textureLoader = new THREE.TextureLoader();
        if (texturePath == null) {
            this.playerModel.chestplate.material.opacity = 0.0;
        } else {
            textureLoader.load(texturePath, (newTexture) => {
                newTexture.flipY = false;  // important for GLTF models
                newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
                newTexture.colorSpace = THREE.SRGBColorSpace;
                this.playerModel.chestplate.material.opacity = 1.0;
                this.playerModel.chestplate.material.map = newTexture;
                this.playerModel.chestplate.material.needsUpdate = true;  // tells Three.js to re-render with new texture
                console.log(texturePath)
            });
        }
    }

    swapLeggings(item) {
        // Find out which texture to use
        let texturePath = null;
        if (item != null) {
            switch (item.name) {
                case "Netherite Leggings":
                    texturePath = texturePack.getPath("entity/equipment/humanoid_leggings/netherite.png");
                    break;
                case "Diamond Leggings":
                    texturePath = texturePack.getPath("entity/equipment/humanoid_leggings/diamond.png");
                    break;
                case "Golden Leggings":
                    texturePath = texturePack.getPath("entity/equipment/humanoid_leggings/gold.png");
                    break;
                case "Iron Leggings":
                    texturePath = texturePack.getPath("entity/equipment/humanoid_leggings/iron.png");
                    break;
            }
        }

        const textureLoader = new THREE.TextureLoader();
        if (texturePath == null) {
            this.playerModel.leggings.material.opacity = 0.0;
        } else {
            textureLoader.load(texturePath, (newTexture) => {
                newTexture.flipY = false;  // important for GLTF models
                newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
                newTexture.colorSpace = THREE.SRGBColorSpace;
                this.playerModel.leggings.material.opacity = 1.0;
                this.playerModel.leggings.material.map = newTexture;
                this.playerModel.leggings.material.needsUpdate = true;  // tells Three.js to re-render with new texture
                console.log(texturePath)
            });
        }
    }

    swapBoots(item) {
        // Find out which texture to use
        let texturePath = null;
        if (item != null) {
            switch (item.name) {
                case "Netherite Boots":
                    texturePath = texturePack.getPath("entity/equipment/humanoid/netherite.png");
                    break;
                case "Diamond Boots":
                    texturePath = texturePack.getPath("entity/equipment/humanoid/diamond.png");
                    break;
                case "Golden Boots":
                    texturePath = texturePack.getPath("entity/equipment/humanoid/gold.png");
                    break;
                case "Iron Boots":
                    texturePath = texturePack.getPath("entity/equipment/humanoid/iron.png");
                    break;
            }
        }

        const textureLoader = new THREE.TextureLoader();
        if (texturePath == null) {
            this.playerModel.boots.material.opacity = 0.0;
        } else {
            textureLoader.load(texturePath, (newTexture) => {
                newTexture.flipY = false;  // important for GLTF models
                newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
                newTexture.colorSpace = THREE.SRGBColorSpace;
                this.playerModel.boots.material.opacity = 1.0;
                this.playerModel.boots.material.map = newTexture;
                this.playerModel.boots.material.needsUpdate = true;  // tells Three.js to re-render with new texture
                console.log(texturePath)
            });
        }
    }

    delete() {
        this.svg.remove();
    }
}
