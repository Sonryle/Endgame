import { state } from "./state.js"
import { texturePack } from "./TexturePack.js"
import { ItemType } from "./Item.js"

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SceneUtils from 'three/addons/utils/SceneUtils.js';

export const PlayerType = Object.freeze({
    SLIM: "Slim",
    WIDE: "Wide"
});

export class PlayerModel {
    constructor(parentSvg, canvasPosX, canvasPosY, canvasScaleX, canvasScaleY, scale) {

        // Create foreign html element to store rendered element
        const foreignObject = parentSvg.append('foreignObject')
            .attr('class', 'playerModelContainer')
            .attr('pointer-events', 'none')
            .attr('width', canvasScaleX)
            .attr('height', canvasScaleY)
            .attr('x', canvasPosX)
            .attr('y', canvasPosY)

        // Create renderer
        const renderer = new THREE.WebGLRenderer( {antialias: false});
        foreignObject.node().appendChild(renderer.domElement);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor( 0xFF0000, 0);
        renderer.setSize(canvasScaleX, canvasScaleY);
        renderer.sortObjects = false;
        
        // Create camera
        const camera = new THREE.OrthographicCamera(canvasScaleX / -scale, canvasScaleX / scale, canvasScaleY / scale, canvasScaleY / -scale, -3, 3);
        camera.position.z = 2.0;
        
        // Create scene
        this.scene = new THREE.Scene();

        // Create & Load player model
        this.ready = this.loadModels();

        // Start the render loop
        const animate = () => {
            requestAnimationFrame(animate);
            if (this.right_arm != null && this.left_arm != null) {
                const d = new Date();
                let time = d.getSeconds() * 1000 + d.getMilliseconds();
            };
            renderer.render(this.scene, camera);
        };
        animate();

        // Add lights to the scene
        const topLight = new THREE.DirectionalLight(0xffffff, 7);
        topLight.position.set(-500, 500, 0) // Top Right
        this.scene.add(topLight);
    }

    async loadModels() {
        await this.loadItemModels();
        await this.loadArmourModels();
        await this.loadPlayerModel("src/assets/models/PlayerWide/Technoblade.png", PlayerType.WIDE);
    }

    async loadItemModels() {
        // Load Item Models for player hands
        const loader = new GLTFLoader();
        this.rightHandGlintMaterial = await this.createEnchantGlintMaterial(await texturePack.getPath("misc/enchanted_glint_item.png"), true, 10, 2);
        this.rightHandItemGLTF = await loader.loadAsync( './src/assets/models/ItemModel/Untitled.gltf' );
        this.scene.add( this.rightHandItemGLTF.scene );
        this.rightHandItemGLTF.scene.traverse((child) => {
            if (child.name == "ItemModel") {
                child.material.side = THREE.DoubleSide,
                child.material.depthWrite = true;
                child.material.opacity = 0.0;
                this.rightHandItemModel = child;
            }
            if (child.name == "ItemGlint") {
                child.material = this.rightHandGlintMaterial;
                child.material.depthWrite = true;
                child.material.opacity = 0.0;
                this.rightHandItemGlintModel = child;
            }
            if (child.name == "ItemBone") {
                this.rightHandItemBone = child;
            }
        });

        this.leftHandGlintMaterial = await this.createEnchantGlintMaterial(await texturePack.getPath("misc/enchanted_glint_item.png"), true, 10, 2);
        this.leftHandItemGLTF = await loader.loadAsync( './src/assets/models/ItemModel/Untitled.gltf' );
        this.scene.add( this.leftHandItemGLTF.scene );
        this.leftHandItemGLTF.scene.traverse((child) => {
            if (child.name == "ItemModel") {
                child.material.side = THREE.DoubleSide,
                child.material.depthWrite = true;
                child.material.opacity = 0.0;
                this.leftHandItemModel = child;
            }
            if (child.name == "ItemGlint") {
                child.material = this.leftHandGlintMaterial;
                child.material.depthWrite = true;
                child.material.opacity = 0.0;
		child.material.transparent = true;
                this.leftHandItemGlintModel = child;
            }
            if (child.name == "ItemBone") {
                this.leftHandItemBone = child;
            }
        });
    }

    async loadArmourModels() {
        console.log("loading armour models");
    }

    async loadPlayerModel(skinTexturePath, playerType) {

        const playerModel = {
            gLTF: null,
            boneHead: null,
            boneArmLeft: null,
            boneArmRight: null,
            meshInnerLayer: null,
            meshOuterLayer: null,
            skinTexturePath: null,
        }
        this.playerModel = playerModel;

        const loader = new GLTFLoader();
        if (playerType == PlayerType.SLIM) {
            this.playerModel.GLTF = await loader.loadAsync( './src/assets/models/PlayerSlim/Untitled.gltf' );
        } else if (playerType == PlayerType.WIDE) {
            this.playerModel.GLTF = await loader.loadAsync( './src/assets/models/PlayerWide/PlayerWide.gltf' );
        } else {
            console.log("PlayerType not passed to loadPlayerModel(). Using WIDE player model");
            this.playerModel.GLTF = await loader.loadAsync( './src/assets/models/PlayerWide/PlayerWide.gltf' );
        }
        this.scene.add( this.playerModel.GLTF.scene );
        this.playerModel.GLTF.scene.traverse((child) => {
            switch (child.name) {
                case "MeshInnerLayer":
                    child.material.depthWrite = true;
                    this.playerModel.meshInnerLayer = child;
                    console.log("mesh inner layer");
                    break;
                case "MeshOuterLayer":
                    child.material.depthWrite = false;
                    this.playerModel.meshOuterLayer = child;
                    console.log("mesh outer layer");
                    break;
                case "BoneHead":
                    this.playerModel.boneHead = child;
                    console.log("bone head");
                    break;
                case "BoneArmLeft":
                    this.playerModel.boneArmLeft = child;
                    console.log("bone arm left");
                    break;
                case "BoneArmRight":
                    this.playerModel.boneArmRight = child;
                    console.log("bone arm right");
                    break;
            }
        });
        
        this.playerModel.boneArmRight.add(this.rightHandItemBone);
        this.playerModel.boneArmLeft.add(this.leftHandItemBone);
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

