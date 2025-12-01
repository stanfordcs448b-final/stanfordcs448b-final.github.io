import { setupMap, setupCanvas } from "./setup.js";
import { plotPoints } from "./vis1.js"
import { plotBars } from "./vis3.js";


// vis1
//setupMap()
//.then(plotPoints);

// vis3
setupCanvas()
.then(plotBars)
