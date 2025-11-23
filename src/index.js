import { setupMap } from "./setup.js";
import { plotPoints } from "./vis1.js";

setupMap()
.then(plotPoints);
