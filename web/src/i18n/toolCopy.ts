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
      crossLink: { href: '/png-to-pdf', label: 'Have PNG images or diagrams? Convert PNG to PDF instead.' },
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
        href: '/tr/png-to-pdf',
        label: "Elinde PNG görseller veya şemalar mı var? Görselleri PDF belgesine dönüştür.",
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
        href: '/img-to-pdf',
        label: 'Have JPG or PNG images? Convert JPG to PDF instead.',
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
        href: '/tr/img-to-pdf',
        label: 'Elinde JPG veya PNG görseller mi var? Görselleri PDF belgesine dönüştür.',
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
    tagline: "Extract pages from your PDF into new documents — free, unlimited, and 100% private.",
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
    tagline: "PDF'ten sayfaları çıkarıp yeni belgeler oluşturun — ücretsiz ve %100 yerel.",
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

export const organizeCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Organize PDF — reorder, rotate, or delete pages locally",
    description: "Sort, reorder, rotate, or delete pages in your PDF document. Processed securely on your device without server uploads.",
    h1: "Organize PDF",
    tagline: "Rearrange, rotate, or trim pages in your PDF document — free, fast, and 100% private.",
    howToName: "How to organize PDF pages in your browser",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Drop your PDF file onto the page." },
      { name: "Arrange Pages", text: "Drag to reorder, click rotate buttons, or remove unwanted pages." },
      { name: "Save PDF", text: "Download your newly organized document directly to your device." }
    ],
    crossLink: { href: "/rotate-pdf", label: "Need to only rotate pages? Rotate PDF." },
  },
  tr: {
    title: "PDF Düzenle — sayfaları sırala, döndür veya sil",
    description: "PDF dosyanızdaki sayfaları sıralayın, çevirin veya silin. Tamamen tarayıcınızda ve gizlilik garantisiyle çalışır.",
    h1: "PDF Düzenle",
    tagline: "Sayfaları sırala, döndür veya sil — ücretsiz ve %100 yerel.",
    howToName: "Tarayıcıda PDF sayfaları nasıl düzenlenir",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "Düzenlemek istediğiniz PDF dosyasını yükleyin." },
      { name: "Sayfaları Düzenle", text: "Sürükleyip sıralayın, döndürme butonlarını kullanın veya sayfaları silin." },
      { name: "PDF Kaydet", text: "Yeniden düzenlenmiş belgenizi cihazınıza indirin." }
    ],
    crossLink: { href: "/tr/rotate-pdf", label: "Sadece sayfaları döndürmek mi istiyorsunuz? PDF Döndür." },
  },
};

export const extractCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Extract Text from PDF — locally, files never uploaded",
    description: "Extract all readable text from your PDF into a TXT file directly in your browser. No servers involved.",
    h1: "Extract Text from PDF",
    tagline: "Pull all readable text from your PDF into a TXT file — free and 100% private.",
    howToName: "How to extract text from a PDF file in your browser",
    howItWorks: "How it works",
    steps: [
      { name: "Add PDF", text: "Drop the PDF file you want to extract text from." },
      { name: "Extract", text: "The system scans the pages and pulls out the text." },
      { name: "Save TXT", text: "Download the extracted text as a simple .txt file." }
    ],
    crossLink: { href: "/protect-pdf", label: "Need to secure your file? Protect PDF." },
  },
  tr: {
    title: "PDF'ten Metin Çıkar — yazıları kopyala, cihazında kalsın",
    description: "PDF dosyanızdaki tüm yazıları TXT dosyası olarak dışa aktarın. Sunucusuz, doğrudan tarayıcınızın içinde çalışır.",
    h1: "PDF'ten Metin Çıkar",
    tagline: "PDF'teki tüm metinleri çıkarıp TXT dosyası olarak kaydedin — ücretsiz ve yerel.",
    howToName: "Tarayıcıda PDF dosyasından metin nasıl çıkarılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF ekle", text: "İçindeki yazıları almak istediğiniz dosyayı sayfaya bırakın." },
      { name: "Çıkar", text: "Sistem sayfaları tarar ve içindeki metinleri çeker." },
      { name: "TXT İndir", text: "Çıkarılan metni basit bir .txt dosyası olarak cihazına kaydet." }
    ],
    crossLink: { href: "/tr/protect-pdf", label: "Dosyanı şifrelemek mi istiyorsun? PDF Şifrele." },
  },
};

