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
        this.texture = state.svg.append('image');
        this.texture.attr('href', href);
        this.texture.attr('width', 16 * state.scale);
        this.texture.attr('height', 16 * state.scale);
        this.texture.attr('pointer-events', 'none');
    }

    // Cause Item to snap to the grid
    snapToGrid(grid) {
        let centerX = +this.texture.attr('x') + +this.texture.attr('width') / 2;
        let centerY = +this.texture.attr('y') + +this.texture.attr('height') / 2;
        let [new_x, new_y] = grid.nearestCell(centerX, centerY);
        new_x += state.scale;    // Offset coordinates by 1 pixel to center item
        new_y += state.scale;
        this.texture.attr('x', new_x);
        this.texture.attr('y', new_y);
    }
    // Can be either "hidden" or "visible"
    setVisibility(visibility) {
        this.texture.attr('visibility', visibility);
    }
}
