import { Item, ItemType } from "./Item.js"
import { state } from "./state.js"

export class ItemSlot {
    constructor(x, y, itemType) {
        this.item = null;
        this.itemType = itemType;
        
        this.rect = state.svg.append('rect');
        this.rect.attr('width', state.scale * 16);
        this.rect.attr('height', state.scale * 16);
        this.rect.attr('x', x + state.scale);
        this.rect.attr('y', y + state.scale);
        this.rect.attr('fill', "white");
        this.rect.attr('opacity', 0.0);

        this.rect.on('mouseover', (event) => {
            this.rect.attr('opacity', 0.4);
        });
        this.rect.on('mouseout', (event) => {
            this.rect.attr('opacity', 0.0);
        })
        // Swap items
        this.rect.on('click', (event) => {
            this.swapItems();
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

        // Lock new item to grid
        if (this.item != null) {
            this.item.image.attr('x', +this.rect.attr('x'));
            this.item.image.attr('y', +this.rect.attr('y'));
        }

        // Make new selected item follow mouse cursor
        if (state.selectedItem != null) {
            state.svg.on('mousemove', (event) => {
                state.mouseX = event.x;
                state.mouseY = event.y;
                state.selectedItem.image.attr('x', event.x - state.selectedItem.image.attr('width') / 2)
                state.selectedItem.image.attr('y', event.y - state.selectedItem.image.attr('height') / 2)
            });
            state.selectedItem.image.raise();
            state.selectedItem.image.attr('x', state.mouseX - state.selectedItem.image.attr('width') / 2);
            state.selectedItem.image.attr('y', state.mouseY - state.selectedItem.image.attr('height') / 2);
        } else {
            state.svg.on('mousemove', (event) => {
                state.mouseX = event.x;
                state.mouseY = event.y;
            })
        }

    }

    // Replaces any item in this slot with a new item. returns old item
    setItem(newItem) {
        let oldItem = this.item;
        this.item = newItem;

        // Lock new item to grid
        if (this.item != null) {
            this.item.image.attr('x', +this.rect.attr('x'));
            this.item.image.attr('y', +this.rect.attr('y'));
        }

        return oldItem;
    }
}
