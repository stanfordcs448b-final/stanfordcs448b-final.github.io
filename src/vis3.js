import { airportdata, toydata, airlinedata } from "./data.js";

const container = d3.select('#container3')
const leftCanvas = d3.select("#leftCanvas");

const color = ['#1459D9', '#daa520'];
const leftWidth = +leftCanvas.attr("width");
const leftHeight = +leftCanvas.attr("height");
const marginTop = 30;
const marginRight = 0;
const marginBottom = 30;
const marginLeft = 40;

// Declare the x (horizontal position) scale.
const x = d3.scaleBand()
    .domain([0, d3.max(airlinedata, (d) => airlinedata.total)])
    .range([marginLeft, leftWidth - marginRight])
    .padding(0.1);

// Declare the y (vertical position) scale.
const y = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => d.frequency)])
    .range([leftHeight - marginBottom, marginTop]);

function updateData(newData) {
    console.log(newData);

    // bind data
    const appending = leftCanvas.selectAll('rect')
       .data(newData);

    // add new elements
    appending.enter().append('rect');

    // update existing elements
    appending.transition()
        .duration(0)
        .style("fill", function(d,i){return color[i];})
        .attr("x", 10)
        .attr("y", 10)
        .attr("width",function (d) {return d.y; })//d.y;})
        .attr("height", 19);

    // remove old elements
    appending.exit().remove();
}

export async function plotBars() {
    leftCanvas.append("g");

    // generate initial legend
    updateData(toydata["ds2"]);

    // handle on click event
    d3.select('#menuDiv')
    .on('change', function() {
        let newData = d3.select("#firstDropdown").property('value');
        updateData(toydata[newData]);
    });
}
