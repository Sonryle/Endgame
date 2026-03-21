const winWidth = window.innerWidth;
const winHeight = window.innerHeight;

export class Grid {
    constructor(scale, svg) {
        this.scale = scale;
        this.cellScale = 18 * scale;
        this.svg = svg;
    }

    drawGrid() {

        // Horizontal Lines
        const remainingYSpace = winHeight % this.cellScale;
        for (let y = remainingYSpace / 2 - this.cellScale / 2; y < winHeight; y += this.cellScale) {
            let line = this.svg.append('line');
            line.attr('stroke', "red");
            line.attr('stroke-width', 2);
            line.attr('x1', 0);
            line.attr('x2', winWidth);
            line.attr('y1', y);
            line.attr('y2', y);
        }
        // Vertical Lines
        const remainingXSpace = winWidth % this.cellScale;
        for (let x = remainingXSpace / 2 - this.cellScale / 2; x < winWidth; x += this.cellScale) {
            let line = this.svg.append('line');
            line.attr('stroke', "red");
            line.attr('stroke-width', 2);
            line.attr('x1', x);
            line.attr('x2', x);
            line.attr('y1', 0);
            line.attr('y2', winHeight);
        }
    }

    nearestSlot(x, y) {
        const remainingXSpace = winWidth % this.cellScale;
        const remainingYSpace = winHeight % this.cellScale;
        const gridOffsetX = this.cellScale / 2 - remainingXSpace / 2;
        const gridOffsetY = this.cellScale / 2 - remainingYSpace / 2;

        let tempX = x + gridOffsetX;
        let tempY = y + gridOffsetY;

        // Solve X
        let new_x = tempX - (tempX % this.cellScale) + this.scale - gridOffsetX;
        // Solve Y
        let new_y = tempY - (tempY % this.cellScale) + this.scale - gridOffsetY;
        return [new_x, new_y];
    }
}

// svg.attr('width', window.innerWidth);
// svg.attr('height', window.innerHeight);
