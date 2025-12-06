import { airportdata } from "./data.js";


const map = d3.select("#container2 #map");
const delaygraph = d3.select("#container2 #delaygraph");

let x, y;
const delays = d3.csv("../data/v2_delays.csv", row => {
    let tmp = 0;
    return {
        id: +row["OriginAirportID"],
        cancelled: {val: +row["cancelled"], acc: tmp+=+row["cancelled"]},
        carrier: {val: +row["carrier"], acc: tmp+=+row["carrier"]},
        weather: {val: +row["weather"], acc: tmp+=+row["weather"]},
        nas: {val: +row["nas"], acc: tmp+=+row["nas"]},
        security: {val: +row["security"], acc: tmp+=+row["security"]},
        late: {val: +row["late"], acc: tmp+=+row["late"]},
    }
    // id: +row["OriginAirportID"],
    // data: [
    //     +row["cancelled"],
    //     +row["carrier"],
    //     +row["weather"],
    //     +row["nas"],
    //     +row["security"],
    //     +row["late"],
    // ]
})


const selectedAirports = new Set();

const width = 975;
const height = 240;
const marginLeft = 40;
const marginRight = 10;
const marginTop = 10;
const marginBottom = 10;

const delaygraphGroups = [
    {key: "cancelled", color: d3.schemeObservable10[0]},
    {key: "carrier", color: d3.schemeObservable10[1]},
    {key: "weather", color: d3.schemeObservable10[2]},
    {key: "nas", color: d3.schemeObservable10[3]},
    {key: "security", color: d3.schemeObservable10[4]},
    {key: "late", color: d3.schemeObservable10[5]},
]

async function drawGraphs() {
    const ad = await airportdata;
    const dls = (await delays)
        .filter(row => selectedAirports.has(row.id)) // airports we're interested in 

        const x = d3.scaleBand()
        .domain([...selectedAirports].map(id => ad.find(r => r.id === id).code))
        .range([marginLeft, width - marginRight])
        .padding(0.1);
    const y = d3.scaleLinear()
        .domain([0, dls.reduce((acc, curr) => Math.max(acc, curr.late.acc + curr.late.val), 0)])
        .rangeRound([height - marginBottom, marginTop]);
    
    delaygraph.selectAll("g")
        .data(delaygraphGroups)
        .join("g")
        .attr("fill", d => d.color)
        .selectAll("rect")
        .data((_d, i) => dls.map(row => ({
            id: row.id, 
            cval: row[delaygraphGroups[i].key], 
        })), d => d.id)
        .join("rect")
        .attr("x", d => x(ad.find(r => r.id === d.id).code))
        .attr("y", d => y(d.cval.acc))
        .attr("height", d => y(0) - y(d.cval.val))
        .attr("width", x.bandwidth())
    
    // horizontal axis
    delaygraph.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call(g => g.selectAll(".domain").remove())
    
    // vertical axis
    delaygraph.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(null, "s"))
        // .call(g => g.selectAll(".domain").remove());
}

async function plotAirports() {
    map.select(".airports")
        .selectAll("circle")
        .data(await airportdata)
        .join("circle")
        .attr("r", 5)
        .attr("opacity", 0.7)
        .attr("fill", "#383838ff")
        .attr("transform", d => `translate(${d.longpx},${d.latpx})`)
        .attr("data-selected", 0)
        .on("click", function(_event, data) {
            if (selectedAirports.has(data.id)) {
                selectedAirports.delete(data.id);
                d3.select(this).attr("data-selected", 0)
            } else if (selectedAirports.size < 10) {
                selectedAirports.add(data.id);
                d3.select(this).attr("data-selected", 1)
            }
            drawGraphs();
        });
}


export async function main() {
    return plotAirports();
}