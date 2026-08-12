import fs from 'fs';

const enTools = `  {
    href: '/remove-annotations',
    idx: 'EDIT · CLEAN',
    name: 'Remove Annotations',
    line: 'Clear comments and forms from PDF',
    Icon: Stamp,
    category: 'Edit PDF',
  },
  {
    href: '/pdf-to-webp',
    idx: 'CONVERT · WEBP',
    name: 'PDF to WebP',
    line: 'Convert PDF pages to WebP format',
    Icon: FileImage,
    category: 'Convert from PDF',
  },
  {
    href: '/auto-crop',
    idx: 'EDIT · CROP',
    name: 'Auto-Crop PDF',
    line: 'Remove white margins automatically',
    Icon: Crop,
    category: 'Edit PDF',
  },
`;

const trTools = `  {
    href: '/tr/remove-annotations',
    idx: 'DÜZENLE · TEMİZLE',
    name: 'Açıklamaları Sil',
    line: 'PDF yorumlarını ve formlarını temizle',
    Icon: Stamp,
    category: 'PDF Düzenle',
  },
  {
    href: '/tr/pdf-to-webp',
    idx: 'DÖNÜŞTÜR · WEBP',
    name: 'PDF to WebP',
    line: 'PDF sayfalarını WebP formatına dönüştür',
    Icon: FileImage,
    category: 'PDF\\'ten Dönüştür',
  },
  {
    href: '/tr/auto-crop',
    idx: 'DÜZENLE · KIRP',
    name: 'Otomatik Kırp',
    line: 'Beyaz boşlukları otomatik kaldır',
    Icon: Crop,
    category: 'PDF Düzenle',
  },
`;

function inject(file, additions, lang) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add Icon imports
  if (!content.includes('Crop,')) {
    content = content.replace('import {', 'import { Stamp, Crop,');
  }

  // Inject tools
  content = content.replace('const tools = [', 'const tools = [\n' + additions);
  
  fs.writeFileSync(file, content);
}

inject('./src/pages/index.astro', enTools, 'en');
inject('./src/pages/tr/index.astro', trTools, 'tr');

console.log('index.astro files updated.');
