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
  steps: Step[];
  faqTitle?: string;
  faq?: QA[];
  crossLink?: { href: string; label: string };
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
    crossLink: { href: "/tr/rotate-pdf", label: "Sadece sayfaları döndürmek mi istiyorsunuz? PDF Döndür." }
  }
};
export const reverseCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Reverse PDF Pages — change page order",
    description: "Reverse the order of pages in your PDF document instantly. Fast, free, and completely local.",
    h1: "Reverse PDF Pages",
    tagline: "Reverse your PDF page order from last to first in seconds.",
    howToName: "How to reverse PDF page order",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF document you want to reverse." },
      { name: "Instant Processing", text: "We reverse the order of all pages instantly." },
      { name: "Download", text: "Download your new PDF with reversed pages." }
    ],
    faq: [
      {
        q: "Why would I need to reverse PDF pages?",
        a: "This tool is extremely useful if a document was fed backwards into a physical scanner, resulting in the last page appearing first."
      },
      {
        q: "Are my files uploaded?",
        a: "No. The entire process runs inside your web browser locally. Your files are never uploaded to our servers."
      }
    ],
    crossLink: { href: "/organize-pdf", label: "Need to manually reorder pages? Organize PDF." }
  },
  tr: {
    title: "PDF Sayfalarını Tersine Çevir — sayfa sırasını değiştirin",
    description: "PDF belgenizdeki sayfaların sırasını anında tersine çevirin. Hızlı, ücretsiz ve tamamen yerel.",
    h1: "Sayfaları Tersine Çevir",
    tagline: "PDF sayfa sıranızı saniyeler içinde sondan başa doğru tersine çevirin.",
    howToName: "PDF sayfa sırası nasıl tersine çevrilir",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      { name: "PDF Yükle", text: "Sayfalarını tersine çevirmek istediğiniz PDF belgesini seçin." },
      { name: "Anında İşlem", text: "Tüm sayfaların sırasını anında tersine çeviriyoruz." },
      { name: "İndir", text: "Sayfaları tersine çevrilmiş yeni PDF'inizi indirin." }
    ],
    faq: [
      {
        q: "PDF sayfalarını neden tersine çevirmem gerekir?",
        a: "Bu araç, fiziksel bir tarayıcıya sayfalar ters yerleştirildiğinde ve son sayfa ilk sırada çıktığında son derece yararlıdır."
      },
      {
        q: "Dosyalarım sunucuya yükleniyor mu?",
        a: "Hayır. Tüm işlemler doğrudan tarayıcınızın içinde yerel olarak gerçekleşir. Dosyalarınız asla sunucularımıza yüklenmez."
      }
    ],
    crossLink: { href: "/tr/organize-pdf", label: "Sayfaları elle mi sıralamak istiyorsunuz? PDF Düzenle." }
  }
};
export const batesCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Add Bates Numbering to PDF — professional document stamping",
    description: "Add Bates numbers to your PDF documents instantly. Perfect for legal professionals. Free, fast, and completely local.",
    h1: "Bates Numbering",
    tagline: "Stamp your PDF with professional Bates numbers in seconds.",
    howToName: "How to add Bates numbering to a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      { name: "Upload PDF", text: "Select the legal document you want to stamp." },
      { name: "Configure Format", text: "Set your prefix, suffix, and starting number." },
      { name: "Download", text: "Download your professionally stamped PDF." }
    ],
    faq: [
      {
        q: "What is Bates numbering?",
        a: "Bates numbering (or Bates stamping) is used in the legal, medical, and business fields to place identifying numbers and/or date/time-marks on images and documents as they are scanned or processed."
      },
      {
        q: "Are my confidential legal files uploaded?",
        a: "No. The entire process runs inside your web browser locally. Your files are never uploaded to our servers, ensuring complete confidentiality."
      }
    ],
    crossLink: { href: "/watermark-pdf", label: "Need a custom watermark instead? Watermark PDF." }
  },
  tr: {
    title: "PDF'ye Bates Numaralandırması Ekle — profesyonel belge damgalama",
    description: "PDF belgelerinize anında Bates numaraları ekleyin. Hukuk profesyonelleri için mükemmeldir. Ücretsiz, hızlı ve tamamen yerel.",
    h1: "Bates Numaralandırması",
    tagline: "PDF'inizi saniyeler içinde profesyonel Bates numaralarıyla damgalayın.",
    howToName: "PDF'ye Bates numaralandırması nasıl eklenir",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      { name: "PDF Yükle", text: "Damgalamak istediğiniz yasal belgeyi seçin." },
      { name: "Formatı Ayarla", text: "Önekinizi, sonekinizi ve başlangıç numaranızı belirleyin." },
      { name: "İndir", text: "Profesyonel olarak damgalanmış PDF'inizi indirin." }
    ],
    faq: [
      {
        q: "Bates numaralandırması nedir?",
        a: "Bates numaralandırması (veya Bates damgalama), hukuk, tıp ve iş alanlarında, görüntü ve belgelere tarandıkları veya işlendikleri sırada tanımlayıcı numaralar ve/veya tarih/saat işaretleri yerleştirmek için kullanılır."
      },
      {
        q: "Gizli yasal dosyalarım sunucuya yükleniyor mu?",
        a: "Hayır. Tüm işlemler doğrudan tarayıcınızın içinde yerel olarak gerçekleşir. Dosyalarınız asla sunucularımıza yüklenmez, böylece tam gizlilik sağlanır."
      }
    ],
    crossLink: { href: "/tr/watermark-pdf", label: "Bunun yerine özel bir filigrana mı ihtiyacınız var? PDF Filigran Ekle." }
  }
};
export const nupCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "N-Up PDF — multiple pages per sheet",
    description: "Combine multiple PDF pages onto a single sheet (2-up, 4-up, 9-up). Perfect for printing slides or saving paper. Fast, free, and totally local.",
    h1: "N-Up PDF",
    tagline: "Shrink and combine multiple pages onto a single sheet instantly.",
    howToName: "How to combine multiple pages onto one sheet",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      { name: "Upload PDF", text: "Select the document you want to compress onto fewer pages." },
      { name: "Select Layout", text: "Choose how many pages to fit per sheet (e.g., 2, 4, 9, or 16)." },
      { name: "Download", text: "Download your new N-Up formatted PDF." }
    ],
    faq: [
      {
        q: "What is N-Up printing?",
        a: "N-Up refers to printing multiple pages on a single sheet of paper. For example, 4-up prints 4 reduced-size pages on one sheet, saving paper and ink."
      },
      {
        q: "Does this affect the quality of my PDF?",
        a: "The content itself is not compressed or blurred, but it is scaled down to fit multiple pages on one sheet. Vector text remains perfectly crisp."
      },
      {
        q: "Is it safe and private?",
        a: "Yes. All processing happens locally in your web browser. Your files are never uploaded to our servers."
      }
    ],
    crossLink: { href: "/compress-pdf", label: "Need to reduce file size instead? Compress PDF." }
  },
  tr: {
    title: "N-Up PDF — tek yaprağa çoklu sayfa",
    description: "Birden fazla PDF sayfasını tek bir yaprakta birleştirin (2, 4, 9 sayfa vb.). Sunum yazdırmak veya kağıt tasarrufu sağlamak için mükemmel. Hızlı, ücretsiz ve yerel.",
    h1: "N-Up PDF",
    tagline: "Birden fazla sayfayı anında küçültüp tek bir yaprakta birleştirin.",
    howToName: "Birden fazla sayfa tek yaprakta nasıl birleştirilir",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      { name: "PDF Yükle", text: "Daha az sayfaya sığdırmak istediğiniz belgeyi seçin." },
      { name: "Düzeni Seçin", text: "Her yaprağa kaç sayfa sığdırılacağını seçin (örn. 2, 4, 9 veya 16)." },
      { name: "İndir", text: "Yeni N-Up formatındaki PDF'inizi indirin." }
    ],
    faq: [
      {
        q: "N-Up yazdırma nedir?",
        a: "N-Up, tek bir kağıt yaprağına birden fazla sayfa yazdırmayı ifade eder. Örneğin, 4-up tek bir yaprağa küçültülmüş 4 sayfa yazdırır ve kağıt ve mürekkep tasarrufu sağlar."
      },
      {
        q: "Bu işlem PDF kalitesini etkiler mi?",
        a: "İçeriğin kendisi sıkıştırılmaz veya bulanıklaştırılmaz, ancak birden fazla sayfayı bir yaprağa sığdırmak için ölçeklendirilir. Vektörel metinler kusursuz keskinliğini korur."
      },
      {
        q: "Güvenli ve gizli mi?",
        a: "Evet. Tüm işlemler web tarayıcınızda yerel olarak gerçekleşir. Dosyalarınız asla sunucularımıza yüklenmez."
      }
    ],
    crossLink: { href: "/tr/compress-pdf", label: "Bunun yerine dosya boyutunu küçültmek mi istiyorsunuz? PDF Sıkıştır." }
  }
};
export const pdfaCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Convert to PDF/A — archive your documents safely",
    description: "Convert your PDF to PDF/A format for long-term archiving. Fast, free, and completely local processing.",
    h1: "Convert to PDF/A",
    tagline: "Ensure your documents are ready for long-term archiving and standard compliance.",
    howToName: "How to convert to PDF/A format",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF document you want to archive." },
      { name: "Standardize", text: "We inject standard metadata and prepare the file for archiving." },
      { name: "Download", text: "Download your new PDF/A compliant document." }
    ],
    faq: [
      {
        q: "What is PDF/A?",
        a: "PDF/A is an ISO-standardized version of the Portable Document Format (PDF) specialized for use in the archiving and long-term preservation of electronic documents."
      },
      {
        q: "Is this a full strict compliance conversion?",
        a: "This tool performs a basic conversion (setting required metadata and flattening object streams) which satisfies many archiving systems, but it does not embed color profiles or missing fonts automatically."
      },
      {
        q: "Are my files uploaded?",
        a: "No. The entire process runs inside your web browser locally. Your files are never uploaded to our servers."
      }
    ],
    crossLink: { href: "/flatten-pdf", label: "Need to flatten annotations instead? Flatten PDF." }
  },
  tr: {
    title: "PDF/A'ya Dönüştür — belgelerinizi güvenle arşivleyin",
    description: "Uzun süreli arşivleme için PDF'inizi PDF/A formatına dönüştürün. Hızlı, ücretsiz ve tamamen yerel işlem.",
    h1: "PDF/A'ya Dönüştür",
    tagline: "Belgelerinizin uzun vadeli arşivlemeye ve standartlara uygun olduğundan emin olun.",
    howToName: "PDF/A formatına nasıl dönüştürülür",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      { name: "PDF Yükle", text: "Arşivlemek istediğiniz PDF belgesini seçin." },
      { name: "Standartlaştır", text: "Standart meta verileri ekliyor ve dosyayı arşivleme için hazırlıyoruz." },
      { name: "İndir", text: "Yeni PDF/A uyumlu belgenizi indirin." }
    ],
    faq: [
      {
        q: "PDF/A nedir?",
        a: "PDF/A, Taşınabilir Belge Formatının (PDF) elektronik belgelerin arşivlenmesi ve uzun süreli korunması amacıyla özel olarak ISO standartlarında geliştirilmiş bir sürümüdür."
      },
      {
        q: "Bu tam ve katı bir standart dönüştürmesi mi?",
        a: "Bu araç, temel bir dönüştürme (gerekli meta verileri ayarlama ve nesne akışlarını düzleştirme) gerçekleştirir. Çoğu arşivleme sistemi için yeterlidir, ancak renk profillerini veya eksik yazı tiplerini otomatik olarak gömmez."
      },
      {
        q: "Dosyalarım sunucuya yükleniyor mu?",
        a: "Hayır. Tüm işlemler doğrudan tarayıcınızın içinde yerel olarak gerçekleşir. Dosyalarınız asla sunucularımıza yüklenmez."
      }
    ],
    crossLink: { href: "/tr/flatten-pdf", label: "Bunun yerine açıklamaları düzleştirmek mi istiyorsunuz? PDF Düzleştir." }
  }
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

