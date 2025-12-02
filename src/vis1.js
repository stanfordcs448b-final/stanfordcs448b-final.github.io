import { airportdata } from "./data.js";
import { redBlue } from "./util.js";


const map = d3.select("#container1 #map");
const sidebar = d3.select("#container1 .sidebar")

const v1_flightdata = d3.csv("../data/v1_flights.csv", row => ({
    originId: +row.originId,
    destId: +row.destId,
    count: +row.count,
    delaycount: +row.delaycount,
}));


/** @returns {Promise<Record<number, {code: number, dispName: string, latpx: number, longpx: number}>>} */
async function buildLookup() {
    return airportdata.then(data => data.reduce((acc, row) => {
        acc[row.id] = ({
            code: row.code,
            dispName: row.dispName,
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
        .attr("opacity", value ? 0.9 : 0.05)
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
                .attr("opacity", 0.05)
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
                .attr("stroke", d => redBlue(d.delayfrac))
                .each(function(flightDatum, idx, nodes) {
                    const margin = 4;
                    const oport = lookup[airportDatum.id];
                    const dport = lookup[flightDatum.destId];

                    // Individual Path labels
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

                    // Update sidebar
                    sidebar.select("h2")
                        .text(airportDatum.dispName);
                    
                    let conn_data = conn_index[airportDatum.id];
                    const total_flights = conn_data.reduce((acc, path) => acc + path.count, 0);
                    const total_delays = conn_data.reduce((acc, path) => acc + path.delaycount, 0);
                    sidebar.select("#summary")
                        .text(`${total_delays} flights delayed of ${total_flights} total flights (${(100 * total_delays / total_flights).toFixed(1)})%`);
                    
                    sidebar.select("#routes")
                        .selectAll("tr")
                        .data(conn_data.sort((a, b) => b.delayfrac - a.delayfrac), d => d.destId)
                        .join(
                            enter => {
                                let tr = enter.append("tr");
                                tr.append("td")
                                    .text(d => lookup[d.destId].code)
                                let val = tr.append("td")
                                val.append("div")
                                    .attr("class", "inlinebar")
                                    .style("width", d => 110 * d.delayfrac)
                                    .style("background-color", d => redBlue(d.delayfrac));
                                val.append("div")
                                    .style("display", "inline-block")
                                    .text(d => `${(100 * d.delayfrac).toFixed(1)}% (${d.delaycount}/${d.count})`);
                                return tr;
                            }, 
                            update => {
                                const td = update.select(":last-child")
                                td.select(":first-child")
                                    .style("width", d => 110 * d.delayfrac)
                                    .style("background-color", d => redBlue(d.delayfrac));
                                td.select(":last-child")
                                    .text(d => `${(100 * d.delayfrac).toFixed(1)}% (${d.delaycount}/${d.count})`);
                                return update;
                            }
                        );
                }
            });
        });
}


export async function main() {
    return plotAirports()
}