import { state } from "./state.js"
import { texturePack } from "./TexturePack.js"

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
        
        const camera = new THREE.OrthographicCamera(canvasX / -scale, canvasX / scale, canvasY / scale, canvasY / -scale, 1, 3);
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
            if (this.playerModel != null) {
                const ax = 0.8; // Bell function height at x = 0
                const ay = 1.0;
                const x = Math.max(Math.min((state.mouseX - canvasXPos - this.svg.attr('x') - canvasX / 2) / 500, ax), -ax);
                const y = Math.max(Math.min((state.mouseY - canvasYPos - this.svg.attr('y') - canvasY / 4) / 500, ay), -ay);
                const bellX = 1 / (1 + ((x / ax)*(x / ax)));
                const bellY = 1 / (1 + ((y / ay)*(y / ay)));
                this.playerModel.rotation.y = x * bellX;
                this.playerModel.rotation.x = y * bellY;
                this.head.rotation.y = x * bellX;
                this.head.rotation.x = y * bellY;
                // this.rightHandItemModel.position
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
            if (child.name == "LeftHandItem") {
                child.material.depthWrite = true;
                child.material.alphaTest = 1.0;
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
        });
        this.right_arm.add(this.rightHandItemModel);

        const leftHandItemGLTF = await loader.loadAsync( './src/assets/models/ItemModel/Untitled.gltf' );
        this.scene.add( leftHandItemGLTF.scene );
        leftHandItemGLTF.scene.traverse((child) => {
            if (child.name == "ItemModel") {
                child.material.depthWrite = true;
                child.material.opacity = 0.0;
                this.leftHandItemModel = child;
            }
        });
        this.left_arm.add(this.leftHandItemModel);
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

    updateHelmet(texturePath, enchanted) {
        const textureLoader = new THREE.TextureLoader();
        let newTexture = textureLoader.load(texturePath);
        
        if (texturePath == null) {
            this.helmet.material.opacity = 0.0;
            this.helmetGlintMaterial.uniforms.hide.value = 1;
        } else {
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
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
        } else {
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.leggings.material.opacity = 1.0;
            this.leggings.material.map = newTexture;
            this.leggings.material.needsUpdate = true;  // tells Three.js to re-render with new texture
            if (enchanted) {
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
    updateLeftHand(texturePath, enchanted) {

        this.leftHandItemModel.position.y = 0.85;
        this.leftHandItemModel.position.x = -0.55;

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
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.leftHandItemModel.material.opacity = 1.0;
            this.leftHandItemModel.material.map = newTexture;
            this.leftHandItemModel.material.needsUpdate = true;  // tells Three.js to re-render with new texture
            // if (enchanted) {
		//               this.leftHandItemModelGlintMaterial.uniforms.hide.value = 0;
		// this.leftHandItemModelGlintMaterial.uniforms.maskTexture.value = newTexture;
	    // } else
                // this.leftHandItemModelGlintMaterial.uniforms.hide.value = 1;
        }
    }
    updateRightHand(texturePath, enchanted) {

        this.rightHandItemModel.position.y = 0.85;
        this.rightHandItemModel.position.x = -0.45;

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
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.rightHandItemModel.material.opacity = 1.0;
            this.rightHandItemModel.material.map = newTexture;
            this.rightHandItemModel.material.needsUpdate = true;  // tells Three.js to re-render with new texture
            // if (enchanted) {
		//               this.rightHandItemModelGlintMaterial.uniforms.hide.value = 0;
		// this.rightHandItemModelGlintMaterial.uniforms.maskTexture.value = newTexture;
	    // } else
                // this.rightHandItemModelGlintMaterial.uniforms.hide.value = 1;
        }
    }
}