export const redactCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Redact PDF — hide sensitive information",
    description: "Permanently black out sensitive text, images, or graphics in your PDF. 100% private and fast.",
    h1: "Redact PDF",
    tagline: "Black out sensitive content in your PDF documents in seconds — free and completely local.",
    howToName: "How to redact a PDF file",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF document you want to redact." },
      { name: "Draw Blackout Boxes", text: "Click and drag over the document preview to draw black boxes over sensitive information." },
      { name: "Apply & Download", text: "Click Apply Redactions to stamp the black boxes onto your PDF and download the result." }
    ],
    faq: [
      {
        q: "Are my files uploaded?",
        a: "No. The redaction happens entirely on your device. Your files are completely private."
      }
    ],
    crossLink: { href: "/sanitize-pdf", label: "Want to remove hidden metadata too? Try Sanitize PDF." }
  },
  tr: {
    title: "PDF Karartma — hassas bilgileri gizleyin",
    description: "PDF'inizdeki hassas bilgileri gizlemek için üzerlerine siyah kutular çizin. %100 gizli ve hızlı.",
    h1: "PDF Karartma",
    tagline: "PDF belgelerinizdeki hassas içerikleri saniyeler içinde karartın — ücretsiz ve %100 gizli.",
    howToName: "Bir PDF dosyası nasıl karartılır",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      { name: "PDF Yükle", text: "Karartmak istediğiniz PDF belgesini yükleyin." },
      { name: "Karartma Kutuları Çiz", text: "Hassas bilgilerin üzerini kapatmak için önizleme üzerinde farenizle kutular çizin." },
      { name: "Uygula ve İndir", text: "Uygula butonuna basarak siyah kutuları PDF'inize kalıcı olarak ekleyin ve indirin." }
    ],
    faq: [
      {
        q: "Dosyalarım bir yere yükleniyor mu?",
        a: "Hayır. Karartma işlemi tamamen cihazınızda gerçekleşir. Dosyalarınız %100 gizli kalır."
      }
    ],
    crossLink: { href: "/tr/sanitize-pdf", label: "Gizli meta verilerini de temizlemek ister misiniz? PDF Temizle." }
  }
};
export const repairCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Repair PDF — fix corrupted documents locally",
    description: "Fix and recover corrupted or broken PDF files instantly in your browser. 100% private, no uploads.",
    h1: "Repair PDF",
    tagline: "Fix corrupted PDF files and recover data instantly — free and completely local.",
    howToName: "How to repair a PDF file",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      { name: "Upload broken PDF", text: "Drag and drop your corrupted PDF file into the drop zone." },
      { name: "Automatic recovery", text: "Our local engine automatically rebuilds the broken document structures." },
      { name: "Download repaired PDF", text: "Save the healthy, recovered PDF file to your device." }
    ],
    faq: [
      {
        q: "Are my files uploaded?",
        a: "No. The repair happens entirely on your device using WebAssembly technology. Your files are completely private."
      }
    ],
    crossLink: { href: "/sanitize-pdf", label: "Want to clean hidden metadata? Try Sanitize PDF." }
  },
  tr: {
    title: "PDF Onar — bozuk belgeleri tarayıcıda düzelt",
    description: "Bozuk veya açılmayan PDF dosyalarınızı tarayıcınızda anında onarın ve kurtarın. %100 gizli, yükleme yok.",
    h1: "PDF Onar",
    tagline: "Bozuk PDF dosyalarınızı onarın ve verilerinizi kurtarın — ücretsiz ve tamamen yerel.",
    howToName: "Bozuk bir PDF dosyası nasıl onarılır",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      { name: "Bozuk PDF'i yükle", text: "Açılmayan veya bozuk PDF dosyanızı alana sürükleyip bırakın." },
      { name: "Otomatik kurtarma", text: "Yerel motorumuz bozuk belge yapısını otomatik olarak yeniden inşa eder." },
      { name: "Onarılan PDF'i indir", text: "Kurtarılmış, sağlıklı PDF dosyasını cihazınıza indirin." }
    ],
    faq: [
      {
        q: "Dosyalarım bir yere yükleniyor mu?",
        a: "Hayır. Onarım işlemi WebAssembly teknolojisi kullanılarak tamamen cihazınızda gerçekleşir. Dosyalarınız %100 gizli kalır."
      }
    ],
    crossLink: { href: "/tr/sanitize-pdf", label: "Gizli meta verilerini temizlemek ister misiniz? PDF Temizle." }
  }
};
export const grayscaleCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Grayscale PDF — convert to black & white locally",
    description: "Convert your PDF documents to grayscale to save ink and reduce file size. Fast, local, and private.",
    h1: "Grayscale PDF",
    tagline: "Remove colors from your PDF files to create black and white documents — free and completely local.",
    howToName: "How to convert PDF to grayscale",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file you want to convert to black and white." },
      { name: "Rasterize to Grayscale", text: "Our local engine converts every page into a high-quality grayscale image." },
      { name: "Download Grayscale PDF", text: "Save the newly generated black and white PDF to your device." }
    ],
    faq: [
      {
        q: "Why convert to grayscale?",
        a: "Grayscale PDFs are perfect for printing text documents, saving you expensive color ink and reducing file sizes in some cases."
      },
      {
        q: "Will the text remain selectable?",
        a: "No. The grayscale process rasterizes the pages as images, so text will no longer be selectable."
      }
    ],
    crossLink: { href: "/compress-pdf", label: "Want to reduce PDF size? Try Compress PDF." }
  },
  tr: {
    title: "Siyah Beyaz PDF — yerel olarak dönüştür",
    description: "Mürekkep tasarrufu yapmak ve dosya boyutunu küçültmek için PDF'lerinizi gri tonlamaya çevirin. Hızlı, yerel ve gizli.",
    h1: "Siyah Beyaz PDF",
    tagline: "PDF dosyalarınızdan renkleri kaldırarak siyah beyaz belgeler oluşturun — ücretsiz ve tamamen yerel.",
    howToName: "PDF siyah beyaza nasıl dönüştürülür",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      { name: "PDF Yükle", text: "Siyah beyaza dönüştürmek istediğiniz PDF dosyasını seçin." },
      { name: "Gri Tonlamaya Çevir", text: "Yerel motorumuz her sayfayı yüksek kaliteli siyah beyaz bir görsele dönüştürür." },
      { name: "Siyah Beyaz PDF'i İndir", text: "Yeni oluşturulan siyah beyaz PDF dosyasını cihazınıza kaydedin." }
    ],
    faq: [
      {
        q: "Neden siyah beyaza çevirmeliyim?",
        a: "Siyah beyaz PDF'ler metin belgelerini yazdırmak için mükemmeldir; pahalı renkli mürekkepten tasarruf etmenizi sağlar ve bazen dosya boyutunu küçültür."
      },
      {
        q: "Metinler seçilebilir kalacak mı?",
        a: "Hayır. Gri tonlama işlemi belgeleri resim olarak tarar, bu yüzden metinler seçilemez hale gelir."
      }
    ],
    crossLink: { href: "/tr/compress-pdf", label: "PDF boyutunu küçültmek mi istiyorsunuz? PDF Sıkıştır." }
  }
};
export const resizeCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Resize PDF — change page size and add margins",
    description: "Scale your PDF pages to standard sizes like A4 or Letter, and add uniform margins. 100% private.",
    h1: "Resize PDF",
    tagline: "Scale PDF pages to standard dimensions and add beautiful margins — free and completely local.",
    howToName: "How to resize a PDF file",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file you want to resize." },
      { name: "Choose Settings", text: "Select your desired target size (e.g., A4) and the margin width you want to add." },
      { name: "Apply & Download", text: "Click apply to scale the pages perfectly and download the new document." }
    ],
    faq: [
      {
        q: "Does this distort my images?",
        a: "No, the original pages are scaled down proportionally and centered on the new canvas, preserving aspect ratios."
      },
      {
        q: "Will this reduce the resolution?",
        a: "No. Your pages are scaled to the new dimensions without any loss of quality."
      }
    ],
    crossLink: { href: "/crop-pdf", label: "Need to cut a part of the page? Try Crop PDF." }
  },
  tr: {
    title: "PDF Boyutlandır — boyut değiştir ve boşluk ekle",
    description: "PDF sayfalarınızı A4 veya Letter gibi standart boyutlara ölçeklendirin ve kenar boşlukları ekleyin. %100 gizli.",
    h1: "PDF Boyutlandır",
    tagline: "PDF sayfalarını standart boyutlara ölçeklendirin ve kenar boşlukları ekleyin — ücretsiz ve tamamen yerel.",
    howToName: "Bir PDF dosyası nasıl boyutlandırılır",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      { name: "PDF Yükle", text: "Boyutlandırmak istediğiniz PDF dosyasını seçin." },
      { name: "Ayarları Seç", text: "Hedef boyutunuzu (örneğin A4) ve eklemek istediğiniz kenar boşluğu miktarını seçin." },
      { name: "Uygula ve İndir", text: "Sayfaları mükemmel şekilde ölçeklendirmek için uygulaya tıklayın ve yeni belgeyi indirin." }
    ],
    faq: [
      {
        q: "Bu işlem görsellerimi bozar mı?",
        a: "Hayır, orijinal sayfalar orantılı olarak küçültülür ve yeni tuvalin ortasına yerleştirilir, en-boy oranları korunur."
      },
      {
        q: "Bu işlem çözünürlüğü düşürür mü?",
        a: "Hayır. Sayfalarınız herhangi bir kalite kaybı olmadan yeni boyutlara ölçeklenir."
      }
    ],
    crossLink: { href: "/tr/crop-pdf", label: "Sayfanın bir kısmını mı kesmek istiyorsunuz? PDF Kırp." }
  }
};
export const scanCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Scan to PDF — scan physical documents",
    description: "Use your device camera to scan physical documents and create high-quality PDFs instantly. 100% private.",
    h1: "Scan to PDF",
    tagline: "Turn your device into a document scanner and generate PDF files directly in your browser.",
    howToName: "How to scan documents to PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      { name: "Grant Camera Access", text: "Allow the browser to access your camera to begin scanning." },
      { name: "Capture Pages", text: "Take photos of your physical documents one by one." },
      { name: "Create PDF", text: "Click Create PDF to combine all captured pages into a single document." }
    ],
    faq: [
      {
        q: "Is my camera feed private?",
        a: "Absolutely. Everything happens on your device locally. Your camera feed and photos are never uploaded or sent anywhere."
      },
      {
        q: "Are my photos uploaded?",
        a: "No. Everything runs directly on your device. We never upload any photos."
      }
    ],
    crossLink: { href: "/img-to-pdf", label: "Have images already? Convert Images to PDF." }
  },
  tr: {
    title: "Kameradan PDF — fiziksel belgeleri tarayın",
    description: "Fiziksel belgeleri taramak ve anında PDF oluşturmak için cihazınızın kamerasını kullanın. %100 gizli.",
    h1: "Kameradan PDF",
    tagline: "Cihazınızı bir tarayıcıya dönüştürün ve doğrudan tarayıcınızda PDF dosyaları oluşturun.",
    howToName: "Belgeler PDF'e nasıl taranır",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      { name: "Kamera İzni Verin", text: "Taramaya başlamak için tarayıcının kameranıza erişmesine izin verin." },
      { name: "Sayfaları Çekin", text: "Fiziksel belgelerinizin fotoğraflarını sırayla çekin." },
      { name: "PDF Oluştur", text: "Tüm çekilen sayfaları tek bir belgeye dönüştürmek için PDF Oluştur butonuna tıklayın." }
    ],
    faq: [
      {
        q: "Kamera görüntüm gizli mi?",
        a: "Kesinlikle. Her şey cihazınızda yerel olarak gerçekleşir. Kamera görüntünüz ve fotoğraflarınız hiçbir yere yüklenmez veya gönderilmez."
      },
      {
        q: "Fotoğraflarım yükleniyor mu?",
        a: "Hayır. Her şey cihazınızda çalışır, fotoğraflarınız asla yüklenmez."
      }
    ],
    crossLink: { href: "/tr/img-to-pdf", label: "Fotoğraflarınız hazır mı? Görselleri PDF Yap." }
  }
};

