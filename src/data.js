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

export const airlinedata = d3.csv("../data/airline_cts.csv");