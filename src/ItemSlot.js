import { ItemType } from "./Item.js"
import { ToolTip } from "./ToolTip.js"
import { state } from "./state.js"
import { texturePack } from "./TexturePack.js"
import { grid } from "./grid.js"

export class ItemSlot {
    constructor(svg, x, y, optionalSlotTexture, optionalItemType) {
        this.svg = svg;
        this.itemType = optionalItemType;
        this.toolTip = null;
        this.item = null;
        
        this.svgContainer = this.svg.append('svg').attr('class', 'ItemSlot');
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
        this.texture_slot.attr('width', 16 * state.scale);
        this.texture_slot.attr('height', 16 * state.scale);
        this.texture_slot.attr('x', 1 * state.scale);
        this.texture_slot.attr('y', 1 * state.scale);
        this.texture_slot.attr('opacity', 1.0);
        this.texture_slot.attr('href', optionalSlotTexture);

        this.texture_back = this.layerHighlightBack.append('image');
        this.texture_back.attr('width', 24 * state.scale);
        this.texture_back.attr('height', 24 * state.scale);
        this.texture_back.attr('x', -3 * state.scale);
        this.texture_back.attr('y', -3 * state.scale);
        this.texture_back.attr('opacity', 0.0);

        this.texture_front = this.layerHighlightFront.append('image');
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
            this.swapWithSelectedItem();
            // Show tooltip & blank item slot texture if item under cursor isnt null
            if (this.item != null) {
                this.showToolTip();
            }
        });

        this.initTextures();
    }

    async initTextures() {
        await this.texture_front.attr('href', await texturePack.getPath("gui/sprites/container/slot_highlight_front.png"));
        await this.texture_back.attr('href', await texturePack.getPath("gui/sprites/container/slot_highlight_back.png"));
    }

    // Swaps item in slot with state.selectedItem
    swapWithSelectedItem() {

        // Switch them around
        state.selectedItem = this.setItem(state.selectedItem);

        // Append selected item to svg and lock new selected item to mouse cursor
        if (state.selectedItem != null && typeof state.selectedItem != "undefined") {
            state.svg.node().appendChild(state.selectedItem.svgContainer.node());
            state.selectedItem.svgContainer.raise();

            let x = Math.floor(state.mouseX) - state.selectedItem.svgContainer.attr('width') / 2
            let y = Math.floor(state.mouseY) - state.selectedItem.svgContainer.attr('height') / 2

            let [gridLockedX, gridLockedY] = grid.nearestPixel(x, y);
            state.selectedItem.svgContainer.attr('x', gridLockedX);
            state.selectedItem.svgContainer.attr('y', gridLockedY);
        }
    }

    // Replaces any item in this slot with a new item. returns old item
    setItem(newItem) {

        // Do ItemType checking
        if (this.itemType != null && typeof this.itemType != "undefined" && newItem != null) {
            if (newItem.itemType != this.itemType)
                return newItem; // return input back as output
        }

        // Swap items
        let oldItem = this.item;
        this.item = newItem;

        // Lock new item to grid & reorder DOM
        if (this.item != null) {
            this.layerItem.node().appendChild(this.item.svgContainer.node());
            this.item.svgContainer.attr('x', Math.floor(state.scale));
            this.item.svgContainer.attr('y', Math.floor(state.scale));
        }

        // if new item is null, set item slot texture to be shown.
        // this is done to hide item slot texture when an item is in it.
        if (this.item != null && typeof this.item != "undefined") {
            this.texture_slot.attr('opacity', 0.0);
        } else {
            this.texture_slot.attr('opacity', 1.0);
        }

        return oldItem;
    }

    showToolTip() {
        if (this.item != null) {
            this.toolTip = new ToolTip(
                            this.item.name,
                            this.item.enchantments,
                            this.item.itemType,
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

export class ArmourItemSlot extends ItemSlot {
    constructor(svg, x, y, itemType, onArmourChanged) {
        switch (itemType) {
            case ItemType.HELMET:
                super(svg, x, y, null, ItemType.HELMET);
                break;
            case ItemType.CHESTPLATE:
                super(svg, x, y, null, ItemType.CHESTPLATE);
                break;
            case ItemType.LEGGINGS:
                super(svg, x, y, null, ItemType.LEGGINGS);
                break;
            case ItemType.BOOTS:
                super(svg, x, y, null, ItemType.BOOTS);
                break;
        }
        this.itemType = itemType;
        this.onArmourChanged = onArmourChanged;
        this.init(svg, x, y, itemType, onArmourChanged);
    }

    async init(svg, x, y, itemType, onArmourChanged) {
        switch (itemType) {
            case ItemType.HELMET:
                this.texture_slot.attr('href', await texturePack.getPath("gui/sprites/container/slot/helmet.png"));
                break;
            case ItemType.CHESTPLATE:
                this.texture_slot.attr('href', await texturePack.getPath("gui/sprites/container/slot/chestplate.png"));
                break;
            case ItemType.LEGGINGS:
                this.texture_slot.attr('href', await texturePack.getPath("gui/sprites/container/slot/leggings.png"));
                break;
            case ItemType.BOOTS:
                this.texture_slot.attr('href', await texturePack.getPath("gui/sprites/container/slot/boots.png"));
                break;
        }
    }

    setItem(newItem) {
        let returnItem = super.setItem(newItem);
        this.onArmourChanged(this.item, this.itemType);
        return returnItem;
    }
}

// Calls callback function when item is placed in slot
export class CallbackItemSlot extends ItemSlot {
    constructor(svg, x, y, optionalSlotTexture, optionalItemType, callbackOnItemChanged) {
        super(svg, x, y, optionalSlotTexture, optionalItemType);
        this.callbackOnItemChanged = callbackOnItemChanged;
    }

    setItem(newItem) {
        let returnItem = super.setItem(newItem);
        this.callbackOnItemChanged(this.item);
        return returnItem;
    }
}
