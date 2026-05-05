const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = walkDir('client/src');
let changed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const initial = content;

  content = content.replace(/bg-\[#0a0a0a\]/g, 'bg-background');
  content = content.replace(/bg-\[#111\]/g, 'bg-card');
  content = content.replace(/bg-\[#222\]/g, 'bg-muted');
  content = content.replace(/bg-\[#000\]/g, 'bg-background');
  content = content.replace(/bg-\[#0f1115\]/g, 'bg-background');
  content = content.replace(/bg-\[#1a1010\]/g, 'bg-rose-950');
  content = content.replace(/bg-\[#0ea5e9\]/g, 'bg-primary');
  content = content.replace(/bg-\[#0d0d0d\]/g, 'bg-background');
  content = content.replace(/border-white\/5/g, 'border-border');
  content = content.replace(/border-white\/10/g, 'border-border\/80');
  content = content.replace(/bg-white\/5/g, 'bg-muted\/50');
  content = content.replace(/bg-white\/10/g, 'bg-muted');
  content = content.replace(/text-white\/[4-8]0/g, 'text-muted-foreground');
  content = content.replace(/text-white\/90/g, 'text-foreground');
  content = content.replace(/text-white/g, 'text-foreground');
  content = content.replace(/border-white\/20/g, 'border-border');

  if (content !== initial) {
    fs.writeFileSync(file, content, 'utf8');
    changed++;
  }
});

console.log(`Updated ${changed} files.`);
