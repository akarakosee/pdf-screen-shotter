// Page copy for the converter tools, EN + TR. All strings are final copy.

interface QA {
  q: string;
  a: string;
}
interface Step {
  name: string;
  text: string;
}
export interface ToolCopy {
  title: string;
  description: string;
  h1: string;
  tagline: string;
  howToName: string;
  howItWorks: string;
  faqTitle: string;
  steps: Step[];
  faq: QA[];
  crossLink: { href: string; label: string };
}

const privacyEn: QA = {
  q: 'Are my PDF files uploaded to a server?',
  a: 'No. The conversion runs entirely inside your browser using WebAssembly. Your files are read locally and the images are saved back to your device — no copy is transmitted anywhere. The source code is public, so this can be verified.',
};
const limitsEn: QA = {
  q: 'Is there a file size or page limit?',
  a: 'No fixed limits. Because your own device does the work, even documents with hundreds of pages convert page by page without running out of memory. Very large jobs simply take longer.',
};
const rangeEn: QA = {
  q: 'Can I convert only some pages?',
  a: 'Yes. Enter a page range like 1-5,8,11-13 in the Pages field. Single pages and ranges can be combined, separated by commas.',
};
const brokenEn: QA = {
  q: 'What happens with password-protected or damaged PDFs?',
  a: 'They are skipped with a clear message, and the rest of your files continue converting. Password-protected files cannot be opened yet; support for entering a password is planned.',
};

const stepsEn = (fmt: string): Step[] => [
  { name: 'Add your PDF', text: 'Drop one or more PDF files on the page, or click to browse.' },
  {
    name: 'Choose resolution and pages',
    text: 'Pick a DPI preset (150 is recommended) and, if you need it, a page range like 1-5,8.',
  },
  {
    name: 'Convert and download',
    text: `Press Convert and download your ${fmt} file, or a ZIP when there are several pages.`,
  },
];

const privacyTr: QA = {
  q: 'PDF dosyalarım bir sunucuya yükleniyor mu?',
  a: 'Hayır. Dönüşüm, WebAssembly kullanılarak tamamen tarayıcının içinde çalışır. Dosyaların cihazında okunur ve görüntüler yine cihazına kaydedilir — hiçbir kopya bir yere iletilmez. Kaynak kodu açıktır; bu iddia doğrulanabilir.',
};
const limitsTr: QA = {
  q: 'Dosya boyutu veya sayfa sınırı var mı?',
  a: 'Sabit bir sınır yok. İşi kendi cihazın yaptığı için yüzlerce sayfalık belgeler bile sayfa sayfa, bellek sorunu yaşanmadan dönüştürülür. Çok büyük işler yalnızca daha uzun sürer.',
};
const rangeTr: QA = {
  q: 'Yalnızca bazı sayfaları dönüştürebilir miyim?',
  a: 'Evet. Sayfalar alanına 1-5,8,11-13 gibi bir aralık yaz. Tek sayfalar ve aralıklar virgülle ayrılarak birlikte kullanılabilir.',
};
const brokenTr: QA = {
  q: 'Şifreli veya hasarlı PDF dosyalarında ne olur?',
  a: 'Bu dosyalar açık bir mesajla atlanır ve kalan dosyaların dönüşümü sürer. Şifreli dosyalar şimdilik açılamıyor; şifre girme desteği planlanıyor.',
};

const stepsTr = (fmt: string): Step[] => [
  {
    name: 'PDF dosyanı ekle',
    text: 'Bir veya birden çok PDF dosyasını sayfaya bırak ya da tıklayıp seç.',
  },
  {
    name: 'Çözünürlük ve sayfaları seç',
    text: 'Bir DPI ön ayarı seç (önerilen 150) ve gerekiyorsa 1-5,8 gibi bir sayfa aralığı gir.',
  },
  {
    name: 'Dönüştür ve indir',
    text: `Dönüştür düğmesine bas; tek sayfada ${fmt} dosyasını, birden çok sayfada ZIP arşivini indir.`,
  },
];

