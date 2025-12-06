/**
 * Source data we need to load
 */

import { projection } from "./util.js";

export const usmap = fetch("./states-albers-10m.json")
                    .then(res => res.json());

export const toydata = {
    ds1: [{x:0,y:12},{x:0,y:45}],
    ds2: [{x:0,y:72},{x:0,y:28}],
    ds3: [{x:0,y:82},{x:0,y:18}]
}

export const airportdata = d3.csv(
    "../data/airport_lookup.csv", 
    d => {
        let [pxLong, pxLat] = projection([+d.long, +d.lat])
        return {
            id: +d.id,
            code: d.code,
            dispName: d.dispName,
            latpx: pxLat,
            longpx: pxLong,
        }
    }
);

export const airlinenames = {
    "9E": "Endeavor",
    "AA": "American",
    "AS": "Alaska",
    "B6": "JetBlue",
    "DL": "Delta",
    "F9": "Frontier",
    "G4": "Allegiant",
    "HA": "Hawaiian",
    "MQ": "Envoy",
    "NK": "Spirit",
    "OH": "PSA",
    "OO": "SkyWest",
    "UA": "United",
    "WN": "Southwest",
    "YX": "Republic"
}

export const airlinedata = d3.csv("../data/airline_cts.csv", 
    (d) => {
        let b = {
            1: +d[1],
            2: +d[2],
            3: +d[3],
            4: +d[4],
            5: +d[5],
            6: +d[6],
            7: +d[7],
            8: +d[8],
            9: +d[9],
            10: +d[10],
            11: +d[11],
            12: +d[12],
            13: +d[13],
            14: +d[14],
            15: +d[15],
            16: +d[16],
            cancelled: +d['cancelled'],
            delayed: +d['delayed'],
            total: +d['total'],
            key: d['carrier']
        };
        return b;
    }
);

export const monthnames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
]

export const monthdata = d3.csv("../data/month_cts.csv", 
    (d) => {
        let b = {
            1: +d[1],
            2: +d[2],
            3: +d[3],
            4: +d[4],
            5: +d[5],
            6: +d[6],
            7: +d[7],
            8: +d[8],
            9: +d[9],
            10: +d[10],
            11: +d[11],
            12: +d[12],
            13: +d[13],
            14: +d[14],
            15: +d[15],
            16: +d[16],
            cancelled: +d['cancelled'],
            delayed: +d['delayed'],
            total: +d['total'],
            key: d['month']
        };
        return b;
    }
);

export const timenames = [
    "Early Morning (12am - 6am)",
    "Morning (6am - 12pm)",
    "Afternoon (12pm - 6pm)",
    "Evening (6pm - 12am)"
]

export const timedata = d3.csv("../data/time_cts.csv", 
    (d) => {
        let b = {
            1: +d[1],
            2: +d[2],
            3: +d[3],
            4: +d[4],
            5: +d[5],
            6: +d[6],
            7: +d[7],
            8: +d[8],
            9: +d[9],
            10: +d[10],
            11: +d[11],
            12: +d[12],
            13: +d[13],
            14: +d[14],
            15: +d[15],
            16: +d[16],
            cancelled: +d['cancelled'],
            delayed: +d['delayed'],
            total: +d['total'],
            key: d['time_of_day']
        };
        return b;
    }
);

export const origindata = d3.csv("../data/origin_cts.csv", 
    (d) => {
        let b = {
            1: +d[1],
            2: +d[2],
            3: +d[3],
            4: +d[4],
            5: +d[5],
            6: +d[6],
            7: +d[7],
            8: +d[8],
            9: +d[9],
            10: +d[10],
            11: +d[11],
            12: +d[12],
            13: +d[13],
            14: +d[14],
            15: +d[15],
            16: +d[16],
            cancelled: +d['cancelled'],
            delayed: +d['delayed'],
            total: +d['total'],
            key: d['origin']
        };
        return b;
    }
);

export const destdata = d3.csv("../data/dest_cts.csv", 
    (d) => {
        let b = {
            1: +d[1],
            2: +d[2],
            3: +d[3],
            4: +d[4],
            5: +d[5],
            6: +d[6],
            7: +d[7],
            8: +d[8],
            9: +d[9],
            10: +d[10],
            11: +d[11],
            12: +d[12],
            13: +d[13],
            14: +d[14],
            15: +d[15],
            16: +d[16],
            cancelled: +d['cancelled'],
            delayed: +d['delayed'],
            total: +d['total'],
            key: d['dest']
        };
        return b;
    }
);

export const overalldata = d3.csv("../data/overall_cts.csv", 
    (d) => {
        let b = {
            1: +d[1],
            2: +d[2],
            3: +d[3],
            4: +d[4],
            5: +d[5],
            6: +d[6],
            7: +d[7],
            8: +d[8],
            9: +d[9],
            10: +d[10],
            11: +d[11],
            12: +d[12],
            13: +d[13],
            14: +d[14],
            15: +d[15],
            16: +d[16],
            cancelled: +d['cancelled'],
            delayed: +d['delayed'],
            total: +d['total'],
            key: d['origin']
        };
        return b;
    }
);