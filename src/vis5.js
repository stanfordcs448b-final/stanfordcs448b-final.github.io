import { 
    airportdata, 
    airlinenames, 
    airlinedata, 
    monthnames, 
    monthdata, 
    timenames, 
    timedata,
    origindata,
    destdata,
    overalldata
} from "./data.js";

import { 
    redBlue, 
    reverseArr, 
    reverseDict,
    pivotDataset
} from "./util.js";

const container = d3.select('#container5')
const canvas = d3.select("#canvas5");

const width = +canvas.attr("width");
let height = +canvas.attr("height");
const marginTop = 50;
const marginRight = 50;
const marginBottom = 50;
let marginLeft = 100;
const margin = {marginTop, marginRight, marginBottom, marginLeft};
const barSize = 10;

let airline_dict;
let month_dict;
let origin_dict;
let dest_dict;
let time_dict;
let overall_dict;

let data_key;



async function drawGraph(newData) {
    let table = await newData;

    canvas.selectAll(".leftbar").remove();
    canvas.selectAll(".barLabel").remove();
    canvas.selectAll(".key").remove();
    canvas.selectAll(".axis").remove();
    canvas.selectAll(".bottomHist").remove();

    let suggestion = d3.select('#suggestionsInput5').property("value");
    if(suggestion != "") {
        d3.select("#factorName5").text(suggestion);
        if(data_key == "dsOrigin")
            d3.select("#factorName5").text("at " + suggestion);
        if(data_key == "dsDest")
            d3.select("#factorName5").text("for flights going to " + suggestion);
        if(data_key == "dsAirline")
            d3.select("#factorName5").text("with " + suggestion);
        if(data_key == "dsMonth" || data_key == "dsTime")
            d3.select("#factorName5").text("in " + suggestion);
    }

    let data_dict;
    let rows_to_graph = [];
    let row_names = [];

    rows_to_graph.push(overall_dict)
    row_names.push('All flights')

    if(data_key == "dsAirline") {
        data_dict = airline_dict;
        let get_row_id = reverseDict(airlinenames);
        if(suggestion in get_row_id) {
            row_names.push(suggestion);
        }
        else {
            suggestion = "American";
            row_names.push("American");
        }
        let row = data_dict[get_row_id[suggestion]];
        rows_to_graph.push(row)
    }
    if(data_key == "dsOrigin") {
        data_dict = origin_dict;
        if(suggestion in data_dict) {
            row_names.push(suggestion);
        }
        else {
            suggestion = "MDW";
            row_names.push("MDW");
        }
        let row = data_dict[suggestion];
        rows_to_graph.push(row)
    }
    if(data_key == "dsDest") {
        data_dict = dest_dict;
        if(suggestion in data_dict) {
            row_names.push(suggestion);
        }
        else {
            suggestion = "MDW";
            row_names.push("MDW");
        }
        let row = data_dict[suggestion];
        rows_to_graph.push(row)
    }
    if(data_key == "dsMonth") {
        data_dict = month_dict;
        let get_row_id = reverseArr(monthnames);
        if(monthnames.includes(suggestion)) {
            row_names.push(suggestion);
        }
        else {
            suggestion = "Jan";
            row_names.push("Jan");
        }
        let row = data_dict[get_row_id[suggestion] + 1];
        rows_to_graph.push(row)
    }
    if(data_key == "dsTime") {
        data_dict = time_dict;
        let get_row_id = reverseArr(timenames);
        if(timenames.includes(suggestion)) {
            row_names.push(suggestion);
        }
        else {
            suggestion = "Early Morning (12am - 6am)";
            row_names.push("Early Morning (12am - 6am)");
        }
        let row = data_dict[get_row_id[suggestion]];
        rows_to_graph.push(row)
    }
    
    if(data_key == "dsTime") {
        marginLeft = 250;
    }
    else {
        marginLeft = 150;
    }

    const barHeight = 20;
    const barSpacing = 1.5;

    // Declare the y (vertical position) scale.
    const xscale = d3.scaleLinear()
        .domain([0, 17])
        .range([marginLeft, width - marginRight]);
    
    const colors = [redBlue(0.05), redBlue(0.85)];

    let axis = d3.axisTop(xscale.copy().range([marginLeft, width - marginRight]));
    axis.ticks(6).tickFormat(function(d) { return d * 0.25 + " hrs"; });

    const y_max = 0.5;
    const y_axis = [
        d3.scaleLinear()
            .domain([0, y_max])
            .range([0, height * 0.5 - marginBottom]),
        d3.scaleLinear()
            .domain([0, y_max])
            .range([0, height * 0.5 - marginTop]),
    ];
    for(let i = 0; i <= 1; i++) {
        let row = rows_to_graph[i];
        
        // Declare the y (vertical position) scale.
        const yscale = y_axis[i];

        let mean = 0;
        let heights = [];
        for(let time_idx = 1; time_idx <= 16; time_idx++) {
            const h = yscale(row[time_idx] / row['delayed'])
            heights.push(height * 0.5 + (-i * h));
            mean += (row[time_idx] / row['delayed']) * time_idx;
        }

        let g = canvas.append("g").attr('class', 'barLabel');
        let t = g.append('text').text(row_names[i]);
        const bbox = g.node().getBBox();
        t.attr("x", xscale(0.5) -  bbox.width).attr("y", height * 0.5 + yscale(y_max * 0.33) * (i * -2 + 1));

        if(i == 0) {
            canvas.append('line')
                .attr("class", "bottomHist")
                .attr("x1", xscale(mean))
                .attr("y1", marginTop - 8)
                .attr("x2", xscale(mean))
                .attr("y2", height * 0.5 + 150 * (i * -2 + 1))
                .attr("stroke", redBlue([0.0, 1.0][i]))
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "8");
        }
        else {
            canvas.append('line')
                .attr("class", "bottomHist")
                .attr("x1", xscale(mean))
                .attr("y1", height * 0.5)
                .attr("x2", xscale(mean))
                .attr("y2", height * 0.5 + 150 * (i * -2 + 1))
                .attr("stroke", redBlue([0.0, 1.0][i]))
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "8");

            canvas.append('line')
                .attr("class", "bottomHist")
                .attr("x1", xscale(mean))
                .attr("y1", marginTop - 8)
                .attr("x2", xscale(mean))
                .attr("y2", height * 0.5 + 170 * (i * -2 + 1))
                .attr("stroke", redBlue([0.0, 1.0][i]))
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "8");
        }

        for(let time_idx = 1; time_idx <= 16; time_idx++) {
            const rgbString = colors[i];
            const h = yscale(row[time_idx] / row['delayed'])
            canvas
                .append('text')
                .attr("class", "bottomHist")
                .attr("text-anchor", "middle")
                .attr("x", xscale(mean))
                .attr("y", height * 0.5 + 160 * (i * -2 + 1) + 5)
                .text('mean')
                .attr("fill", redBlue([0.0, 1.0][i]));

            const rect = canvas.append("rect")
                .attr("class", "bottomHist")
                .attr("x", xscale(time_idx))
                .attr("width", (xscale(9) - xscale(8)) * 0.9)
                .attr("y", heights[time_idx - 1])
                .attr("height", h)
                .attr("fill", rgbString)
        }
    }

    let axis_g = canvas.append('g')
        .attr('transform', `translate(0, ${marginTop - 10})`)
        .attr('class', 'axis')
        .call(axis);

    axis_g.selectAll("path").remove();
    axis_g.selectAll(".tick text").style("font-size", "18px");

    let targetTextElement = axis_g.selectAll("text").filter(function() {
        return d3.select(this).text() === "4 hrs";
    });
    targetTextElement.text('4+ hrs');

    targetTextElement = axis_g.selectAll("text").filter(function() {
        return d3.select(this).text() === "0 hrs";
    });
    d3.select((targetTextElement.node().parentNode)).remove();
}

