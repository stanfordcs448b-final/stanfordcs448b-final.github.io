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
    reverseDict 
} from "./util.js";

const container = d3.select('#container3')
const canvas = d3.select("#canvas");

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

    let suggestion = d3.select('#suggestionsInput').property("value");
    if(suggestion != "")
        d3.select("#factorName").text(suggestion);
    if(suggestion == "MDW")
        d3.select("#factorName").text(suggestion);

    let data_dict;
    let rows_to_graph = [];
    let row_names = [];

    if(data_key == "dsAirline") {
        data_dict = airline_dict;
        let get_row_id = reverseDict(airlinenames);
        if(suggestion in get_row_id) {
            row_names.push(suggestion);
            let row = data_dict[get_row_id[suggestion]];
            rows_to_graph.push(row);
            rows_to_graph.push(overall_dict)
            row_names.push('All flights')
        }
        else {
            for(let id of Object.keys(get_row_id)) {
                row_names.push(id);
                let row = data_dict[get_row_id[id]];
                rows_to_graph.push(row)
            }
        }
    }
    if(data_key == "dsOrigin") {
        data_dict = origin_dict;
        if(suggestion in data_dict) {
            d3.select(".airportInTitle").text(suggestion);
            row_names.push(suggestion);
            let row = data_dict[suggestion];
            rows_to_graph.push(row);
            rows_to_graph.push(overall_dict)
            row_names.push('All flights')
        }
        else {
            let i = 0;
            for(let id of Object.keys(data_dict)) {
                i++
                row_names.push(id);
                let row = data_dict[id];
                rows_to_graph.push(row)
                if(i > 15) break;
            }
        }
    }
    if(data_key == "dsDest") {
        data_dict = dest_dict;
        if(suggestion in data_dict) {
            d3.select(".airportInTitle").text(suggestion);
            row_names.push(suggestion);
            let row = data_dict[suggestion];
            rows_to_graph.push(row);
            rows_to_graph.push(overall_dict)
            row_names.push('All flights')
        }
        else {
            let i = 0;
            for(let id of Object.keys(data_dict)) {
                i++
                row_names.push(id);
                let row = data_dict[id];
                rows_to_graph.push(row)
                if(i > 15) break;
            }
        }
    }
    if(data_key == "dsMonth") {
        data_dict = month_dict;
        let get_row_id = reverseArr(monthnames);
        if(monthnames.includes(suggestion)) {
            row_names.push(suggestion);
            let row = data_dict[get_row_id[suggestion] + 1];
            rows_to_graph.push(row);
            rows_to_graph.push(overall_dict)
            row_names.push('All months')
        }
        else {
            for(let id of Object.keys(get_row_id)) {
                row_names.push(id);
                let row = data_dict[get_row_id[id] + 1];
                rows_to_graph.push(row)
            }
        }
    }
    if(data_key == "dsTime") {
        data_dict = time_dict;
        let get_row_id = reverseArr(timenames);
        if(timenames.includes(suggestion)) {
            row_names.push(suggestion);
            let row = data_dict[get_row_id[suggestion]];
            rows_to_graph.push(row);
            rows_to_graph.push(overall_dict)
            row_names.push('All times of day')
        }
        else {
            for(let id of Object.keys(get_row_id)) {
                row_names.push(id);
                let row = data_dict[get_row_id[id]];
                rows_to_graph.push(row)
            }
        }
    }
    
    if(data_key == "dsTime") {
        marginLeft = 250;
    }
    else {
        marginLeft = 100;
    }

    const barHeight = 20;
    const barSpacing = 1.5;
    let key_top = marginTop + rows_to_graph.length * barHeight * barSpacing + 15;
    height = key_top + 75;
    canvas.attr('height', height);
    canvas.attr('viewBox', '0 0 1000 ' + height);
    

    // Declare the y (vertical position) scale.
    const yscale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - marginBottom, marginTop]);

    // Declare the y (vertical position) scale.
    const xscale = d3.scaleLinear()
        .domain([0, 1])
        .range([width - marginRight, marginLeft]);
    

    const labels = ['cancelled', 'delayed', 'on time'];
    const colors = [redBlue(1.0), redBlue(0.8), redBlue(0.1)];

    let axis = d3.axisTop(xscale.copy().range([marginLeft, width - marginRight]));
    axis.ticks(5).tickFormat(function(d) { return d * 100 + "%"; });

    let axis_g = canvas.append('g')
        .attr('transform', `translate(0, ${marginTop - 5})`)
        .attr('class', 'axis')
        .call(axis);

    axis_g.selectAll("path").remove();
    axis_g.selectAll(".tick text").style("font-size", "20px");
    
    
    canvas.append('text')
        .attr('class', 'key')
        .text(labels[0])
        .attr('x', marginLeft)
        .attr('y', key_top)
        .attr('fill', colors[0]);

    canvas.append('text')
        .attr('class', 'key')
        .text(labels[1])
        .attr('x', marginLeft + 40)
        .attr('y', key_top + 20)
        .attr('fill', colors[1]);

    canvas.append('text')
        .attr('class', 'key')
        .text(labels[2])
        .attr('x', marginLeft + 80)
        .attr('y', key_top + 40)
        .attr('fill', colors[2]);
    
    

    for(let row_idx = 0; row_idx < rows_to_graph.length; row_idx++) {
        let row = rows_to_graph[row_idx];
        const amts = [
            row['cancelled'], 
            row['delayed'], 
            row['total'] - (row['cancelled'] + row['delayed'])
        ];

        // populate information about the stacked bars
        let bars_x = [0, row['cancelled'], row['delayed']];
        let c_sum = 0;
        for(let i = 0; i < bars_x.length; i++) {
            c_sum += bars_x[i];
            bars_x[i] = c_sum / row['total'];
        }
        bars_x.push(1);
        
        const y =  marginTop + row_idx * barHeight * barSpacing;
        for(let i = 0; i < bars_x.length - 1; i++) {
            const rInt = Math.floor(i / 3 * 255);
            const rgbString = colors[i];
            
            const x = xscale(1 - bars_x[i]);
            const width = xscale(1 - bars_x[i + 1]) - xscale(1 - bars_x[i]);

            const rect = canvas.append("rect")
                .attr("class", "leftbar")
                .attr("x", x)
                .attr("y", y)
                .attr("width", width)
                .attr("height", barHeight)
                .attr("fill", rgbString)
                .attr("rx", 0)
                .attr("ry", 0)
                .on('mouseover', function (event, d) { // Handle 'mouseover' events
                    const group = canvas.append('g')
                        .attr('class', 'hoverdata');
                    const text = group.append("text").attr("x", 0).attr("y", 0);         // add text element into group
                    text.append("tspan").attr("x", 0).attr("dy", "1.2em").text(amts[i] + " flights " + labels[i]); // add text spans into text, with line spacing `dy`
                    const bbox = group.node().getBBox();
                    let tooltip_x = x + width * 0.5 - bbox.width * 0.5;
                    if(tooltip_x < 0) tooltip_x = marginLeft;
                    group.attr('transform',
                        `translate(${tooltip_x} ${marginTop + row_idx * barHeight * barSpacing})`
                    );
                    group.insert('rect', ':first-child') // create background rectangle
                    .attr("x", -2)
                    .attr("y",  2)
                    .attr("width", bbox.width + 4)
                    .attr("height", bbox.height + 4);
                })
                .on('mouseout', function(event, d) {
                    canvas.selectAll('.hoverdata').remove()    // Remove all ptLabels
                });
        }
        let g = canvas.append("g").attr('class', 'barLabel');
        let t = g.append('text').text(row_names[row_idx]);
        const bbox = g.node().getBBox();
        t.attr("x", marginLeft - bbox.width - 5).attr("y", y + barHeight * 0.5 + bbox.height * 0.3);
        
    }
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
        d3.select('#suggestionsInput').attr("value", "MDW");
        d3.select('#suggestions').selectChildren().remove();
        for(let row of data) {
            let option = d3.select('#suggestions').append('option');
            option.attr('value', row['key']);
        }
    }

    if(data_key === "dsOrigin") {
        data = await destdata;

        // default value
        title_text_span.text("origin airport");
        d3.select('#suggestionsInput').attr("value", "MDW");
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
