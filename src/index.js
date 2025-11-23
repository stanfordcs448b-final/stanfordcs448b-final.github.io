import { airportdata, usmap } from "./data.js";

const map = d3.select("#map");
const projection = d3.geoAlbers().scale(1300).translate([487.5, 305])

// https://observablehq.com/@d3/bubble-map/2
async function setupMap() {
    return usmap
    .then(usmap => {
        const path = d3.geoPath();
    
        map.append("path")
            .datum(topojson.feature(usmap, usmap.objects.nation))
            .attr("fill", "#ddd")
            .attr("d", path);
        
        map.append("path")
            .datum(topojson.mesh(usmap, usmap.objects.states, (a, b) => a !== b))
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-linejoin", "round")
            .attr("d", path);
    });
    
}

async function plotPoints() {
    const format = d3.format(",.0f");
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
        .attr("r", d => 4)
        .append("title")
        .text(d => d.AIRPORT);
}

setupMap()
.then(plotPoints);