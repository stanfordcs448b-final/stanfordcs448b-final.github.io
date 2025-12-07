import { airportdata } from "./data.js";
import { redBlue } from "./util.js";


const map = d3.select("#container2 #map");
const delaygraph = d3.select("#container2 #delaygraph");

const delays = d3.csv("../data/v2_delays.csv", row => {
    let tmp = 0;
    let c;
    return {
        id: +row["OriginAirportID"],
        carrier:   { val: c = +row["carrier"],   acc: tmp += c },
        weather:   { val: c = +row["weather"],   acc: tmp += c },
        nas:       { val: c = +row["nas"],       acc: tmp += c },
        security:  { val: c = +row["security"],  acc: tmp += c },
        late:      { val: c = +row["late"],      acc: tmp += c },
        cancelled: { val: c = +row["cancelled"], acc: tmp += c },
    }
})


const selectedAirports = new Set();

const width = 975;
const height = 240;
const marginLeft = 40;
const marginRight = 160;
const marginTop = 10;
const marginBottom = 10;

const delayGraphGroups = [
    {key: "carrier",   color: redBlue(0.8)},
    {key: "weather",   color: redBlue(0.9)},
    {key: "nas",       color: redBlue(0.2)},
    {key: "security",  color: d3.schemeTableau10[4]},
    {key: "late",      color: redBlue(0.65)},
    {key: "cancelled", color: redBlue(0.1)},
]

const legendText = {
    carrier: "Carrier",
    weather: "Weather",
    nas: "National Air System",
    security: "Security",
    late: "Late Plane",
    cancelled: "Cancelled",
};

async function drawGraphs() {
    const ad = await airportdata;
    const dls = (await delays)
        .filter(row => selectedAirports.has(row.id)) // airports we're interested in 

    //@ts-expect-error
    const doNormalize = d3.select("#container2 #delayNormalize").node().checked;
    //@ts-expect-error
    const includeCancellations = d3.select("#container2 #includeCancellations").node().checked;

    const x = d3.scaleBand()
        .domain([...selectedAirports].map(id => ad.find(r => r.id === id).code))
        .range([marginLeft, width - marginRight])
        .padding(0.1);
    const y = d3.scaleLinear()
        .domain(doNormalize 
            ? [0, 100]
            : [0, dls.reduce((acc, curr) => {
                    const last = includeCancellations ? curr.cancelled : curr.late;
                    return Math.max(acc, last.acc + last.val);
                }, 0)]
        )
        .range([height - marginBottom, marginTop]);

    delaygraph.select("#bars")
        .selectAll("g")
        .data(delayGraphGroups.filter(g => includeCancellations || g.key !== "cancelled"))
        .join("g")
        .attr("fill", d => d.color)
        .selectAll("rect")
        .data(d => dls.map(row => ({
            id: row.id, 
            key: d.key,
            cval: row[d.key],
            total: doNormalize ? 0.01 * (
                (includeCancellations ? row.cancelled.val : 0) 
                + row.carrier.val 
                + row.late.val 
                + row.nas.val 
                + row.security.val 
                + row.weather.val
            ) : 1,
        })), d => `${d.id} ${d.total}`)
        .join("rect")
        .attr("x", d => x(ad.find(r => r.id === d.id).code))
        .attr("y", d => y(d.cval.acc / d.total))
        .attr("height", d => y(0) - y(d.cval.val / d.total))
        .attr("width", x.bandwidth())
        .append("title")
        .text(d => `${legendText[d.key]}: ${doNormalize ? (d.cval.val / d.total).toFixed(1) : d.cval.val}${doNormalize ? "%" : ""}`);

    const axes = delaygraph.select("#axes");
    axes.selectAll("g").remove();

    // horizontal axis
    axes.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .call(g => g.selectAll(".domain").remove())

    // vertical axis
    axes.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).ticks(null, "s"))
        // .call(g => g.selectAll(".domain").remove());

    // legend
    map.select("#legend")
        .selectAll("g")
        .data(delayGraphGroups)
        .join(enter => {
            const group = enter.append("g")
                .attr("transform", (_d,i) => `translate(0, ${24 * i})`);
            group.append("circle")
                .attr("fill", d => d.color)
                .attr("r", 8)
                .attr("cx", 0)
                .attr("cy", 0)
            group.append("text")
                .text(d => legendText[d.key])
                .attr("x", 24)
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle");
            return group;
        });
}

let starterAirport = [];

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
        })
        .each(function(airportDatum) {
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
            
            d3.select(this)
                .on("mouseover", () => airportLabel.attr("visibility", "visible"))
                .on("mouseout", () => airportLabel.attr("visibility", "hidden"));
            
            if ([13232, 10821, 14771, 11637].includes(airportDatum.id)) {
                starterAirport.push(d3.select(this));
            }
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
    return plotAirports().then(() => ["mouseover", "click"].forEach(
            e => starterAirport.forEach(a => a.node().dispatchEvent(new Event(e)))
        )).then(() => {
            d3.select("#container2 #delayNormalize").on("click", drawGraphs);
            d3.select("#container2 #includeCancellations").on("click", drawGraphs);
        });
}