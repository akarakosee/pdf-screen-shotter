import fs from 'fs';

['ExtractTocShell.tsx', 'OverlayPdfShell.tsx', 'ChangeBackgroundShell.tsx'].forEach(file => {
  const path = './src/components/' + file;
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace("import { Button } from './Button';", "");
  content = content.replace(/<Button/g, "<button className=\"rounded-lg bg-indigo px-4 py-2 text-sm font-medium text-white hover:bg-indigo/90 dark:bg-indigo-dark dark:hover:bg-indigo-dark/90 disabled:opacity-50\"");
  content = content.replace(/<\/Button>/g, "</button>");
  fs.writeFileSync(path, content);
});

console.log("Buttons fixed!");