export const toolCopy: Record<'png' | 'jpg', Record<'en' | 'tr', ToolCopy>> = {
  png: {
    en: {
      title: 'PDF to PNG — convert in your browser, files never uploaded',
      description:
        'Convert PDF pages to PNG images, free and without limits. Everything runs in your browser — your files never leave your device.',
      h1: 'PDF to PNG',
      tagline:
        'Convert PDF pages to PNG images — free, no limits, and your files stay on your device.',
      howToName: 'How to convert PDF to PNG in your browser',
      howItWorks: 'How it works',
      faqTitle: 'Frequently asked questions',
      steps: stepsEn('PNG'),
      faq: [
        privacyEn,
        {
          q: 'Which resolution should I choose?',
          a: '150 DPI is right for most uses — presentations, documents, and screens. Choose 300 DPI for printing, and 100 DPI when you want smaller files for quick sharing.',
        },
        rangeEn,
        limitsEn,
        brokenEn,
        {
          q: 'How do I get the results?',
          a: 'A single converted page downloads directly as a PNG file. Multiple pages are packed into one ZIP archive, named after your document.',
        },
      ],
      crossLink: { href: '/pdf-to-jpg', label: 'Need smaller files for photos or scans? Convert PDF to JPG instead.' },
    },
    tr: {
      title: "PDF'i PNG'ye çevir — tarayıcında, dosyalar yüklenmeden",
      description:
        "PDF sayfalarını ücretsiz ve sınırsız biçimde PNG görüntülerine dönüştür. Her şey tarayıcında çalışır — dosyaların cihazından çıkmaz.",
      h1: "PDF'ten PNG'ye",
      tagline:
        'PDF sayfalarını PNG görüntülerine dönüştür — ücretsiz, sınırsız ve dosyaların cihazında kalır.',
      howToName: "Tarayıcıda PDF'ten PNG'ye dönüştürme",
      howItWorks: 'Nasıl çalışır',
      faqTitle: 'Sık sorulan sorular',
      steps: stepsTr('PNG'),
      faq: [
        privacyTr,
        {
          q: 'Hangi çözünürlüğü seçmeliyim?',
          a: '150 DPI çoğu kullanım için doğrudur — sunumlar, belgeler ve ekranlar. Baskı için 300 DPI, hızlı paylaşım için daha küçük dosyalar istiyorsan 100 DPI seç.',
        },
        rangeTr,
        limitsTr,
        brokenTr,
        {
          q: 'Sonuçları nasıl alırım?',
          a: 'Tek sayfa doğrudan PNG dosyası olarak iner. Birden çok sayfa, belgenin adını taşıyan tek bir ZIP arşivinde toplanır.',
        },
      ],
      crossLink: {
        href: '/tr/pdf-to-jpg',
        label: "Fotoğraf ve taramalar için daha küçük dosya mı gerekiyor? PDF'i JPG'ye çevir.",
      },
    },
  },
  jpg: {
    en: {
      title: 'PDF to JPG — convert in your browser, files never uploaded',
      description:
        'Convert PDF pages to JPG images, free and without limits. Everything runs in your browser — your files never leave your device.',
      h1: 'PDF to JPG',
      tagline:
        'Convert PDF pages to JPG images — free, no limits, and your files stay on your device.',
      howToName: 'How to convert PDF to JPG in your browser',
      howItWorks: 'How it works',
      faqTitle: 'Frequently asked questions',
      steps: stepsEn('JPG'),
      faq: [
        privacyEn,
        {
          q: 'When is JPG better than PNG?',
          a: 'JPG files are much smaller for photographs and scanned pages, which makes them easier to email or upload. For text, diagrams, or anything that needs sharp edges and lossless quality, PNG is the better choice.',
        },
        rangeEn,
        limitsEn,
        brokenEn,
        {
          q: 'How do I get the results?',
          a: 'A single converted page downloads directly as a JPG file. Multiple pages are packed into one ZIP archive, named after your document.',
        },
      ],
      crossLink: {
        href: '/pdf-to-png',
        label: 'Need lossless quality for text or diagrams? Convert PDF to PNG instead.',
      },
    },
    tr: {
      title: "PDF'i JPG'ye çevir — tarayıcında, dosyalar yüklenmeden",
      description:
        "PDF sayfalarını ücretsiz ve sınırsız biçimde JPG görüntülerine dönüştür. Her şey tarayıcında çalışır — dosyaların cihazından çıkmaz.",
      h1: "PDF'ten JPG'ye",
      tagline:
        'PDF sayfalarını JPG görüntülerine dönüştür — ücretsiz, sınırsız ve dosyaların cihazında kalır.',
      howToName: "Tarayıcıda PDF'ten JPG'ye dönüştürme",
      howItWorks: 'Nasıl çalışır',
      faqTitle: 'Sık sorulan sorular',
      steps: stepsTr('JPG'),
      faq: [
        privacyTr,
        {
          q: "JPG ne zaman PNG'den daha iyidir?",
          a: 'Fotoğraflar ve taranmış sayfalarda JPG dosyaları çok daha küçüktür; e-postayla göndermesi ve yüklemesi kolaylaşır. Metin, şema ya da keskin kenar ve kayıpsız kalite gerektiren içerikte ise PNG daha doğru seçimdir.',
        },
        rangeTr,
        limitsTr,
        brokenTr,
        {
          q: 'Sonuçları nasıl alırım?',
          a: 'Tek sayfa doğrudan JPG dosyası olarak iner. Birden çok sayfa, belgenin adını taşıyan tek bir ZIP arşivinde toplanır.',
        },
      ],
      crossLink: {
        href: '/tr/pdf-to-png',
        label: "Metin ve şemalar için kayıpsız kalite mi gerekiyor? PDF'i PNG'ye çevir.",
      },
    },
  },
};

