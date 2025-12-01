/**
 * Source data we need to load
 */

export const usmap = fetch("./states-albers-10m.json")
                    .then(res => res.json());

export const flightdata = d3.csv("../data/flights.csv");

export const airportdata = d3.csv(
    "../data/airport_lookup.csv", 
    d => ({
        id: +d.id,
        code: d.code,
        dispName: d.dispName,
        lat: +d.lat,
        long: +d.long,
    })
);
