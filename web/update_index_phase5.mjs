import fs from 'fs';

const enTools = `  {
    href: '/extract-javascript',
    idx: 'EXTRACT · MALWARE',
    name: 'Extract JavaScript',
    line: 'Find malicious code',
    Icon: Code,
    category: 'Organize PDF',
  },
  {
    href: '/split-bookmarks',
    idx: 'SPLIT · CHAPTERS',
    name: 'Split by Bookmarks',
    line: 'Split at TOC chapters',
    Icon: BookOpen,
    category: 'Organize PDF',
  },
  {
    href: '/split-blank',
    idx: 'SPLIT · SCANNERS',
    name: 'Split by Blank Page',
    line: 'Auto batch separation',
    Icon: FileMinus,
    category: 'Organize PDF',
  },
`;

const trTools = `  {
    href: '/tr/extract-javascript',
    idx: 'ÇIKAR · GÜVENLİK',
    name: 'JS Sökücü',
    line: 'Zararlı kodları bul',
    Icon: Code,
    category: 'PDF Düzenle',
  },
  {
    href: '/tr/split-bookmarks',
    idx: 'BÖL · İÇİNDEKİLER',
    name: 'Bölümlere Göre Ayır',
    line: 'Kitapları parçala',
    Icon: BookOpen,
    category: 'PDF Düzenle',
  },
  {
    href: '/tr/split-blank',
    idx: 'BÖL · TARAYICILAR',
    name: 'Boş Sayfadan Parçala',
    line: 'Toplu taramaları ayır',
    Icon: FileMinus,
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

console.log('index.astro files updated for Phase 5.');
