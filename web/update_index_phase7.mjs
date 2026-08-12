import fs from 'fs';

const enTools = `  {
    href: '/extract-tables',
    idx: 'EXTRACT · TABLES',
    name: 'Extract Tables',
    line: 'PDF to CSV',
    Icon: Table,
    category: 'Extract PDF',
  },
  {
    href: '/pdf-to-json',
    idx: 'EXTRACT · JSON',
    name: 'PDF to JSON',
    line: 'Developer raw data',
    Icon: Braces,
    category: 'Extract PDF',
  },
  {
    href: '/scan-to-pdf',
    idx: 'CREATE · SCAN',
    name: 'Scan to PDF',
    line: 'Camera to PDF',
    Icon: Camera,
    category: 'Convert to PDF',
  },
  {
    href: '/audio-reader',
    idx: 'EXTRACT · AUDIO',
    name: 'Audio Reader',
    line: 'TTS optimized text',
    Icon: Headphones,
    category: 'Extract PDF',
  },
`;

const trTools = `  {
    href: '/tr/extract-tables',
    idx: 'ÇIKART · TABLO',
    name: 'Tablo Çıkarıcı',
    line: 'PDF\\'ten CSV\\'ye',
    Icon: Table,
    category: 'PDF Çıkar',
  },
  {
    href: '/tr/pdf-to-json',
    idx: 'ÇIKART · JSON',
    name: 'PDF to JSON',
    line: 'Ham geliştirici verisi',
    Icon: Braces,
    category: 'PDF Çıkar',
  },
  {
    href: '/tr/scan-to-pdf',
    idx: 'OLUŞTUR · TARAYICI',
    name: 'Kameradan PDF',
    line: 'Scan to PDF',
    Icon: Camera,
    category: 'PDF\\'e Dönüştür',
  },
  {
    href: '/tr/audio-reader',
    idx: 'ÇIKART · SES',
    name: 'Sesli Okuma (TTS)',
    line: 'Ses motoru için metin',
    Icon: Headphones,
    category: 'PDF Çıkar',
  },
`;

function inject(file, additions) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('const tools = [', 'const tools = [\n' + additions);
  // Add missing icon imports
  content = content.replace("import { Sun,", "import { Sun, Table, Braces, Headphones,");
  fs.writeFileSync(file, content);
}

inject('./src/pages/index.astro', enTools);
inject('./src/pages/tr/index.astro', trTools);

console.log('index.astro files updated for Phase 7.');