export const bookletCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Booklet PDF — create printable booklets",
    description: "Convert your PDF into a printable booklet layout. Free and completely local.",
    h1: "Booklet PDF",
    tagline: "Rearrange pages into a saddle-stitch booklet layout.",
    howToName: "How to create a booklet",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file." },
      { name: "Arrange", text: "The pages are arranged automatically." },
      { name: "Download", text: "Download the booklet PDF." }
    ]
  },
  tr: {
    title: "Kitapçık PDF — yazdırılabilir kitapçık oluştur",
    description: "PDF dosyanızı yazdırılabilir kitapçık düzenine dönüştürün.",
    h1: "Kitapçık PDF",
    tagline: "Sayfaları kitapçık düzeninde yeniden sıralayın.",
    howToName: "Kitapçık nasıl oluşturulur",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "PDF dosyasını seçin." },
      { name: "Düzenle", text: "Sayfalar otomatik düzenlenir." },
      { name: "İndir", text: "Kitapçık PDF'ini indirin." }
    ]
  }
};

export const compareCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Compare PDF — find differences between documents",
    description: "Visually compare two PDF files side by side.",
    h1: "Compare PDF",
    tagline: "Spot differences between two documents instantly.",
    howToName: "How to compare PDFs",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDFs", text: "Select the two PDF files." },
      { name: "Compare", text: "View them side by side." },
      { name: "Review", text: "Find the differences." }
    ]
  },
  tr: {
    title: "PDF Karşılaştır — belgeler arası farkları bul",
    description: "İki PDF dosyasını yan yana görsel olarak karşılaştırın.",
    h1: "PDF Karşılaştır",
    tagline: "İki belge arasındaki farkları anında tespit edin.",
    howToName: "PDF'ler nasıl karşılaştırılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF'leri Yükle", text: "İki PDF dosyasını seçin." },
      { name: "Karşılaştır", text: "Yan yana görüntüleyin." },
      { name: "İncele", text: "Farkları bulun." }
    ]
  }
};

export const cropCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Crop PDF — remove margins",
    description: "Crop your PDF pages to remove unnecessary margins.",
    h1: "Crop PDF",
    tagline: "Trim PDF margins quickly and locally.",
    howToName: "How to crop a PDF",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file." },
      { name: "Select Area", text: "Draw the crop box." },
      { name: "Download", text: "Download the cropped PDF." }
    ]
  },
  tr: {
    title: "PDF Kırp — kenar boşluklarını kaldır",
    description: "PDF sayfalarınızı kırparak gereksiz boşlukları temizleyin.",
    h1: "PDF Kırp",
    tagline: "Kenar boşluklarını hızlıca kesin.",
    howToName: "PDF nasıl kırpılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "PDF dosyasını seçin." },
      { name: "Alan Seç", text: "Kırpma alanını çizin." },
      { name: "İndir", text: "Kırpılmış PDF'i indirin." }
    ]
  }
};

export const ocrCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "OCR PDF — extract text from scanned documents",
    description: "Convert scanned PDFs into searchable text documents.",
    h1: "OCR PDF",
    tagline: "Make scanned documents searchable with AI.",
    howToName: "How to use OCR on a PDF",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Select the scanned PDF file." },
      { name: "Process", text: "AI extracts the text." },
      { name: "Download", text: "Download the searchable document." }
    ]
  },
  tr: {
    title: "OCR PDF — taranmış belgelerden metin çıkar",
    description: "Taranmış PDF'leri aranabilir metin belgelerine dönüştürün.",
    h1: "OCR PDF",
    tagline: "Yapay zeka ile taranmış belgeleri aranabilir yapın.",
    howToName: "PDF'te OCR nasıl kullanılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "Taranmış PDF dosyasını seçin." },
      { name: "İşle", text: "Yapay zeka metni çıkarır." },
      { name: "İndir", text: "Aranabilir belgeyi indirin." }
    ]
  }
};


export const removeBlankCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Remove Blank Pages — clean up your PDF",
    description: "Automatically detect and remove blank pages from your PDF.",
    h1: "Remove Blank Pages",
    tagline: "Clean up your documents instantly and locally.",
    howToName: "How to remove blank pages",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file." },
      { name: "Process", text: "We detect empty pages." },
      { name: "Download", text: "Download the cleaned PDF." }
    ]
  },
  tr: {
    title: "Boş Sayfaları Sil — PDF'inizi temizleyin",
    description: "PDF'inizdeki boş sayfaları otomatik olarak tespit edip kaldırın.",
    h1: "Boş Sayfaları Sil",
    tagline: "Belgelerinizi anında ve yerel olarak temizleyin.",
    howToName: "Boş sayfalar nasıl silinir",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "PDF dosyasını seçin." },
      { name: "İşle", text: "Boş sayfaları tespit ediyoruz." },
      { name: "İndir", text: "Temizlenmiş PDF'i indirin." }
    ]
  }
};

export const editMetadataCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Edit PDF Metadata — change author, title, and keywords locally",
    description: "View and edit PDF properties and metadata fields like Author, Title, Subject, and Keywords without uploading your file.",
    h1: "Edit PDF Metadata",
    tagline: "Change document properties locally and instantly.",
    howToName: "How to edit PDF metadata",
    howItWorks: "How it works",
    steps: [
      { name: "Add your PDF", text: "Drop your document on the page." },
      { name: "Edit fields", text: "Modify the title, author, and other metadata fields." },
      { name: "Save", text: "Download the updated PDF immediately." }
    ]
  },
  tr: {
    title: "PDF Meta Verilerini Düzenle — yazar, başlık ve anahtar kelimeleri yerel olarak değiştir",
    description: "PDF özelliklerini ve Yazar, Başlık, Konu gibi meta veri alanlarını dosyanızı yüklemeden görüntüleyin ve düzenleyin.",
    h1: "PDF Meta Verilerini Düzenle",
    tagline: "Belge özelliklerini anında ve yerel olarak değiştirin.",
    howToName: "PDF meta verileri nasıl düzenlenir",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF ekle", text: "Belgenizi sayfaya bırakın." },
      { name: "Alanları düzenle", text: "Başlık, yazar ve diğer meta veri alanlarını değiştirin." },
      { name: "Kaydet", text: "Güncellenmiş PDF'i anında indirin." }
    ]
  }
};

export const base64PdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Base64 to PDF & PDF to Base64 — developer tools",
    description: "Convert a PDF to a Base64 string for embedding in code, or decode a Base64 string back into a PDF file locally.",
    h1: "Base64 PDF Converter",
    tagline: "Encode or decode PDFs to and from Base64 instantly.",
    howToName: "How to use the Base64 converter",
    howItWorks: "How it works",
    steps: [
      { name: "Input data", text: "Upload a PDF or paste a Base64 string." },
      { name: "Convert", text: "The conversion happens instantly in your browser." },
      { name: "Export", text: "Copy the Base64 text or download the decoded PDF." }
    ]
  },
  tr: {
    title: "Base64'ten PDF'e ve PDF'ten Base64'e — geliştirici araçları",
    description: "Koda gömmek için PDF'yi Base64 dizgesine dönüştürün veya bir Base64 dizgesini yerel olarak PDF dosyasına çevirin.",
    h1: "Base64 PDF Dönüştürücü",
    tagline: "PDF'leri anında Base64'e kodlayın veya çözün.",
    howToName: "Base64 dönüştürücü nasıl kullanılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "Girdi verisi", text: "Bir PDF yükleyin veya Base64 dizgesi yapıştırın." },
      { name: "Dönüştür", text: "Dönüşüm tarayıcınızda anında gerçekleşir." },
      { name: "Dışa aktar", text: "Base64 metnini kopyalayın veya PDF'yi indirin." }
    ]
  }
};

