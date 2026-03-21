import { Grid } from "./grid.js"

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;

export class Inventory {
    constructor(scale, svg, grid) {
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
        // // Horizontal Lines
        // const remainingYSpace = winHeight % this.cellScale;
        // for (let y = remainingYSpace / 2; y < winHeight; y += this.cellScale) {
        //     let line = this.svg.append('line');
        //     line.attr('stroke', "green");
        //     line.attr('stroke-width', 2);
        //     line.attr('x1', 0);
        //     line.attr('x2', winWidth);
        //     line.attr('y1', y);
        //     line.attr('y2', y);
        // }
        // // Vertical Lines
        // const remainingXSpace = winWidth % this.cellScale;
        // for (let x = remainingXSpace / 2; x < winWidth; x += this.cellScale) {
        //     let line = this.svg.append('line');
        //     line.attr('stroke', "green");
        //     line.attr('stroke-width', 2);
        //     line.attr('x1', x);
        //     line.attr('x2', x);
        //     line.attr('y1', 0);
        //     line.attr('y2', winHeight);
        // }
    }

    nearestSlot(x, y) {

    }

}