export const sanitizeCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Sanitize PDF — remove metadata, files never uploaded",
    description: "Remove author, creation date, and all hidden metadata from your PDF file for maximum privacy. No servers involved.",
    h1: "Sanitize PDF",
    tagline: "Strip hidden metadata and digital footprints from your PDF — free and 100% private.",
    howToName: "How to remove metadata from a PDF file in your browser",
    howItWorks: "How it works",
    steps: [
      { name: "Add PDF", text: "Drop the PDF file you want to sanitize." },
      { name: "Clean Data", text: "The system strips author, dates, and all hidden properties." },
      { name: "Save Clean PDF", text: "Download the sanitized, metadata-free PDF to your device." }
    ],
    crossLink: { href: "/protect-pdf", label: "Need even more privacy? Protect PDF." },
  },
  tr: {
    title: "PDF Temizle — meta verileri sil, dosyalar cihazında kalsın",
    description: "PDF dosyanızdaki yazar, oluşturulma tarihi ve gizli meta verilerini silerek tam gizlilik sağlayın. Sunucu kullanılmaz.",
    h1: "PDF Temizle (Meta Veri Sil)",
    tagline: "PDF'teki gizli meta verileri ve dijital izleri temizleyin — ücretsiz ve yerel.",
    howToName: "Tarayıcıda PDF dosyasından meta veriler nasıl silinir",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF ekle", text: "Temizlemek istediğiniz PDF dosyasını sayfaya bırakın." },
      { name: "Verileri Temizle", text: "Sistem yazar, tarih ve tüm gizli özellikleri siler." },
      { name: "Temiz PDF İndir", text: "Meta verilerinden arındırılmış PDF'i cihazınıza kaydedin." }
    ],
    crossLink: { href: "/tr/protect-pdf", label: "Daha fazla gizlilik mi lazım? PDF Şifrele." },
  },
};

export const watermarkCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Add Watermark to PDF — free, secure, local",
    description: "Stamp your PDF with a custom text watermark. Protect your documents from unauthorized use. Processed completely in your browser.",
    h1: "Watermark PDF",
    tagline: "Add a diagonal watermark to every page of your document in seconds.",
    howToName: "How to add a watermark to a PDF online",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file you want to watermark." },
      { name: "Set Text", text: "Type your custom watermark text (e.g. 'CONFIDENTIAL')." },
      { name: "Save", text: "Download the watermarked PDF directly to your device." }
    ],
    crossLink: { href: "/protect-pdf", label: "Want to lock the file? Protect PDF." },
  },
  tr: {
    title: "PDF'e Filigran Ekle — ücretsiz, güvenli, yerel",
    description: "PDF'inize özel metin filigranı (damga) ekleyin. Belgelerinizi izinsiz kullanıma karşı koruyun. Tamamen tarayıcınızda işlenir.",
    h1: "Filigran Ekle",
    tagline: "Belgenizin her sayfasına saniyeler içinde damga (filigran) vurun.",
    howToName: "PDF dosyasına nasıl filigran eklenir",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "Filigran eklemek istediğiniz dosyayı sayfaya bırakın." },
      { name: "Metin Yaz", text: "Damga metninizi girin (Örn: 'GİZLİDİR')." },
      { name: "Kaydet", text: "Filigran basılmış PDF dosyasını cihazınıza indirin." }
    ],
    crossLink: { href: "/tr/protect-pdf", label: "Dosyayı kilitlemek mi istiyorsunuz? PDF Şifrele." },
  },
};