export const invertPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Invert PDF Colors — dark mode for PDFs",
    description: "Invert the colors of your PDF document for easier night reading. All processing is done locally.",
    h1: "Invert PDF Colors",
    tagline: "Turn bright documents into dark mode PDFs.",
    howToName: "How to invert PDF colors",
    howItWorks: "How it works",
    steps: [
      { name: "Add your PDF", text: "Upload the document you want to read in dark mode." },
      { name: "Invert colors", text: "We apply a color inversion filter to every page." },
      { name: "Download", text: "Save the dark mode PDF to your device." }
    ]
  },
  tr: {
    title: "PDF Renklerini Ters Çevir — PDF'ler için karanlık mod",
    description: "Gece okumasını kolaylaştırmak için PDF belgenizin renklerini tersine çevirin. Tüm işlemler yerel olarak yapılır.",
    h1: "PDF Renklerini Ters Çevir",
    tagline: "Parlak belgeleri karanlık mod PDF'lerine dönüştürün.",
    howToName: "PDF renkleri nasıl tersine çevrilir",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF ekle", text: "Karanlık modda okumak istediğiniz belgeyi yükleyin." },
      { name: "Renkleri ters çevir", text: "Her sayfaya renk ters çevirme filtresi uygularız." },
      { name: "İndir", text: "Karanlık moddaki PDF'i cihazınıza kaydedin." }
    ]
  }
};

export const markdownPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Markdown to PDF — convert MD files locally",
    description: "Write or paste Markdown syntax and instantly export it to a beautifully formatted PDF document. Runs 100% in your browser.",
    h1: "Markdown to PDF",
    tagline: "Convert MD files to styled PDFs instantly.",
    howToName: "How to convert Markdown to PDF",
    howItWorks: "How it works",
    steps: [
      { name: "Input Markdown", text: "Type or paste your Markdown syntax into the editor." },
      { name: "Preview", text: "See a live preview of how your document will look." },
      { name: "Download", text: "Click to generate and download the PDF." }
    ]
  },
  tr: {
    title: "Markdown'dan PDF'e — MD dosyalarını yerel olarak dönüştür",
    description: "Markdown formatında yazın veya yapıştırın, anında şık bir PDF belgesine dönüştürün. %100 tarayıcınızda çalışır.",
    h1: "Markdown to PDF",
    tagline: "MD dosyalarını anında şekilli PDF'lere dönüştürün.",
    howToName: "Markdown PDF'e nasıl dönüştürülür",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "Markdown Girin", text: "Editöre Markdown metninizi yazın veya yapıştırın." },
      { name: "Önizleme", text: "Belgenizin nasıl görüneceğini canlı olarak izleyin." },
      { name: "İndir", text: "PDF'i oluşturmak ve indirmek için tıklayın." }
    ]
  }
};

export const htmlPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "HTML to PDF — render raw HTML code locally",
    description: "Paste raw HTML code and convert it directly into a PDF document. Perfect for developers saving web snippets.",
    h1: "HTML to PDF",
    tagline: "Convert raw HTML code to a PDF document.",
    howToName: "How to convert HTML to PDF",
    howItWorks: "How it works",
    steps: [
      { name: "Paste HTML", text: "Paste your raw HTML code (including inline styles) into the box." },
      { name: "Render", text: "The browser renders your HTML securely." },
      { name: "Download", text: "Save the rendered output as a PDF file." }
    ]
  },
  tr: {
    title: "HTML'den PDF'e — ham HTML kodunu yerel dönüştür",
    description: "Ham HTML kodunu yapıştırın ve doğrudan PDF belgesine dönüştürün. Web içeriklerini kaydetmek isteyen geliştiriciler için mükemmeldir.",
    h1: "HTML to PDF",
    tagline: "Ham HTML kodunu PDF belgesine dönüştürün.",
    howToName: "HTML PDF'e nasıl dönüştürülür",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "HTML Yapıştır", text: "Ham HTML kodunuzu (satıriçi stillerle) kutuya yapıştırın." },
      { name: "İşle", text: "Tarayıcınız HTML kodunuzu güvenli bir şekilde işler." },
      { name: "İndir", text: "İşlenmiş çıktıyı PDF dosyası olarak kaydedin." }
    ]
  }
};

export const extractPagesCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Extract PDF Pages — save specific pages",
    description: "Visually select specific pages from a PDF document and save them as a brand new PDF file.",
    h1: "Extract Pages",
    tagline: "Pick the pages you want to keep.",
    howToName: "How to extract PDF pages",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Select a document to extract pages from." },
      { name: "Select pages", text: "Click on the thumbnails of the pages you want to keep." },
      { name: "Extract", text: "Download a new PDF containing only your selected pages." }
    ]
  },
  tr: {
    title: "Sayfaları Çıkar — belirli sayfaları yeni bir PDF yap",
    description: "Bir PDF belgesindeki belirli sayfaları görsel olarak seçin ve bunları yepyeni bir PDF dosyası olarak kaydedin.",
    h1: "Sayfaları Çıkar",
    tagline: "Sadece tutmak istediğiniz sayfaları seçin.",
    howToName: "PDF sayfaları nasıl çıkarılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "Sayfalarını çıkarmak istediğiniz belgeyi seçin." },
      { name: "Sayfaları seç", text: "Saklamak istediğiniz sayfaların küçük resimlerine tıklayın." },
      { name: "Çıkar", text: "Yalnızca seçtiğiniz sayfaları içeren yeni bir PDF indirin." }
    ]
  }
};

export const annotatePdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Annotate PDF — draw and add text to your PDF files",
    description: "Add text annotations and highlights to your PDF documents entirely in your browser.",
    h1: "Annotate PDF",
    tagline: "Add text and notes to your documents.",
    howToName: "How to annotate a PDF",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Select a document to annotate." },
      { name: "Add text", text: "Type your text and set its position on the page." },
      { name: "Save", text: "Download your newly annotated PDF." }
    ]
  },
  tr: {
    title: "PDF Not Ekle — PDF dosyalarına metin ve çizim ekle",
    description: "Tamamen tarayıcınızda PDF belgelerinize metin ve notlar ekleyin.",
    h1: "PDF Not Ekle",
    tagline: "Belgelerinize metin ve notlar ekleyin.",
    howToName: "PDF'e nasıl not eklenir",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "Not eklemek istediğiniz belgeyi seçin." },
      { name: "Metin ekle", text: "Metninizi yazın ve sayfadaki konumunu ayarlayın." },
      { name: "Kaydet", text: "Not eklenmiş PDF'inizi indirin." }
    ]
  }
};

export const editPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Edit PDF — modify and hide text in your PDF files",
    description: "Apply whiteout and hide sensitive information in your PDFs directly in your browser.",
    h1: "Edit PDF",
    tagline: "Hide sensitive information with whiteout.",
    howToName: "How to edit a PDF",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Select a document to edit." },
      { name: "Apply Whiteout", text: "Specify the area to hide with a white rectangle." },
      { name: "Save", text: "Download your edited PDF securely." }
    ]
  },
  tr: {
    title: "PDF Düzenle — PDF dosyalarında metin gizle ve düzenle",
    description: "Tarayıcınızda doğrudan PDF dosyalarınızdaki hassas bilgileri gizleyin (whiteout).",
    h1: "PDF Düzenle",
    tagline: "Hassas bilgileri beyazlatarak (whiteout) gizleyin.",
    howToName: "PDF nasıl düzenlenir",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "Düzenlemek istediğiniz belgeyi seçin." },
      { name: "Whiteout Uygula", text: "Beyaz bir dikdörtgenle gizlenecek alanı belirtin." },
      { name: "Kaydet", text: "Düzenlenmiş PDF'inizi güvenle indirin." }
    ]
  }
};

export const pdfFormsCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "PDF Forms — fill and manage PDF forms",
    description: "Fill interactive PDF forms quickly and easily, right in your browser.",
    h1: "PDF Forms",
    tagline: "Fill interactive PDF forms quickly.",
    howToName: "How to fill PDF forms",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF Form", text: "Select an interactive PDF form." },
      { name: "Fill fields", text: "Enter your information into the detected form fields." },
      { name: "Save", text: "Download the flattened, filled PDF document." }
    ]
  },
  tr: {
    title: "PDF Formları — PDF formlarını doldurun ve yönetin",
    description: "Etkileşimli PDF formlarını tarayıcınızda hızlıca ve kolayca doldurun.",
    h1: "PDF Formları",
    tagline: "Etkileşimli PDF formlarını hızlıca doldurun.",
    howToName: "PDF formları nasıl doldurulur",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "Form Yükle", text: "Etkileşimli bir PDF formu seçin." },
      { name: "Alanları doldur", text: "Bilgilerinizi algılanan form alanlarına girin." },
      { name: "Kaydet", text: "Doldurulmuş PDF belgesini indirin." }
    ]
  }
};

export const mixpdfCopy = {
  en: {
    title: 'Alternate & Mix PDF',
    description: 'Interleave pages from two PDFs.',
    h1: 'Alternate & Mix PDF',
    tagline: 'Interleave pages from two PDFs.',
    howToName: 'How to use Alternate & Mix PDF',
    howItWorks: 'Upload your file and process it instantly in your browser.',
    steps: [
      { name: 'Upload', text: 'Select your PDF file.' },
      { name: 'Process', text: 'Apply the settings.' },
      { name: 'Download', text: 'Save your file securely.' }
    ]
  },
  tr: {
    title: 'Alternate & Mix PDF',
    description: 'Interleave pages from two PDFs.',
    h1: 'Alternate & Mix PDF',
    tagline: 'Interleave pages from two PDFs.',
    howToName: 'Alternate & Mix PDF Nasıl Kullanılır',
    howItWorks: 'Dosyanızı yükleyin ve tarayıcınızda anında işleyin.',
    steps: [
      { name: 'Yükle', text: 'PDF dosyanızı seçin.' },
      { name: 'İşle', text: 'Ayarları uygulayın.' },
      { name: 'İndir', text: 'Dosyanızı güvenle indirin.' }
    ]
  }
};

export const splithalfpdfCopy = {
  en: {
    title: 'Split PDF in Half',
    description: 'Split 2-up spreads into 1-up pages.',
    h1: 'Split PDF in Half',
    tagline: 'Split 2-up spreads into 1-up pages.',
    howToName: 'How to use Split PDF in Half',
    howItWorks: 'Upload your file and process it instantly in your browser.',
    steps: [
      { name: 'Upload', text: 'Select your PDF file.' },
      { name: 'Process', text: 'Apply the settings.' },
      { name: 'Download', text: 'Save your file securely.' }
    ]
  },
  tr: {
    title: 'Split PDF in Half',
    description: 'Split 2-up spreads into 1-up pages.',
    h1: 'Split PDF in Half',
    tagline: 'Split 2-up spreads into 1-up pages.',
    howToName: 'Split PDF in Half Nasıl Kullanılır',
    howItWorks: 'Dosyanızı yükleyin ve tarayıcınızda anında işleyin.',
    steps: [
      { name: 'Yükle', text: 'PDF dosyanızı seçin.' },
      { name: 'İşle', text: 'Ayarları uygulayın.' },
      { name: 'İndir', text: 'Dosyanızı güvenle indirin.' }
    ]
  }
};

