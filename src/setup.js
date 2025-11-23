import { usmap } from "./data.js";

const map = d3.select("#map");

// https://observablehq.com/@d3/bubble-map/2
export async function setupMap() {
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
