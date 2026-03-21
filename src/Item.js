import { state } from "./state.js"
import { Grid } from "./grid.js"
import { Inventory } from "./inventory.js"

export const ItemType = {
    HELMET: "0",
    CHESTPLATE: "1",
    LEGGINGS: "2",
    BOOTS: "3",
    DEFAULT: "4",
}

export class Item {
    constructor(href, itemType) {
        this.itemType = itemType;
        this.image = state.svg.append('image');
        this.image.attr('href', href);
        this.image.attr('width', 16 * state.scale);
        this.image.attr('height', 16 * state.scale);
        this.image.attr('pointer-events', 'none');
    }

    // Cause Item to snap to the grid
    snapToGrid(grid) {
        let centerX = +this.image.attr('x') + +this.image.attr('width') / 2;
        let centerY = +this.image.attr('y') + +this.image.attr('height') / 2;
        let [new_x, new_y] = grid.nearestCell(centerX, centerY);
        new_x += state.scale;    // Offset coordinates by 1 pixel to center item
        new_y += state.scale;
        this.image.attr('x', new_x);
        this.image.attr('y', new_y);
    }
    // Can be either "hidden" or "visible"
    setVisibility(visibility) {
        this.image.attr('visibility', visibility);
    }
}
