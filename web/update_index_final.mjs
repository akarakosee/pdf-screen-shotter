import fs from 'fs';

const enTools = `  {
    href: '/extract-toc',
    idx: 'EXTRACT · TOC',
    name: 'Extract Bookmarks',
    line: 'Export PDF Table of Contents',
    Icon: FileText,
    category: 'Organize PDF',
  },
  {
    href: '/overlay-pdf',
    idx: 'EDIT · OVERLAY',
    name: 'Add Letterhead',
    line: 'Overlay a template behind your PDF',
    Icon: FileUp,
    category: 'Edit PDF',
  },
  {
    href: '/change-bg',
    idx: 'EDIT · COLOR',
    name: 'Change Background',
    line: 'Dark Mode & Sepia for PDFs',
    Icon: Palette,
    category: 'Edit PDF',
  },
`;

const trTools = `  {
    href: '/tr/extract-toc',
    idx: 'ÇIKAR · İÇİNDEKİLER',
    name: 'İçindekileri Çıkar',
    line: 'PDF Başlık Ağacını Dışa Aktar',
    Icon: FileText,
    category: 'PDF Düzenle',
  },
  {
    href: '/tr/overlay-pdf',
    idx: 'DÜZENLE · ANTET',
    name: 'Antet Ekle',
    line: 'PDF arka planına şablon ekleyin',
    Icon: FileUp,
    category: 'PDF Düzenle',
  },
  {
    href: '/tr/change-bg',
    idx: 'DÜZENLE · RENK',
    name: 'Arka Plan Rengi',
    line: 'Gece Modu & Sepya zemin',
    Icon: Palette,
    category: 'PDF Düzenle',
  },
`;

function inject(file, additions) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('Palette,')) {
    content = content.replace('import {', 'import { Palette,');
  }

  content = content.replace('const tools = [', 'const tools = [\n' + additions);
  fs.writeFileSync(file, content);
}

inject('./src/pages/index.astro', enTools);
inject('./src/pages/tr/index.astro', trTools);

console.log('index.astro files updated.');
