import { 
    origindata,
    airlinenames
} from "./data.js";

import { redBlue } from "./util.js";

const container = d3.select('#container4')
const graphCanvas = d3.select("#graphCanvas");

const width = +graphCanvas.attr("width");
let height = +graphCanvas.attr("height");
const marginTop = 50;
const marginRight = 50;
const marginBottom = 50;
let marginLeft = 100;
const margin = {marginTop, marginRight, marginBottom, marginLeft};
const barSize = 10;

let origin_dict;
let airline_dict;
let data;

async function drawGraph() {

    let data_dict = airline_dict;
    let rows_to_graph = [];
    let row_names = [];
    let row_by_key = reverseDict(airlinenames);

    const barHeight = 20;
    const barSpacing = 1.5;
    let key_top = marginTop + rows_to_graph.length * barHeight * barSpacing + 15;
    height = key_top + 75;
    graphCanvas.attr('height', height);
    graphCanvas.attr('viewBox', '0 0 1000 ' + height);
    
    // Declare the y (vertical position) scale.
    const yscale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - marginBottom, marginTop]);

    // Declare the y (vertical position) scale.
    const xscale = d3.scaleLinear()
        .domain([0, 1])
        .range([width - marginRight, marginLeft]);

    console.log(data);
}

async function updateDataState() {
    let data = await origindata;
    return data;
}

function pivotDataset(data) {
    let obj = {};
    for(let row of data) {
        obj[row['key']] = { ...row };
    }

    return Object.keys(obj)
        .reduce((out_obj, key) => {
            out_obj[key] = obj[key];
            return out_obj;
        }, {});;
}

function reverseDict(json) {
    var ret = {};
    for(var key in json) {
        ret[json[key]] = key;
    }
    return ret;
}

function reverseArr(arr) {
    var ret = {};
    for(let i = 0; i < arr.length; i++) {
        ret[arr[i]] = i;
    }
    return ret;
}

async function initData() {
    origin_dict = pivotDataset(await origindata);
}

export async function plotBars() {
    await initData();

    // generate initial legend
    drawGraph();

    // handle on click event
    d3.select('#menuDiv')
    .on('change', function() {
        drawGraph();
    });
}
