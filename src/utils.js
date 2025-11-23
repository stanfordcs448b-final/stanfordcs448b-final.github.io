/**
 * Utility functions
 */


const path = d3.geoPath();

export function centroid(feature) {
    return path.centroid(feature);
}