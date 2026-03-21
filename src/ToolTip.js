import { state } from "./state.js"

export class ToolTip {
    constructor(text) {
        this.image = state.svg.append('image');
        this.image.attr('href', './src/assets/textures/gui/sprites/tooltip/background.png');
        this.image.attr('width', 84 * state.scale);
        this.image.attr('height', 84 * state.scale);
        this.image.attr('pointer-events', 'none');
        this.image2 = state.svg.append('image');
        this.image2.attr('href', './src/assets/textures/gui/sprites/tooltip/frame.png');
        this.image2.attr('width', 84 * state.scale);
        this.image2.attr('height', 84 * state.scale);
        this.image2.attr('pointer-events', 'none');

        state.svg.node().addEventListener('mousemove', (event) => {
            if (this.image != null) {
                this.image.attr('x', event.x);
                this.image.attr('y', event.y);
                this.image2.attr('x', event.x);
                this.image2.attr('y', event.y);
            }
        })
    }

    delete() {
        this.image.remove();
        this.image2.remove();
    }
}
