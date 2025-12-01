import { airportdata } from "./data.js";
import { projection } from "./util.js";


const container = d3.select('#container3')
const map = d3.select("#container3 #canvas");


export async function plotBars() {
    map.append("g")
        .attr("fill", "green")
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