const mergeStepsEn: Step[] = [
  { name: 'Add your PDFs', text: 'Drop two or more PDF files on the page, or click to browse.' },
  {
    name: 'Set the order',
    text: 'Use the up/down arrows on each file to put them in the order you want merged.',
  },
  { name: 'Merge and download', text: 'Press Merge and download the single combined PDF.' },
];

const mergeStepsTr: Step[] = [
  {
    name: 'PDF dosyalarını ekle',
    text: 'İki veya daha fazla PDF dosyasını sayfaya bırak ya da tıklayıp seç.',
  },
  {
    name: 'Sırayı ayarla',
    text: 'Her dosyanın yanındaki yukarı/aşağı oklarıyla birleştirme sırasını belirle.',
  },
  { name: 'Birleştir ve indir', text: 'Birleştir düğmesine bas ve tek bir PDF olarak indir.' },
];

export const mergeCopy: Record<'en' | 'tr', ToolCopy> = {
  en: {
    title: 'Merge PDF — combine files in your browser, files never uploaded',
    description:
      'Combine multiple PDF files into one document, free and without limits. Everything runs in your browser — your files never leave your device.',
    h1: 'Merge PDF',
    tagline:
      'Combine multiple PDFs into one document — free, no limits, and your files stay on your device.',
    howToName: 'How to merge PDF files in your browser',
    howItWorks: 'How it works',
    faqTitle: 'Frequently asked questions',
    steps: mergeStepsEn,
    faq: [
      {
        q: 'Are my PDF files uploaded to a server?',
        a: 'No. The merge runs entirely inside your browser using WebAssembly. Your files are read locally and the merged PDF is saved back to your device — no copy is transmitted anywhere.',
      },
      {
        q: 'Can I change the order of the files?',
        a: 'Yes. Use the up and down arrows next to each file to arrange them in the order you want them merged.',
      },
      {
        q: 'Is there a file count or size limit?',
        a: 'No fixed limit. Because your own device does the work, even many large files merge without being uploaded anywhere.',
      },
      {
        q: 'What happens with password-protected or damaged PDFs?',
        a: 'They are skipped with a clear message, and the rest of your files still merge together. Password-protected files cannot be opened yet.',
      },
    ],
    crossLink: { href: '/pdf-to-png', label: 'Need to turn PDF pages into images instead? Convert PDF to PNG.' },
  },
  tr: {
    title: "PDF Birleştir — tarayıcında birleştir, dosyalar yüklenmeden",
    description:
      'Birden çok PDF dosyasını ücretsiz ve sınırsız biçimde tek bir belgede birleştir. Her şey tarayıcında çalışır — dosyaların cihazından çıkmaz.',
    h1: 'PDF Birleştir',
    tagline: 'Birden çok PDF\'i tek bir belgede birleştir — ücretsiz, sınırsız ve dosyaların cihazında kalır.',
    howToName: 'Tarayıcıda PDF dosyalarını birleştirme',
    howItWorks: 'Nasıl çalışır',
    faqTitle: 'Sık sorulan sorular',
    steps: mergeStepsTr,
    faq: [
      {
        q: 'PDF dosyalarım bir sunucuya yükleniyor mu?',
        a: 'Hayır. Birleştirme, WebAssembly kullanılarak tamamen tarayıcının içinde çalışır. Dosyalar cihazında okunur ve birleştirilmiş PDF yine cihazına kaydedilir — hiçbir kopya bir yere iletilmez.',
      },
      {
        q: 'Dosyaların sırasını değiştirebilir miyim?',
        a: 'Evet. Her dosyanın yanındaki yukarı ve aşağı oklarını kullanarak birleştirme sırasını istediğin gibi ayarlayabilirsin.',
      },
      {
        q: 'Dosya sayısı veya boyutu için bir sınır var mı?',
        a: 'Sabit bir sınır yok. İşi kendi cihazın yaptığı için çok sayıda büyük dosya bile hiçbir yere yüklenmeden birleştirilir.',
      },
      {
        q: 'Şifreli veya hasarlı PDF dosyalarında ne olur?',
        a: 'Bu dosyalar açık bir mesajla atlanır ve kalan dosyalar yine de birleştirilir. Şifreli dosyalar şimdilik açılamıyor.',
      },
    ],
    crossLink: {
      href: '/tr/pdf-to-png',
      label: "PDF sayfalarını görüntüye çevirmek mi istiyorsun? PDF'i PNG'ye çevir.",
    },
  },
};

