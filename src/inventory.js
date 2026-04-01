import { state } from "./state.js"
import { grid } from "./grid.js"
import { texturePack } from "./TexturePack.js"
import { ItemType } from "./Item.js"
import { ItemSlot } from "./ItemSlot.js"

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
        renderer.setSize(canvasX, canvasY);
        // renderer.setClearColor( 0x88ffff, 1 );
        foreignObject.node().appendChild(renderer.domElement);
        
        const scale = 57.5 * state.scale;
        const camera = new THREE.OrthographicCamera(canvasX / -scale, canvasX / scale, canvasY / scale, canvasY / -scale, 1, 3);
        camera.position.z = 2.0; camera.position.y = 0.15;
        
        // Create scene
        const scene = new THREE.Scene();

        // Create & Load player model
        let object = null;
        let head = null;
        let left_arm = null;
        let right_arm = null;
        const loader = new GLTFLoader();
        loader.load(
            './src/assets/models/PlayerSlim/Untitled.gltf',
            (gltf) => {
                gltf.scene.traverse((child) => {
                    if (child.name == "SlimPlayerInnerLayer")
                        child.material.depthWrite = true;
                    if (child.name == "SlimPlayerOuterLayer")
                        child.material.depthWrite = false;
                    if (child.name == "Head")
                        head = child;
                    if (child.name == "ArmLeft")
                        left_arm = child;
                    if (child.name == "ArmRight")
                        right_arm = child;
                });
                // If file is loaded, add it to scene
                object = gltf.scene;
                scene.add(object);
            }, null ,
            (error) => {
                // If there is an error, log it
                console.log(error);
            }
        )

        // Start the render loop
        const animate = () => {
            requestAnimationFrame(animate);
            if (right_arm != null && left_arm != null) {
        	const d = new Date();
                let time = d.getSeconds() * 1000 + d.getMilliseconds();
                left_arm.rotation.z = (Math.sin(time / 750) - 1) / 15;
                right_arm.rotation.z = (Math.sin(time / 750) - 1) / -15;
            };
            renderer.render(scene, camera);
        };
        animate();


        // Add lights to the scene
        const topLight = new THREE.DirectionalLight(0xffffff, 7);
        topLight.position.set(-500, 500, 0) // Top Right
        scene.add(topLight);
        const ambientLight = new THREE.AmbientLight(0x333333, 40);
        scene.add(ambientLight);

        // Add callback for model rotation
        state.svg.node().addEventListener('mousemove', (event) => {
            if (object != null) {
                const ax = 0.8; // Bell function height at x = 0
                const ay = 1.0;
                const x = Math.max(Math.min((state.mouseX - xPos - this.svg.attr('x') - canvasX / 2) / 500, ax), -ax);
                const y = Math.max(Math.min((state.mouseY - yPos - this.svg.attr('y') - canvasY / 4) / 500, ay), -ay);
                const bellX = 1 / (1 + ((x / ax)*(x / ax)));
                const bellY = 1 / (1 + ((y / ay)*(y / ay)));
                object.rotation.y = x * bellX;
                object.rotation.x = y * bellY;
                head.rotation.y = x * bellX;
                head.rotation.x = y * bellY;
            }
        })

        renderer.render(scene, camera);
    }
}

// Inventory has 44 possible slots for items
export class Inventory {
    constructor(svg, items) {
        this.svg = svg;
        this.cellScale = 18 * state.scale;
        this.slots = [];

        // Create inventory image
        this.texture = this.svg.append('image');   
        this.texture.attr('href', texturePack.getPath("gui/container/inventory.png"));
        this.texture.attr('width', 256 * state.scale);
        this.texture.attr('height', 256 * state.scale);

        // Create item slots holding items
        this.initSlots(items);

        // Create Mini Player Model
        this.playerModel = new MiniPlayerModel(this.svg, (25 * state.scale), (8 * state.scale));
    }

    initSlots(items) {

        // Crafting Result
        this.slots[0] = new ItemSlot(this.svg, 153 * state.scale, 27 * state.scale, ItemType.NONE);

        // Crafting Input
        let xOffset = 97 * state.scale;
        let yOffset = 17 * state.scale;
        this.slots[1] = new ItemSlot(this.svg, xOffset + 0 * this.cellScale, yOffset + 0 * this.cellScale, ItemType.DEFAULT, null)
        this.slots[2] = new ItemSlot(this.svg, xOffset + 1 * this.cellScale, yOffset + 0 * this.cellScale, ItemType.DEFAULT, null);
        this.slots[3] = new ItemSlot(this.svg, xOffset + 0 * this.cellScale, yOffset + 1 * this.cellScale, ItemType.DEFAULT, null);
        this.slots[4] = new ItemSlot(this.svg, xOffset + 1 * this.cellScale, yOffset + 1 * this.cellScale, ItemType.DEFAULT, null);

        // Armour
        xOffset = 7 * state.scale;
        yOffset = 7 * state.scale;
        this.slots[5] = new ItemSlot(this.svg, xOffset, yOffset + 0 * this.cellScale, ItemType.HELMET, texturePack.getPath("gui/sprites/container/slot/helmet.png"));
        this.slots[6] = new ItemSlot(this.svg, xOffset, yOffset + 1 * this.cellScale, ItemType.CHESTPLATE, texturePack.getPath("gui/sprites/container/slot/chestplate.png"));
        this.slots[7] = new ItemSlot(this.svg, xOffset, yOffset + 2 * this.cellScale, ItemType.LEGGINGS, texturePack.getPath("gui/sprites/container/slot/leggings.png"));
        this.slots[8] = new ItemSlot(this.svg, xOffset, yOffset + 3 * this.cellScale, ItemType.BOOTS, texturePack.getPath("gui/sprites/container/slot/boots.png"));

        // Main Inventory
        xOffset = 7 * state.scale;
        yOffset = 83 * state.scale;
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 9; x++) {
                let slotNum = 9 + x + (y * 9);
                this.slots[slotNum] = new ItemSlot( this.svg,
                                    xOffset + x * this.cellScale,
                                    yOffset + y * this.cellScale,
                                    ItemType.DEFAULT, null);
            }
        }

        // Hotbar
        xOffset = 7 * state.scale;
        yOffset = 141 * state.scale;
        for (let x = 0; x < 9; x++) {
            let slotNum = 36 + x;
            this.slots[slotNum] = new ItemSlot(this.svg,
                                xOffset + x * this.cellScale,
                                yOffset + 0 * this.cellScale,
                                ItemType.DEFAULT, null);
        }

        // Offhand Slot
        this.slots[45] = new ItemSlot(this.svg, 76 * state.scale, 61 * state.scale, ItemType.DEFAULT, texturePack.getPath("gui/sprites/container/slot/shield.png"));

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

    delete() {
        this.svg.remove();
    }
}
