import { airportdata, toydata } from "./data.js";
import { projection } from "./util.js";


const container = d3.select('#container3')
const leftCanvas = d3.select("#leftCanvas");

const color = ['#1459D9', '#daa520'];

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
