import { state } from "./state.js"
import { grid } from "./grid.js"
import { texturePack } from "./TexturePack.js"
import { ItemType, MinecraftItem } from "./Item.js"
import { ItemSlot, ArmourItemSlot, CallbackItemSlot } from "./ItemSlot.js"
import { PlayerModel, PlayerType } from "./PlayerModel"
import { getSkinPath, defaultSkin } from "./SkinStealer.js"

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;

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
        this.texture.attr('x', 0);
        this.texture.attr('y', 0);

        function animationCallback(playerModelInstance) {
                const canvasPosX = playerModelInstance.canvasPosX;
                const canvasPosY = playerModelInstance.canvasPosY;
                const canvasScaleX = playerModelInstance.canvasScaleX;
                const canvasScaleY = playerModelInstance.canvasScaleY;
                const playerModel = playerModelInstance.playerModel;
                const leftItem = playerModelInstance.leftItemModel;
                const rightItem = playerModelInstance.rightItemModel;
                const svg = playerModelInstance.parentSvg;
                const ax = 1.0; // Bell function height at x = 0
                const ay = 1.0;
                const x = Math.max(Math.min((state.mouseX - canvasPosX - svg.attr('x') - canvasScaleX / 2) / 500, ax), -ax);
                const y = Math.max(Math.min((state.mouseY - canvasPosY - svg.attr('y') - canvasScaleY / 4) / 500, ay), -ay);
                const bellX = 1 / (1 + ((x / ax)*(x / ax)));
                const bellY = 1 / (1 + ((y / ay)*(y / ay)));
                playerModel.GLTF.scene.rotation.y = x * bellX;
                playerModel.GLTF.scene.rotation.x = y * bellY;
                playerModel.boneHead.rotation.y = x * bellX;
                playerModel.boneHead.rotation.x = y * bellY;

                // If item isnt null and bone has been moved by animation, add rotation to bone
                if (leftItem.minecraftItem != null && this.lastBoneArmLeftRotation != playerModel.boneArmLeft.rotation.x) {
                    playerModel.boneArmLeft.rotation.x -= 0.4;
                    this.lastBoneArmLeftRotation = playerModel.boneArmLeft.rotation.x;
                }
                if (rightItem.minecraftItem != null && this.lastBoneArmRightRotation != playerModel.boneArmLeft.rotation.x) {
                    playerModel.boneArmRight.rotation.x -= 0.4;
                    this.lastBoneArmRightRotation = playerModel.boneArmLeft.rotation.x;
                }
        }
        // Create Mini Player Model
        let [skinPath, playerType] = await getSkinPath("Sonryle");
        this.playerModel = new PlayerModel(this.svg, (21 * state.scale), (7 * state.scale),
                            (60 * state.scale), (80 * state.scale), (54 * state.scale),
                            skinPath, playerType, animationCallback);
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
            if (x == 0)
                this.slots[slotNum] = new CallbackItemSlot(this.svg,
                                    xOffset + x * this.cellScale,
                                    yOffset + 0 * this.cellScale,
                                    null, null, (item) => this.swapRightHand(item));
            else
                this.slots[slotNum] = new ItemSlot(this.svg,
                                    xOffset + x * this.cellScale,
                                    yOffset + 0 * this.cellScale);
        }

        // Offhand Slot
        this.slots[45] = new CallbackItemSlot(this.svg, 76 * state.scale, 61 * state.scale, await texturePack.getPath("gui/sprites/container/slot/shield.png"), null, (item) => this.swapLeftHand(item));

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

        let path = null;
        if (item != null) {
            switch (item.name) {
                case "Netherite Helmet":
                    if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/netherite_layer_1.png")) == true)
                        legacyTextureLocation = true;
                    path = (legacyTextureLocation)? "models/armor/netherite_layer_1.png" : "entity/equipment/humanoid/netherite.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Diamond Helmet":
                    if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/diamond_layer_1.png")) == true)
                        legacyTextureLocation = true;
                    path = (legacyTextureLocation)? "models/armor/diamond_layer_1.png" : "entity/equipment/humanoid/diamond.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Golden Helmet":
                    if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/gold_layer_1.png")) == true)
                        legacyTextureLocation = true;
                    path = (legacyTextureLocation)? "models/armor/gold_layer_1.png" : "entity/equipment/humanoid/gold.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Iron Helmet":
                    if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/iron_layer_1.png")) == true)
                        legacyTextureLocation = true;
                    path = (legacyTextureLocation)? "models/armor/iron_layer_1.png" : "entity/equipment/humanoid/iron.png"
                    texturePath = await texturePack.getPath(path);
                    break;
            }
            this.playerModel.updateHelmet(texturePath, (item.enchantments != null && item.enchantments != "undefined"));
        } else {
            this.playerModel.updateHelmet(null, false);
        }


    }

    async swapChestplate(item) {
        // Find out which texture to use
        let texturePath = null;
        let legacyTextureLocation = false;

        let path = null;
        if (item != null) {
            switch (item.name) {
                case "Netherite Chestplate":
                    if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/netherite_layer_1.png")))
                        legacyTextureLocation = true;
                    path = (legacyTextureLocation)? "models/armor/netherite_layer_1.png" : "entity/equipment/humanoid/netherite.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Diamond Chestplate":
                    if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/diamond_layer_1.png")))
                        legacyTextureLocation = true;
                    path = (legacyTextureLocation)? "models/armor/diamond_layer_1.png" : "entity/equipment/humanoid/diamond.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Golden Chestplate":
                    if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/gold_layer_1.png")))
                        legacyTextureLocation = true;
                    path = (legacyTextureLocation)? "models/armor/gold_layer_1.png" : "entity/equipment/humanoid/gold.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Iron Chestplate":
                    if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/iron_layer_1.png")))
                        legacyTextureLocation = true;
                    path = (legacyTextureLocation)? "models/armor/iron_layer_1.png" : "entity/equipment/humanoid/iron.png"
                    texturePath = await texturePack.getPath(path);
                    break;
            }
            this.playerModel.updateChestplate(texturePath, (item.enchantments != null && typeof item.enchantments != "undefined"));
        } else {
            this.playerModel.updateChestplate(null, false);
        }
    }

    async swapLeggings(item) {
        // Find out which texture to use
        let texturePath = null;
        let legacyTextureLocation = false;

        let path = null;
        if (item != null) {
            switch (item.name) {
                case "Netherite Leggings":
                    if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/netherite_layer_1.png")))
                        legacyTextureLocation = true;
                    path = (legacyTextureLocation)? "models/armor/netherite_layer_2.png" : "entity/equipment/humanoid_leggings/netherite.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Diamond Leggings":
                    if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/diamond_layer_1.png")))
                        legacyTextureLocation = true;
                    path = (legacyTextureLocation)? "models/armor/diamond_layer_2.png" : "entity/equipment/humanoid_leggings/diamond.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Golden Leggings":
                    if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/gold_layer_1.png")))
                        legacyTextureLocation = true;
                    path = (legacyTextureLocation)? "models/armor/gold_layer_2.png" : "entity/equipment/humanoid_leggings/gold.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Iron Leggings":
                    if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/iron_layer_1.png")))
                        legacyTextureLocation = true;
                    path = (legacyTextureLocation)? "models/armor/iron_layer_2.png" : "entity/equipment/humanoid_leggings/iron.png"
                    texturePath = await texturePack.getPath(path);
                    break;
            }
            this.playerModel.updateLeggings(texturePath, (item.enchantments != null && item.enchantments != "undefined"));
        } else {
            this.playerModel.updateLeggings(null, false);
        }
    }

    async swapBoots(item) {
        // Find out which texture to use
        let texturePath = null;
        let legacyTextureLocation = false;

        let path = null;
        if (item != null) {
            switch (item.name) {
                case "Netherite Boots":
                    if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/netherite_layer_1.png")))
                        legacyTextureLocation = true;
                    path = (legacyTextureLocation)? "models/armor/netherite_layer_1.png" : "entity/equipment/humanoid/netherite.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Diamond Boots":
                    if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/diamond_layer_1.png")))
                        legacyTextureLocation = true;
                    path = (legacyTextureLocation)? "models/armor/diamond_layer_1.png" : "entity/equipment/humanoid/diamond.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Golden Boots":
                    if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/gold_layer_1.png")))
                        legacyTextureLocation = true;
                    path = (legacyTextureLocation)? "models/armor/gold_layer_1.png" : "entity/equipment/humanoid/gold.png"
                    texturePath = await texturePack.getPath(path);
                    break;
                case "Iron Boots":
                    if (await texturePack.textureExists(texturePack.getPathNoFallback("models/armor/iron_layer_1.png")))
                        legacyTextureLocation = true;
                    path = (legacyTextureLocation)? "models/armor/iron_layer_1.png" : "entity/equipment/humanoid/iron.png"
                    texturePath = await texturePack.getPath(path);
                    break;
            }
            this.playerModel.updateBoots(texturePath, (item.enchantments != null && item.enchantments != "undefined"));
        } else {
            this.playerModel.updateBoots(null, false);
        }
    }

    swapLeftHand(item) {
        this.playerModel.updateLeftHand(item);
    }

    swapRightHand(item) {
        this.playerModel.updateRightHand(item);
    }

    delete() {
        this.svg.remove();
    }
}