export const numberCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Add Page Numbers to PDF — free, fast, local",
    description: "Easily add page numbers to your PDF documents. Customize format and position. Processed securely on your device.",
    h1: "Add Page Numbers",
    tagline: "Organize your documents by adding page numbers instantly.",
    howToName: "How to add page numbers to a PDF online",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file you want to number." },
      { name: "Customize", text: "Choose the position and format (e.g., '1 of 10')." },
      { name: "Save", text: "Download the numbered PDF directly to your device." }
    ],
    crossLink: { href: "/watermark-pdf", label: "Want to stamp every page? Add Watermark." },
  },
  tr: {
    title: "PDF'e Sayfa Numarası Ekle — ücretsiz, hızlı, yerel",
    description: "PDF belgelerinize kolayca sayfa numarası ekleyin. Formatı ve konumu ayarlayın. Tamamen cihazınızda güvenle işlenir.",
    h1: "Sayfa Numarası Ekle",
    tagline: "Belgelerinizi anında numaralandırarak daha düzenli hale getirin.",
    howToName: "PDF dosyasına nasıl sayfa numarası eklenir",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "Numara eklemek istediğiniz dosyayı sayfaya bırakın." },
      { name: "Ayarla", text: "Konumu ve numaralandırma formatını seçin (Örn: '1 / 10')." },
      { name: "Kaydet", text: "Numaralandırılmış PDF dosyasını cihazınıza indirin." }
    ],
    crossLink: { href: "/tr/watermark-pdf", label: "Her sayfaya damga mı vurmak istiyorsunuz? Filigran Ekle." },
  },
};

export const protectCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Protect PDF — encrypt your file locally with a password",
    description: "Encrypt and protect your PDF document with a strong password. Processed securely in your browser.",
    h1: "Protect PDF",
    tagline: "Lock your confidential documents with password encryption — free and 100% private.",
    howToName: "How to password-protect a PDF online",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file you want to protect." },
      { name: "Set Password", text: "Enter a strong password to lock the file." },
      { name: "Download", text: "Save the encrypted PDF directly to your device." }
    ],
    crossLink: { href: "/unlock-pdf", label: "Need to remove a password? Unlock PDF." },
  },
  tr: {
    title: "PDF Şifrele — belgeni parolayla kilitle ve koru",
    description: "PDF dosyanızı güçlü bir şifreyle koruma altına alın. Tüm şifreleme tarayıcınızda ve gizlilikle yapılır.",
    h1: "PDF Şifrele",
    tagline: "Gizli belgelerinizi saniyeler içinde parola ile kilitleyin — ücretsiz ve %100 yerel.",
    howToName: "PDF dosyası nasıl şifrelenir",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "Şifrelemek istediğiniz dosyayı sayfaya bırakın." },
      { name: "Şifre Belirle", text: "Dosyanızı açmak için kullanılacak güçlü bir şifre yazın." },
      { name: "Kaydet", text: "Şifrelenmiş PDF belgenizi anında indirin." }
    ],
    crossLink: { href: "/tr/unlock-pdf", label: "Bir dosyanın şifresini mi kaldıracaksınız? PDF Şifre Kaldır." },
  },
};

