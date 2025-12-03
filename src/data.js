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
            2: +d[1],
            3: +d[1],
            4: +d[1],
            5: +d[1],
            6: +d[1],
            7: +d[1],
            8: +d[1],
            9: +d[1],
            10: +d[1],
            11: +d[1],
            12: +d[1],
            13: +d[1],
            14: +d[1],
            15: +d[1],
            16: +d[1],
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
    "Nov",
    "Dec"
]

export const monthdata = d3.csv("../data/month_cts.csv", 
    (d) => {
        let b = {
            1: +d[1],
            2: +d[1],
            3: +d[1],
            4: +d[1],
            5: +d[1],
            6: +d[1],
            7: +d[1],
            8: +d[1],
            9: +d[1],
            10: +d[1],
            11: +d[1],
            12: +d[1],
            13: +d[1],
            14: +d[1],
            15: +d[1],
            16: +d[1],
            cancelled: +d['cancelled'],
            delayed: +d['delayed'],
            total: +d['total'],
            key: d['month']
        };
        return b;
    }
);

export const timenames = [
    "Late Night / Early Morning (12am - 6am)",
    "Morning (6am - 12pm)",
    "Afternoon (12pm - 6pm)",
    "Evening (6pm - 12am)"
]

export const timedata = d3.csv("../data/time_cts.csv", 
    (d) => {
        let b = {
            1: +d[1],
            2: +d[1],
            3: +d[1],
            4: +d[1],
            5: +d[1],
            6: +d[1],
            7: +d[1],
            8: +d[1],
            9: +d[1],
            10: +d[1],
            11: +d[1],
            12: +d[1],
            13: +d[1],
            14: +d[1],
            15: +d[1],
            16: +d[1],
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
            2: +d[1],
            3: +d[1],
            4: +d[1],
            5: +d[1],
            6: +d[1],
            7: +d[1],
            8: +d[1],
            9: +d[1],
            10: +d[1],
            11: +d[1],
            12: +d[1],
            13: +d[1],
            14: +d[1],
            15: +d[1],
            16: +d[1],
            cancelled: +d['cancelled'],
            delayed: +d['delayed'],
            total: +d['total'],
            key: d['origin']
        };
        return b;
    }
);

export const overalldata = d3.csv("../data/origin_cts.csv", 
    (d) => {
        let b = {
            1: +d[1],
            2: +d[1],
            3: +d[1],
            4: +d[1],
            5: +d[1],
            6: +d[1],
            7: +d[1],
            8: +d[1],
            9: +d[1],
            10: +d[1],
            11: +d[1],
            12: +d[1],
            13: +d[1],
            14: +d[1],
            15: +d[1],
            16: +d[1],
            cancelled: +d['cancelled'],
            delayed: +d['delayed'],
            total: +d['total'],
            key: d['origin']
        };
        return b[0];
    }
);