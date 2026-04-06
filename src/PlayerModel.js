import { state } from "./state.js"
import { texturePack } from "./TexturePack.js"
import { ItemType } from "./Item.js"

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';

export class PlayerModel {
    constructor(svg, canvasXPos, canvasYPos, canvasX, canvasY, animationCallback, scale) {

        this.svg = svg;
        this.animationCallback = animationCallback;

        // Create foreign html element to store rendered element
        const foreignObject = this.svg.append('foreignObject')
            .attr('class', 'playerModelContainer')
            .attr('pointer-events', 'none')
            .attr('width', canvasX)
            .attr('height', canvasY)
            .attr('x', canvasXPos)
            .attr('y', canvasYPos)

        // Create renderer
        const renderer = new THREE.WebGLRenderer( {antialias: false});
        foreignObject.node().appendChild(renderer.domElement);
        renderer.setSize(canvasX, canvasY);
        renderer.sortObjects = false;
        renderer.setClearColor( 0xFF0000, 0);
        
        const camera = new THREE.OrthographicCamera(canvasX / -scale, canvasX / scale, canvasY / scale, canvasY / -scale, -3, 3);
        camera.position.z = 2.0;
        
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

                // Arm Animation
                this.left_arm.rotation.z = (Math.sin(time / 750) - 1) / 13;
                this.right_arm.rotation.z = (Math.sin(time / 750) - 1) / -13;
                if (this.rightHandItemModel != null && typeof this.rightHandItemModel != "undefined")
                    if (this.rightHandItemModel.material.opacity == 1.0) {
                        this.right_arm.rotation.x = 3.141592 - 0.3- (Math.sin(time / -350) - 1) / -50;
                    }
                if (this.leftHandItemModel != null && typeof this.rightHandItemModel != "undefined")
                    if (this.leftHandItemModel.material.opacity == 1.0) {
                        this.left_arm.rotation.x = 3.141592 - 0.3 - (Math.sin(time / 375) - 1) / 50;
                    }

                // Enchantment Glints
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
            if (this.playerModel != null) {
                const ax = 1.0; // Bell function height at x = 0
                const ay = 1.0;
                const x = Math.max(Math.min((state.mouseX - canvasXPos - this.svg.attr('x') - canvasX / 2) / 500, ax), -ax);
                const y = Math.max(Math.min((state.mouseY - canvasYPos - this.svg.attr('y') - canvasY / 4) / 500, ay), -ay);
                const bellX = 1 / (1 + ((x / ax)*(x / ax)));
                const bellY = 1 / (1 + ((y / ay)*(y / ay)));
                this.playerModel.rotation.y = x * bellX;
                this.playerModel.rotation.x = y * bellY;
                this.head.rotation.y = x * bellX;
                this.head.rotation.x = y * bellY;
            }
        })

        renderer.render(this.scene, camera);
    }

    async loadPlayerModel() {

        // Create shader for armor enchantment glint
        let armourGlintTexturePath = await texturePack.getPath("misc/enchanted_glint_armor.png");
        this.helmetGlintMaterial = await this.createEnchantGlintMaterial(armourGlintTexturePath, false, 4, 120);
        this.chestplateGlintMaterial = await this.createEnchantGlintMaterial(armourGlintTexturePath, false, 4, 120);
        this.leggingsGlintMaterial = await this.createEnchantGlintMaterial(armourGlintTexturePath, false, 4, 120);
        this.bootsGlintMaterial = await this.createEnchantGlintMaterial(armourGlintTexturePath, false, 4, 120);

        this.playerModel = null;
        this.head = null;
        this.left_arm = null;
        this.right_arm = null;
        const loader = new GLTFLoader();
        const playerGLTF = await loader.loadAsync( './src/assets/models/PlayerSlim/Untitled.gltf' );
        this.playerModel = playerGLTF.scene;
        this.scene.add( playerGLTF.scene );
        playerGLTF.scene.traverse((child) => {
	    console.log(child.name);
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
            if (child.name == "HelmetGlint") {
                child.material = this.helmetGlintMaterial;
                child.material.depthWrite = false;
                child.material.wrapS = THREE.RepeatWrapping;
                child.material.wrapT = THREE.RepeatWrapping;
                this.helmetGlint = child;
            }
            if (child.name == "Chestplate") {
                child.material.depthWrite = true;
                child.material.opacity = 0.0;
                child.material.alphaTest = 0.5;
                this.chestplate = child;
            }
            if (child.name == "ChestplateGlint") {
                child.material = this.chestplateGlintMaterial;
                child.material.depthWrite = false;
                child.material.wrapS = THREE.RepeatWrapping;
                child.material.wrapT = THREE.RepeatWrapping;
                this.chestplateGlint = child;
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
            // Bones
            if (child.name == "Head")
                this.head = child;
            if (child.name == "ArmLeft")
                this.left_arm = child;
            if (child.name == "ArmRight")
                this.right_arm = child;
        });
        
        // Load Item Models for player hands
        const rightHandItemGLTF = await loader.loadAsync( './src/assets/models/ItemModel/Untitled.gltf' );
        this.scene.add( rightHandItemGLTF.scene );
        rightHandItemGLTF.scene.traverse((child) => {
            if (child.name == "ItemModel") {
                child.material.depthWrite = true;
                child.material.opacity = 0.0;
                this.rightHandItemModel = child;
            }
            if (child.name == "ItemGlint") {
                child.material.depthWrite = true;
                child.material.opacity = 0.0;
                this.rightHandItemGlintModel = child;
            }
            if (child.name == "ItemBone") {
                this.rightHandItemBone = child;
            }
        });
        this.right_arm.add(this.rightHandItemBone);

        const leftHandItemGLTF = await loader.loadAsync( './src/assets/models/ItemModel/Untitled.gltf' );
        this.scene.add( leftHandItemGLTF.scene );
        leftHandItemGLTF.scene.traverse((child) => {
            if (child.name == "ItemModel") {
                child.material.depthWrite = true;
                child.material.opacity = 0.0;
                this.leftHandItemModel = child;
            }
            if (child.name == "ItemGlint") {
                child.material.depthWrite = true;
                child.material.opacity = 0.0;
		child.material.transparent = true;
                this.leftHandItemGlintModel = child;
            }
            if (child.name == "ItemBone") {
                this.leftHandItemBone = child;
            }
        });
        this.left_arm.add(this.leftHandItemBone);
    }

    async createEnchantGlintMaterial(glintTexturePath, depthWrite, zoom, blur) {

        const glintTexture = new THREE.TextureLoader().load(glintTexturePath);
        glintTexture.flipY = false;  // important for GLTF models
        glintTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
        glintTexture.wrapS = THREE.RepeatWrapping;
        glintTexture.wrapT = THREE.RepeatWrapping;

        return new THREE.ShaderMaterial({
            uniforms: {
              glintTexture:  { value: glintTexture },
              maskTexture:   { value: null },
              hide:          { value: false },
              glintOffset:   { value: new THREE.Vector2(0, 0) },
              zoom:          { value: zoom },
              blur:          { value: blur },
            },
            transparent: true,
            depthWrite: depthWrite,
            blending: THREE.AdditiveBlending,
            premultipliedAlpha: true,
            fragmentShader: `
              uniform sampler2D glintTexture;
              uniform sampler2D maskTexture;
              uniform bool hide;
              uniform float zoom;
              uniform float blur;
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
		vec4 glint = blur9(glintTexture, (vUv) / vec2(zoom, zoom) + glintOffset, vec2(blur, blur), vec2(1, 1));

                if (hide == true || mask.w < 0.5)
                    discard;

               // Find Brightest Pixel
               float brightest = glint.r;
               if (brightest < glint.g)
                   brightest = glint.g;
               if (brightest < glint.b)
                   brightest = glint.b;

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

    updateHelmet(texturePath, enchanted) {
        const textureLoader = new THREE.TextureLoader();
        let newTexture = textureLoader.load(texturePath);
        
        if (texturePath == null) {
            this.helmet.material.opacity = 0.0;
            this.helmetGlintMaterial.uniforms.hide.value = 1;
        } else {
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.minFilter = THREE.NearestFilter;
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.helmet.material.opacity = 1.0;
            this.helmet.material.map = newTexture;
            this.helmet.material.needsUpdate = true;  // tells Three.js to re-render with new texture
            if (enchanted) {
                this.helmetGlintMaterial.uniforms.hide.value = 0;
		this.helmetGlintMaterial.uniforms.maskTexture.value = newTexture;
	    } else
                this.helmetGlintMaterial.uniforms.hide.value = 1;
        }
    }
    updateChestplate(texturePath, enchanted) {
        const textureLoader = new THREE.TextureLoader();
        let newTexture = textureLoader.load(texturePath);
        
        if (texturePath == null) {
            this.chestplate.material.opacity = 0.0;
            this.chestplateGlintMaterial.uniforms.hide.value = 1;
        } else {
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.minFilter = THREE.NearestFilter;
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.chestplate.material.opacity = 1.0;
            this.chestplate.material.map = newTexture;
            this.chestplate.material.needsUpdate = true;  // tells Three.js to re-render with new texture
            if (enchanted) {
                this.chestplateGlintMaterial.uniforms.hide.value = 0;
		this.chestplateGlintMaterial.uniforms.maskTexture.value = newTexture;
	    } else
                this.chestplateGlintMaterial.uniforms.hide.value = 1;
        }
    }
    updateLeggings(texturePath, enchanted) {
        const textureLoader = new THREE.TextureLoader();
        let newTexture = textureLoader.load(texturePath);
        
        if (texturePath == null) {
            this.leggings.material.opacity = 0.0;
            this.leggingsGlintMaterial.uniforms.hide.value = 1;
	    console.log(this.leggingsGlintMaterial);
        } else {
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.minFilter = THREE.NearestFilter;
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.leggings.material.opacity = 1.0;
            this.leggings.material.map = newTexture;
            this.leggings.material.needsUpdate = true;  // tells Three.js to re-render with new texture
            if (enchanted) {
		console.log("enchanted");
                this.leggingsGlintMaterial.uniforms.hide.value = 0;
		this.leggingsGlintMaterial.uniforms.maskTexture.value = newTexture;
	    } else
                this.leggingsGlintMaterial.uniforms.hide.value = 1;
        }
    }
    updateBoots(texturePath, enchanted) {
        const textureLoader = new THREE.TextureLoader();
        let newTexture = textureLoader.load(texturePath);
        
        if (texturePath == null) {
            this.boots.material.opacity = 0.0;
            this.bootsGlintMaterial.uniforms.hide.value = 1;
        } else {
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.minFilter = THREE.NearestFilter;
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.boots.material.opacity = 1.0;
            this.boots.material.map = newTexture;
            this.boots.material.needsUpdate = true;  // tells Three.js to re-render with new texture
            if (enchanted) {
                this.bootsGlintMaterial.uniforms.hide.value = 0;
		this.bootsGlintMaterial.uniforms.maskTexture.value = newTexture;
	    } else
                this.bootsGlintMaterial.uniforms.hide.value = 1;
        }
    }
    updateLeftHand(item) {

        let texturePath = null;
        if (item != null && typeof item != "undefined") {
            texturePath = item.href;
            if (item.itemType == ItemType.WEAPON) {
                this.leftHandItemBone.position.x = 0;
                this.leftHandItemBone.position.y = 0.34;
                this.leftHandItemBone.position.z = -0.2;
                this.leftHandItemBone.scale.x = 1.5;
                this.leftHandItemBone.scale.y = 1.5;
                this.leftHandItemBone.scale.z = 1.5;
                this.leftHandItemBone.rotation.y = 3.141592 / 2;
                this.leftHandItemBone.rotation.x = 3.141592 / -5;
            } else {
                this.leftHandItemBone.position.x = -0.06;
                this.leftHandItemBone.position.y = 0.9;
                this.leftHandItemBone.position.z = -0.0;
                this.leftHandItemBone.scale.x = -0.9; // Negative so texture is mirrored
                this.leftHandItemBone.scale.y = 0.9;
                this.leftHandItemBone.scale.z = 0.9;
                this.leftHandItemBone.rotation.x = 3.141592 / -2;
                this.leftHandItemBone.rotation.y = 0;
                this.leftHandItemBone.rotation.z = 0;
            }
        }
		

        const textureLoader = new THREE.TextureLoader();
        let newTexture = textureLoader.load(texturePath);
        
        if (texturePath == null) {
            this.left_arm.rotation.x = 3.141592;
            this.leftHandItemModel.material.opacity = 0.0;
            // this.leftHandItemModelGlintMaterial.uniforms.hide.value = 1;
        } else {
            this.left_arm.rotation.x = 2.8;
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.minFilter = THREE.NearestFilter;
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.leftHandItemModel.material.opacity = 1.0;
            this.leftHandItemModel.material.map = newTexture;
            this.leftHandItemModel.material.alphaTest = 0.1;
            this.leftHandItemModel.material.needsUpdate = true;  // tells Three.js to re-render with new texture
            // if (enchanted) {
		//               this.leftHandItemModelGlintMaterial.uniforms.hide.value = 0;
		// this.leftHandItemModelGlintMaterial.uniforms.maskTexture.value = newTexture;
	    // } else
                // this.leftHandItemModelGlintMaterial.uniforms.hide.value = 1;
        }
    }
    updateRightHand(item) {

        let texturePath = null;
        if (item != null && typeof item != "undefined") {
            texturePath = item.href;
            if (item.itemType == ItemType.WEAPON) {
                this.rightHandItemBone.position.x = 0;
                this.rightHandItemBone.position.y = 0.34;
                this.rightHandItemBone.position.z = -0.2;
                this.rightHandItemBone.scale.x = 1.5;
                this.rightHandItemBone.scale.y = 1.5;
                this.rightHandItemBone.scale.z = 1.5;
                this.rightHandItemBone.rotation.y = 3.141592 / 2;
                this.rightHandItemBone.rotation.x = 3.141592 / -5;
            } else {
                console.log("Holding Non-Weapon");
                this.rightHandItemBone.position.x = 0.06;
                this.rightHandItemBone.position.y = 0.9;
                this.rightHandItemBone.position.z = -0.0;
                this.rightHandItemBone.scale.x = -1.0; // Negative so texture is mirrored
                this.rightHandItemBone.scale.y = 1.0;
                this.rightHandItemBone.scale.z = 1.0;
                this.rightHandItemBone.rotation.x = 3.141592 / -2;
                this.rightHandItemBone.rotation.y = 0;
                this.rightHandItemBone.rotation.z = 0;
            }
        }

        const textureLoader = new THREE.TextureLoader();
        let newTexture = textureLoader.load(texturePath);
        
        if (texturePath == null) {
            this.right_arm.rotation.x = 3.141592;
            this.rightHandItemModel.material.opacity = 0.0;
            // this.rightHandItemModelGlintMaterial.uniforms.hide.value = 1;
        } else {
            this.right_arm.rotation.x = 2.8;
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.minFilter = THREE.NearestFilter;
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.rightHandItemModel.material.opacity = 1.0;
            this.rightHandItemModel.material.map = newTexture;
            this.rightHandItemModel.material.alphaTest = 0.1;
            this.rightHandItemModel.material.needsUpdate = true;  // tells Three.js to re-render with new texture
            // if (enchanted) {
		//               this.rightHandItemModelGlintMaterial.uniforms.hide.value = 0;
		// this.rightHandItemModelGlintMaterial.uniforms.maskTexture.value = newTexture;
	    // } else
                // this.rightHandItemModelGlintMaterial.uniforms.hide.value = 1;
        }
    }
}

