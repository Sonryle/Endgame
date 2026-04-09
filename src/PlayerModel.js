import { state } from "./state.js"
import { texturePack } from "./TexturePack.js"
import { MinecraftItem, ItemInstance, ItemType } from "./Item.js"

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';

export const PlayerType = Object.freeze({
    SLIM: "Slim",
    WIDE: "Wide"
});

const itemModelPositions = Object.freeze({
    DEFAULT: {
        scale: new THREE.Vector3(0.8, 0.8, 0.8),
        position: new THREE.Vector3(0.0, 0.1, 0.0),
        rotation: new THREE.Euler(0.0, 0.0, 0.0),
    },
    WEAPON: {
        scale: new THREE.Vector3(1.35, 1.35, 1.35),
        position: new THREE.Vector3(0.0, 0.25, 0.5),
        rotation: new THREE.Euler(-Math.PI / 3, -Math.PI/2, 0.0),
    },
});

export class PlayerModel {
    constructor(parentSvg, canvasPosX, canvasPosY, canvasScaleX, canvasScaleY, scale, animationCallback) {

        // Create foreign html element to store rendered element
        const foreignObject = parentSvg.append('foreignObject')
            .attr('class', 'playerModelContainer')
            .attr('pointer-events', 'none')
            .attr('width', canvasScaleX)
            .attr('height', canvasScaleY)
            .attr('x', canvasPosX)
            .attr('y', canvasPosY)

        // Set variables
        this.canvasPosX = canvasPosX;
        this.canvasPosY = canvasPosY;
        this.canvasScaleX = canvasScaleX;
        this.canvasScaleY = canvasScaleY;
        this.parentSvg = parentSvg;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer( {antialias: false});
        foreignObject.node().appendChild(this.renderer.domElement);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor( 0xFF0000, 0);
        this.renderer.setSize(canvasScaleX, canvasScaleY);
        this.renderer.sortObjects = false;

        // Create camera
        this.camera = new THREE.OrthographicCamera(canvasScaleX / -scale, canvasScaleX / scale, canvasScaleY / scale, canvasScaleY / -scale, -3, 3);
        this.camera.position.z = 2.0;

        // Setup Callback
        this.animationCallback = animationCallback;

        // Initiate Three JS scene
        this.ready = this.initScene();
        
    }

    async initScene() {
        // Create scene
        this.scene = new THREE.Scene();

        // Create & Load player model and Item Models
        await this.loadPlayerModel("src/assets/models/Player/Technoblade.png", PlayerType.WIDE);
        this.leftItemModel = await this.loadItemModel();
        this.rightItemModel = await this.loadItemModel();
        this.playerModel.boneItemLeft.add(this.leftItemModel.boneItem);
        this.playerModel.boneItemRight.add(this.rightItemModel.boneItem);

        // Animation Mixer
        let mixer = new THREE.AnimationMixer(this.playerModel.GLTF.scene)
        const clips = this.playerModel.GLTF.animations;
        const clip = THREE.AnimationClip.findByName(clips, "Idle");
        const action = mixer.clipAction(clip);
        action.play();

        // Add lights to the scene
        const topLight = new THREE.DirectionalLight(0xffffff, 7);
        topLight.position.set(-500, 500, 0) // Top Right
        this.scene.add(topLight);
        const ambientLight = new THREE.AmbientLight(0x333333, 40);
        this.scene.add(ambientLight);

        // Start the render loop
        const timer = new THREE.Timer();
        const animate = () => {
            mixer.update(timer.update().getDelta());
            this.animationCallback(this);
            this.updateEnchantmentGlintOffsets(timer.getElapsed());
            this.renderer.render(this.scene, this.camera);
        };
        this.renderer.setAnimationLoop(animate);
    }