export const unlockCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Unlock PDF — remove password protection locally",
    description: "Remove passwords and security restrictions from your PDF files in seconds. Completely local and private.",
    h1: "Unlock PDF",
    tagline: "Strip password protection from PDF documents — free, fast, and secure.",
    howToName: "How to remove a password from a PDF online",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Drop your password-protected PDF document." },
      { name: "Enter Password", text: "Enter the current password to unlock the document." },
      { name: "Save Unlocked PDF", text: "Download the decrypted, password-free PDF." }
    ],
    crossLink: { href: "/protect-pdf", label: "Need to lock a document? Protect PDF." },
  },
  tr: {
    title: "PDF Şifre Kaldır — parolayı ve korumayı kaldır",
    description: "PDF dosyalarınızdaki şifreleri ve kısıtlamaları saniyeler içinde kaldırın. %100 gizli ve tarayıcınızda.",
    h1: "PDF Şifre Kaldır",
    tagline: "PDF belgelerinizdeki şifre korumasını temizleyin — ücretsiz, hızlı ve güvenli.",
    howToName: "PDF dosyasının şifresi nasıl kaldırılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "Şifreli PDF belgenizi yükleyin." },
      { name: "Şifreyi Gir", text: "Kilidi açmak için mevcut şifreyi girin." },
      { name: "Şifresiz PDF İndir", text: "Koruması kaldırılmış temiz PDF belgenizi indirin." }
    ],
    crossLink: { href: "/tr/protect-pdf", label: "Bir belgeyi şifrelemek mi istiyorsunuz? PDF Şifrele." },
  },
};

export const rotateCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Rotate PDF — turn pages 90, 180, or 270 degrees locally",
    description: "Rotate individual PDF pages or all pages at once. Your files stay on your device — free, fast, and secure.",
    h1: "Rotate PDF",
    tagline: "Turn upside-down or sideways pages to the right orientation — free, instant, and 100% private.",
    howToName: "How to rotate PDF pages in your browser",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Drop your PDF document onto the page." },
      { name: "Rotate Pages", text: "Click the rotate buttons on individual pages or rotate all selected pages at once." },
      { name: "Download", text: "Save the newly oriented PDF straight to your device." }
    ],
    crossLink: { href: "/remove-pages", label: "Need to remove extra pages instead? Remove Pages." },
  },
  tr: {
    title: "PDF Döndür — sayfaları 90, 180 veya 270 derece çevir",
    description: "PDF sayfalarını tek tek veya topluca çevirin. Dosyalarınız cihazınızdan asla çıkmaz — ücretsiz ve güvenli.",
    h1: "PDF Döndür",
    tagline: "Ters veya yan duran sayfaları doğru açıda hizalayın — ücretsiz, anında ve %100 gizli.",
    howToName: "Tarayıcıda PDF sayfaları nasıl döndürülür",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "Döndürmek istediğiniz belgeyi sayfaya bırakın." },
      { name: "Sayfaları Döndür", text: "Sayfalardaki döndürme butonlarına tıklayın veya seçilenleri tek tıkla çevirin." },
      { name: "İndir", text: "Doğru açıya getirilmiş yeni PDF belgenizi anında indirin." }
    ],
    crossLink: { href: "/tr/remove-pages", label: "İstenmeyen sayfaları silmek mi istiyorsunuz? Sayfa Sil." },
  },
};

export const removeCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Remove Pages from PDF — delete unwanted pages locally",
    description: "Delete extra or sensitive pages from your PDF document in seconds. No servers involved, 100% private.",
    h1: "Remove Pages",
    tagline: "Strip unwanted pages from your PDF cleanly — free, unlimited, and entirely in your browser.",
    howToName: "How to remove pages from a PDF online",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Drop the PDF file you want to trim." },
      { name: "Select & Delete", text: "Click the trash icon on any page you want to remove." },
      { name: "Download PDF", text: "Save the cleaned PDF document without the deleted pages." }
    ],
    crossLink: { href: "/rotate-pdf", label: "Need to fix sideways pages? Rotate PDF." },
  },
  tr: {
    title: "PDF Sayfa Sil — istenmeyen sayfaları anında çıkar",
    description: "PDF dosyanızdan gereksiz veya hatalı sayfaları saniyeler içinde kaldırın. Sunucuya yüklenmez, gizlilik garantili.",
    h1: "PDF Sayfa Sil",
    tagline: "İstenmeyen sayfaları PDF belgenizden temizleyin — ücretsiz, sınırsız ve tarayıcınızda.",
    howToName: "PDF dosyasından sayfa nasıl silinir",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "Düzenlemek istediğiniz PDF dosyasını yükleyin." },
      { name: "Seç ve Sil", text: "Kaldırmak istediğiniz sayfaların üzerindeki çöp kutusu simgesine tıklayın." },
      { name: "PDF İndir", text: "Silinen sayfalar olmadan temiz PDF belgenizi indirin." }
    ],
    crossLink: { href: "/tr/rotate-pdf", label: "Yan duran sayfaları düzeltmek mi istiyorsunuz? PDF Döndür." },
  },
};

