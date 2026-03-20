export class Item {
    constructor(href, scale, svg) {
        this.image = svg.append('image');

        this.image.attr('href', href);
        this.image.attr('width', 16 * scale);
        this.image.attr('height', 16 * scale);
        this.isBeingDragged = false;

        this.image.on('click', (event) => {
            if (this.isBeingDragged == true) {
                this.isBeingDragged = false;
            } else {
                this.isBeingDragged = true;
                this.image.raise(); // Raise element to top
            }
        });
        svg.node().addEventListener('mousemove', (event) => {
            if (this.isBeingDragged) {
                this.image.attr('x', event.x - this.image.attr('width') / 2)
                this.image.attr('y', event.y - this.image.attr('height') / 2)
            }
        });
    }
}
