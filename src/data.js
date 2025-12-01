/**
 * Source data we need to load
 */

export const usmap = fetch("./states-albers-10m.json")
                    .then(res => res.json());

export const flightdata = d3.csv("../data/flights.csv");

export const airportdata = d3.csv("../data/airports.csv");

export const toydata = {
    ds1: [{x:0,y:12},{x:0,y:45}],
    ds2: [{x:0,y:72},{x:0,y:28}],
    ds3: [{x:0,y:82},{x:0,y:18}]
}