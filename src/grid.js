const winWidth = window.innerWidth;
const winHeight = window.innerHeight;

export class Grid {
    constructor(scale, svg) {
        this.scale = scale;
        this.svg = svg;
    }

    drawGrid() {

        // Horizontal Lines
        const remainingYSpace = winHeight % (16 * this.scale);
        for (let y = remainingYSpace / 2; y < winHeight; y+=16*this.scale) {
            let line = this.svg.append('line');
            line.attr('stroke', "red");
            line.attr('stroke-width', 2);
            line.attr('x1', 0);
            line.attr('x2', winWidth);
            line.attr('y1', y);
            line.attr('y2', y);
        }
        // Vertical Lines
        const remainingXSpace = winWidth % (16 * this.scale);
        for (let x = remainingXSpace / 2; x < winWidth; x+=16*this.scale) {
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
        const remainingXSpace = winWidth % (16 * this.scale);
        const remainingYSpace = winHeight % (16 * this.scale);

        let tempX = x - remainingXSpace / 2;
        let tempY = y - remainingYSpace / 2;

        // Solve X
        let new_x = tempX - (tempX % (16 * this.scale)) + remainingXSpace / 2;
        // Solve Y
        let new_y = tempY - (tempY % (16 * this.scale)) + remainingYSpace / 2;
        return [new_x, new_y];
    }
}

// svg.attr('width', window.innerWidth);
// svg.attr('height', window.innerHeight);
