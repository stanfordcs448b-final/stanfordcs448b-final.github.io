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
    map.append("g")
        // attrs here
        .selectAll()
        .data(await v1_flightdata)
        .join("path")
        .attr("d", d => {
            return "1";
        })
}


export async function main() {
    return plotAirports()
           .then(plotFlights);
}