export const extractbykeywordCopy = {
  en: {
    title: 'Extract by Keyword',
    description: 'Extract pages containing specific text.',
    h1: 'Extract by Keyword',
    tagline: 'Extract pages containing specific text.',
    howToName: 'How to use Extract by Keyword',
    howItWorks: 'Upload your file and process it instantly in your browser.',
    steps: [
      { name: 'Upload', text: 'Select your PDF file.' },
      { name: 'Process', text: 'Apply the settings.' },
      { name: 'Download', text: 'Save your file securely.' }
    ]
  },
  tr: {
    title: 'Extract by Keyword',
    description: 'Extract pages containing specific text.',
    h1: 'Extract by Keyword',
    tagline: 'Extract pages containing specific text.',
    howToName: 'Extract by Keyword Nasıl Kullanılır',
    howItWorks: 'Dosyanızı yükleyin ve tarayıcınızda anında işleyin.',
    steps: [
      { name: 'Yükle', text: 'PDF dosyanızı seçin.' },
      { name: 'İşle', text: 'Ayarları uygulayın.' },
      { name: 'İndir', text: 'Dosyanızı güvenle indirin.' }
    ]
  }
};

export const splitbysizeCopy = {
  en: {
    title: 'Split by Size',
    description: 'Split PDF into smaller parts by MB size.',
    h1: 'Split by Size',
    tagline: 'Split PDF into smaller parts by MB size.',
    howToName: 'How to use Split by Size',
    howItWorks: 'Upload your file and process it instantly in your browser.',
    steps: [
      { name: 'Upload', text: 'Select your PDF file.' },
      { name: 'Process', text: 'Apply the settings.' },
      { name: 'Download', text: 'Save your file securely.' }
    ]
  },
  tr: {
    title: 'Split by Size',
    description: 'Split PDF into smaller parts by MB size.',
    h1: 'Split by Size',
    tagline: 'Split PDF into smaller parts by MB size.',
    howToName: 'Split by Size Nasıl Kullanılır',
    howItWorks: 'Dosyanızı yükleyin ve tarayıcınızda anında işleyin.',
    steps: [
      { name: 'Yükle', text: 'PDF dosyanızı seçin.' },
      { name: 'İşle', text: 'Ayarları uygulayın.' },
      { name: 'İndir', text: 'Dosyanızı güvenle indirin.' }
    ]
  }
};

export const addmarginsCopy = {
  en: {
    title: 'Add Margins',
    description: 'Add white padding around PDF pages.',
    h1: 'Add Margins',
    tagline: 'Add white padding around PDF pages.',
    howToName: 'How to use Add Margins',
    howItWorks: 'Upload your file and process it instantly in your browser.',
    steps: [
      { name: 'Upload', text: 'Select your PDF file.' },
      { name: 'Process', text: 'Apply the settings.' },
      { name: 'Download', text: 'Save your file securely.' }
    ]
  },
  tr: {
    title: 'Add Margins',
    description: 'Add white padding around PDF pages.',
    h1: 'Add Margins',
    tagline: 'Add white padding around PDF pages.',
    howToName: 'Add Margins Nasıl Kullanılır',
    howItWorks: 'Dosyanızı yükleyin ve tarayıcınızda anında işleyin.',
    steps: [
      { name: 'Yükle', text: 'PDF dosyanızı seçin.' },
      { name: 'İşle', text: 'Ayarları uygulayın.' },
      { name: 'İndir', text: 'Dosyanızı güvenle indirin.' }
    ]
  }
};

export const pdftosvgCopy = {
  en: {
    title: 'PDF to SVG',
    description: 'Convert PDF pages to SVG vectors.',
    h1: 'PDF to SVG',
    tagline: 'Convert PDF pages to SVG vectors.',
    howToName: 'How to use PDF to SVG',
    howItWorks: 'Upload your file and process it instantly in your browser.',
    steps: [
      { name: 'Upload', text: 'Select your PDF file.' },
      { name: 'Process', text: 'Apply the settings.' },
      { name: 'Download', text: 'Save your file securely.' }
    ]
  },
  tr: {
    title: 'PDF to SVG',
    description: 'Convert PDF pages to SVG vectors.',
    h1: 'PDF to SVG',
    tagline: 'Convert PDF pages to SVG vectors.',
    howToName: 'PDF to SVG Nasıl Kullanılır',
    howItWorks: 'Dosyanızı yükleyin ve tarayıcınızda anında işleyin.',
    steps: [
      { name: 'Yükle', text: 'PDF dosyanızı seçin.' },
      { name: 'İşle', text: 'Ayarları uygulayın.' },
      { name: 'İndir', text: 'Dosyanızı güvenle indirin.' }
    ]
  }
};

export const extractimagesCopy = {
  en: {
    title: 'Extract Images',
    description: 'Extract all images from a PDF.',
    h1: 'Extract Images',
    tagline: 'Extract all images from a PDF.',
    howToName: 'How to use Extract Images',
    howItWorks: 'Upload your file and process it instantly in your browser.',
    steps: [
      { name: 'Upload', text: 'Select your PDF file.' },
      { name: 'Process', text: 'Apply the settings.' },
      { name: 'Download', text: 'Save your file securely.' }
    ]
  },
  tr: {
    title: 'Görselleri Çıkar',
    description: 'PDF içindeki tüm resimleri ayıkla.',
    h1: 'Görselleri Çıkar',
    tagline: 'PDF içindeki tüm resimleri ayıkla.',
    howToName: 'Görselleri Çıkar Nasıl Kullanılır',
    howItWorks: 'Dosyanızı yükleyin ve tarayıcınızda anında işleyin.',
    steps: [
      { name: 'Yükle', text: 'PDF dosyanızı seçin.' },
      { name: 'İşle', text: 'Ayarları uygulayın.' },
      { name: 'İndir', text: 'Dosyanızı güvenle indirin.' }
    ]
  }
};

export const addpagenumbersCopy = {
  en: {
    title: 'Add Page Numbers',
    description: 'Insert page numbers into a PDF.',
    h1: 'Add Page Numbers',
    tagline: 'Insert page numbers into a PDF.',
    howToName: 'How to use Add Page Numbers',
    howItWorks: 'Upload your file and process it instantly in your browser.',
    steps: [
      { name: 'Upload', text: 'Select your PDF file.' },
      { name: 'Process', text: 'Apply the settings.' },
      { name: 'Download', text: 'Save your file securely.' }
    ]
  },
  tr: {
    title: 'Sayfa Numarası',
    description: 'PDF sayfalarına otomatik numara ekle.',
    h1: 'Sayfa Numarası',
    tagline: 'PDF sayfalarına otomatik numara ekle.',
    howToName: 'Sayfa Numarası Nasıl Kullanılır',
    howItWorks: 'Dosyanızı yükleyin ve tarayıcınızda anında işleyin.',
    steps: [
      { name: 'Yükle', text: 'PDF dosyanızı seçin.' },
      { name: 'İşle', text: 'Ayarları uygulayın.' },
      { name: 'İndir', text: 'Dosyanızı güvenle indirin.' }
    ]
  }
};

export const removeblankpagesCopy = {
  en: {
    title: 'Remove Blank Pages',
    description: 'Detect and delete empty pages.',
    h1: 'Remove Blank Pages',
    tagline: 'Detect and delete empty pages.',
    howToName: 'How to use Remove Blank Pages',
    howItWorks: 'Upload your file and process it instantly in your browser.',
    steps: [
      { name: 'Upload', text: 'Select your PDF file.' },
      { name: 'Process', text: 'Apply the settings.' },
      { name: 'Download', text: 'Save your file securely.' }
    ]
  },
  tr: {
    title: 'Boş Sayfaları Sil',
    description: 'Boş veya beyaz sayfaları tespit edip sil.',
    h1: 'Boş Sayfaları Sil',
    tagline: 'Boş veya beyaz sayfaları tespit edip sil.',
    howToName: 'Boş Sayfaları Sil Nasıl Kullanılır',
    howItWorks: 'Dosyanızı yükleyin ve tarayıcınızda anında işleyin.',
    steps: [
      { name: 'Yükle', text: 'PDF dosyanızı seçin.' },
      { name: 'İşle', text: 'Ayarları uygulayın.' },
      { name: 'İndir', text: 'Dosyanızı güvenle indirin.' }
    ]
  }
};


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


export const extractTocCopy = {
  en: {
    title: 'Extract Bookmarks — export PDF Table of Contents',
    description: 'Instantly extract the Table of Contents (Bookmarks) from any PDF and save it as a Markdown file.',
    h1: 'Extract Bookmarks (TOC)',
    tagline: 'Export your PDF\'s outline tree structure to a structured text file in one click.',
    howToName: 'How to extract bookmarks from a PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a PDF that has an embedded outline.' },
      { name: 'Extract', text: 'The bookmarks are parsed entirely in your browser.' },
      { name: 'Download', text: 'Get your Markdown (.md) file.' }
    ],
  },
  tr: {
    title: 'İçindekileri Çıkar — PDF Başlık Ağacını Dışa Aktar',
    description: 'Herhangi bir PDF\'in İçindekiler Tablosunu (Yer İmlerini) anında çıkarın ve Markdown dosyası olarak kaydedin.',
    h1: 'İçindekileri Çıkar',
    tagline: 'PDF belgenizin başlık hiyerarşisini tek tıkla yapılandırılmış bir metin dosyasına aktarın.',
    howToName: 'PDF\'ten içindekiler nasıl çıkarılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'İçindekiler kısmı olan bir PDF seçin.' },
      { name: 'Çıkar', text: 'Başlık ağacı tamamen tarayıcınızda ayrıştırılır.' },
      { name: 'İndir', text: 'Markdown (.md) dosyanızı indirin.' }
    ],
  }
};

export const overlayPdfCopy = {
  en: {
    title: 'Add Letterhead — overlay a template behind your PDF',
    description: 'Stamp a company letterhead or invoice template to the background of every page in your PDF document.',
    h1: 'Add Letterhead (Overlay)',
    tagline: 'Seamlessly embed a template PDF into the background of your target document.',
    howToName: 'How to add a letterhead to a PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload Target', text: 'Select the main PDF document you want to stamp.' },
      { name: 'Upload Template', text: 'Select your 1-page letterhead or template PDF.' },
      { name: 'Download', text: 'Get your branded PDF document.' }
    ],
  },
  tr: {
    title: 'Antet Ekle — PDF\'inizin arka planına şablon ekleyin',
    description: 'Şirket antetli kağıdınızı veya fatura şablonunuzu PDF belgenizin her sayfasının arka planına ekleyin.',
    h1: 'Antet / Şablon Ekle',
    tagline: 'Şablon bir PDF\'i, hedef belgenizin tüm sayfalarının arka planına kusursuzca gömün.',
    howToName: 'PDF\'e antet veya şablon nasıl eklenir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Hedefi Yükle', text: 'Şablon basmak istediğiniz ana PDF\'i seçin.' },
      { name: 'Şablon Yükle', text: '1 sayfalık antetli kağıdınızı veya şablon PDF\'inizi seçin.' },
      { name: 'İndir', text: 'Kurumsal PDF belgenizi indirin.' }
    ],
  }
};