export const imgToPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "JPG to PDF — convert images to PDF document locally",
    description: "Convert JPG, PNG, and WebP images into a single PDF document in your browser. Organize, adjust orientation and margin, 100% private.",
    h1: "JPG to PDF",
    tagline: "Turn your images into a clean PDF document — free, instant, and 100% private.",
    howToName: "How to convert JPG images to PDF online",
    howItWorks: "How it works",
    steps: [
      { name: "Upload Images", text: "Drop one or more JPG, PNG, or WebP images onto the page." },
      { name: "Reorder & Configure", text: "Drag to reorder photos, choose page size, orientation, and margin." },
      { name: "Create PDF", text: "Download your beautifully combined PDF document instantly." }
    ],
    crossLink: { href: "/pdf-to-jpg", label: "Need to extract images from a PDF? Convert PDF to JPG." },
  },
  tr: {
    title: "JPG'den PDF'e — fotoğrafları ve görselleri PDF'e dönüştür",
    description: "JPG, PNG ve WebP görsellerinizi tarayıcınızda tek bir PDF belgesine dönüştürün. Sayfa yapısı ve kenar boşluklarını ayarlayın, %100 gizli.",
    h1: "JPG'den PDF'e",
    tagline: "Görsellerinizi anında PDF belgesine dönüştürün — ücretsiz, sınırsız ve tarayıcınızda.",
    howToName: "Görsellerden PDF nasıl oluşturulur",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "Görselleri Yükle", text: "Bir veya daha fazla JPG, PNG ya da WebP dosyasını sürükleyin." },
      { name: "Sırala ve Ayarla", text: "Fotoğrafların sırasını değiştirin, sayfa boyutu ve kenar boşluğu seçin." },
      { name: "PDF Oluştur", text: "Birleştirilmiş PDF belgenizi anında cihazınıza indirin." }
    ],
    crossLink: { href: "/tr/pdf-to-jpg", label: "PDF içindeki görselleri dışarı mı çıkarmak istiyorsunuz? PDF'ten JPG'ye." },
  },
};

export const pngToPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "PNG to PDF — convert PNG images to PDF document locally",
    description: "Convert PNG, JPG, and WebP images into a high-quality PDF document in your browser. Maintain transparency and sharp edges, 100% private.",
    h1: "PNG to PDF",
    tagline: "Turn your PNG images into a clean PDF document — free, instant, and 100% private.",
    howToName: "How to convert PNG images to PDF online",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PNGs", text: "Drop one or more PNG images onto the page." },
      { name: "Reorder & Configure", text: "Drag to reorder diagrams, choose page size, orientation, and margin." },
      { name: "Create PDF", text: "Download your beautifully combined PDF document instantly." }
    ],
    crossLink: { href: "/pdf-to-png", label: "Need to extract lossless PNGs from a PDF? Convert PDF to PNG." },
  },
  tr: {
    title: "PNG'den PDF'e — PNG görsellerini ve şemalarını PDF'e dönüştür",
    description: "PNG, JPG ve WebP görsellerinizi tarayıcınızda tek bir PDF belgesine dönüştürün. Şeffaflık ve keskin kenarları koruyun, %100 gizli.",
    h1: "PNG'den PDF'e",
    tagline: "PNG görsellerinizi anında PDF belgesine dönüştürün — ücretsiz, sınırsız ve tarayıcınızda.",
    howToName: "PNG görsellerinden PDF nasıl oluşturulur",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PNG'leri Yükle", text: "Bir veya daha fazla PNG dosyasını sürükleyin." },
      { name: "Sırala ve Ayarla", text: "Şemaların sırasını değiştirin, sayfa boyutu ve kenar boşluğu seçin." },
      { name: "PDF Oluştur", text: "Birleştirilmiş PDF belgenizi anında cihazınıza indirin." }
    ],
    crossLink: { href: "/tr/pdf-to-png", label: "PDF içindeki sayfaları kayıpsız PNG olarak mı çıkarmak istiyorsunuz? PDF'ten PNG'ye." },
  },
};