    async loadPlayerModel(skinTexturePath, playerType) {

        // Create Variable Structure for playerModel
        const playerModel = {
            GLTF: null,
            boneHead: null,
            boneArmLeft: null,
            boneArmRight: null,
            boneItemLeft: null,
            boneItemRight: null,
            meshInnerLayer: null,
            meshOuterLayer: null,
            skinTexturePath: null,
            armor: {
                meshHelmet: null,
                meshHelmetGlint: null,
                shaderHelmetGlint: null,
                meshChestplate: null,
                meshChestplateGlint: null,
                shaderChestplateGlint: null,
                meshLeggings: null,
                meshLeggingsGlint: null,
                shaderLeggingsGlint: null,
                meshBoots: null,
                meshBootsGlint: null,
                shaderBootsGlint: null,
            },
        };
        this.playerModel = playerModel;

        // Load PlayerModel
        const loader = new GLTFLoader();
        if (playerType == PlayerType.SLIM) {
            this.playerModel.GLTF = await loader.loadAsync( './src/assets/models/Player/PlayerSlim.gltf' );
        } else if (playerType == PlayerType.WIDE) {
            this.playerModel.GLTF = await loader.loadAsync( './src/assets/models/Player/PlayerWide.gltf' );
        } else {
            console.log("PlayerType not passed to loadPlayerModel(). Using WIDE player model");
            this.playerModel.GLTF = await loader.loadAsync( './src/assets/models/PlayerWide/PlayerWide.gltf' );
        }
        this.scene.add( this.playerModel.GLTF.scene );

        // Add PlayerModel Mesh & Bones to class variables
        this.playerModel.GLTF.scene.traverse((child) => {
            switch (child.name) {
                case "MeshInnerLayer":
                    this.playerModel.meshInnerLayer = child;
                    break;
                case "MeshOuterLayer":
                    this.playerModel.meshOuterLayer = child;
                    break;
                case "BoneHead":
                    this.playerModel.boneHead = child;
                    break;
                case "BoneArmLeft":
                    this.playerModel.boneArmLeft = child;
                    break;
                case "BoneArmRight":
                    this.playerModel.boneArmRight = child;
                    break;
                case "BoneItemLeft":
                    this.playerModel.boneItemLeft = child;
                    break;
                case "BoneItemRight":
                    this.playerModel.boneItemRight = child;
                    break;
                case "MeshHelmet":
                    this.playerModel.armor.meshHelmet = child;
                    break;
                case "MeshHelmetGlint":
                    this.playerModel.armor.meshHelmetGlint = child;
                    break;
                case "MeshChestplate":
                    this.playerModel.armor.meshChestplate = child;
                    break;
                case "MeshChestplateGlint":
                    this.playerModel.armor.meshChestplateGlint = child;
                    break;
                case "MeshLeggings":
                    this.playerModel.armor.meshLeggings = child;
                    break;
                case "MeshLeggingsGlint":
                    this.playerModel.armor.meshLeggingsGlint = child;
                    break;
                case "MeshBoots":
                    this.playerModel.armor.meshBoots = child;
                    break;
                case "MeshBootsGlint":
                    this.playerModel.armor.meshBootsGlint = child;
                    break;
            }
        });

        // Create enchantment Shaders for Player Model Meshes
        let armourGlintTexturePath = await texturePack.getPath("misc/enchanted_glint_armor.png");
        this.playerModel.armor.shaderHelmetGlint = await this.createEnchantGlintMaterial(armourGlintTexturePath, false, 4);
        this.playerModel.armor.shaderChestplateGlint = await this.createEnchantGlintMaterial(armourGlintTexturePath, false, 4);
        this.playerModel.armor.shaderLeggingsGlint = await this.createEnchantGlintMaterial(armourGlintTexturePath, false, 4);
        this.playerModel.armor.shaderBootsGlint = await this.createEnchantGlintMaterial(armourGlintTexturePath, false, 4);

        // Edit Mesh Attributes
        this.playerModel.meshOuterLayer.material.depthWrite           = false;
        this.playerModel.meshOuterLayer.material.magFilter            = THREE.NearestFilter;  // keeps pixel art crisp
        this.playerModel.meshOuterLayer.material.minFilter            = THREE.NearestFilter;  // keeps pixel art crisp

        this.playerModel.meshInnerLayer.material.depthWrite           = true;
        this.playerModel.meshInnerLayer.material.magFilter            = THREE.NearestFilter;  // keeps pixel art crisp
        this.playerModel.meshInnerLayer.material.minFilter            = THREE.NearestFilter;  // keeps pixel art crisp

        this.playerModel.armor.meshHelmet.material.depthWrite         = true;
        this.playerModel.armor.meshHelmet.material.opacity            = 0.0;
        this.playerModel.armor.meshHelmet.material.alphaTest          = 0.5;
        this.playerModel.armor.meshHelmetGlint.material               = this.playerModel.armor.shaderHelmetGlint;

        this.playerModel.armor.meshChestplate.material.depthWrite     = true;
        this.playerModel.armor.meshChestplate.material.opacity        = 0.0;
        this.playerModel.armor.meshChestplate.material.alphaTest      = 0.5;
        this.playerModel.armor.meshChestplateGlint.material           = this.playerModel.armor.shaderChestplateGlint;

        this.playerModel.armor.meshLeggings.material.depthWrite       = true;
        this.playerModel.armor.meshLeggings.material.opacity          = 0.0;
        this.playerModel.armor.meshLeggings.material.alphaTest        = 0.5;
        this.playerModel.armor.meshLeggingsGlint.material             = this.playerModel.armor.shaderLeggingsGlint;

        this.playerModel.armor.meshBoots.material.depthWrite          = true;
        this.playerModel.armor.meshBoots.material.opacity             = 0.0;
        this.playerModel.armor.meshBoots.material.alphaTest           = 0.5;
        this.playerModel.armor.meshBootsGlint.material                = this.playerModel.armor.shaderBootsGlint;

    }

