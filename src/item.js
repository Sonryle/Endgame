import { Grid } from "./grid.js"

export class Item {
    constructor(href, scale, svg, grid) {
        this.image = svg.append('image');

        this.image.attr('href', href);
        this.image.attr('width', 16 * scale);
        this.image.attr('height', 16 * scale);
        this.isBeingDragged = false;

        this.image.on('click', (event) => {
            if (this.isBeingDragged == true) {
                this.isBeingDragged = false;
                this.snapToGrid(grid);
            } else {
                this.isBeingDragged = true;
                this.image.raise(); // Raise element to top
            }
        });
        svg.node().addEventListener('mousemove', (event) => {
            if (this.isBeingDragged) {
                this.image.attr('x', event.x - this.image.attr('width') / 2)
                this.image.attr('y', event.y - this.image.attr('height') / 2)
            }
        });
    }

    // Cause Item to snap to the grid
    snapToGrid(grid) {
        let centerX = +this.image.attr('x') + +this.image.attr('width') / 2;
        let centerY = +this.image.attr('y') + +this.image.attr('height') / 2;
        let [new_x, new_y] = grid.nearestSlot(centerX, centerY);
        this.image.attr('x', new_x);
        this.image.attr('y', new_y);
        console.log("hello");
    }
    // Can be either "hidden" or "visible"
    setVisibility(visibility) {
        this.image.attr('visibility', visibility);
    }
}
