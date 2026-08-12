import fs from 'fs';

const enTools = `  {
    href: '/viewer-prefs',
    idx: 'SECURITY · SETTINGS',
    name: 'Viewer Preferences',
    line: 'Force full screen PDF',
    Icon: Settings,
    category: 'Protect PDF',
  },
  {
    href: '/extract-hidden-text',
    idx: 'SECURITY · FORENSICS',
    name: 'Extract Hidden Text',
    line: 'Find invisible words',
    Icon: Search,
    category: 'Protect PDF',
  },
  {
    href: '/wipe-bookmarks',
    idx: 'SECURITY · STRUCTURE',
    name: 'Wipe Bookmarks',
    line: 'Destroy TOC structure',
    Icon: BookX,
    category: 'Protect PDF',
  },
`;

const trTools = `  {
    href: '/tr/viewer-prefs',
    idx: 'GÜVENLİK · AYARLAR',
    name: 'Açılış Ayarları',
    line: 'Tam ekran zorla',
    Icon: Settings,
    category: 'PDF Güvenliği',
  },
  {
    href: '/tr/extract-hidden-text',
    idx: 'GÜVENLİK · ADLİ BİLİŞİM',
    name: 'Gizli Yazı Bul',
    line: 'Görünmez metinleri bul',
    Icon: Search,
    category: 'PDF Güvenliği',
  },
  {
    href: '/tr/wipe-bookmarks',
    idx: 'GÜVENLİK · YAPI',
    name: 'İçindekiler Sil',
    line: 'TOC yapısını yok et',
    Icon: BookX,
    category: 'PDF Güvenliği',
  },
`;

function inject(file, additions) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('const tools = [', 'const tools = [\n' + additions);
  // Add missing icon imports
  content = content.replace("import { Sun,", "import { Sun, Settings, BookX,");
  fs.writeFileSync(file, content);
}

inject('./src/pages/index.astro', enTools);
inject('./src/pages/tr/index.astro', trTools);

console.log('index.astro files updated for Phase 6.');
