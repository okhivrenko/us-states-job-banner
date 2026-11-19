// Regenerates states.ts from us-atlas (pre-projected Albers USA, 975x610).
// Usage: npm run generate:states
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { geoPath } from 'd3-geo';

const require = createRequire(import.meta.url);
const topo = require('us-atlas/states-albers-10m.json');

const FIPS = {"01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE","11":"DC","12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA","20":"KS","21":"KY","22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN","28":"MS","29":"MO","30":"MT","31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM","36":"NY","37":"NC","38":"ND","39":"OH","40":"OK","41":"OR","42":"PA","44":"RI","45":"SC","46":"SD","47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA","54":"WV","55":"WI","56":"WY"};

const path = geoPath(); // data is already projected
const round = (d) => d.replace(/(\d+\.\d{2})\d+/g, '$1');

const states = feature(topo, topo.objects.states).features
  .filter((f) => FIPS[f.id])
  .map((f) => {
    const [cx, cy] = path.centroid(f);
    return { code: FIPS[f.id], name: f.properties.name, d: round(path(f)), cx: +cx.toFixed(1), cy: +cy.toFixed(1) };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

writeFileSync(
  process.argv[2] ?? 'states.ts',
  `// Generated from us-atlas (ISC, US Census Bureau data). Do not edit by hand.
export interface UsState { code: string; name: string; d: string; cx: number; cy: number }
export const VIEWBOX = '0 0 975 610';
export const STATES: UsState[] = ${JSON.stringify(states)};
`,
);
console.log(`Wrote ${states.length} states`);
