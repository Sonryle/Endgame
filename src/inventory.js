import { state } from "./state.js"
import { grid } from "./grid.js"
import { texturePack } from "./TexturePack.js"
import { ItemType, MinecraftItem } from "./Item.js"
import { ItemSlot, ArmourItemSlot, CallbackItemSlot } from "./ItemSlot.js"
import { PlayerModel } from "./PlayerModel"

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

        // Create Mini Player Model
        this.playerModel = new PlayerModel(this.svg, (20 * state.scale), (6 * state.scale), (60 * state.scale), (80 * state.scale), null, (53 * state.scale));
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
            this.playerModel.updateHelmet(texturePath, (item.enchantments != null && item.enchantments != "undefined"));
        } else {
            this.playerModel.updateHelmet(null, false);
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
            this.playerModel.updateChestplate(texturePath, (item.enchantments != null && typeof item.enchantments != "undefined"));
        } else {
            this.playerModel.updateChestplate(null, false);
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
            this.playerModel.updateLeggings(texturePath, (item.enchantments != null && item.enchantments != "undefined"));
        } else {
            this.playerModel.updateLeggings(null, false);
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