export const splitCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Split PDF — extract pages in your browser, files never uploaded",
    description: "Extract and separate PDF pages into multiple files, free and without limits. Everything runs in your browser — your files never leave your device.",
    h1: "Split PDF",
    tagline: "Extract pages from your PDF into new documents — free, no limits, and your files stay on your device.",
    howToName: "How to split PDF files in your browser",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Add your PDF", text: "Drop a PDF file on the page." },
      { name: "Select pages", text: "Click to select the pages you want to extract from the visual grid." },
      { name: "Extract or Burst", text: "Extract them into a single PDF or burst them into individual page files." }
    ],
    faq: [],
    crossLink: { href: "/merge-pdf", label: "Need to combine PDFs instead? Merge PDF files." },
  },
  tr: {
    title: "PDF Böl — tarayıcında ayır, dosyalar yüklenmeden",
    description: "PDF sayfalarını çıkart ve ayrı dosyalara böl. Her şey tarayıcında çalışır — dosyaların cihazından çıkmaz.",
    h1: "PDF Böl",
    tagline: "PDF dosyandan sayfaları çıkararak yeni belgeler oluştur — ücretsiz, sınırsız ve dosyaların cihazında kalır.",
    howToName: "Tarayıcıda PDF dosyalarını bölme",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sık sorulan sorular",
    steps: [
      { name: "PDF dosyanı ekle", text: "Bir PDF dosyasını sayfaya bırak." },
      { name: "Sayfaları seç", text: "Görsel ızgaradan çıkarmak istediğin sayfalara tıkla." },
      { name: "Çıkar veya Patlat", text: "Tek bir PDF olarak çıkar veya her bir sayfayı ayrı bir dosya (ZIP) olarak indir." }
    ],
    faq: [],
    crossLink: { href: "/tr/merge-pdf", label: "Bölmek yerine birleştirmek mi istiyorsun? PDF Birleştir." },
  },
};
