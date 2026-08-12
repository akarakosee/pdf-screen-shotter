import fs from 'fs';

const enTools = `  {
    href: '/pdf-to-html',
    idx: 'CONVERT · WEB',
    name: 'PDF to HTML',
    line: 'Convert to Web Page',
    Icon: FileText,
    category: 'Convert to PDF',
  },
  {
    href: '/extract-fonts',
    idx: 'EXTRACT · DESIGN',
    name: 'Extract Fonts',
    line: 'Recover TTF/OTF',
    Icon: FileUp,
    category: 'Organize PDF',
  },
  {
    href: '/remove-images',
    idx: 'OPTIMIZE · INK',
    name: 'Remove Images',
    line: 'Save Printer Ink',
    Icon: FileText,
    category: 'Organize PDF',
  },
  {
    href: '/extract-urls',
    idx: 'EXTRACT · LINKS',
    name: 'Extract URLs',
    line: 'Get all links',
    Icon: FileText,
    category: 'Organize PDF',
  },
  {
    href: '/remove-duplicates',
    idx: 'ORGANIZE · CLEAN',
    name: 'Remove Duplicates',
    line: 'Delete identical pages',
    Icon: FileText,
    category: 'Organize PDF',
  },
`;

const trTools = `  {
    href: '/tr/pdf-to-html',
    idx: 'DÖNÜŞTÜR · WEB',
    name: 'PDF to HTML',
    line: 'Web Sayfasına Çevir',
    Icon: FileText,
    category: 'PDF\\'ye Dönüştür',
  },
  {
    href: '/tr/extract-fonts',
    idx: 'ÇIKAR · TASARIM',
    name: 'Fontları Çıkar',
    line: 'TTF/OTF Kurtar',
    Icon: FileUp,
    category: 'PDF Düzenle',
  },
  {
    href: '/tr/remove-images',
    idx: 'OPTİMİZE · MÜREKKEP',
    name: 'Resimleri Sil',
    line: 'Mürekkep Tasarrufu',
    Icon: FileText,
    category: 'PDF Düzenle',
  },
  {
    href: '/tr/extract-urls',
    idx: 'ÇIKAR · LİNKLER',
    name: 'Linkleri Çıkar',
    line: 'Tüm URL\\'leri al',
    Icon: FileText,
    category: 'PDF Düzenle',
  },
  {
    href: '/tr/remove-duplicates',
    idx: 'DÜZENLE · TEMİZLE',
    name: 'Kopyaları Sil',
    line: 'Aynı sayfaları yok et',
    Icon: FileText,
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

console.log('index.astro files updated for Phase 3.');
