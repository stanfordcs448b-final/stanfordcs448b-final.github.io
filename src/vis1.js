import { airportdata } from "./data.js";
import { projection } from "./util.js";


const map = d3.select("#container1 #map");

const v1_flightdata = d3.csv("../data/v1_flights.csv", row => ({
    originId: +row.originId,
    destId: +row.destId,
    counts: +row.counts,
    delaycounts: +row.delaycounts,
}));


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
            let [pxX, pxY] = projection([d.long, d.lat]);
            return `translate(${pxX},${pxY})`;
        })
        .attr("r", _d => 5)
        .append("title")
        .text(d => d.code);
}
