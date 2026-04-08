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

        this.ready = this.initScene();
        
    }

    async initScene() {
        // Create scene
        this.scene = new THREE.Scene();

        // Create & Load player model
        await this.loadModels();

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
            this.renderer.render(this.scene, this.camera);
        };
        this.renderer.setAnimationLoop(animate);
    }

    async loadModels() {
        
        await this.loadPlayerModel("src/assets/models/PlayerWide/Technoblade.png", PlayerType.SLIM);

        // Set Armour & Items to be on Player Model
        this.playerModel.boneArmRight.add(this.playerModel.rightItem.boneItem);
        this.playerModel.boneArmLeft.add(this.playerModel.leftItem.boneItem);
    }


    async loadArmourModels() {
        console.log("loading armour models");
    }

    async loadPlayerModel(skinTexturePath, playerType) {

        // Create Variable Structure for playerModel
        const playerModel = {
            GLTF: null,
            boneHead: null,
            boneArmLeft: null,
            boneArmRight: null,
            meshInnerLayer: null,
            meshOuterLayer: null,
            skinTexturePath: null,
            leftItem: {
                boneItem: null,
                meshItem: null,
                meshItemGlint: null,
            },
            rightItem: {
                boneItem: null,
                meshItem: null,
                meshItemGlint: null,
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
                case "MeshItemLeft":
                    this.playerModel.leftItem.meshItem = child;
                    break;
                case "MeshItemGlintLeft":
                    this.playerModel.leftItem.meshItemGlint = child;
                    break;
                case "BoneItemLeft":
                    this.playerModel.leftItem.boneItem = child;
                    break;
                case "MeshItemRight":
                    this.playerModel.rightItem.meshItem = child;
                    break;
                case "MeshItemGlintRight":
                    this.playerModel.rightItem.meshItemGlint = child;
                    break;
                case "BoneItemRight":
                    this.playerModel.rightItem.boneItem = child;
                    break;
            }
        });

        // Edit Mesh Attributes
        this.playerModel.meshInnerLayer.material.depthWrite = true;
        this.playerModel.meshInnerLayer.material.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
        this.playerModel.meshInnerLayer.material.minFilter = THREE.NearestFilter;  // keeps pixel art crisp
        this.playerModel.meshOuterLayer.material.depthWrite = false;
        this.playerModel.meshOuterLayer.material.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
        this.playerModel.meshOuterLayer.material.minFilter = THREE.NearestFilter;  // keeps pixel art crisp

        this.playerModel.leftItem.meshItem.material.depthWrite = true;
        this.playerModel.leftItem.meshItem.material.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
        this.playerModel.leftItem.meshItem.material.minFilter = THREE.NearestFilter;  // keeps pixel art crisp
        this.playerModel.rightItem.meshItem.material.depthWrite = true;
        this.playerModel.rightItem.meshItem.material.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
        this.playerModel.rightItem.meshItem.material.minFilter = THREE.NearestFilter;  // keeps pixel art crisp
    }

    // Changes Position of Item Model based on itemtype
    setItemModelPos(itemModel, itemType) {
        switch (itemType) {
            case ItemType.WEAPON:
                this.leftHandItemModel.position.x = 0;
                this.leftHandItemModel.position.y = 0.58;
                this.leftHandItemModel.position.z = 0.35;
                this.leftHandItemModel.scale.x = 1.5; // Negative so texture is mirrored
                this.leftHandItemModel.scale.y = 1.5;
                this.leftHandItemModel.scale.z = 1.5;
                this.leftHandItemModel.rotation.z = 3.141592 / 2;
                this.leftHandItemModel.rotation.x = 3.141592 / -8;
        }
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

    updateHelmet(texturePath, enchanted) {
    }
    updateChestplate(texturePath, enchanted) {
    }
    updateLeggings(texturePath, enchanted) {
    }
    updateBoots(texturePath, enchanted) {
    }
    updateLeftHand(item) {
    }
    updateRightHand(item) {
    }

    changeSkin(texturePath, playerType) {
        this.loadPlayerModel(texturePath, playerType);
    }
}

