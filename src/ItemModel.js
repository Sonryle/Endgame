import { MinecraftItem, ItemInstance, ItemType } from "./Item.js"

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ItemModel {
    constructor(scene) {

        // Create Variable Structure for playerModel
        this.itemModel = {
            GLTF: null,
            boneItem: null,
            meshItem: null,
            meshItemGlint: null,
        }
        this.scene = scene;
        this.ready = this.loadItemModels();
    }
    async loadItemModels() {

        // Load Item Model & add to scene
        const loader = new GLTFLoader();
        this.itemModel.GLTF = await loader.loadAsync( './src/assets/models/ItemModel/Item.gltf' );
        this.scene.add( this.itemModel.GLTF.scene );

        // Add ItemModel Mesh & Bones to class variables
        this.itemModel.GLTF.scene.traverse((child) => {
            switch(child.name) {
                case "MeshItem":
                    child.material.side = THREE.DoubleSide,
                    child.material.depthWrite = true;
                    // child.material.opacity = 0.0;
                    this.itemModel.meshItem = child;
                    break;
                case "MeshItemGlint":
                    child.material.depthWrite = true;
                    // child.material.opacity = 0.0;
                    this.itemModel.meshItemGlint = child;
                    break;
                case "BoneItem":
                    this.itemModel.boneItem = child;
                    break;
            }
        });
    }

    updateModel(item) {

        console.log(item);
        console.log(item.href);
        let texturePath = null;
        let newTexture = null;
        if (item != null && typeof item != "undefined") {
            texturePath = item.href;

            // load texture using texturePath
            const textureLoader = new THREE.TextureLoader();
            newTexture = textureLoader.load(texturePath);
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.minFilter = THREE.NearestFilter;
            newTexture.flipY = false;  // important for GLTF models
            newTexture.magFilter = THREE.NearestFilter;  // keeps pixel art crisp
            newTexture.colorSpace = THREE.SRGBColorSpace;
        }

        if (texturePath == null) {
            this.itemModel.meshItem.material.opacity = 0.0;
        } else {
            this.itemModel.meshItem.material.opacity = 1.0;
            this.itemModel.meshItem.material.map = newTexture;
            this.itemModel.meshItem.material.alphaTest = 1.0;
            this.itemModel.meshItem.material.needsUpdate = true;  // tells Three.js to re-render with new texture
        }

        this.updatePosition(item.itemType);
    }

    updatePosition(itemType) {
        if (itemType == ItemType.WEAPON) {
            // this.itemModel.boneItem.position.x = 0.1;
            this.itemModel.boneItem.position.y = 0.58;
            this.itemModel.boneItem.position.z = 0.35;
            this.itemModel.boneItem.scale.x = 1.5; // Negative so texture is mirrored
            this.itemModel.boneItem.scale.y = 1.5;
            this.itemModel.boneItem.scale.z = 1.5;
            this.itemModel.boneItem.rotation.z = 3.141592 / 2;
            this.itemModel.boneItem.rotation.x = 3.141592 / -8;
	    console.log("Holding Weapon");
        } else {
            console.log("Holding Non-Weapon");
            // this.itemModel.boneItem.position.x = 0.5;
            this.itemModel.boneItem.position.y = 0.85;
            this.itemModel.boneItem.position.z = 0;
            this.itemModel.boneItem.scale.x = -0.9; // Negative so texture is mirrored
            this.itemModel.boneItem.scale.y = 0.9;
            this.itemModel.boneItem.scale.z = 0.9;
            this.itemModel.boneItem.rotation.z = 0;
            this.itemModel.boneItem.rotation.x = 0;
        }
    }
}
