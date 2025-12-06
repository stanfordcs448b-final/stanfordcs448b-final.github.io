const xform_geoAlbersUsa = d3.geoAlbersUsa()
    .scale(1300)
    .translate([487.5, 305]);

const xform_geoAlbers = d3.geoAlbers()
    .scale(1300)
    .translate([487.5, 305]);

/**
 * @param {[Number, Number]} coords 
 * @returns {[Number, Number]}
 */
export const projection = function(coords) {
    // fallback if coords not in composite projection
    return xform_geoAlbersUsa(coords) ?? xform_geoAlbers(coords);
}

export const redBlue = val => d3.interpolateRdYlBu(1 - val);
