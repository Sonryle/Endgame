import { Item, ItemType } from "./Item.js"
import { ToolTip } from "./ToolTip.js"
import { state } from "./state.js"

export class ItemSlot {
    constructor(x, y, itemType) {
        this.toolTip = null;
        this.itemType = itemType;
        this.item = null;
        
        this.svgContainer = state.svg.append('svg').attr('class', 'ItemSlot');
        this.svgContainer.raise();
        this.svgContainer.attr('overflow', 'hidden');
        this.svgContainer.attr('width', 18 * state.scale);
        this.svgContainer.attr('height', 18 * state.scale);
        this.svgContainer.attr('x', x);
        this.svgContainer.attr('y', y);

        this.layerBack = this.svgContainer.append('g').attr('class', 'layerBack');
        this.layerItem = this.svgContainer.append('g').attr('class', 'layerItem');
        this.layerFront = this.svgContainer.append('g').attr('class', 'layerFront');

        this.texture_back = this.layerBack.append('image');
        this.texture_back.attr('href', "./src/assets/textures/gui/sprites/container/slot_highlight_back.png");
        this.texture_back.attr('width', 24 * state.scale);
        this.texture_back.attr('height', 24 * state.scale);
        this.texture_back.attr('x', -3 * state.scale);
        this.texture_back.attr('y', -3 * state.scale);
        this.texture_back.attr('opacity', 0.0);

        this.texture_front = this.layerFront.append('image');
        this.texture_front.attr('href', "./src/assets/textures/gui/sprites/container/slot_highlight_front.png");
        this.texture_front.attr('width', 24 * state.scale);
        this.texture_front.attr('height', 24 * state.scale);
        this.texture_front.attr('x', -3 * state.scale);
        this.texture_front.attr('y', -3 * state.scale);
        this.texture_front.attr('opacity', 0.0);

        this.svgContainer.on('mouseover', (event) => {
            this.texture_back.attr('opacity', 1.0);
            this.texture_front.attr('opacity', 1.0);
            this.showToolTip();
        });
        this.svgContainer.on('mouseout', (event) => {
            this.texture_front.attr('opacity', 0.0);
            this.texture_back.attr('opacity', 0.0);
            this.hideToolTip();
        })
        this.svgContainer.on('click', (event) => {
            this.hideToolTip();
            this.swapItems();
            if (this.item != null)
                this.showToolTip();
            else
                this.hideToolTip();
        });
    }

    // Swaps item in slot with state.selectedItem
    swapItems() {
        // Check if item can go in this itemSlot
        console.log(this.itemType);
        if (state.selectedItem != null && this.itemType != ItemType.DEFAULT)
            if (state.selectedItem.itemType != this.itemType)
                return;

        // Switch them around
        let temp = this.item;
        this.item = state.selectedItem;
        state.selectedItem = temp;

        // Lock new item to grid & reorder DOM
        if (this.item != null) {
            this.item.texture.attr('x', state.scale);
            this.item.texture.attr('y', state.scale);
            this.layerItem.node().appendChild(this.item.texture.node());
        }

        // Make new selected item follow mouse cursor
        if (state.selectedItem != null) {
            state.svg.on('mousemove', (event) => {
                state.mouseX = event.x;
                state.mouseY = event.y;
                state.selectedItem.texture.attr('x', event.x - state.selectedItem.texture.attr('width') / 2)
                state.selectedItem.texture.attr('y', event.y - state.selectedItem.texture.attr('height') / 2)
            });
            state.svg.node().appendChild(state.selectedItem.texture.node());
            state.selectedItem.texture.raise();
            state.selectedItem.texture.attr('x', state.mouseX - state.selectedItem.texture.attr('width') / 2);
            state.selectedItem.texture.attr('y', state.mouseY - state.selectedItem.texture.attr('height') / 2);
        } else {
            state.svg.on('mousemove', (event) => {
                state.mouseX = event.x;
                state.mouseY = event.y;
            })
        }
        
        this.svgContainer.dispatch('mousemove');
    }

    // Replaces any item in this slot with a new item. returns old item
    setItem(newItem) {
        let oldItem = this.item;
        this.item = newItem;

        // Lock new item to grid & reorder DOM
        if (this.item != null) {
            this.item.texture.attr('x', state.scale);
            this.item.texture.attr('y', state.scale);
            this.layerItem.node().appendChild(this.item.texture.node());
        }

        return oldItem;
    }

    showToolTip() {
        if (this.item != null) {
            this.toolTip = new ToolTip("na");
        }
    }

    hideToolTip() {
        if (this.toolTip != null) {
            this.toolTip.delete();
            this.toolTip = null;
        }
    }
}
