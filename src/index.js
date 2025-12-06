import { setupMap, setupCanvas } from "./setup.js";
import { main as v1main } from "./vis1.js"
import { main as v2main } from "./vis2.js"
import { plotBars } from "./vis3.js";
import { plotPoints } from "./vis4.js";
import { plotBars5 } from "./vis5.js";


// vis1
setupMap(d3.select("#container1 #map #background"))
.then(v1main);

// vis2
setupMap(d3.select("#container2 #map #background"))
.then(v2main);

// vis3
setupCanvas()
.then(plotBars);

plotPoints();

plotBars5();