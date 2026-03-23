import { state } from "./state.js"
import { Inventory } from "./inventory.js"

export const ItemType = {
    HELMET: "0",
    CHESTPLATE: "1",
    LEGGINGS: "2",
    BOOTS: "3",
    WEAPON: "4",
    DEFAULT: "5",
}

export class Item {
    constructor(href, itemType, statValue1, statValue2, enchantments, name) {
        this.type = itemType;
        this.enchantments = enchantments;
        this.name = name
        this.statValue1 = statValue1;
        this.statValue2 = statValue2;

        this.svgContainer = state.svg.append('svg');
        this.svgContainer.attr('width', 16 * state.scale);
        this.svgContainer.attr('height', 16 * state.scale);

        this.itemTexture = this.svgContainer.append('image');
        this.itemTexture.attr('href', href);
        this.itemTexture.attr('width', 16 * state.scale);
        this.itemTexture.attr('height', 16 * state.scale);
        this.itemTexture.attr('pointer-events', 'none');

        this.itemGlint = null;
        if (enchantments != null && typeof enchantments != "undefined") {
            const patternId = 'itemGlintPattern-' + href;
            const maskId = 'maskId-' + href;
            
            // Append a <defs> block with an animated pattern
            const defs = this.svgContainer.append('defs');
            const pattern = defs.append('pattern')
                .attr('id', patternId)
                .attr('width', 1)
                .attr('height', 1)
            pattern.append('image')
                .attr('href', './src/assets/textures/misc/enchanted_glint_item.png')
            pattern.append('animateTransform')
                .attr('attributeName', 'patternTransform')
                .attr('to', `${16 * state.scale} ${-32 * state.scale}`)  // move up by one tile height
                .attr('dur', '4s')
                .attr('repeatCount', 'indefinite');

            const mask = defs.append('mask')
                .attr('id', maskId)
                .attr('mask-mode', 'alpha')
            
            mask.append('image')
                .attr('href', href)
                .attr('y', 0)
                .attr('width', 16 * state.scale)
                .attr('height', 16 * state.scale)
                .style('filter', 'brightness(0) invert(1)')
            
            this.itemGlint = this.svgContainer.append('rect');
            this.itemGlint.attr('mask', `url(#${maskId})`);
            this.itemGlint.attr('width', 16 * state.scale);
            this.itemGlint.attr('height', 16 * state.scale);
            this.itemGlint.attr('fill', `url(#${patternId})`);
            this.itemGlint.attr('pointer-events', 'none');
            this.itemGlint.style('mix-blend-mode', 'screen');
            this.itemGlint.style('filter', 'opacity(1.0) saturate(1) blur(2px)');
        }
    }

    // Cause Item to snap to the grid
    snapToGrid(grid) {
        let centerX = +this.svgContainer.attr('x') + +this.svgContainer.attr('width') / 2;
        let centerY = +this.svgContainer.attr('y') + +this.svgContainer.attr('height') / 2;
        let [new_x, new_y] = grid.nearestCell(centerX, centerY);
        new_x += state.scale;    // Offset coordinates by 1 pixel to center item
        new_y += state.scale;
        this.svgContainer.attr('x', new_x);
        this.svgContainer.attr('y', new_y);
    }
    // Can be either "hidden" or "visible"
    setOpacity(level) {
        this.svgContainer.attr('opacity', visibility);
    }
}
