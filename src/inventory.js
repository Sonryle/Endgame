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
	    renderer.sortObjects = false;
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
                this.helmetGlintMaterial.uniforms.glintOffset.value.x = time / -20000;
                this.helmetGlintMaterial.uniforms.glintOffset.value.y = time /  4000;
                this.chestplateGlintMaterial.uniforms.glintOffset.value.x = time / -20000;
                this.chestplateGlintMaterial.uniforms.glintOffset.value.y = time /  4000;
                this.leggingsGlintMaterial.uniforms.glintOffset.value.x = time / -20000;
                this.leggingsGlintMaterial.uniforms.glintOffset.value.y = time /  4000;
                this.bootsGlintMaterial.uniforms.glintOffset.value.x = time / -20000;
                this.bootsGlintMaterial.uniforms.glintOffset.value.y = time /  4000;
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

        // Create shader for armor enchantment glint
        this.helmetGlintMaterial = await this.createEnchantGlintMaterial();
        this.chestplateGlintMaterial = await this.createEnchantGlintMaterial();
        this.leggingsGlintMaterial = await this.createEnchantGlintMaterial();
        this.bootsGlintMaterial = await this.createEnchantGlintMaterial();

        this.object = null;
        this.head = null;
        this.left_arm = null;
        this.right_arm = null;
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync( './src/assets/models/PlayerSlim/Untitled.gltf' );
        this.scene.add( gltf.scene );
        gltf.scene.traverse((child) => {
	    console.log(child.name);
            if (child.name == "SlimPlayerInnerLayer") {
                child.material.depthWrite = true;
                this.innerLayer = child;
            }
            if (child.name == "SlimPlayerOuterLayer") {
                child.material.depthWrite = false;
                this.outerLayer = child;
            }
            if (child.name == "HelmetGlint") {
                child.material = this.helmetGlintMaterial;
                child.material.depthWrite = false;
                child.material.wrapS = THREE.RepeatWrapping;
                child.material.wrapT = THREE.RepeatWrapping;
                this.helmetGlint = child;
            }
            if (child.name == "Helmet") {
                child.material.depthWrite = true;
                child.material.opacity = 0.0;
                child.material.alphaTest = 0.5;
                this.helmet = child;
            }
            if (child.name == "ChestplateGlint") {
                child.material = this.chestplateGlintMaterial;
                child.material.depthWrite = false;
                child.material.wrapS = THREE.RepeatWrapping;
                child.material.wrapT = THREE.RepeatWrapping;
                this.chestplateGlint = child;
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
            if (child.name == "LeggingsGlint") {
                child.material = this.leggingsGlintMaterial;
                child.material.depthWrite = false;
                child.material.wrapS = THREE.RepeatWrapping;
                child.material.wrapT = THREE.RepeatWrapping;
                this.leggingsGlint = child;
            }
            if (child.name == "Boots") {
                child.material.depthWrite = true;
                child.material.opacity = 0.0;
                child.material.alphaTest = 0.5;
                this.boots = child;
            }
            if (child.name == "BootsGlint") {
                child.material = this.bootsGlintMaterial;
                child.material.depthWrite = false;
                child.material.wrapS = THREE.RepeatWrapping;
                child.material.wrapT = THREE.RepeatWrapping;
                this.bootsGlint = child;
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

    async createEnchantGlintMaterial() {

        const texturePath = await texturePack.getPath("misc/enchanted_glint_armor.png");
        const glintTexture = new THREE.TextureLoader().load(texturePath);
        glintTexture.flipY = false;  // important for GLTF models
        glintTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
        glintTexture.colorSpace = THREE.NoColorSpace;
        glintTexture.wrapS = THREE.RepeatWrapping;
        glintTexture.wrapT = THREE.RepeatWrapping;

        return new THREE.ShaderMaterial({
            uniforms: {
              glintTexture:  { value: glintTexture },
              maskTexture:   { value: null },
              hide:          { value: false },
              glintOffset:   { value: new THREE.Vector2(0, 0) },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            premultipliedAlpha: true,
            fragmentShader: `
              uniform sampler2D glintTexture;
              uniform sampler2D maskTexture;
              uniform bool hide;
	      uniform vec2 glintOffset;
              varying vec2 vUv;

              vec4 blendScreen (vec4 base, vec4 top) {
                  vec4 result = vec4(0, 0, 0, 0);
                  result.r = 1.0 - ((1.0 - base.r) * (1.0 - top.r));
                  result.g = 1.0 - ((1.0 - base.g) * (1.0 - top.g));
                  result.b = 1.0 - ((1.0 - base.b) * (1.0 - top.b));
                  result.w = 1.0 - ((1.0 - base.w) * (1.0 - top.w));
                  return result;
              }

              vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
                  vec4 color = vec4(0.0);
                  vec2 off1 = vec2(1.3846153846) * direction;
                  vec2 off2 = vec2(3.2307692308) * direction;
                  color += texture2D(image, uv) * 0.2270270270;
                  color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
                  color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
                  color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
                  color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
                  return color;
              }

              void main() {
	        vec4 mask = texture(maskTexture, vUv);
                // vec4 glint = texture(glintTexture,  (vUv) / vec2(2, 2) + glintOffset);
		vec4 glint = blur9(glintTexture, (vUv) / vec2(4, 4) + glintOffset, vec2(120, 120), vec2(1, 1));

                if (hide == true || mask.w < 0.5)
                    discard;

                // float gamma = 2.2;
                // mask.rgb = pow(mask.rgb, vec3(1.0/gamma));
                
		// Find Brightest Pixel
		float brightest = glint.r;
		if (brightest < glint.g)
		    brightest = glint.g;
		if (brightest < glint.b)
		    brightest = glint.b;
                // gl_FragColor = blendScreen(mask, glint);
                gl_FragColor = vec4(glint.rgb, brightest);
              }
            `,
            vertexShader: `
              #include <skinning_pars_vertex>
              varying vec2 vUv;
              
              void main() {
                vUv = uv;
              
                #include <beginnormal_vertex>
                #include <skinbase_vertex>
                #include <skinnormal_vertex>
                #include <begin_vertex>
                #include <skinning_vertex>
              
                gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
              }
            `
        });
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
        this.texture.attr('href', await texturePack.getPath("gui/container/inventory.png"));
        this.texture.attr('width', 256 * state.scale);
        this.texture.attr('height', 256 * state.scale);

        // Create Mini Player Model
        this.playerModel = new MiniPlayerModel(this.svg, (25 * state.scale), (8 * state.scale));
        await this.playerModel.ready;

        // Create item slots holding items
        this.initSlots(items)
    }

    async initSlots(items) {

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
        this.slots[45] = new ItemSlot(this.svg, 76 * state.scale, 61 * state.scale, await texturePack.getPath("gui/sprites/container/slot/shield.png"));

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

    async swapHelmet(item) {

        // Find out which texture to use
        let texturePath = null;
        let legacyTextureLocation = false;
        if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/diamond_layer_1.png"))) {
            legacyTextureLocation = true;
	}

        let path = null;
        if (item != null) {
            switch (item.name) {
                case "Netherite Helmet":
                    path = (legacyTextureLocation)? "models/armor/netherite_layer_1.png" : "entity/equipment/humanoid/netherite.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Diamond Helmet":
                    path = (legacyTextureLocation)? "models/armor/diamond_layer_1.png" : "entity/equipment/humanoid/diamond.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Golden Helmet":
                    path = (legacyTextureLocation)? "models/armor/gold_layer_1.png" : "entity/equipment/humanoid/gold.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Iron Helmet":
                    path = (legacyTextureLocation)? "models/armor/iron_layer_1.png" : "entity/equipment/humanoid/iron.png"
                    texturePath = await texturePack.getPath(path);
                    break;
            }
        }

        const textureLoader = new THREE.TextureLoader();
        let newTexture = textureLoader.load(texturePath);
        
        if (texturePath == null) {
            this.playerModel.helmet.material.opacity = 0.0;
            this.playerModel.helmetGlintMaterial.uniforms.hide.value = 1;
        } else {
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.playerModel.helmet.material.opacity = 1.0;
            this.playerModel.helmet.material.map = newTexture;
            this.playerModel.helmet.material.needsUpdate = true;  // tells Three.js to re-render with new texture
            if (item.enchantments != null) {
                this.playerModel.helmetGlintMaterial.uniforms.hide.value = 0;
		this.playerModel.helmetGlintMaterial.uniforms.maskTexture.value = newTexture;
	    } else
                this.playerModel.helmetGlintMaterial.uniforms.hide.value = 1;
        }
    }

    async swapChestplate(item) {
        // Find out which texture to use
        let texturePath = null;
        let legacyTextureLocation = false;
        if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/diamond_layer_1.png")))
	    legacyTextureLocation = true;

        let path = null;
        if (item != null) {
            switch (item.name) {
                case "Netherite Chestplate":
                    path = (legacyTextureLocation)? "models/armor/netherite_layer_1.png" : "entity/equipment/humanoid/netherite.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Diamond Chestplate":
                    path = (legacyTextureLocation)? "models/armor/diamond_layer_1.png" : "entity/equipment/humanoid/diamond.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Golden Chestplate":
                    path = (legacyTextureLocation)? "models/armor/gold_layer_1.png" : "entity/equipment/humanoid/gold.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Iron Chestplate":
                    path = (legacyTextureLocation)? "models/armor/iron_layer_1.png" : "entity/equipment/humanoid/iron.png"
                    texturePath = await texturePack.getPath(path);
                    break;
            }
        }

        const textureLoader = new THREE.TextureLoader();
        let newTexture = textureLoader.load(texturePath);
        
        if (texturePath == null) {
            this.playerModel.chestplate.material.opacity = 0.0;
            this.playerModel.chestplateGlintMaterial.uniforms.hide.value = 1;
        } else {
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.playerModel.chestplate.material.opacity = 1.0;
            this.playerModel.chestplate.material.map = newTexture;
            this.playerModel.chestplate.material.needsUpdate = true;  // tells Three.js to re-render with new texture
            if (item.enchantments != null) {
                this.playerModel.chestplateGlintMaterial.uniforms.hide.value = 0;
		this.playerModel.chestplateGlintMaterial.uniforms.maskTexture.value = newTexture;
	    } else
                this.playerModel.chestplateGlintMaterial.uniforms.hide.value = 1;
        }
    }

    async swapLeggings(item) {
        // Find out which texture to use
        let texturePath = null;
        let legacyTextureLocation = false;
        if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/diamond_layer_1.png")))
            legacyTextureLocation = true;

        let path = null;
        if (item != null) {
            switch (item.name) {
                case "Netherite Leggings":
                    path = (legacyTextureLocation)? "models/armor/netherite_layer_2.png" : "entity/equipment/humanoid_leggings/netherite.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Diamond Leggings":
                    path = (legacyTextureLocation)? "models/armor/diamond_layer_2.png" : "entity/equipment/humanoid_leggings/diamond.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Golden Leggings":
                    path = (legacyTextureLocation)? "models/armor/gold_layer_2.png" : "entity/equipment/humanoid_leggings/gold.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Iron Leggings":
                    path = (legacyTextureLocation)? "models/armor/iron_layer_2.png" : "entity/equipment/humanoid_leggings/iron.png"
                    texturePath = await texturePack.getPath(path);
                    break;
            }
        }

        const textureLoader = new THREE.TextureLoader();
        let newTexture = textureLoader.load(texturePath);
        
        if (texturePath == null) {
            this.playerModel.leggings.material.opacity = 0.0;
            this.playerModel.leggingsGlintMaterial.uniforms.hide.value = 1;
        } else {
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.playerModel.leggings.material.opacity = 1.0;
            this.playerModel.leggings.material.map = newTexture;
            this.playerModel.leggings.material.needsUpdate = true;  // tells Three.js to re-render with new texture
            if (item.enchantments != null) {
                this.playerModel.leggingsGlintMaterial.uniforms.hide.value = 0;
		this.playerModel.leggingsGlintMaterial.uniforms.maskTexture.value = newTexture;
	    } else
                this.playerModel.leggingsGlintMaterial.uniforms.hide.value = 1;
        }
    }

    async swapBoots(item) {
        // Find out which texture to use
        let texturePath = null;
        let legacyTextureLocation = false;
        if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/diamond_layer_1.png")))
            legacyTextureLocation = true;

        let path = null;
        if (item != null) {
            switch (item.name) {
                case "Netherite Boots":
                    path = (legacyTextureLocation)? "models/armor/netherite_layer_1.png" : "entity/equipment/humanoid/netherite.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Diamond Boots":
                    path = (legacyTextureLocation)? "models/armor/diamond_layer_1.png" : "entity/equipment/humanoid/diamond.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Golden Boots":
                    path = (legacyTextureLocation)? "models/armor/gold_layer_1.png" : "entity/equipment/humanoid/gold.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Iron Boots":
                    path = (legacyTextureLocation)? "models/armor/iron_layer_1.png" : "entity/equipment/humanoid/iron.png"
                    texturePath = await texturePack.getPath(path);
                    break;
            }
        }

        const textureLoader = new THREE.TextureLoader();
        let newTexture = textureLoader.load(texturePath);
        
        if (texturePath == null) {
            this.playerModel.boots.material.opacity = 0.0;
            this.playerModel.bootsGlintMaterial.uniforms.hide.value = 1;
        } else {
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.playerModel.boots.material.opacity = 1.0;
            this.playerModel.boots.material.map = newTexture;
            this.playerModel.boots.material.needsUpdate = true;  // tells Three.js to re-render with new texture
            if (item.enchantments != null) {
                this.playerModel.bootsGlintMaterial.uniforms.hide.value = 0;
		this.playerModel.bootsGlintMaterial.uniforms.maskTexture.value = newTexture;
	    } else
                this.playerModel.bootsGlintMaterial.uniforms.hide.value = 1;
        }
    }

    delete() {
        this.svg.remove();
    }
}
