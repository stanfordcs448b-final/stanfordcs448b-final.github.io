import { airportdata } from "./data.js";
import { redBlue } from "./util.js";

const getColor = val => redBlue(val * 2.0);


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

/** @returns {Promise<Record<number, {dests: {destId: number, count: number, delaycount: number, delayfrac: number}[], total_delays: number, total_flights: number}>>} */
async function buildConnections() {
    return v1_flightdata.then(data => data.reduce((acc, row) => {
        if (!(row.originId in acc)) 
            acc[row.originId] = {dests: [], total_delays: 0, total_flights: 0};
        
        acc[row.originId].dests.push({
            destId: row.destId, 
            count: row.count, 
            delaycount: row.delaycount,
            delayfrac: row.delaycount / row.count,
        });
        acc[row.originId].total_delays += row.delaycount;
        acc[row.originId].total_flights += row.count;
        return acc;
    }, {}));
}

let selectedAirport = null;
/** @type {Record<number, {routes: d3.Selection<SVGGElement, any, HTMLElement, any>, label: d3.Selection<SVGGElement, any, HTMLElement, any>, dests: number[], destSelection: d3.Selection, airport: d3.Selection}>} */
let airportDOMIndex = {};

/**
 * @param {number} id 
 * @param {boolean} value */
function setActive(id, value) {
    airportDOMIndex[id].routes
        .attr("opacity", value ? 0.65 : 0.03)
        .attr("stroke-width", value ? 4.0 : 1.5)
        .raise();
    airportDOMIndex[id].label
        .attr("visibility", value ? "visible" : "hidden");
}

function setSelected(id, value) {
    if (value) {
        d3.select(".airports").selectAll("circle")
            .attr("data-active", 0);
        airportDOMIndex[id].destSelection
            .attr("data-active", 1);
        airportDOMIndex[id].airport
            .attr("data-active", 1);
    } else {
        d3.select(".airports").selectAll("circle")
            .attr("data-active", 1);
    }
}

/**
 * 
 * @param {{id: number, code: string, dispName: string, latpx: number, longpx: number}} airportDatum 
 * @param {Record<number, {code: number, dispName: string, latpx: number, longpx: number}>} lookup 
 * @param {Record<number, {dests: {destId: number, count: number, delaycount: number, delayfrac: number}[], total_delays: number, total_flights: number}>} conn_index 
 */
function updateSidebar(airportDatum, lookup, conn_index) {
    // Update sidebar
    sidebar.select("#airportname")
        .text(airportDatum.dispName);

    const { dests, total_delays, total_flights } = conn_index[airportDatum.id];
    sidebar.select("#summary")
        .text(`${total_delays} flights delayed of ${total_flights} total flights (${(100 * total_delays / total_flights).toFixed(1)})%`);
        
    const barWidth = 100;
    sidebar.select("#routetable")
        .selectAll("tr")
        .data(dests.sort((a, b) => b.delayfrac - a.delayfrac), d => d.destId)
        .join(
            enter => {
                let tr = enter.append("tr");
                tr.attr("title", d => `${lookup[d.destId].dispName} (${d.delaycount}/${d.count})`);
                tr.append("td")
                    .text(d => lookup[d.destId].code)
                let val = tr.append("td")
                    .attr("width", barWidth);
                val.append("div")
                    .attr("class", "inlinebar")
                    .style("width", d => barWidth * d.delayfrac)
                    .style("background-color", d => getColor(d.delayfrac))
                    .style("margin-left", "4px");
                tr.append("td")
                    .text(d => `${(100 * d.delayfrac).toFixed(1)}%`);
                return tr;
            }, 
            update => {
                update.attr("title", d => `${lookup[d.destId].dispName} (${d.delaycount}/${d.count})`);
                update.select(":nth-child(2)").select("div")
                    .style("width", d => barWidth * d.delayfrac)
                    .style("background-color", d => getColor(d.delayfrac));
                update.select(":nth-child(3)")
                    .text(d => `${(100 * d.delayfrac).toFixed(1)}%`);
                return update;
            }
        );
    //@ts-ignore
    const headerHeight = sidebar.select("#sidebarheader").node().offsetHeight;
    //@ts-ignore
    const mapHeight = sidebar.node().offsetHeight;
    sidebar.select("#routes")
        .style("height", `calc(${mapHeight}px - ${headerHeight}px - 36px)`);
}



