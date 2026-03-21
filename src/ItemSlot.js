import { Item } from "./Item.js"
import { state } from "./state.js"

export class ItemSlot {
    constructor(x, y) {
        this.item = null;
        
        this.rect = state.svg.append('rect');
        this.rect.attr('width', state.scale * 18);
        this.rect.attr('height', state.scale * 18);
        this.rect.attr('x', x);
        this.rect.attr('y', y);
        this.rect.attr('fill', "white");
        this.rect.attr('opacity', 0.0);

        this.rect.on('mouseover', (event) => {
            this.rect.attr('opacity', 0.4);
            console.log("hover");
        });
        this.rect.on('mouseout', (event) => {
            this.rect.attr('opacity', 0.0);
            console.log("leave");
        })
        // Swap items
        this.rect.on('click', (event) => {
            this.swapItems(state.selectedItem);
        });
    }

    // Swaps item in slot with state.selectedItem
    swapItems() {

        // Switch them around
        let temp = this.item;
        this.item = state.selectedItem;
        state.selectedItem = temp;

        // Lock new item to grid
        if (this.item != null) {
            this.item.image.attr('x', +this.rect.attr('x') + state.scale);
            this.item.image.attr('y', +this.rect.attr('y') + state.scale);
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
            console.log("following!");
        } else {
            state.svg.on('mousemove', (event) => {
                state.mouseX = event.x;
                state.mouseY = event.y;
            })
        }

    }
}
