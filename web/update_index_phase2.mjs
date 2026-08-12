import fs from 'fs';

const enTools = `  {
    href: '/auto-redact',
    idx: 'SECURITY · REDACT',
    name: 'Auto-Redact',
    line: 'Hide PII & Sensitive Info',
    Icon: FileText,
    category: 'Security',
  },
  {
    href: '/smart-markdown',
    idx: 'EXTRACT · AI',
    name: 'Smart Markdown',
    line: 'AI-Ready MD Export',
    Icon: FileText,
    category: 'Organize PDF',
  },
  {
    href: '/contrast-enhancer',
    idx: 'EDIT · SCAN',
    name: 'Enhance Scan',
    line: 'Fix Contrast & Brightness',
    Icon: Sun,
    category: 'Edit PDF',
  },
`;

const trTools = `  {
    href: '/tr/auto-redact',
    idx: 'GÜVENLİK · SANSÜR',
    name: 'Otomatik Sansür',
    line: 'Kişisel Verileri (PII) Gizle',
    Icon: FileText,
    category: 'Güvenlik',
  },
  {
    href: '/tr/smart-markdown',
    idx: 'ÇIKAR · AI',
    name: 'Akıllı Markdown',
    line: 'Yapay Zeka İçin Çeviri',
    Icon: FileText,
    category: 'PDF Düzenle',
  },
  {
    href: '/tr/contrast-enhancer',
    idx: 'DÜZENLE · TARAMA',
    name: 'Tarama Netleştir',
    line: 'Kötü Taramaları İyileştir',
    Icon: Sun,
    category: 'PDF Düzenle',
  },
`;

function inject(file, additions) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('Sun,')) {
    content = content.replace('import {', 'import { Sun,');
  }

  content = content.replace('const tools = [', 'const tools = [\n' + additions);
  fs.writeFileSync(file, content);
}

inject('./src/pages/index.astro', enTools);
inject('./src/pages/tr/index.astro', trTools);

console.log('index.astro files updated.');
