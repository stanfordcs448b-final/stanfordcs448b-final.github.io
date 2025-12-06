import { airportdata } from "./data.js";
import { redBlue } from "./util.js";

const getColor = (val) => redBlue(val * 2.0);


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
        .attr("opacity", value ? 1.0 : 0.03)
        .attr("stroke-width", value ? 3.0 : 1.5)
        .raise();
    airportDOMIndex[id].label
        .attr("visibility", value ? "visible" : "hidden");
}

async function plotAirports() {
    // await our lookup table builds simultaneously
    const [lookup, conn_index] = await Promise.all([
        buildLookup(), 
        buildConnections(),
    ]);

    // put a bunch of dummy elements in .d3cache that we will bind the data to.
    // we will use functions like .each to actually create the DOM elements we want
    d3.select("#container1 .d3cache").selectAll("p")
        .data(await airportdata, d => d.id)
        .join("p")
        .each(function(airportDatum) {

            // Flight route edges
            const routeEdges = map.select(".connections").append("g");
            routeEdges
                .attr("opacity", 0.03)
                .selectAll("path")
                .data(conn_index[airportDatum.id])
                .join("path")
                .each(function(flightDatum) {
                    // vars we need to reference multiple times
                    const oport = lookup[airportDatum.id];
                    const dport = lookup[flightDatum.destId];
                    
                    const margin = 4;
                    /** @type {d3.Selection<SVGGElement, any, HTMLElement, any>}*/
                    let label;

                    d3.select(this)
                        .attr("d",  // set route path
                            `M ${oport.longpx} ${oport.latpx} `
                            + `Q ${(oport.longpx + dport.longpx) / 2} ${(oport.latpx + dport.latpx) / 2 - 30}, `
                            + `${dport.longpx} ${dport.latpx}`
                        )
                        .attr("stroke", getColor(flightDatum.delayfrac))
                        .on("mouseover", function() {
                            if (selectedAirport !== airportDatum.id) return;
                            
                            // Draw label
                            label = map.select(".labels").append("g")
                                .attr("class", "hoverdata")
                                .attr("transform", `translate(${(oport.longpx + dport.longpx) / 2},${(oport.latpx + dport.latpx) / 2})`)
                            const text = label.append("text")
                                .attr("x", 0).attr("y", 0)
                            text.append("tspan")
                                .attr("x", 0).attr("dy", "1.0em")
                                .text(`${airportDatum.code} → ${lookup[flightDatum.destId].code}`);
                            
                            // draw label background
                            const {width, height} = label.node().getBBox();
                            label.insert("rect", ":first-child")
                                .attr("x", -margin)
                                .attr("y", -margin)
                                .attr("width", width + 2 * margin)
                                .attr("height", height + 2 * margin);
                            console.log(label);
                        })
                        .on("mouseout", function() {
                            label?.remove();
                        });
                });

            // Airport labels
            const offset = 12;
            const airportLabel = map.select(".labels").append("g")
                .attr("class", "hoverdata")
                .attr("transform", `translate(${airportDatum.longpx + offset},${airportDatum.latpx - offset})`)
                .attr("visibility", "hidden");
            const text = airportLabel.append("text")
                .attr("x", 0).attr("y", 0)
            text.append("tspan")
                .attr("x", 0).attr("dy", "1.0em")
                .text(airportDatum.code);
            // text.append("tspan")
            //     .attr("x", 0).attr("dy", "1.2em")
            //     .text(ad.code);


            airportDOMIndex[airportDatum.id] = {connections: routeEdges, label: airportLabel};
            
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
                        return;
                    }

                    if (selectedAirport !== null) {
                        setVisible(selectedAirport, false);
                    }
                    selectedAirport = airportDatum.id;

                    // Update sidebar
                    sidebar.select("#airportname")
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
                                tr.attr("title", d => lookup[d.destId].dispName);
                                tr.append("td")
                                    .text(d => lookup[d.destId].code)
                                let val = tr.append("td")
                                    .attr("width", 110);
                                val.append("div")
                                    .attr("class", "inlinebar")
                                    .style("width", d => 110 * d.delayfrac)
                                    .style("background-color", d => getColor(d.delayfrac))
                                    .style("margin-left", "4px");
                                tr.append("td")
                                    .text(d => `${(100 * d.delayfrac).toFixed(1)}% (${d.delaycount}/${d.count})`);
                                return tr;
                            }, 
                            update => {
                                update.select(":nth-child(2)").select("div")
                                    .style("width", d => 110 * d.delayfrac)
                                    .style("background-color", d => getColor(d.delayfrac));
                                update.select(":nth-child(3)")
                                    .text(d => `${(100 * d.delayfrac).toFixed(1)}% (${d.delaycount}/${d.count})`);
                                return update;
                            }
                        );
                });
        });
    
    // add backgrounds to airport labels
    const margin = 4;
    map.select(".labels").selectAll("g")
        .each(function() {
            /** @type {d3.Selection<SVGGElement, any, HTMLElement, any>} */
            // @ts-ignore
            const label = d3.select(this);
            const {width, height} = label.node().getBBox();
            label.insert("rect", ":first-child")
                .attr("x", -margin)
                .attr("y", -margin)
                .attr("width", width + 2 * margin)
                .attr("height", height + 2 * margin)
        });
}


export async function main() {
    return plotAirports()
}