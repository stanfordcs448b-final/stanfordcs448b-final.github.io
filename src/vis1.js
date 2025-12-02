import { airportdata } from "./data.js";


const map = d3.select("#container1 #map");

const v1_flightdata = d3.csv("../data/v1_flights.csv", row => ({
    originId: +row.originId,
    destId: +row.destId,
    counts: +row.counts,
    delaycounts: +row.delaycounts,
}));


async function buildLookup() {
    return airportdata.then(data => data.reduce((acc, row) => {
        acc[row.id] = ({
            code: row.code,
            latpx: row.latpx, 
            longpx: row.longpx,
        });
        return acc;
    }, {}));
}

async function buildConnections() {
    return v1_flightdata.then(data => data.reduce((acc, row) => {
        if (!(row.originId in acc)) 
            acc[row.originId] = [];
        acc[row.originId].push({
            destId: row.destId, 
            counts: row.counts, 
            delaycounts: row.delaycounts
        });
        return acc;
    }, {}));
}

async function plotAirports() {
    const lookup = await buildLookup();
    const conn_index = await buildConnections();

    map.append("g")
        .selectAll()
        .data(await airportdata)
        .join("g")
        .each(async function(ad) {
            const group = d3.select(this);

            // Airport connections
            const connections = group.append("g")
                .attr("class", "connections")
                .selectAll()
                .data(conn_index[ad.id])
                .join("path")
                .attr("d", fd => {
                    const oport = lookup[ad.id];
                    const dport = lookup[fd.destId];
                    return `M ${oport.longpx} ${oport.latpx} Q ${(oport.longpx + dport.longpx) / 2} ${(oport.latpx + dport.latpx) / 2 - 30}, ${dport.longpx} ${dport.latpx}`;
                })
                .attr("visibility", "hidden");
            
            // Airport Label
            const label = group.append("g")
                .attr("class", "hoverdata")
                .attr("transform", `translate(${ad.longpx},${ad.latpx})`)
                .attr("visibility", "hidden");
            const text = label.append("text")
                .attr("x", 0).attr("y", 0)
            text.append("tspan")
                .attr("x", 0).attr("dy", "1.2em")
                .text(ad.code);
            const {width: bbwidth, height: bbheight} = label.node().getBBox();
            const margin = 8;
            label.insert('rect', ':first-child') // create background rect
                .attr("x", -margin)
                .attr("y", 0)
                .attr("width", bbwidth + 2 * margin)
                .attr("height", bbheight + 2 * margin);

            // Airport circle
            group.append("circle")
                .attr("class", "airport")
                .attr("transform", d => `translate(${d.longpx},${d.latpx})`)
                .attr("r", _d => 5)
                .on("mouseover", async function (_event, ad) {
                    connections.attr("visibility", "visible");
                    label.attr("visibility", "visible");
                })
                .on("mouseout", () => {
                    connections.attr("visibility", "hidden");
                    label.attr("visibility", "hidden");
                });
        });
}


export async function main() {
    return plotAirports()
}