async function updateDataState() {
    let data;
    data_key = d3.select("#firstDropdown5").property('value');
    let title_text_span = d3.select("#factorName5");

    // case Airline selected
    if(data_key === "dsAirline") {
        data = await airlinedata;
        // default value
        d3.select('#suggestionsInput5').attr("value", "");
        title_text_span.text("with each airline");

        // clear suggestions
        d3.select('#suggestions5').selectChildren().remove();
        for(let key of Object.keys(airline_dict)) {
            let row = airline_dict[key];
            let option = d3.select('#suggestions5').append('option');
            option.attr('value', airlinenames[row['key']]);
        }
    }
    // case Month selected
    if(data_key === "dsMonth") {
        data = await monthdata;
        title_text_span.text("in each month");
        d3.select('#suggestionsInput5').attr("value", "");
        d3.select('#suggestions5').selectChildren().remove();
        for(let i = 1; i <= 12; i++) {
            let row = month_dict[i];
            let option = d3.select('#suggestions5').append('option');
            option.attr('value', monthnames[row.key - 1]);
        }
    }
    // case Time selected
    if(data_key === "dsTime") {
        data = await timedata;
        title_text_span.text("at each time of day");
        d3.select('#suggestionsInput5').attr("value", "");
        d3.select('#suggestions5').selectChildren().remove();
        for(let i = 0; i <= 3; i++) {
            let row = time_dict[i];
            let option = d3.select('#suggestions5').append('option');
            option.attr('value', timenames[row.key]);
        }
    }
    // case Origin selected
    if(data_key === "dsOrigin") {
        data = await origindata;

        // default value
        title_text_span.text("at each origin airport");
        d3.select('#suggestionsInput5').attr("value", "MDW");
        d3.select('#suggestions5').selectChildren().remove();
        for(let row of data) {
            let option = d3.select('#suggestions5').append('option');
            option.attr('value', row['key']);
        }
    }

    if(data_key === "dsOrigin") {
        data = await destdata;

        // default value
        title_text_span.text("at each origin airport");
        d3.select('#suggestionsInput5').attr("value", "MDW");
        d3.select('#suggestions5').selectChildren().remove();
        for(let row of data) {
            let option = d3.select('#suggestions5').append('option');
            option.attr('value', row['key']);
        }
    }

    return data;
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
    dest_dict = pivotDataset(await destdata);
    overall_dict = (await overalldata)[0];
}

export async function plotBars5() {
    await initData();

    // generate initial legend
    let data = updateDataState();
    drawGraph(data);

    // handle on click event
    d3.select('#menuDiv5')
    .on('change', function() {
        data = updateDataState();
        drawGraph(data);
    });
}
