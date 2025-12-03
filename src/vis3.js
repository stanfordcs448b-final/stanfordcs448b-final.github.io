import { 
    airportdata, 
    toydata, 
    airlinenames, 
    airlinedata, 
    monthnames, 
    monthdata, 
    timenames, 
    timedata,
    origindata,
    overalldata
} from "./data.js";

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

let data_key;

async function drawGraph(newData) {
    console.log(newData);
    
    const xscale = d3.scaleLinear()
        .domain([0, 1])
        .range([marginLeft, leftWidth - marginRight])

    // Declare the y (vertical position) scale.
    const yscale = d3.scaleLinear()
        .domain([0, 1])
        .range([leftHeight - marginBottom, marginTop])

}

async function updateDataState() {
    let data;
    data_key = d3.select("#firstDropdown").property('value');
    let title_text_span = d3.select("#factorName");

    // case Airline selected
    if(data_key === "dsAirline") {
        data = await airlinedata;
        // default value
        d3.select('#suggestionsInput').attr("value", "");
        title_text_span.text("airline");

        // clear suggestions
        d3.select('#suggestions').selectChildren().remove();
        for(let key of Object.keys(airline_dict)) {
            let row = airline_dict[key];
            let option = d3.select('#suggestions').append('option');
            option.attr('value', airlinenames[row['key']]);
        }
    }
    // case Month selected
    if(data_key === "dsMonth") {
        data = await monthdata;
        title_text_span.text("month");
        d3.select('#suggestionsInput').attr("value", "");
        d3.select('#suggestions').selectChildren().remove();
        for(let i = 1; i <= 12; i++) {
            let row = month_dict[i];
            let option = d3.select('#suggestions').append('option');
            option.attr('value', monthnames[row.key - 1]);
        }
    }
    // case Time selected
    if(data_key === "dsTime") {
        data = await timedata;
        title_text_span.text("time of day");
        d3.select('#suggestionsInput').attr("value", "");
        d3.select('#suggestions').selectChildren().remove();
        for(let i = 0; i <= 3; i++) {
            let row = time_dict[i];
            let option = d3.select('#suggestions').append('option');
            option.attr('value', timenames[row.key]);
        }
    }
    // case Origin selected
    if(data_key === "dsOrigin") {
        data = await origindata;

        // default value
        title_text_span.text("origin airport");
        d3.select('#suggestionsInput').attr("value", "SFO");
        d3.select('#suggestions').selectChildren().remove();
        for(let row of data) {
            let option = d3.select('#suggestions').append('option');
            option.attr('value', row['key']);
        }
    }

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

function reverseDict(dict) {
    return Object.entries(dict).map(([key, value]) => [value, key]);
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
    month_dict = pivotDataset(await monthdata);
    time_dict = pivotDataset(await timedata);
    origin_dict = pivotDataset(await origindata);
    await overalldata;
}

export async function plotBars() {
    await initData();

    // generate initial legend
    let data = updateDataState();
    drawGraph(data);

    // handle on click event
    d3.select('#menuDiv')
    .on('change', function() {
        data = updateDataState();
        drawGraph(data);
    });
}