export const changeBgCopy = {
  en: {
    title: 'Change PDF Background — Dark Mode & Sepia',
    description: 'Change the background color of your transparent or white PDFs. Perfect for Dark Mode reading or eye protection.',
    h1: 'Change Background Color',
    tagline: 'Instantly set a custom background color for your PDF pages to reduce eye strain.',
    howToName: 'How to change the background color of a PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select your PDF document.' },
      { name: 'Select Color', text: 'Pick a color like Dark Gray or Sepia.' },
      { name: 'Download', text: 'Download the recolored PDF.' }
    ],
  },
  tr: {
    title: 'Arka Plan Rengini Değiştir — Gece Modu & Sepya',
    description: 'Şeffaf veya beyaz PDF\'lerinizin arka plan rengini değiştirin. Gece okuması ve göz koruması için mükemmeldir.',
    h1: 'Arka Plan Rengini Değiştir',
    tagline: 'Göz yorgunluğunu azaltmak için PDF sayfalarınızın arka planına anında özel bir renk atayın.',
    howToName: 'PDF arka plan rengi nasıl değiştirilir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'PDF belgenizi seçin.' },
      { name: 'Renk Seç', text: 'Koyu Gri veya Sepya gibi bir zemin rengi belirleyin.' },
      { name: 'İndir', text: 'Yeniden renklendirilmiş PDF\'inizi indirin.' }
    ],
  }
};


export const autoRedactCopy = {
  en: {
    title: 'Auto-Redact PII — hide sensitive information',
    description: 'Automatically detect and censor Emails, Phone Numbers, and Credit Cards from your PDF using client-side AI.',
    h1: 'Auto-Redact PDF',
    tagline: 'Black out Personally Identifiable Information (PII) with zero uploads.',
    howToName: 'How to auto-redact a PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select your PDF document.' },
      { name: 'Scan', text: 'Our engine detects Emails, SSNs, and more.' },
      { name: 'Download', text: 'Get your censored PDF.' }
    ],
  },
  tr: {
    title: 'Otomatik Sansür — kişisel verileri gizleyin',
    description: 'PDF\'nizdeki E-posta, Telefon ve Kredi Kartı gibi kişisel verileri (PII) otomatik olarak tespit edip sansürleyin.',
    h1: 'Otomatik PDF Sansür',
    tagline: 'Kişisel verilerinizi %100 gizlilikle otomatik siyah kutulara alın.',
    howToName: 'PDF nasıl otomatik sansürlenir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'PDF belgenizi seçin.' },
      { name: 'Tara', text: 'Motorumuz hassas verileri otomatik bulur.' },
      { name: 'İndir', text: 'Sansürlü belgenizi indirin.' }
    ],
  }
};

export const smartMarkdownCopy = {
  en: {
    title: 'Smart PDF to Markdown — AI-ready export',
    description: 'Convert PDFs to structured Markdown. Infers headings (H1, H2, H3) based on font sizes automatically.',
    h1: 'Smart PDF to Markdown',
    tagline: 'Perfect for LLMs and AI agents. Get structured MD files instantly.',
    howToName: 'How to convert PDF to Markdown',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a text-heavy PDF.' },
      { name: 'Convert', text: 'Font sizes are analyzed to structure the document.' },
      { name: 'Download', text: 'Get your Markdown (.md) file.' }
    ],
  },
  tr: {
    title: 'Akıllı PDF to Markdown — Yapay Zeka Çıktısı',
    description: 'PDF\'leri yapılandırılmış Markdown formatına dönüştürün. Başlıkları font boyutlarına göre otomatik algılar.',
    h1: 'PDF to Markdown',
    tagline: 'LLM ve yapay zeka ajanları için kusursuz. Anında yapılandırılmış MD dosyaları alın.',
    howToName: 'PDF Markdown\'a nasıl dönüştürülür',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Metin içeren bir PDF seçin.' },
      { name: 'Dönüştür', text: 'Font boyutları analiz edilerek belge yapılandırılır.' },
      { name: 'İndir', text: 'Markdown (.md) dosyanızı indirin.' }
    ],
  }
};

export const contrastEnhancerCopy = {
  en: {
    title: 'Enhance PDF — adjust contrast & brightness',
    description: 'Fix bad scans by increasing contrast and brightness. Make faded text crisp and readable again.',
    h1: 'Enhance Scanned PDF',
    tagline: 'Adjust brightness and contrast of poor PDF scans effortlessly.',
    howToName: 'How to enhance a scanned PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select your scanned PDF.' },
      { name: 'Adjust', text: 'Set your desired brightness and contrast.' },
      { name: 'Download', text: 'Download the enhanced PDF.' }
    ],
  },
  tr: {
    title: 'PDF Netleştir — kontrast ve parlaklık artır',
    description: 'Kötü taranmış soluk belgelerin kontrastını artırarak metinleri cam gibi net hale getirin.',
    h1: 'Taranmış PDF Netleştir',
    tagline: 'Soluk PDF taramalarının parlaklığını ve kontrastını zahmetsizce ayarlayın.',
    howToName: 'Taranmış PDF nasıl netleştirilir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Taranmış PDF\'nizi seçin.' },
      { name: 'Ayarla', text: 'Parlaklık ve kontrast oranını belirleyin.' },
      { name: 'İndir', text: 'Netleştirilmiş PDF\'inizi indirin.' }
    ],
  }
};


export const pdfToHtmlCopy = {
  en: {
    title: 'PDF to HTML — export as web page',
    description: 'Convert your PDF documents into clean, semantic HTML files directly in your browser.',
    h1: 'PDF to HTML Converter',
    tagline: 'Publish your PDFs on the web easily without losing text formatting.',
    howToName: 'How to convert PDF to HTML',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select the PDF file.' },
      { name: 'Convert', text: 'Our engine extracts the semantic structure.' },
      { name: 'Download', text: 'Get your web-ready HTML file.' }
    ],
  },
  tr: {
    title: 'PDF to HTML — web sayfası yap',
    description: 'PDF belgelerinizi doğrudan tarayıcınızda temiz ve anlamsal (semantic) HTML dosyalarına dönüştürün.',
    h1: 'PDF HTML Çevirici',
    tagline: 'PDF\'lerinizi web\'de kolayca yayınlayın.',
    howToName: 'PDF HTML\'e nasıl çevrilir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'PDF dosyasını seçin.' },
      { name: 'Dönüştür', text: 'Motorumuz metin yapısını HTML\'e çevirir.' },
      { name: 'İndir', text: 'HTML dosyanızı indirin.' }
    ],
  }
};

export const extractFontsCopy = {
  en: {
    title: 'Extract Fonts from PDF — recover TTF/OTF',
    description: 'Find and extract embedded TrueType (TTF) and OpenType (OTF) font files from any PDF.',
    h1: 'Extract PDF Fonts',
    tagline: 'A lifesaver for graphic designers. Recover original fonts instantly.',
    howToName: 'How to extract fonts from PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a PDF with embedded fonts.' },
      { name: 'Extract', text: 'We scan the resource dictionaries for font streams.' },
      { name: 'Download', text: 'Download a ZIP of all fonts.' }
    ],
  },
  tr: {
    title: 'PDF Font Çıkarıcı — TTF/OTF Kurtar',
    description: 'Herhangi bir PDF içine gömülmüş TrueType (TTF) ve OpenType (OTF) font dosyalarını bulup çıkarın.',
    h1: 'PDF Font Kurtarıcı',
    tagline: 'Tasarımcılar için hayat kurtarıcı. Orijinal fontları saniyeler içinde geri alın.',
    howToName: 'PDF\'den font nasıl çıkarılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Gömülü fontlar içeren bir PDF seçin.' },
      { name: 'Ayıkla', text: 'Font dosyalarını kaynak koddan sökeriz.' },
      { name: 'İndir', text: 'Tüm fontları ZIP olarak indirin.' }
    ],
  }
};

export const removeImagesCopy = {
  en: {
    title: 'Remove Images from PDF — ink saver',
    description: 'Strip all images, photos, and heavy graphics from your PDF to save 90% printer ink.',
    h1: 'Remove Images from PDF',
    tagline: 'Create text-only documents instantly. Perfect for printing long slides.',
    howToName: 'How to remove images from PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select your heavy PDF.' },
      { name: 'Strip', text: 'We safely remove all image objects.' },
      { name: 'Download', text: 'Get your ink-saving text-only PDF.' }
    ],
  },
  tr: {
    title: 'Görselleri Sil — Mürekkep Tasarrufu',
    description: 'Yazıcı mürekkebinden %90 tasarruf etmek için PDF\'nizdeki tüm resimleri ve ağır grafikleri silin.',
    h1: 'PDF Resimlerini Sil',
    tagline: 'Saniyeler içinde sadece-metin belgeleri oluşturun. Slayt yazdırmak için ideal.',
    howToName: 'PDF\'den resimler nasıl silinir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Görsel dolu PDF\'inizi seçin.' },
      { name: 'Temizle', text: 'Tüm görsel nesneleri güvenle kaldırırız.' },
      { name: 'İndir', text: 'Sadece metinden oluşan PDF\'i indirin.' }
    ],
  }
};

export const extractUrlsCopy = {
  en: {
    title: 'Extract URLs from PDF — link parser',
    description: 'Find all clickable links, URLs, and external references inside a PDF and export them.',
    h1: 'Extract Links from PDF',
    tagline: 'Parse academic papers and reports for external references in one click.',
    howToName: 'How to extract links from PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a PDF containing hyperlinks.' },
      { name: 'Parse', text: 'We scan link annotations across all pages.' },
      { name: 'Download', text: 'Download a text file with all URLs.' }
    ],
  },
  tr: {
    title: 'Linkleri Çıkar — URL Ayrıştırıcı',
    description: 'Bir PDF\'in içindeki tüm tıklanabilir bağlantıları, URL\'leri ve harici referansları bulup dışa aktarın.',
    h1: 'PDF\'den Link Çıkar',
    tagline: 'Akademik makaleler ve raporlardaki bağlantıları tek tıkla listeleyin.',
    howToName: 'PDF\'den linkler nasıl çıkarılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Link içeren bir PDF seçin.' },
      { name: 'Tara', text: 'Tüm sayfalardaki bağlantı noktalarını tararız.' },
      { name: 'İndir', text: 'Tüm URL\'lerin olduğu dosyayı indirin.' }
    ],
  }
};

