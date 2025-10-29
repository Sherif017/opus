const fs = require('fs');
const path = require('path');

const apiDir = path.join(process.cwd(), 'app', 'api');

function findRouteFiles(dir) {
  let routes = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      routes = routes.concat(findRouteFiles(fullPath));
    } else if (file === 'route.ts' || file === 'route.tsx') {
      routes.push(fullPath);
    }
  }
  
  return routes;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const supabasePattern = /const\s+supabase\s*=\s*createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL[^)]*\)/g;
  const supabaseAdminPattern = /const\s+supabaseAdmin\s*=\s*createClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL[^)]*SUPABASE_SERVICE_ROLE_KEY[^)]*\)/g;
  const resendPattern = /const\s+resend\s*=\s*new\s+Resend\(\s*process\.env\.RESEND_API_KEY\s*\)/g;
  
  const hasModuleLevelClients = supabasePattern.test(content) || supabaseAdminPattern.test(content) || resendPattern.test(content);
  
  if (!hasModuleLevelClients) {
    return false;
  }
  
  content = fs.readFileSync(filePath, 'utf-8');
  
  const supabaseMatch = content.match(/const\s+supabase\s*=\s*createClient\([^)]*\)/);
  const supabaseAdminMatch = content.match(/const\s+supabaseAdmin\s*=\s*createClient\([^)]*\)/);
  const resendMatch = content.match(/const\s+resend\s*=\s*new\s+Resend\([^)]*\)/);
  
  content = content.replace(/const\s+supabase\s*=\s*createClient\([^)]*\)\s*\n/g, '');
  content = content.replace(/const\s+supabaseAdmin\s*=\s*createClient\([^)]*\)\s*\n/g, '');
  content = content.replace(/const\s+resend\s*=\s*new\s+Resend\([^)]*\)\s*\n/g, '');
  
  const functionPattern = /export\s+async\s+function\s+(GET|POST|PATCH|DELETE)\s*\(/g;
  let match;
  let lastIndex = 0;
  let newContent = '';
  
  while ((match = functionPattern.exec(content)) !== null) {
    const functionStart = match.index;
    const functionBody = content.indexOf('{', functionStart);
    const insertPoint = functionBody + 1;
    
    newContent += content.substring(lastIndex, insertPoint);
    newContent += '\n    // ✅ Créer les clients DANS la fonction\n';
    
    if (supabaseMatch) {
      newContent += `    ${supabaseMatch[0]}\n`;
    }
    if (supabaseAdminMatch) {
      newContent += `    ${supabaseAdminMatch[0]}\n`;
    }
    if (resendMatch) {
      newContent += `    ${resendMatch[0]}\n`;
    }
    
    lastIndex = insertPoint;
  }
  
  newContent += content.substring(lastIndex);
  
  fs.writeFileSync(filePath, newContent, 'utf-8');
  return true;
}

try {
  if (!fs.existsSync(apiDir)) {
    console.error('❌ Dossier app/api non trouvé');
    process.exit(1);
  }
  
  const routes = findRouteFiles(apiDir);
  console.log(`\n📁 Trouvé ${routes.length} fichiers route.ts\n`);
  
  let fixed = 0;
  routes.forEach(route => {
    const relativePath = path.relative(process.cwd(), route);
    if (fixFile(route)) {
      console.log(`✅ ${relativePath}`);
      fixed++;
    } else {
      console.log(`⏭️  ${relativePath} (déjà OK)`);
    }
  });
  
  console.log(`\n✨ ${fixed} fichiers corrigés!\n`);
} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}
