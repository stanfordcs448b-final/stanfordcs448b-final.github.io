import { airportdata } from "./data.js";
import { redGreen } from "./util.js";


const map = d3.select("#container1 #map");

const v1_flightdata = d3.csv("../data/v1_flights.csv", row => ({
    originId: +row.originId,
    destId: +row.destId,
    count: +row.count,
    delaycount: +row.delaycount,
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

/** @returns {Promise<Record<number, {destId: number, count: number, delaycount: number, delayfrac: number}[]>>} */
async function buildConnections() {
    return v1_flightdata.then(data => data.reduce((acc, row) => {
        if (!(row.originId in acc)) 
            acc[row.originId] = [];
        acc[row.originId].push({
            destId: row.destId, 
            count: row.count, 
            delaycount: row.delaycount,
            delayfrac: row.delaycount / row.count,
        });
        return acc;
    }, {}));
}

let selectedAirport = null;
/** @type {Record<number, {connections: d3.Selection<SVGGElement, any, HTMLElement, any>, label: d3.Selection<SVGGElement, any, HTMLElement, any>}>} */
let airportDOMIndex = {};

/**
 * @param {number} id 
 * @param {boolean} value */
function setVisible(id, value) {
    airportDOMIndex[id].connections
        .attr("opacity", value ? 0.9 : 0.015)
        .attr("stroke-width", value ? 3.0 : 1.5)
        .raise();
    airportDOMIndex[id].label
        .attr("visibility", value ? "visible" : "hidden");
}

async function plotAirports() {
    const [lookup, conn_index] = await Promise.all([
        buildLookup(), 
        buildConnections(),
    ]);

    d3.select("#container1 .d3cache").selectAll("p")
        .data(await airportdata, d => d.id)
        .join("p")
        .each(function(airportDatum) {

            // Flight connections
            const connections = map.select(".connections").append("g");
            connections
                .attr("opacity", 0.015)
                .selectAll("path")
                .data(conn_index[airportDatum.id])
                .join("path")
                .attr("d", flightDatum => {
                    const oport = lookup[airportDatum.id];
                    const dport = lookup[flightDatum.destId];
                    return `M ${oport.longpx} ${oport.latpx} `
                         + `Q ${(oport.longpx + dport.longpx) / 2} ${(oport.latpx + dport.latpx) / 2 - 30}, `
                         + `${dport.longpx} ${dport.latpx}`;
                })
                .attr("stroke", d => redGreen(d.delayfrac))
                .each(function(flightDatum, idx, nodes) {
                    const margin = 4;
                    const oport = lookup[airportDatum.id];
                    const dport = lookup[flightDatum.destId];

                    const pathLabel = map.select(".labels").append("g")
                        .attr("class", "hoverdata")
                        .attr("visibility", "hidden")
                        .attr("transform", `translate(${(oport.longpx + dport.longpx) / 2},${(oport.latpx + dport.latpx) / 2})`)
                    const text = pathLabel.append("text")
                        .attr("x", 0).attr("y", 0)
                    text.append("tspan")
                        .attr("x", 0).attr("dy", "1.0em")
                        .text(`${airportDatum.code} -> ${lookup[flightDatum.destId].code}`);
                    const {width: bbwidth, height: bbheight} = pathLabel.node().getBBox();
                    pathLabel.insert("rect", ":first-child")
                        .attr("x", -margin)
                        .attr("y", -margin)
                        .attr("width", bbwidth + 2 * margin)
                        .attr("height", bbheight + 2 * margin)
                    
                    d3.select(this).on("mouseover", function(_event, _data) {
                        if (selectedAirport !== airportDatum.id) return;

                        pathLabel.attr("visibility", "visible");
                    })
                    .on("mouseout", function(_event, _data) {
                        pathLabel.attr("visibility", "hidden");
                    })
                });
            

            // Airport labels
            const margin = 4;
            const airportLabel = map.select(".labels").append("g")
                .attr("class", "hoverdata")
                .attr("transform", `translate(${airportDatum.longpx + margin},${airportDatum.latpx + margin})`)
                .attr("visibility", "hidden");
            const text = airportLabel.append("text")
                .attr("x", 0).attr("y", 0)
            text.append("tspan")
                .attr("x", 0).attr("dy", "1.0em")
                .text(airportDatum.code);
            // text.append("tspan")
            //     .attr("x", 0).attr("dy", "1.2em")
            //     .text(ad.code);
            const {width: bbwidth, height: bbheight} = airportLabel.node().getBBox();
            airportLabel.insert("rect", ":first-child") // create background rect
                .attr("x", -margin)
                .attr("y", -margin)
                .attr("width", bbwidth + 2 * margin)
                .attr("height", bbheight + 2 * margin);


            airportDOMIndex[airportDatum.id] = {connections, label: airportLabel};
            
            // Airport dots
            const airport = map.select(".airports").append("circle");
            airport
                .attr("transform", `translate(${airportDatum.longpx},${airportDatum.latpx})`)
                .attr("r", _d => 5)
            .on("mouseover", function(_event, _data) {
                setVisible(airportDatum.id, true);
            })
            .on("mouseout", function(_event, _data) {
                if (selectedAirport !== airportDatum.id) {
                    setVisible(airportDatum.id, false);
                }
            })
            .on("click", function(_event, _data) {
                if (selectedAirport === airportDatum.id) {
                    selectedAirport = null;
                } else {
                    if (selectedAirport !== null) {
                        setVisible(selectedAirport, false);
                    }
                    selectedAirport = airportDatum.id;
                }
            });
        });
}


export async function main() {
    return plotAirports()
}