export const flattenCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Flatten PDF — make form fields and annotations uneditable locally",
    description: "Convert interactive PDF forms, highlights, and annotations into static page content. 100% private, processed in your browser.",
    h1: "Flatten PDF",
    tagline: "Turn PDF form fields and annotations into static content — free and 100% private.",
    howToName: "How to flatten PDF forms in your browser",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Drop your interactive or annotated PDF file." },
      { name: "Select Options", text: "Choose whether to flatten form fields and annotations." },
      { name: "Download", text: "Get your uneditable, flattened PDF document instantly." }
    ],
    crossLink: { href: "/protect-pdf", label: "Need to password-protect your document? Try Protect PDF." },
  },
  tr: {
    title: "PDF Düzleştir — form alanlarını ve notları sabit katmana dönüştür",
    description: "İnteraktif PDF formlarını, açıklamaları ve işaretlemeleri sabit sayfa içeriğine dönüştürün. %100 gizli, tarayıcınızda çalışır.",
    h1: "PDF Düzleştir",
    tagline: "PDF form alanlarını sabit ve düzenlenemez içeriğe dönüştürün — ücretsiz ve %100 gizli.",
    howToName: "PDF formları tarayıcıda nasıl düzleştirilir",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "Doldurulmuş form veya not içeren PDF dosyanızı sürükleyin." },
      { name: "Seçenekleri Belirle", text: "Form alanlarının ve açıklamaların düzleştirileceğini seçin." },
      { name: "İndir", text: "Düzenlenemez, sabitlenmiş PDF belgenizi anında indirin." }
    ],
    crossLink: { href: "/tr/protect-pdf", label: "Belgenizi şifreyle mi korumak istiyorsunuz? PDF Şifrele aracını deneyin." },
  },
};

export const signCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Sign PDF — add signatures locally without uploading",
    description: "Sign PDF documents with your drawn, typed, or uploaded signature. 100% private, your files and signature never leave your device.",
    h1: "Sign PDF",
    tagline: "Stamp your signature onto any PDF document — free, instant, and 100% private.",
    howToName: "How to sign a PDF online for free",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Drop your PDF document." },
      { name: "Create Signature", text: "Draw your signature, type your name, or upload an image." },
      { name: "Download", text: "Get your signed PDF document instantly." }
    ],
    crossLink: { href: "/flatten-pdf", label: "Want to lock your form fields after signing? Try Flatten PDF." },
  },
  tr: {
    title: "PDF İmzala — tarayıcında güvenle imza ekle",
    description: "PDF belgelerine çizdiğiniz, yazdığınız veya yüklediğiniz imzanızı ekleyin. %100 gizli, dosyanız ve imzanız cihazınızdan çıkmaz.",
    h1: "PDF İmzala",
    tagline: "PDF belgelerinizi tarayıcınızda güvenle imzalayın — ücretsiz ve %100 gizli.",
    howToName: "PDF belgesine internetten imza nasıl eklenir",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "İmzalamak istediğiniz PDF belgesini sürükleyin." },
      { name: "İmzanı Oluştur", text: "İmzanızı çizin, adınızı yazın veya imza görseli yükleyin." },
      { name: "İndir", text: "İmzalanan PDF belgenizi anında indirin." }
    ],
    crossLink: { href: "/tr/flatten-pdf", label: "İmzaladıktan sonra form alanlarını kilitlemek mi istiyorsunuz? PDF Düzleştir." },
  },
};