    async loadItemModel() {

        // Create Variable Structure for playerModel
        const itemModel = {
            GLTF: null,
            boneItem: null,
            meshItem: null,
            meshItemGlint: null,
            shaderItemGlint: null,
            minecraftItem: null,
        };

        // Load ItemModel
        const loader = new GLTFLoader();
        itemModel.GLTF = await loader.loadAsync( './src/assets/models/ItemModel/Item.gltf' );
        this.scene.add( itemModel.GLTF.scene );

        // Add PlayerModel Mesh & Bones to class variables
        itemModel.GLTF.scene.traverse((child) => {
            switch (child.name) {
                case "BoneItem":
                    itemModel.boneItem = child;
                    break;
                case "MeshItem":
                    itemModel.meshItem = child;
                    break;
                case "MeshItemGlint":
                    itemModel.meshItemGlint = child;
                    break;
            }
        });

        // Create enchantment Shaders for Item Model Glint Mesh
        let itemGlintTexturePath = await texturePack.getPath("misc/enchanted_glint_item.png");
        itemModel.shaderItemGlint = await this.createEnchantGlintMaterial(itemGlintTexturePath, false, 5);

        // Edit Mesh Attributes
        itemModel.meshItem.material.depthWrite   = true;
        itemModel.meshItem.material.transparent  = false;
        itemModel.meshItem.material.opacity      = 1.0;
        itemModel.meshItem.material.alphaTest    = 1.0;
        itemModel.meshItemGlint.material         = itemModel.shaderItemGlint;

        return itemModel;
    }