export const removeDuplicatesCopy = {
  en: {
    title: 'Remove Duplicate Pages — de-duplicator',
    description: 'Automatically find and delete visually identical pages from your PDF.',
    h1: 'Remove Duplicate Pages',
    tagline: 'Clean up merged or poorly scanned documents by eliminating double pages.',
    howToName: 'How to remove duplicate PDF pages',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select your PDF document.' },
      { name: 'Analyze', text: 'We do a fast pixel-hash comparison of all pages.' },
      { name: 'Download', text: 'Get your cleaned up PDF.' }
    ],
  },
  tr: {
    title: 'Kopya Sayfaları Sil — Tekilleştirici',
    description: 'PDF\'nizdeki görsel olarak tamamen aynı olan kopya sayfaları otomatik bulup silin.',
    h1: 'Kopya Sayfaları Sil',
    tagline: 'Hatalı taranmış belgelerdeki çifte sayfaları yok edin.',
    howToName: 'PDF\'deki çift sayfalar nasıl silinir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'PDF belgenizi seçin.' },
      { name: 'Analiz', text: 'Hızlı bir piksel-hash karşılaştırması yaparız.' },
      { name: 'İndir', text: 'Temizlenmiş PDF\'nizi indirin.' }
    ],
  }
};


export const extractAttachmentsCopy = {
  en: {
    title: 'Extract Attachments — recover embedded files',
    description: 'Find and extract hidden XML, Word, Excel, or other files embedded inside a PDF.',
    h1: 'Extract PDF Attachments',
    tagline: 'Recover hidden files and portfolios instantly.',
    howToName: 'How to extract attachments from PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select a PDF with embedded files.' },
      { name: 'Extract', text: 'We scan the /EmbeddedFiles dictionary.' },
      { name: 'Download', text: 'Download a ZIP of all attachments.' }
    ],
  },
  tr: {
    title: 'Ek Dosyaları Sök — Gömülü dosyaları kurtar',
    description: 'PDF içine gizlenmiş XML, Word, Excel gibi gömülü ek dosyaları (attachments) bulup çıkarın.',
    h1: 'PDF Ek Dosyası Çıkarıcı',
    tagline: 'E-faturalardaki veya kurum belgelerindeki gizli dosyaları kurtarın.',
    howToName: 'PDF\'den ekler nasıl çıkarılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Ek içeren bir PDF seçin.' },
      { name: 'Ayıkla', text: 'Gömülü dosyalar sözlüğünü tararız.' },
      { name: 'İndir', text: 'Tüm ekleri ZIP olarak indirin.' }
    ],
  }
};

export const extractColorsCopy = {
  en: {
    title: 'Extract Color Palette — find HEX codes',
    description: 'Scan your PDF to extract a complete color palette of all HEX codes used in vectors, backgrounds, and fonts.',
    h1: 'PDF Color Palette Extractor',
    tagline: 'The ultimate tool for graphic designers and brand managers.',
    howToName: 'How to extract colors from PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select your designed PDF.' },
      { name: 'Scan', text: 'We analyze the raw drawing operations.' },
      { name: 'Download', text: 'Get your HEX color palette.' }
    ],
  },
  tr: {
    title: 'Renk Paleti Çıkarıcı — HEX Kodlarını Bul',
    description: 'Vektörlerde, arka planlarda ve metinlerde kullanılan tüm HEX renk kodlarını çıkarıp tam bir renk paleti oluşturun.',
    h1: 'PDF Renk Hırsızı',
    tagline: 'Grafikerler ve tasarımcılar için bulunmaz bir araç.',
    howToName: 'PDF\'den renkler nasıl çıkarılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Tasarım içeren PDF\'i seçin.' },
      { name: 'Tara', text: 'Ham çizim operasyonlarını analiz ederiz.' },
      { name: 'İndir', text: 'Renk paletinizi indirin.' }
    ],
  }
};

export const removeTextCopy = {
  en: {
    title: 'Remove Text from PDF — template mode',
    description: 'Strip all text from a PDF, leaving only images, graphics, and backgrounds intact.',
    h1: 'Remove Text from PDF',
    tagline: 'Perfect for stealing templates or preparing documents for translation.',
    howToName: 'How to remove text from PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Upload', text: 'Select your PDF document.' },
      { name: 'Strip', text: 'We safely delete all text drawing operators.' },
      { name: 'Download', text: 'Get your text-free document.' }
    ],
  },
  tr: {
    title: 'Metinleri Sil — Sadece Görsel/Şablon',
    description: 'Sadece resimlerin ve arka planların kalması için PDF\'teki tüm metinleri tamamen silin.',
    h1: 'PDF Yazılarını Sil',
    tagline: 'Şablonları kopyalamak veya çeviri altlığı hazırlamak için ideal.',
    howToName: 'PDF\'den metin nasıl silinir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Belgenizi seçin.' },
      { name: 'Temizle', text: 'Tüm metin çizim operatörlerini yok ederiz.' },
      { name: 'İndir', text: 'Yazısız (sadece görsel) şablonu indirin.' }
    ],
  }
};


export const extractJavascriptCopy = {
  en: {
    title: 'Extract JavaScript — malware analysis',
    description: 'Scan and extract embedded JavaScript code from PDF documents for security and malware analysis.',
    h1: 'PDF JavaScript Extractor',
    tagline: 'The ultimate tool for cyber security analysts.',
    howToName: 'How to extract JavaScript from PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Add your PDF', text: 'Drop a potentially malicious PDF document onto the page.' },
      { name: 'Scan and extract', text: 'We parse the document structure locally to find and extract all embedded JavaScript code.' },
      { name: 'Download JS', text: 'Download a clean .js file to safely analyze the code.' }
    ],
  },
  tr: {
    title: 'JS Sökücü — Malware Analizi',
    description: 'Siber güvenlik ve zararlı yazılım analizi için PDF belgelerine gizlenmiş JavaScript kodlarını tespit edip çıkarın.',
    h1: 'PDF JavaScript Sökücü',
    tagline: 'Siber güvenlik uzmanları için eşsiz bir araç.',
    howToName: 'PDF\'den JavaScript nasıl çıkarılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'PDF dosyanı ekle', text: 'Şüpheli olabilecek PDF belgesini sayfaya bırak.' },
      { name: 'Tara ve ayıkla', text: 'Tüm belge yapısını yerel olarak tarayıp gizlenmiş JavaScript kodlarını tespit ediyoruz.' },
      { name: 'JS dosyasını indir', text: 'Kodları güvenle analiz edebilmek için temiz bir .js dosyası olarak indir.' }
    ],
  }
};

export const splitBookmarksCopy = {
  en: {
    title: 'Split by Bookmarks — auto chapter split',
    description: 'Automatically split large textbooks or reports into multiple PDFs based on their Table of Contents (TOC) bookmarks.',
    h1: 'Split PDF by Bookmarks',
    tagline: 'Instantly break down textbooks into chapters.',
    howToName: 'How to split PDF by TOC',
    howItWorks: 'How it works',
    steps: [
      { name: 'Add your PDF', text: 'Drop a large textbook or report that contains a Table of Contents.' },
      { name: 'Detect chapters', text: 'We instantly read the bookmarks to identify all chapter breakpoints.' },
      { name: 'Split and download', text: 'Extract and download a ZIP file containing each chapter as a separate PDF.' }
    ],
  },
  tr: {
    title: 'Bölümlere Göre Parçala — İçindekiler Ayırıcı',
    description: 'Büyük ders kitaplarını veya raporları, İçindekiler (TOC) tablosundaki bölüm başlıklarına göre otomatik olarak ayrı PDF\'lere bölün.',
    h1: 'İçindekiler Tablosuna Göre Böl',
    tagline: 'Yüzlerce sayfalık kitapları saniyeler içinde bölümlere ayırın.',
    howToName: 'PDF bölümlere göre nasıl ayrılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'PDF dosyanı ekle', text: 'İçindekiler tablosu (TOC) bulunan büyük bir ders kitabı veya raporu sayfaya bırak.' },
      { name: 'Bölümleri algıla', text: 'İçindekiler listesini anında okuyarak bölüm başlangıç noktalarını belirliyoruz.' },
      { name: 'Böl ve indir', text: 'Her bir bölümü ayrı bir PDF\'e ayırıp tek bir ZIP arşivi olarak indir.' }
    ],
  }
};

export const splitBlankCopy = {
  en: {
    title: 'Split by Blank Page — auto scanner split',
    description: 'Automatically divide a large scanned PDF into multiple documents whenever a blank page is detected.',
    h1: 'Split PDF by Blank Page',
    tagline: 'A lifesaver for batch scanning and archiving.',
    howToName: 'How to split PDF by blank pages',
    howItWorks: 'How it works',
    steps: [
      { name: 'Add your PDF', text: 'Drop your batch-scanned PDF file onto the page.' },
      { name: 'Scan for blanks', text: 'We analyze every pixel locally to detect completely blank separator pages.' },
      { name: 'Split and download', text: 'Download a ZIP archive containing your perfectly separated individual documents.' }
    ],
  },
  tr: {
    title: 'Boş Sayfadan Parçala — Tarayıcı Ayırıcı',
    description: 'Tarayıcıdan toplu olarak taranmış büyük bir belgeyi, aradaki boş sayfaları tespit ederek otomatik olarak ayrı PDF\'lere bölün.',
    h1: 'Boş Sayfalardan Böl',
    tagline: 'Arşivciler ve fotokopi merkezleri için devrim niteliğinde.',
    howToName: 'PDF boş sayfalara göre nasıl bölünür',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'PDF dosyanı ekle', text: 'Toplu olarak taranmış PDF belgesini sayfaya bırak.' },
      { name: 'Boş sayfaları tara', text: 'Belgeyi ayıran tamamen boş sayfaları bulmak için her pikseli yerel olarak analiz ediyoruz.' },
      { name: 'Böl ve indir', text: 'Kusursuzca ayrılmış bireysel evraklarınızı tek bir ZIP arşivi halinde indir.' }
    ],
  }
};


