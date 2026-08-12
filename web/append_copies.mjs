import fs from 'fs';

const newCopies = `
export const removeAnnotationsCopy = {
  en: {
    title: 'Remove Annotations — clear comments and forms from PDF',
    description: 'Instantly strip all highlights, sticky notes, comments, and form fields from your PDF.',
    h1: 'Remove Annotations',
    tagline: 'Remove all annotations, comments, and form fields from your PDF.',
    howToName: 'How to remove annotations from a PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select the PDF file.' },
      { name: 'Clean', text: 'All annotations will be instantly stripped locally.' },
      { name: 'Download', text: 'Get your clean PDF.' }
    ],
  },
  tr: {
    title: 'Açıklamaları Sil — PDF yorumlarını ve formlarını temizle',
    description: 'PDF belgenizdeki tüm vurguları, yapışkan notları, yorumları ve form alanlarını tek tıkla silin.',
    h1: 'Açıklamaları Sil',
    tagline: 'PDF belgenizdeki tüm açıklamaları, yorumları ve form alanlarını temizleyin.',
    howToName: 'PDF açıklamaları nasıl silinir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'PDF dosyasını seçin.' },
      { name: 'Temizle', text: 'Tüm açıklamalar cihazınızda anında silinir.' },
      { name: 'İndir', text: 'Temiz PDF dosyanızı alın.' }
    ],
  }
};

export const pdfToWebpCopy = {
  en: {
    title: 'PDF to WebP — convert in your browser',
    description: 'Convert PDF pages to WebP format for 30% smaller file sizes with no loss in quality.',
    h1: 'PDF to WebP',
    tagline: 'Convert PDF pages to modern, lightweight WebP images directly in your browser.',
    howToName: 'How to convert PDF to WebP',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Drop your PDF here.' },
      { name: 'Convert', text: 'Pages are converted to high-quality WebP.' },
      { name: 'Download', text: 'Download the ZIP archive.' }
    ],
  },
  tr: {
    title: 'PDF to WebP — tarayıcınızda dönüştürün',
    description: 'Kalite kaybı olmadan %30 daha küçük dosya boyutları için PDF sayfalarını WebP formatına dönüştürün.',
    h1: 'PDF to WebP',
    tagline: 'PDF sayfalarını tarayıcınızda doğrudan modern ve hafif WebP görüntülerine dönüştürün.',
    howToName: 'PDF WebP formatına nasıl dönüştürülür',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'PDF dosyanızı sürükleyin.' },
      { name: 'Dönüştür', text: 'Sayfalar yüksek kaliteli WebP olarak dönüştürülür.' },
      { name: 'İndir', text: 'ZIP arşivini indirin.' }
    ],
  }
};

export const autoCropCopy = {
  en: {
    title: 'Auto-Crop PDF — remove white margins automatically',
    description: 'Automatically detect and crop out unnecessary white margins from your PDF pages.',
    h1: 'Auto-Crop PDF',
    tagline: 'Smart detection automatically removes white borders and margins from every page.',
    howToName: 'How to auto-crop a PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a scanned or wide-margin PDF.' },
      { name: 'Analyze', text: 'Each page is analyzed to find the actual content box.' },
      { name: 'Download', text: 'Download the cropped, mobile-friendly PDF.' }
    ],
  },
  tr: {
    title: 'Otomatik Kırp — beyaz boşlukları otomatik kaldır',
    description: 'PDF sayfalarınızdaki gereksiz beyaz boşlukları ve kenar boşluklarını otomatik olarak tespit edip kırpın.',
    h1: 'Otomatik Kırp',
    tagline: 'Akıllı tarama sistemi sayesinde tüm sayfalardaki gereksiz beyaz çerçeveleri otomatik olarak kırpın.',
    howToName: 'PDF otomatik olarak nasıl kırpılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Geniş kenarlı veya taranmış bir PDF seçin.' },
      { name: 'Analiz', text: 'Her sayfanın içeriği tespit edilerek sınırları çizilir.' },
      { name: 'İndir', text: 'Kırpılmış ve telefonda okunması kolay PDF dosyanızı indirin.' }
    ],
  }
};
`;
fs.appendFileSync('./src/i18n/toolCopy.ts', '\n' + newCopies);
console.log('Appended to toolCopy.ts');