    async createEnchantGlintMaterial(glintTexturePath, depthWrite, zoom) {

        const glintTexture = new THREE.TextureLoader().load(glintTexturePath);
        glintTexture.flipY = false;  // important for GLTF models
        glintTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
        glintTexture.minFilter = THREE.NearestFilter;
        glintTexture.wrapS = THREE.RepeatWrapping;
        glintTexture.wrapT = THREE.RepeatWrapping;

        return new THREE.ShaderMaterial({
            uniforms: {
              glintTexture:  { value: glintTexture },
              maskTexture:   { value: null },
              hide:          { value: false },
              glintOffset:   { value: new THREE.Vector2(0, 0) },
              zoom:          { value: zoom },
            },
            blending: THREE.AdditiveBlending,
            premultipliedAlpha: true,
            side: THREE.DoubleSide,
            depthWrite: depthWrite,
            transparent: true,
            fragmentShader: `
              uniform sampler2D glintTexture;
              uniform sampler2D maskTexture;
	      uniform vec2 glintOffset;
              uniform float zoom;
              uniform bool hide;
              varying vec2 vUv;

              vec4 blendScreen (vec4 base, vec4 top) {
                  vec4 result = vec4(0, 0, 0, 0);
                  result.r = 1.0 - ((1.0 - base.r) * (1.0 - top.r));
                  result.g = 1.0 - ((1.0 - base.g) * (1.0 - top.g));
                  result.b = 1.0 - ((1.0 - base.b) * (1.0 - top.b));
                  result.w = 1.0 - ((1.0 - base.w) * (1.0 - top.w));
                  return result;
              }

	      vec4 blurKernel(sampler2D textureUnit, vec2 texCoord, float sampleDistance) {
	
                  float kernel[9];
		  // Top row
                  kernel[0] = 1.0f;
                  kernel[1] = 2.0f;
                  kernel[2] = 1.0f;
                   
                  // Middle row
                  kernel[3] = 2.0f;
                  kernel[4] = 4.0f;
                  kernel[5] = 2.0f;
                   
                  // Bottom row
                  kernel[6] = 1.0f;
                  kernel[7] = 2.0f;
                  kernel[8] = 1.0f;

		  float s = 1.0f / sampleDistance;
	          vec2 offsets[9];
                  // Top row
                  offsets[0] = vec2(-s, -s);
                  offsets[1] = vec2(0, -s);
                  offsets[2] = vec2(s, -s);
                   
                  // Middle row
                  offsets[3] = vec2(-s, 0);
                  offsets[4] = vec2(0, 0);
                  offsets[5] = vec2(s, 0);
                   
                  // Bottom row
                  offsets[6] = vec2(-s, s);
                  offsets[7] = vec2(0, s);
                  offsets[8] = vec2(s, s);

                  for(int i=0; i<9; ++i) {
                      kernel[i] /= 16.0f;
                  }

                  vec3 result = vec3(0.0f);
                  for(int i=0; i<9; ++i)
                  {
                      result += texture(textureUnit, texCoord + offsets[i]).rgb * kernel[i];
                  }
	          return vec4(result.rgb, texture(textureUnit, texCoord).a);
              }

              void main() {

	        vec4 mask = texture(maskTexture, vUv);
                if (hide == true || mask.w < 0.5)
                    discard;

                vec4 glint = blurKernel(glintTexture, (vUv / vec2(zoom, zoom)) + glintOffset, 300.0f);
                gl_FragColor = vec4(glint.rgba);

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

    updateEnchantmentGlintOffsets(time) {
        this.playerModel.armor.shaderHelmetGlint.uniforms.glintOffset.value.x = time / -20;
        this.playerModel.armor.shaderHelmetGlint.uniforms.glintOffset.value.y = time / 4;
        this.playerModel.armor.shaderChestplateGlint.uniforms.glintOffset.value.x = time / -20;
        this.playerModel.armor.shaderChestplateGlint.uniforms.glintOffset.value.y = time / 4;
        this.playerModel.armor.shaderLeggingsGlint.uniforms.glintOffset.value.x = time / -20;
        this.playerModel.armor.shaderLeggingsGlint.uniforms.glintOffset.value.y = time / 4;
        this.playerModel.armor.shaderBootsGlint.uniforms.glintOffset.value.x = time / -20;
        this.playerModel.armor.shaderBootsGlint.uniforms.glintOffset.value.y = time / 4;
        this.rightItemModel.shaderItemGlint.uniforms.glintOffset.value.x = time / -8;
        this.rightItemModel.shaderItemGlint.uniforms.glintOffset.value.y = time / 4;
        this.leftItemModel.shaderItemGlint.uniforms.glintOffset.value.x = time / -8;
        this.leftItemModel.shaderItemGlint.uniforms.glintOffset.value.y = time / 4;
    }

    updateHelmet(texturePath, enchanted) {
        
        if (texturePath == null && typeof texturePath == "undefined") {
            this.helmet.material.opacity = 0.0;
        } else {
            const textureLoader = new THREE.TextureLoader();
            let newTexture = textureLoader.load(texturePath);
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.minFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.playerModel.armor.meshHelmet.material.map = newTexture;
            this.playerModel.armor.meshHelmet.material.opacity = 1.0;
            this.playerModel.armor.meshHelmetGlint.material.uniforms.maskTexture.value = newTexture;
            if (enchanted == true)
                this.playerModel.armor.meshHelmetGlint.material.uniforms.hide.value = false;
            else
                this.playerModel.armor.meshHelmetGlint.material.uniforms.hide.value = true;
        }
    }
    updateChestplate(texturePath, enchanted) {
        
        if (texturePath == null && typeof texturePath == "undefined") {
            this.helmet.material.opacity = 0.0;
        } else {
            const textureLoader = new THREE.TextureLoader();
            let newTexture = textureLoader.load(texturePath);
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.minFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.playerModel.armor.meshChestplate.material.map = newTexture;
            this.playerModel.armor.meshChestplate.material.opacity = 1.0;
            this.playerModel.armor.meshChestplateGlint.material.uniforms.maskTexture.value = newTexture;
            if (enchanted == true)
                this.playerModel.armor.meshChestplateGlint.material.uniforms.hide.value = false;
            else
                this.playerModel.armor.meshChestplateGlint.material.uniforms.hide.value = true;
        }
    }
    updateLeggings(texturePath, enchanted) {
        
        if (texturePath == null && typeof texturePath == "undefined") {
            this.helmet.material.opacity = 0.0;
        } else {
            const textureLoader = new THREE.TextureLoader();
            let newTexture = textureLoader.load(texturePath);
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.minFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.playerModel.armor.meshLeggings.material.map = newTexture;
            this.playerModel.armor.meshLeggings.material.opacity = 1.0;
            this.playerModel.armor.meshLeggingsGlint.material.uniforms.maskTexture.value = newTexture;
            if (enchanted == true)
                this.playerModel.armor.meshLeggingsGlint.material.uniforms.hide.value = false;
            else
                this.playerModel.armor.meshLeggingsGlint.material.uniforms.hide.value = true;
        }
    }
    updateBoots(texturePath, enchanted) {
        
        if (texturePath == null && typeof texturePath == "undefined") {
            this.helmet.material.opacity = 0.0;
        } else {
            const textureLoader = new THREE.TextureLoader();
            let newTexture = textureLoader.load(texturePath);
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.minFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.playerModel.armor.meshBoots.material.map = newTexture;
            this.playerModel.armor.meshBoots.material.opacity = 1.0;
            this.playerModel.armor.meshBootsGlint.material.uniforms.maskTexture.value = newTexture;
            if (enchanted == true)
                this.playerModel.armor.meshBootsGlint.material.uniforms.hide.value = false;
            else
                this.playerModel.armor.meshBootsGlint.material.uniforms.hide.value = true;
        }
    }
    updateLeftHand(item) {

        let texturePath = null;
        this.leftItemModel.minecraftItem = null;
        if (item != null && typeof item != "undefined") {
            texturePath = item.href;
            this.leftItemModel.minecraftItem = item.minecraftItem;
            console.log(item.minecraftItem);
        }

        // Update Texture & Enchantment Shader
        if (texturePath == null && typeof texturePath == "undefined") {
            this.leftItemModel.meshItem.material.opacity = 0.0;
        } else {
            const textureLoader = new THREE.TextureLoader();
            let newTexture = textureLoader.load(texturePath);
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.minFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.leftItemModel.meshItem.material.map = newTexture;
            this.leftItemModel.meshItem.material.opacity = 1.0;
            this.leftItemModel.meshItemGlint.material.uniforms.maskTexture.value = newTexture;
            if (item != null) {
                if (item.enchantments != null && typeof item.enchantments != "undefined")
                    this.leftItemModel.meshItemGlint.material.uniforms.hide.value = false;
                else
                    this.leftItemModel.meshItemGlint.material.uniforms.hide.value = true;
            }
        }

        // Change Item Position based on item type
        if (item != null && typeof item != "undefined") {
            let modelPosition;
            switch (item.itemType) {
                case ItemType.WEAPON:
                    modelPosition = itemModelPositions.WEAPON;
                    break;
                default:
                    modelPosition = itemModelPositions.DEFAULT;
                    break;
            }
            this.leftItemModel.boneItem.scale.copy(modelPosition.scale);
            this.leftItemModel.boneItem.rotation.copy(modelPosition.rotation);
            this.leftItemModel.boneItem.position.copy(modelPosition.position);
        }
    }
    updateRightHand(item) {
        
        let texturePath = null;
        this.rightItemModel.minecraftItem = null;
        if (item != null && typeof item != "undefined") {
            texturePath = item.href;
            this.rightItemModel.minecraftItem = item.minecraftItem;
            console.log(item.minecraftItem);
        }

        // Update Texture & Enchantment Shader
        if (texturePath == null && typeof texturePath == "undefined") {
            this.rightItemModel.meshItem.material.opacity = 0.0;
        } else {
            const textureLoader = new THREE.TextureLoader();
            let newTexture = textureLoader.load(texturePath);
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.minFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.colorSpace = THREE.SRGBColorSpace;
            this.rightItemModel.meshItem.material.map = newTexture;
            this.rightItemModel.meshItem.material.opacity = 1.0;
            this.rightItemModel.meshItemGlint.material.uniforms.maskTexture.value = newTexture;
            if (item != null) {
                if (item.enchantments != null && typeof item.enchantments != "undefined")
                    this.rightItemModel.meshItemGlint.material.uniforms.hide.value = false;
                else
                    this.rightItemModel.meshItemGlint.material.uniforms.hide.value = true;
            }
        }

        // Change Item Position based on item type
        if (item != null && typeof item != "undefined") {
            let modelPosition;
            switch (item.itemType) {
                case ItemType.WEAPON:
                    modelPosition = itemModelPositions.WEAPON;
                    break;
                default:
                    modelPosition = itemModelPositions.DEFAULT;
                    break;
            }
            this.rightItemModel.boneItem.scale.copy(modelPosition.scale);
            this.rightItemModel.boneItem.rotation.copy(modelPosition.rotation);
            this.rightItemModel.boneItem.position.copy(modelPosition.position);
        }
    }

    changeSkin(texturePath, playerType) {
        this.loadPlayerModel(texturePath, playerType);
    }
}

