const fs = require('fs');

function convertES6ToCommonJS(content) {
  let converted = content;
  
  // Convert: import { x } from 'y' → const { x } = require('y')
  converted = converted.replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g, 'const {$1} = require(\'$2\')');
  
  // Convert: import x from 'y' → const x = require('y')
  converted = converted.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require(\'$2\')');
  
  // Convert: export default x → module.exports = x (at end of file)
  converted = converted.replace(/export\s+default\s+(\w+)/g, 'module.exports = $1');
  
  // Convert: export { x } → module.exports = { x }
  converted = converted.replace(/export\s+{([^}]+)}/g, 'module.exports = {$1}');
  
  // Convert: export const x = → module.exports.x = 
  converted = converted.replace(/export\s+const\s+(\w+)\s*=/g, 'const $1 =\nmodule.exports.$1 = $1;\n//');
  
  // Fix ../lib/supabase imports → ./supabase
  converted = converted.replace(/require\('\.\.\/lib\/supabase'\)/g, "require('./supabase')");
  converted = converted.replace(/require\('\.\.\/lib\/supabase\.js'\)/g, "require('./supabase')");
  
  // Fix ../services/ imports → ./
  converted = converted.replace(/require\('\.\.\/services\//g, "require('./");
  converted = converted.replace(/require\('\.\/services\//g, "require('./");
  
  // Fix ../data/ imports → ../data/
  converted = converted.replace(/require\('\.\.\/data\//g, "require('../data/");
  
  return converted;
}

// Get file to convert from command line
const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
  console.error('Usage: node convert_es6_to_cjs.js <input> <output>');
  process.exit(1);
}

const content = fs.readFileSync(inputFile, 'utf8');
const converted = convertES6ToCommonJS(content);
fs.writeFileSync(outputFile, converted, 'utf8');
console.log(`✅ Converted ${inputFile} → ${outputFile}`);
