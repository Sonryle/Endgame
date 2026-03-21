import { Grid } from "./grid.js"

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;

// Inventory has 44 possible slots for items
export class Inventory {
    constructor(scale, svg, grid) {
        this.slots = [];
        this.cellScale = 18 * scale;
        this.svg = svg;
        this.scale = scale;
        this.image = svg.append('image');   

        this.image.attr('href', "./src/assets/textures/gui/container/inventory.png");
        this.image.attr('width', 256 * scale);
        this.image.attr('height', 256 * scale);

        // Center texture
        let inventoryPaddingX = 8 * scale;
        let inventoryPaddingY = 12 * scale;
        let [x, y] = grid.nearestSlot(winWidth / 2 - this.image.attr('width') / 4 , winHeight / 2 - this.image.attr('height') / 4);
        this.image.attr('x', x - inventoryPaddingX);
        this.image.attr('y', y - inventoryPaddingY);
    }

    drawGrid() {
        // Crafting Input
        let xOffset = +this.image.attr('x') + (97 * this.scale);
        let yOffset = +this.image.attr('y') + (17 * this.scale);
        for (let x = xOffset; x < xOffset + this.cellScale * 3; x += this.cellScale) {
            let line = this.svg.append('line');
            line.attr('stroke', "green");
            line.attr('stroke-width', 3);
            line.attr('x1', x);
            line.attr('x2', x);
            line.attr('y1', yOffset);
            line.attr('y2', yOffset + this.cellScale * 2);
        }
        for (let y = yOffset; y < yOffset + this.cellScale * 3; y += this.cellScale) {
            let line = this.svg.append('line');
            line.attr('stroke', "green");
            line.attr('stroke-width', 3);
            line.attr('x1', xOffset);
            line.attr('x2', xOffset + this.cellScale * 2);
            line.attr('y1', y);
            line.attr('y2', y);
        }

        // Armour
        xOffset = +this.image.attr('x') + (7 * this.scale);
        yOffset = +this.image.attr('y') + (7 * this.scale);
        for (let x = xOffset; x < xOffset + this.cellScale * 2; x += this.cellScale) {
            let line = this.svg.append('line');
            line.attr('stroke', "green");
            line.attr('stroke-width', 3);
            line.attr('x1', x);
            line.attr('x2', x);
            line.attr('y1', yOffset);
            line.attr('y2', yOffset + this.cellScale * 4);
        }
        for (let y = yOffset; y < yOffset + this.cellScale * 5; y += this.cellScale) {
            let line = this.svg.append('line');
            line.attr('stroke', "green");
            line.attr('stroke-width', 3);
            line.attr('x1', xOffset);
            line.attr('x2', xOffset + this.cellScale);
            line.attr('y1', y);
            line.attr('y2', y);
        }

        // Main Inventory
        xOffset = +this.image.attr('x') + (7 * this.scale);
        yOffset = +this.image.attr('y') + (83 * this.scale);
        for (let x = xOffset; x < xOffset + this.cellScale * 10; x += this.cellScale) {
            let line = this.svg.append('line');
            line.attr('stroke', "green");
            line.attr('stroke-width', 3);
            line.attr('x1', x);
            line.attr('x2', x);
            line.attr('y1', yOffset);
            line.attr('y2', yOffset + this.cellScale * 3);
        }
        for (let y = yOffset; y < yOffset + this.cellScale * 4; y += this.cellScale) {
            let line = this.svg.append('line');
            line.attr('stroke', "green");
            line.attr('stroke-width', 3);
            line.attr('x1', xOffset);
            line.attr('x2', xOffset + this.cellScale * 9);
            line.attr('y1', y);
            line.attr('y2', y);
        }

        // Hotbar
        xOffset = +this.image.attr('x') + (7 * this.scale);
        yOffset = +this.image.attr('y') + (141 * this.scale);
        for (let x = xOffset; x < xOffset + this.cellScale * 10; x += this.cellScale) {
            let line = this.svg.append('line');
            line.attr('stroke', "green");
            line.attr('stroke-width', 3);
            line.attr('x1', x);
            line.attr('x2', x);
            line.attr('y1', yOffset);
            line.attr('y2', yOffset + this.cellScale);
        }
        for (let y = yOffset; y < yOffset + this.cellScale * 2; y += this.cellScale) {
            let line = this.svg.append('line');
            line.attr('stroke', "green");
            line.attr('stroke-width', 3);
            line.attr('x1', xOffset);
            line.attr('x2', xOffset + this.cellScale * 9);
            line.attr('y1', y);
            line.attr('y2', y);
        }

        // Offhand Slot
        xOffset = +this.image.attr('x') + (76 * this.scale);
        yOffset = +this.image.attr('y') + (61 * this.scale);
        for (let x = xOffset; x < xOffset + this.cellScale * 2; x += this.cellScale) {
            let line = this.svg.append('line');
            line.attr('stroke', "green");
            line.attr('stroke-width', 3);
            line.attr('x1', x);
            line.attr('x2', x);
            line.attr('y1', yOffset);
            line.attr('y2', yOffset + this.cellScale);
        }
        for (let y = yOffset; y < yOffset + this.cellScale * 2; y += this.cellScale) {
            let line = this.svg.append('line');
            line.attr('stroke', "green");
            line.attr('stroke-width', 3);
            line.attr('x1', xOffset);
            line.attr('x2', xOffset + this.cellScale);
            line.attr('y1', y);
            line.attr('y2', y);
        }
    }

    nearestSlot(x, y) {

    }

}
