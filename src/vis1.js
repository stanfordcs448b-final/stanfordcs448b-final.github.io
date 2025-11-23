import { airportdata } from "./data.js";
import { map, projection } from "./util.js";


export async function plotPoints() {
    map.append("g")
        .attr("fill", "brown")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .selectAll()
        .data(await airportdata)
        .join("circle")
        .attr("transform", d => {
            let [pxX, pxY] = projection([Number(d.LONGITUDE), Number(d.LATITUDE)]);
            return `translate(${pxX},${pxY})`;
        })
        .attr("r", _d => 4)
        .append("title")
        .text(d => d.AIRPORT);
}
