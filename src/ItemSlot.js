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

        this.layerSlotTexture = this.svgContainer.append('g').attr('class', 'layerSlotTexture');
        this.layerHighlightBack = this.svgContainer.append('g').attr('class', 'layerHighlightBack');
        this.layerItem = this.svgContainer.append('g').attr('class', 'layerItem');
        this.layerHighlightFront = this.svgContainer.append('g').attr('class', 'layerHighlightFront');

        this.texture_slot = this.layerSlotTexture.append('image');
        this.texture_slot.attr('href', "./src/assets/textures/gui/sprites/container/slot.png");
        this.texture_slot.attr('width', 18 * state.scale);
        this.texture_slot.attr('height', 18 * state.scale);
        this.texture_slot.attr('opacity', 0.0);

        this.texture_back = this.layerHighlightBack.append('image');
        this.texture_back.attr('href', "./src/assets/textures/gui/sprites/container/slot_highlight_back.png");
        this.texture_back.attr('width', 24 * state.scale);
        this.texture_back.attr('height', 24 * state.scale);
        this.texture_back.attr('x', -3 * state.scale);
        this.texture_back.attr('y', -3 * state.scale);
        this.texture_back.attr('opacity', 0.0);

        this.texture_front = this.layerHighlightFront.append('image');
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
            // Hide tooltip because item under cursor is now held
            this.hideToolTip();
            // Swap Items
            this.swapItems();
            // Show tooltip & blank item slot texture if item under cursor isnt null
            if (this.item != null) {
                this.showToolTip();
            }
        });
    }

    // Swaps item in slot with state.selectedItem
    swapItems() {
        // Check if item can go in this itemSlot
        if (state.selectedItem != null && this.itemType != ItemType.DEFAULT)
            if (state.selectedItem.type != this.itemType)
                return;

        // Switch them around
        let temp = this.item;
        this.item = state.selectedItem;
        state.selectedItem = temp;

        // Lock new item to grid & reorder DOM
        if (this.item != null) {
            this.item.svgContainer.attr('x', state.scale);
            this.item.svgContainer.attr('y', state.scale);
            this.layerItem.node().appendChild(this.item.svgContainer.node());
        }

        // Make new selected item follow mouse cursor
        if (state.selectedItem != null) {
            state.svg.on('mousemove', (event) => {
                state.mouseX = event.x;
                state.mouseY = event.y;
                state.selectedItem.svgContainer.attr('x', event.x - state.selectedItem.svgContainer.attr('width') / 2)
                state.selectedItem.svgContainer.attr('y', event.y - state.selectedItem.svgContainer.attr('height') / 2)
            });
            state.svg.node().appendChild(state.selectedItem.svgContainer.node());
            state.selectedItem.svgContainer.raise();
            state.selectedItem.svgContainer.attr('x', state.mouseX - state.selectedItem.svgContainer.attr('width') / 2);
            state.selectedItem.svgContainer.attr('y', state.mouseY - state.selectedItem.svgContainer.attr('height') / 2);
        } else {
            state.svg.on('mousemove', (event) => {
                state.mouseX = event.x;
                state.mouseY = event.y;
            })
        }

        // if new item isnt null, set item slot texture to be shown.
        // this is done to hide any graphic symbols behind the item. (like in the armour slots)
        if (this.item != null) {
            this.texture_slot.attr('opacity', 1.0);
        } else {
            this.texture_slot.attr('opacity', 0.0);
        }
        
        this.svgContainer.dispatch('mousemove');
    }

    // Replaces any item in this slot with a new item. returns old item
    setItem(newItem) {
        let oldItem = this.item;
        this.item = newItem;

        // Lock new item to grid & reorder DOM
        if (this.item != null) {
            this.item.svgContainer.attr('x', state.scale);
            this.item.svgContainer.attr('y', state.scale);
            this.layerItem.node().appendChild(this.item.svgContainer.node());
        }

        // if new item isnt null, set item slot texture to be shown.
        // this is done to hide any graphic symbols behind the item. (like in the armour slots)
        if (this.item != null) {
            this.texture_slot.attr('opacity', 1.0);
        } else {
            this.texture_slot.attr('opacity', 0.0);
        }

        return oldItem;
    }

    showToolTip() {
        if (this.item != null) {
            this.toolTip = new ToolTip(
                            this.item.name,
                            this.item.enchantments,
                            this.item.type,
                            this.item.statValue1,
                            this.item.statValue2
            );
        }
    }

    hideToolTip() {
        if (this.toolTip != null) {
            this.toolTip.delete();
            this.toolTip = null;
        }
    }
}
