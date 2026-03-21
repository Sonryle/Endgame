import { state } from "./state.js"
import { Grid } from "./grid.js"
import { Item, ItemType } from "./Item.js"
import { ItemSlot } from "./ItemSlot.js"

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;

// Inventory has 44 possible slots for items
export class Inventory {
    constructor(grid) {
        this.slots = [];
        this.cellScale = 18 * state.scale;

        // Create image
        this.image = state.svg.append('image');   
        this.image.attr('href', "./src/assets/textures/gui/container/inventory.png");
        this.image.attr('width', 256 * state.scale);
        this.image.attr('height', 256 * state.scale);

        // Center texture
        let inventoryPaddingX = 8 * state.scale;
        let inventoryPaddingY = 12 * state.scale;
        let [x, y] = grid.nearestCell(winWidth / 2 - this.image.attr('width') / 4 , winHeight / 2 - this.image.attr('height') / 4);
        x += state.scale;    // Offset coordinates by 1 pixel to center inventory texture
        y += state.scale;
        this.image.attr('x', x - inventoryPaddingX);
        this.image.attr('y', y - inventoryPaddingY);

        // Create item slots
        let [topLeftX, topLeftY] = grid.nearestCell(this.image.attr('x'), this.image.attr('y'));

        // Crafting Input
        let xOffset = topLeftX + this.cellScale + 90 * state.scale;
        let yOffset = topLeftY + this.cellScale + 6 * state.scale;
        this.slots[1] = new ItemSlot(xOffset, yOffset, ItemType.DEFAULT);
        this.slots[2] = new ItemSlot(xOffset + this.cellScale, yOffset, ItemType.DEFAULT);
        this.slots[3] = new ItemSlot(xOffset, yOffset + this.cellScale, ItemType.DEFAULT);
        this.slots[4] = new ItemSlot(xOffset + this.cellScale, yOffset + this.cellScale, ItemType.DEFAULT);

        // Armour
        xOffset = topLeftX + this.cellScale;
        yOffset = topLeftY + 14 * state.scale;
        this.slots[5] = new ItemSlot(xOffset, yOffset + 0 * this.cellScale, ItemType.HELMET);
        this.slots[6] = new ItemSlot(xOffset, yOffset + 1 * this.cellScale, ItemType.CHESTPLATE);
        this.slots[7] = new ItemSlot(xOffset, yOffset + 2 * this.cellScale, ItemType.LEGGINGS);
        this.slots[8] = new ItemSlot(xOffset, yOffset + 3 * this.cellScale, ItemType.BOOTS);

        // Main Inventory
        xOffset = topLeftX + this.cellScale;
        yOffset = topLeftY + 90 * state.scale;
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 9; x++) {
                this.slots[9 + x * (y + 1)] = new ItemSlot(xOffset + x * this.cellScale, yOffset + y * this.cellScale, ItemType.DEFAULT);
                // console.log(9 + x + (y * 9));
            }
        }
        
        // Hotbar
        xOffset = topLeftX + this.cellScale;
        yOffset = topLeftY + 148 * state.scale;
        for (let x = 0; x < 9; x++) {
            this.slots[36 + x] = new ItemSlot(xOffset + x * this.cellScale, yOffset, ItemType.DEFAULT);
            // console.log(36 + x);
        }

        // Offhand Slot
        this.slots[45] = new ItemSlot(topLeftX + 87 * state.scale, topLeftY + 68 * state.scale, ItemType.DEFAULT);
    }
}
