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
const barSize = 10;

async function updateGraph(newData) {
    await newData;
    console.log(newData);
    
    const xscale = d3.scaleLinear()
        .domain([0, 1])
        .range([marginLeft, leftWidth - marginRight])

    // Declare the y (vertical position) scale.
    const yscale = d3.scaleLinear()
        .domain([0, 1])
        .range([leftHeight - marginBottom, marginTop])
        
    console.log(newData)

    // bind data
    const appending = leftCanvas.selectAll('rect')
       .data(newData)
       .join('rect')
       .attr('x', marginLeft)
       .attr('y', (d) => d.key)
       .attr('width', d => 100)
       .attr('height', 100)
       .style('fill', d => color[0])
       .style('stroke', 'black')
       .text(d => d["origin"]);
}

async function updateDataState() {
    let data;
    data = await airlinedata;

    let data_key = d3.select("#firstDropdown").property('value');
    console.log(data_key);
    if(data_key === "dsAirline") {
        d3.select('#suggestionsInput').attr("value", "Blue");
        d3.select('#suggestions').selectChildren().remove();
    }
    console.log(data);

    return data;
}

export async function plotBars() {
    // Declare the x (horizontal position) scale.
    
    
    // generate initial legend
    let data = updateDataState();
    updateGraph(data);

    // handle on click event
    d3.select('#menuDiv')
    .on('change', function() {
        data = updateDataState();
        updateGraph(data);
    });
}
