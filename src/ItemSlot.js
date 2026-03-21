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
        this.rect.attr('opacity', 0.3);

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
            let oldItem = this.item;

            // Put item into slot
            this.item = state.selectedItem;
            if (this.item != null) {
                this.item.image.attr('x', +this.rect.attr('x') + state.scale);
                this.item.image.attr('y', +this.rect.attr('y') + state.scale);
            }

            // Make old item in slot selected Item
            state.selectedItem = oldItem;

            // Make selected item follow mouse cursor
            if (state.selectedItem != null) {
                state.svg.on('mousemove', (event) => {
                    state.selectedItem.image.attr('x', event.x - state.selectedItem.image.attr('width') / 2)
                    state.selectedItem.image.attr('y', event.y - state.selectedItem.image.attr('height') / 2)
                });
                console.log("following!");
            } else {
                state.svg.on('mousemove', () => {})
            }
        });
    }

}
