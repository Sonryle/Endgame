import { state } from "./state.js"

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;

export class Grid {
    constructor() {
        this.cellScale = 18 * state.scale;
    }

    drawGrid() {

        // Horizontal Lines
        const remainingYSpace = winHeight % this.cellScale;
        for (let y = remainingYSpace / 2 - this.cellScale / 2; y < winHeight; y += this.cellScale) {
            let line = state.svg.append('line');
            line.attr('stroke', "red");
            line.attr('stroke-width', 2);
            line.attr('x1', 0);
            line.attr('x2', winWidth);
            line.attr('y1', y);
            line.attr('y2', y);
            line.attr('pointer-events', 'none');
        }
        // Vertical Lines
        const remainingXSpace = winWidth % this.cellScale;
        for (let x = remainingXSpace / 2 - this.cellScale / 2; x < winWidth; x += this.cellScale) {
            let line = state.svg.append('line');
            line.attr('stroke', "red");
            line.attr('stroke-width', 2);
            line.attr('x1', x);
            line.attr('x2', x);
            line.attr('y1', 0);
            line.attr('y2', winHeight);
            line.attr('pointer-events', 'none');
        }
    }

    // returns x y coordinate of top left of nearest cell on the grid
    nearestCell(x, y) {
        const remainingXSpace = winWidth % this.cellScale;
        const remainingYSpace = winHeight % this.cellScale;
        const gridOffsetX = this.cellScale / 2 - remainingXSpace / 2;
        const gridOffsetY = this.cellScale / 2 - remainingYSpace / 2;

        let newX = +x + gridOffsetX;
        let newY = +y + gridOffsetY;
        newX -= (newX % this.cellScale);
        newY -= (newY % this.cellScale);
        newX -= gridOffsetX;
        newY -= gridOffsetY;

        return [newX, newY];
    }
}

// svg.attr('width', window.innerWidth);
// svg.attr('height', window.innerHeight);
