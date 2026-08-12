import fs from 'fs';

const enTools = `  {
    href: '/extract-attachments',
    idx: 'EXTRACT · FILES',
    name: 'Extract Attachments',
    line: 'Recover hidden files',
    Icon: Archive,
    category: 'Organize PDF',
  },
  {
    href: '/extract-colors',
    idx: 'EXTRACT · DESIGN',
    name: 'Extract Color Palette',
    line: 'Get all HEX codes',
    Icon: Palette,
    category: 'Organize PDF',
  },
  {
    href: '/remove-text',
    idx: 'OPTIMIZE · TEMPLATE',
    name: 'Remove Text',
    line: 'Strip all text content',
    Icon: Eraser,
    category: 'Organize PDF',
  },
`;

const trTools = `  {
    href: '/tr/extract-attachments',
    idx: 'ÇIKAR · DOSYALAR',
    name: 'Ekleri Çıkar',
    line: 'Gizli dosyaları sök',
    Icon: Archive,
    category: 'PDF Düzenle',
  },
  {
    href: '/tr/extract-colors',
    idx: 'ÇIKAR · TASARIM',
    name: 'Renk Paleti Çıkar',
    line: 'Tüm HEX kodlarını bul',
    Icon: Palette,
    category: 'PDF Düzenle',
  },
  {
    href: '/tr/remove-text',
    idx: 'OPTİMİZE · ŞABLON',
    name: 'Yazıları Sil',
    line: 'Tüm metni temizle',
    Icon: Eraser,
    category: 'PDF Düzenle',
  },
`;

function inject(file, additions) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('const tools = [', 'const tools = [\n' + additions);
  fs.writeFileSync(file, content);
}

inject('./src/pages/index.astro', enTools);
inject('./src/pages/tr/index.astro', trTools);

console.log('index.astro files updated for Phase 4.');
