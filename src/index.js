import { setupMap, setupCanvas } from "./setup.js";
import { main as v1main } from "./vis1.js"
import { plotBars } from "./vis3.js";


// vis1
setupMap(d3.select("#container1 #map"))
.then(v1main);

// vis3
setupCanvas()
.then(plotBars)