async function plotAirports() {
    // await our lookup table builds simultaneously
    const [lookup, conn_index] = await Promise.all([
        buildLookup(), 
        buildConnections(),
    ]);

    const airportElems = []
    // put a bunch of dummy elements in .d3cache that we will bind the data to.
    // we will use functions like .each to actually create the DOM elements we want
    d3.select("#container1 .d3cache").selectAll("p")
        .data(await airportdata, d => d.id)
        .join("p")
        .each(function(airportDatum) {
            const {dests, total_flights, total_delays} = conn_index[airportDatum.id];

            // Flight route edges
            const routeEdges = map.select(".connections").append("g");
            const oport = lookup[airportDatum.id];
            routeEdges
                .attr("opacity", 0.03)
                .selectAll("path")
                .data(dests.sort((a, b) => a.delayfrac - b.delayfrac))
                .join("path")
                .each(function(flightDatum) {
                    // vars we need to reference multiple times
                    const dport = lookup[flightDatum.destId];
                    
                    const margin = 4;
                    /** @type {d3.Selection<SVGGElement, any, HTMLElement, any>}*/
                    let label;

                    d3.select(this)
                        .attr("d",  // set route path
                            `M ${oport.longpx} ${oport.latpx} `
                            + `Q ${(oport.longpx + dport.longpx) / 2} ${(oport.latpx + dport.latpx) / 2 - 60}, `
                            + `${dport.longpx} ${dport.latpx}`
                        )
                        .attr("stroke", getColor(flightDatum.delayfrac))
                        .on("mouseover", function(event) {
                            if (selectedAirport !== airportDatum.id) return;
                            // Draw label
                            label = map.select(".labels").append("g")
                                .attr("class", "hoverdata")
                                .attr("transform", `translate(${event.offsetX},${event.offsetY})`);
                            const text = label.append("text")
                                .attr("x", 0).attr("y", 0)
                            text.append("tspan")
                                .attr("x", 0).attr("dy", "1.0em")
                                .text(`${airportDatum.code} → ${dport.code}`);
                            
                            // draw label background
                            const {width, height} = label.node().getBBox();
                            label.insert("rect", ":first-child")
                                .attr("x", -margin)
                                .attr("y", -margin)
                                .attr("width", width + 2 * margin)
                                .attr("height", height + 2 * margin);
                        })
                        .on("mouseout", () => label?.remove());
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
            
            // Airport dots
            const airport = map.select(".airports").append("circle");
            airport
                .attr("transform", `translate(${airportDatum.longpx},${airportDatum.latpx})`)
                .attr("fill", getColor(total_delays / total_flights))
                .attr("data-active", 1)
                .attr("r", 5)
                .on("mouseover", function() {
                    setActive(airportDatum.id, true);
                    if (selectedAirport === null) {
                        updateSidebar(airportDatum, lookup, conn_index);
                    }
                })
                .on("mouseout", function() {
                    if (selectedAirport !== airportDatum.id) {
                        setActive(airportDatum.id, false);
                    }
                })
                .on("click", function() {
                    if (selectedAirport === airportDatum.id) {
                        selectedAirport = null;
                        setSelected(selectedAirport, false)
                        return;
                    }

                    if (selectedAirport !== null) {
                        setActive(selectedAirport, false);
                    }
                    selectedAirport = airportDatum.id;
                    setSelected(selectedAirport, true)
                    updateSidebar(airportDatum, lookup, conn_index);
                });
            // airportElems.push(airport);

            airportDOMIndex[airportDatum.id] = {
                routes: routeEdges, 
                label: airportLabel,
                dests: dests.map(d => d.destId),
                destSelection: null,
                airport: airport,
            };
        })
        // compute destination selection for each airport
        .call(selection => Object.values(airportDOMIndex).forEach(airport => {
            const indices = [];
            selection.each((airportDatum, idx) => {
                if (airport.dests.find(i => i == airportDatum.id)) {
                    indices.push(idx)
                }
            });
            airport.destSelection = d3.select(".airports")
                .selectAll("circle")
                .filter((_d, idx) => indices.find(i => i == idx));
        }));
    
    
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