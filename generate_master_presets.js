/**
 * MASTER PREMIUM PRESET GENERATOR
 * ONE FILE TO RULE THEM ALL
 * Fiction + Business + Technical + Biography + Audiobook
 */

import fs from 'fs';
import { ULTIMATE_OPTIONS } from './src/data/ULTIMATE_MASTER_VARIABLES.js';

const first = (optionKey) => ULTIMATE_OPTIONS[optionKey]?.[0]?.value || '';
const pick = (optionKey, index) => ULTIMATE_OPTIONS[optionKey]?.[index]?.value || first(optionKey);

// Import all preset definitions
import { FICTION_PRESETS } from './generate_premium_presets_dynamic.js';
import { BUSINESS_PRESETS, TECHNICAL_PRESETS, BIOGRAPHY_PRESETS, AUDIOBOOK_PRESETS } from './generate_all_flow_presets.js';

// Combine everything
const ALL_PRESETS = {
  ...FICTION_PRESETS,
  ...BUSINESS_PRESETS,
  ...TECHNICAL_PRESETS,
  ...BIOGRAPHY_PRESETS,
  ...AUDIOBOOK_PRESETS
};

// Generate ONE master SQL file
let sql = `-- MASTER PREMIUM PRESETS - COMPLETE SUITE
-- Generated: ${new Date().toISOString()}
-- Fiction + Business + Technical + Biography + Audiobook
-- ALL values from ULTIMATE_MASTER_VARIABLES - NO HARDCODING
-- Total: ${Object.keys(ALL_PRESETS).length} presets

-- COMPLETE WIPE - Delete ALL existing presets
TRUNCATE TABLE public.client_flow_input_sets;

-- Insert ALL premium curated presets
INSERT INTO public.client_flow_input_sets (flow_key, variant_key, name, description, tags, variables, weight) VALUES\n`;

const values = Object.values(ALL_PRESETS).map((preset) => {
  const variablesJSON = JSON.stringify(preset.variables).replace(/'/g, "''");
  const tagsArray = `ARRAY[${preset.tags.map(t => `'${t}'`).join(',')}]`;
  const description = preset.description.replace(/'/g, "''");
  const name = preset.name.replace(/'/g, "''");
  
  return `('${preset.flow_key}','${preset.variant_key}','${name}','${description}',${tagsArray},'${variablesJSON}',${preset.weight})`;
});

sql += values.join(',\n');
sql += ';\n';

fs.writeFileSync('MASTER_PRESETS.sql', sql);

console.log('✅ MASTER_PRESETS.sql generated');
console.log(`📊 Total: ${Object.keys(ALL_PRESETS).length} presets`);
console.log('🎯 Ready to deploy!');









