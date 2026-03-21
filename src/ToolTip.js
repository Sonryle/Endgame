import { state } from "./state.js"

export class ToolTip {
    constructor(text) {
        this.svgContainer = state.svg.append('svg').attr('class', 'tooltipcontainer');
        this.svgContainer.raise();

        const foreignObject = this.svgContainer.append('foreignObject')
            .attr('pointer-events', 'none')
            .attr('width', 30 * state.scale)
            .attr('height', 30 * state.scale)
            .style('position', 'relative')

        foreignObject.append('xhtml:div')
            .attr('class', 'tooltip')
            .style('width', '100%')
            .style('height', '100%')
            .style('border-image-width', state.scale.toString() + "0px")
            .style('position', 'absolute')
        foreignObject.append('xhtml:div')
            .attr('class', 'tooltipFrame')
            .style('width', '100%')
            .style('height', '100%')
            .style('border-image-width', state.scale.toString() + "0px")
            .style('position', 'absolute')

        this.svgContainer.attr('x', Math.trunc(state.mouseX / state.scale) * state.scale);
        this.svgContainer.attr('y', Math.trunc(state.mouseY / state.scale) * state.scale) - (11 * state.scale);
        state.svg.node().addEventListener('mousemove', (event) => {
            if (this.svgContainer != null) {
                this.svgContainer.attr('x', Math.trunc(state.mouseX / state.scale) * state.scale);
                this.svgContainer.attr('y', Math.trunc(state.mouseY / state.scale) * state.scale) - (11 * state.scale);
            }
        })
    }

    delete() {
        console.log("deleting");
        this.svgContainer.remove();
    }
}
