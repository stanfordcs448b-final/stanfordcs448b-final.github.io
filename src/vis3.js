import { airportdata, toydata, airlinenames, airlinedata } from "./data.js";

const container = d3.select('#container3')
const leftCanvas = d3.select("#canvas");

const color = ['#1459D9', '#daa520'];
const leftWidth = +leftCanvas.attr("width");
const leftHeight = +leftCanvas.attr("height");
const marginTop = 30;
const marginRight = 0;
const marginBottom = 30;
const marginLeft = 40;
const barSize = 10;

let airline_dict;
let month_dict;
let origin_dict;
let time_dict;

async function updateGraph(newData) {
    
    const xscale = d3.scaleLinear()
        .domain([0, 1])
        .range([marginLeft, leftWidth - marginRight])

    // Declare the y (vertical position) scale.
    const yscale = d3.scaleLinear()
        .domain([0, 1])
        .range([leftHeight - marginBottom, marginTop])

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
    let data_key = d3.select("#firstDropdown").property('value');
    if(data_key === "dsAirline") {
        data = await airlinedata;

        // default value
        d3.select('#suggestionsInput').attr("value", "Delta");

        d3.select('#suggestions').selectChildren().remove();
        console.log(data[1])
        for(let key of Object.keys(airline_dict)) {
            let row = airline_dict[key];
            let option = d3.select('#suggestions').append('option');
            option.attr('value', airlinenames[row['key']]);
        }
    }

    return data;
}

function pivotDataset(data) {
    let obj = {};
    console.log(data);
    for(let row of data) {
        obj[row['key']] = { ...row };
    }

    return Object.keys(obj)
        .reduce((out_obj, key) => {
            out_obj[key] = obj[key];
            return out_obj;
        }, {});;
}

async function initData() {
    let unsorted_airline_dict = pivotDataset(await airlinedata);
    airline_dict = Object.keys(unsorted_airline_dict)
        .sort(
            (a, b) => airlinenames[a].localeCompare(airlinenames[b])
            )
        .reduce((obj, key) => { 
            obj[key] = unsorted_airline_dict[key];
            return obj;
        }, {});
    console.log(airline_dict);
}

export async function plotBars() {
    initData();

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
