import { airportdata } from "./data.js";


const map = d3.select("#container1 #map");

const v1_flightdata = d3.csv("../data/v1_flights.csv", row => ({
    originId: +row.originId,
    destId: +row.destId,
    counts: +row.counts,
    delaycounts: +row.delaycounts,
}));


async function plotAirports() {
    map.append("g")
        .attr("fill", "brown")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .selectAll()
        .data(await airportdata)
        .join("circle")
        .attr("transform", d => `translate(${d.longpx},${d.latpx})`)
        .attr("r", _d => 5)
        .append("title")
        .text(d => d.code);
}

async function plotFlights() {
    let airport_lookup = {};
    airportdata.then(data => data.forEach(
        row => airport_lookup[row.id] = {latpx: row.latpx, longpx: row.longpx}
    ))
    map.append("g")
        .attr("stroke", "#ddd")
        .attr("stroke-width", 0.4)
        .selectAll()
        .data(await v1_flightdata)
        .join("path")
        .attr("d", d => {
            let oport = airport_lookup[d.originId];
            let dport = airport_lookup[d.destId];
            return `M ${oport.longpx} ${oport.latpx} L ${dport.longpx} ${dport.latpx}`;
        })
}


export async function main() {
    return plotAirports()
           .then(plotFlights);
}