export const extractImagesCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Extract Images from PDF — download embedded JPG and PNG",
    description: "Extract all embedded raster images from PDF documents in original quality. 100% private, files never leave your device.",
    h1: "Extract Images",
    tagline: "Extract embedded JPG and PNG images from your PDF — free and 100% private.",
    howToName: "How to extract images from a PDF in your browser",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Drop your PDF document containing images or photos." },
      { name: "Extract", text: "We extract all embedded raster images at their original resolution." },
      { name: "Download ZIP", text: "Download all extracted images bundled in a convenient ZIP archive." }
    ],
    crossLink: { href: "/pdf-to-png", label: "Want to render full PDF pages as images? Try PDF to PNG." },
  },
  tr: {
    title: "PDF Resim Çıkar — gömülü fotoğrafları orijinal kalitede indir",
    description: "PDF belgelerindeki tüm gömülü resimleri ve fotoğrafları orijinal kalitede ayıklayın. %100 gizli, dosyanız cihazınızdan çıkmaz.",
    h1: "PDF Resim Çıkar",
    tagline: "PDF'teki gömülü JPG ve PNG resimlerini ayıklayın — ücretsiz ve %100 gizli.",
    howToName: "PDF içindeki resimler tarayıcıda nasıl çıkarılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "Resim veya fotoğraf içeren PDF belgenizi sürükleyip bırakın." },
      { name: "Resimleri Çıkar", text: "Belgedeki tüm gömülü resimler orijinal çözünürlüklerinde ayıklanır." },
      { name: "ZIP İndir", text: "Çıkarılan tüm görselleri tek bir ZIP dosyası olarak anında indirin." }
    ],
    crossLink: { href: "/tr/pdf-to-png", label: "Tüm sayfayı görüntü olarak kaydetmek mi istiyorsunuz? PDF - PNG dönüştürücü." },
  },
};

export const compressCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Compress PDF — reduce file size in your browser, files never uploaded",
    description: "Compress and reduce PDF file size with zero quality loss. Remove unused objects and optimize streams locally in your browser. 100% private.",
    h1: "Compress PDF",
    tagline: "Shrink your PDF file size in seconds — free, instant, and 100% private.",
    howToName: "How to compress a PDF file in your browser",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Select and drop your PDF document on the page." },
      { name: "Choose Compression", text: "Select from Recommended, Extreme (deduplication), or Fast compression." },
      { name: "Download", text: "Download your optimized, smaller PDF instantly." }
    ],
    crossLink: { href: "/merge-pdf", label: "Want to combine multiple PDFs after compressing? Try Merge PDF." },
  },
  tr: {
    title: "PDF Küçült / Sıkıştır — tarayıcında dosya boyutunu azalt, gizli ve ücretsiz",
    description: "PDF dosya boyutunu kalite kaybı olmadan küçültün. Kullanılmayan nesneleri ve çift akışları temizleyin. %100 gizli, dosyalar cihazınızdan çıkmaz.",
    h1: "PDF Sıkıştır",
    tagline: "PDF dosyanızın boyutunu saniyeler içinde küçültün — ücretsiz, hızlı ve %100 gizli.",
    howToName: "PDF dosya boyutu tarayıcıda nasıl küçültülür",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "Küçültmek istediğiniz PDF belgesini sayfaya sürükleyip bırakın." },
      { name: "Sıkıştırma Seç", text: "Önerilen (dengeli), Maksimum (tekilleştirme) veya Hızlı sıkıştırma modlarından birini seçin." },
      { name: "İndir", text: "Optimize edilmiş küçük boyutlu PDF belgenizi anında indirin." }
    ],
    crossLink: { href: "/tr/merge-pdf", label: "Küçülttükten sonra belgeleri birleştirmek mi istiyorsunuz? PDF Birleştir." },
  },
};


