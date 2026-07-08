import { RNVBabelioComponent } from "../rnvbabelio/rnvbabelio.component";
import { RNVBabelioFullComponent } from "../rnvbabelio/rnvbabeliofull.component";


// Define the map
export const selectorComponentMap = new Map<string, any>([
    ['nde-record-title-after', RNVBabelioComponent],
    ['nde-full-display-links-after', RNVBabelioFullComponent]
]);