export const viewerPrefsCopy = {
  en: {
    title: 'Viewer Preferences — PDF auto open settings',
    description: 'Configure how your PDF behaves when opened. Force full screen mode, hide toolbars, or center the window automatically.',
    h1: 'Set PDF Viewer Preferences',
    tagline: 'Professional presentation settings for eBooks and reports.',
    howToName: 'How to set PDF initial view',
    howItWorks: 'How it works',
    steps: [
      { name: 'Add your PDF', text: 'Drop the PDF document you want to configure.' },
      { name: 'Set preferences', text: 'Choose to force full-screen mode, hide toolbars, or center the window automatically.' },
      { name: 'Save settings', text: 'Download the modified PDF with your new professional presentation settings applied.' }
    ],
  },
  tr: {
    title: 'Açılış Ayarları — PDF görünümünü ayarla',
    description: 'PDF\'iniz açıldığında nasıl davranacağını kodlayın. Tam ekranda açmaya zorlayın veya menü çubuklarını gizleyin.',
    h1: 'PDF Açılış Ayarları (ViewerPrefs)',
    tagline: 'E-kitaplar ve profesyonel sunumlar için olmazsa olmaz.',
    howToName: 'PDF açılış ayarları nasıl yapılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'PDF dosyanı ekle', text: 'Açılış ayarlarını değiştirmek istediğin PDF belgesini sayfaya bırak.' },
      { name: 'Tercihleri belirle', text: 'Tam ekran moduna zorlamayı, araç çubuklarını gizlemeyi veya pencereyi ortalamayı seç.' },
      { name: 'Ayarları kaydet', text: 'Profesyonel sunum ayarlarının uygulandığı yeni PDF belgesini indir.' }
    ],
  }
};

export const extractHiddenTextCopy = {
  en: {
    title: 'Extract Hidden Text — forensics tool',
    description: 'A forensics tool to detect and extract invisible or white-on-white text hidden inside a PDF document.',
    h1: 'Hidden Text Detector',
    tagline: 'Uncover hidden trackers, SEO spam, or steganography.',
    howToName: 'How to detect hidden text in PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Add your PDF', text: 'Drop a suspicious PDF document onto the page.' },
      { name: 'Scan for forensics', text: 'We analyze raw content streams locally to detect invisible rendering modes and hidden text.' },
      { name: 'Download report', text: 'Download a text file containing all the hidden trackers, SEO spam, or steganography we found.' }
    ],
  },
  tr: {
    title: 'Gizli Yazı Dedektörü — Forensics aracı',
    description: 'Adli bilişim (forensics) amaçlı olarak PDF içine gizlenmiş, görünmez kodlu veya beyaz metinleri tespit edip çıkarın.',
    h1: 'Gizli Metin Sökücü',
    tagline: 'SEO spamlarnı veya görünmez filigranları ortaya çıkarın.',
    howToName: 'PDF\'den gizli metin nasıl çıkarılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'PDF dosyanı ekle', text: 'Şüpheli gördüğün PDF belgesini sayfaya bırak.' },
      { name: 'Adli analiz yap', text: 'Görünmez katmanları ve gizli metinleri bulmak için belgenin ham veri akışını yerel olarak tarıyoruz.' },
      { name: 'Raporu indir', text: 'Bulduğumuz tüm gizli SEO spam\'lerini ve takipçileri içeren metin dosyasını indir.' }
    ],
  }
};

export const wipeBookmarksCopy = {
  en: {
    title: 'Wipe Bookmarks — remove TOC',
    description: 'Completely delete the Table of Contents (Bookmarks) structure from a PDF for privacy or file size reduction.',
    h1: 'Remove PDF Bookmarks',
    tagline: 'Hide your document structure before publishing.',
    howToName: 'How to delete PDF bookmarks',
    howItWorks: 'How it works',
    steps: [
      { name: 'Add your PDF', text: 'Drop a PDF document that contains a Table of Contents or bookmarks.' },
      { name: 'Destroy outlines', text: 'We safely remove the entire outlines hierarchy and document structure locally.' },
      { name: 'Download clean PDF', text: 'Download your cleaned document, free of any internal structural metadata.' }
    ],
  },
  tr: {
    title: 'İçindekiler Silici — Outline Yok Et',
    description: 'Gizlilik veya boyut tasarrufu amacıyla PDF içindeki "İçindekiler" (Bookmarks/Outlines) ağacını tamamen yok edin.',
    h1: 'PDF İçindekiler Silici',
    tagline: 'Belgenizin iskeletini ve başlık hiyerarşisini gizleyin.',
    howToName: 'PDF içindekiler nasıl silinir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'PDF dosyanı ekle', text: 'İçindekiler tablosu veya yer imleri (bookmarks) olan PDF belgesini sayfaya bırak.' },
      { name: 'Yapıyı yok et', text: 'Belgenin tüm iskelet yapısını ve içindekiler hiyerarşisini güvenli bir şekilde tamamen siliyoruz.' },
      { name: 'Temiz PDF\'i indir', text: 'İç yapısal meta verilerden tamamen arındırılmış temiz belgenizi indir.' }
    ],
  }
};


export const extractTablesCopy = {
  en: {
    title: 'Extract Tables — PDF to CSV',
    description: 'Mathematically analyze bounding boxes to extract tabular data from PDF into an Excel-ready CSV format.',
    h1: 'PDF to CSV Converter',
    tagline: 'Automated tabular data extraction for analysts.',
    howToName: 'How to extract PDF tables',
    howItWorks: 'How it works',
    steps: [
      { name: 'Add your PDF', text: 'Drop a PDF document containing tabular data onto the page.' },
      { name: 'Analyze layout', text: 'We mathematically calculate text alignments and bounding boxes to reconstruct rows and columns.' },
      { name: 'Download CSV', text: 'Download the extracted data as an Excel-ready CSV file.' }
    ],
  },
  tr: {
    title: 'Tablo Çıkarıcı — PDF to CSV',
    description: 'PDF içindeki metin hizalamalarını matematiksel analiz ederek verileri Excel (CSV) formatına dökün.',
    h1: 'PDF Tablo Çıkarıcı (CSV)',
    tagline: 'Fatura ve veri analizleri için birebir.',
    howToName: 'PDF içindeki tablolar nasıl çıkarılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'PDF dosyanı ekle', text: 'İçinde tablolar bulunan PDF belgesini sayfaya bırak.' },
      { name: 'Düzeni analiz et', text: 'Satır ve sütunları yeniden oluşturmak için metin hizalamalarını matematiksel olarak hesaplıyoruz.' },
      { name: 'CSV olarak indir', text: 'Çıkarılan tüm tablo verilerini Excel\'de açılabilir bir CSV dosyası olarak indir.' }
    ],
  }
};

export const pdfToJsonCopy = {
  en: {
    title: 'PDF to JSON — for developers',
    description: 'Convert a PDF into a structured JSON payload containing text, fonts, and bounding box coordinates.',
    h1: 'PDF to JSON Converter',
    tagline: 'A developer tool for AI pipelines and parsing.',
    howToName: 'How to convert PDF to JSON',
    howItWorks: 'How it works',
    steps: [
      { name: 'Add your PDF', text: 'Drop the PDF document you want to parse onto the page.' },
      { name: 'Parse structure', text: 'We process the document locally to build a complete structural tree with exact coordinates.' },
      { name: 'Download JSON', text: 'Download the raw JSON data, ready to be used in AI pipelines or developer tools.' }
    ],
  },
  tr: {
    title: 'PDF to JSON — Yazılımcılar İçin',
    description: 'Yazılımcılar ve AI projeleri için PDF belgelerini tüm yapısal haritası ve koordinatlarıyla JSON formatına çevirin.',
    h1: 'PDF to JSON Çevirici',
    tagline: 'Geliştiricilerin aradığı o eşsiz araç.',
    howToName: 'PDF JSON formatına nasıl çevrilir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'PDF dosyanı ekle', text: 'Ayrıştırmak (parse) istediğin PDF belgesini sayfaya bırak.' },
      { name: 'Yapıyı ayrıştır', text: 'Tam koordinatları içeren yapısal bir veri haritası oluşturmak için belgeyi yerel olarak işliyoruz.' },
      { name: 'JSON olarak indir', text: 'Yapay zeka veya yazılım projelerinde kullanılmaya hazır ham JSON verisini indir.' }
    ],
  }
};

export const scanToPdfCopy = {
  en: {
    title: 'Scan to PDF — camera scanner',
    description: 'Use your webcam or mobile camera to snap pictures of documents and instantly turn them into a single PDF.',
    h1: 'Camera Scanner to PDF',
    tagline: 'Turn your device into a portable document scanner.',
    howToName: 'How to scan documents to PDF',
    howItWorks: 'How it works',
    steps: [
      { name: 'Allow camera access', text: 'Grant webcam or mobile camera access securely within your browser.' },
      { name: 'Snap documents', text: 'Take clear photos of your physical documents directly through the app.' },
      { name: 'Generate PDF', text: 'We instantly compile and optimize your photos into a single PDF document.' }
    ],
  },
  tr: {
    title: 'Kameradan PDF — Scan to PDF',
    description: 'Bilgisayar veya telefon kameranızı kullanarak fiziksel evraklarınızı anında tek bir PDF belgesine dönüştürün.',
    h1: 'Kamera Tarayıcı (Scan to PDF)',
    tagline: 'Cihazınızı portatif bir tarayıcıya dönüştürün.',
    howToName: 'Kameradan PDF nasıl yapılır',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Kamera izni ver', text: 'Tarayıcın üzerinden web kamerasını veya telefon kamerasını kullanmaya güvenle izin ver.' },
      { name: 'Evrakları çek', text: 'Uygulama üzerinden fiziksel evraklarının net fotoğraflarını arka arkaya çek.' },
      { name: 'PDF oluştur', text: 'Çektiğin fotoğrafları anında optimize edip tek bir PDF belgesinde birleştirerek indir.' }
    ],
  }
};

export const audioReaderCopy = {
  en: {
    title: 'Audio Reader — Text to Speech',
    description: 'Extract raw text from a PDF optimized for audio reading (Text-to-Speech) software and audiobooks.',
    h1: 'PDF Audio Reader Prep',
    tagline: 'Prepare your documents for smooth listening.',
    howToName: 'How to make a PDF ready for audio',
    howItWorks: 'How it works',
    steps: [
      { name: 'Add your PDF', text: 'Drop the PDF document you want to listen to onto the page.' },
      { name: 'Extract flowing text', text: 'We extract and clean the raw text locally, removing page numbers and weird line breaks.' },
      { name: 'Download TXT', text: 'Download a clean text file perfectly optimized for Text-to-Speech (TTS) engines.' }
    ],
  },
  tr: {
    title: 'Sesli Okuma — TTS Hazırlık',
    description: 'PDF belgelerindeki metinleri Sesli Kitap (Text-to-Speech) uygulamalarının pürüzsüz okuyabilmesi için saf txt formatına dökün.',
    h1: 'Sesli Okuyucu Hazırlığı',
    tagline: 'Belgelerinizi dinlemek için en temiz formata çevirin.',
    howToName: 'PDF sese nasıl çevrilir',
    howItWorks: 'Nasıl çalışır',
    steps: [
      { name: 'Yükle', text: 'Okunabilir bir PDF seçin.' },
      { name: 'Ayıkla', text: 'Sayfa numaraları ve kırılmalar temizlenir.' },
      { name: 'İndir', text: 'Ses motorları için pürüzsüz bir metin indirin.' }
    ],
  }
};
