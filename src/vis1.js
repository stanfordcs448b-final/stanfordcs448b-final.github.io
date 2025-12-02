import { airportdata } from "./data.js";


const map = d3.select("#container1 #map");

const v1_flightdata = d3.csv("../data/v1_flights.csv", row => ({
    originId: +row.originId,
    destId: +row.destId,
    counts: +row.counts,
    delaycounts: +row.delaycounts,
}));


async function buildLookup() {
    const lookup = {};
    return airportdata.then(data => data.forEach(
        row => lookup[row.id] = {
            code: row.code,
            latpx: row.latpx, 
            longpx: row.longpx,
        }
    )).then(_ => lookup);
}

async function plotAirports() {
    const lookup = await buildLookup();
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
        .on("mouseover", async function (event, ad) {
            const hoverdata = map.append("g")
                .attr("class", "hoverdata")
            const active_label = hoverdata.append("g")
                .attr("transform", `translate(${ad.longpx},${ad.latpx})`);
            
            // Label
            const text = active_label.append("text").attr("x", 0).attr("y", 0);
            text.append("tspan").attr("x", 0).attr("dy", "1.2em")
                .text(ad.code);
            const {width: bbwidth, height: bbheight} = active_label.node().getBBox();
            const margin = 8;
            active_label.insert('rect', ':first-child') // create background rect
                .attr("x", -margin)
                .attr("y", 0)
                .attr("width", bbwidth + 2 * margin)
                .attr("height", bbheight + 2 * margin);
            
            hoverdata.append("g")
                .attr("stroke", "#444")
                .attr("stroke-width", 1.5)
                .attr("fill", "none")
                .selectAll()
                .data((await v1_flightdata).filter(fd => fd.originId === ad.id))
                .join("path")
                .attr("d", fd => {
                    const oport = lookup[fd.originId];
                    const dport = lookup[fd.destId];
                    return `M ${oport.longpx} ${oport.latpx} Q ${(oport.longpx + dport.longpx) / 2} ${(oport.latpx + dport.latpx) / 2 - 30}, ${dport.longpx} ${dport.latpx}`;
                });
        })
        .on("mouseout", () => map.selectAll(".hoverdata").remove())
}


export async function main() {
    return plotAirports()
}