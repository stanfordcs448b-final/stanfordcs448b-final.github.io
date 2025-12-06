import { usmap, toydata } from "./data.js";

const canvas = d3.select("#canvas");

// https://observablehq.com/@d3/bubble-map/2
export async function setupMap(svgEl) {
    return usmap
    .then(usmap => {
        const bggroup = svgEl.append("g")
        const path = d3.geoPath();
    
        bggroup.append("path")
            .datum(topojson.feature(usmap, usmap.objects.nation))
            .attr("fill", "#d4d4d4ff")
            .attr("d", path);
        
        bggroup.append("path")
            .datum(topojson.mesh(usmap, usmap.objects.states, (a, b) => a !== b))
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-linejoin", "round")
            .attr("d", path);
    });
}

export async function setupCanvas() {
    return toydata;
}
