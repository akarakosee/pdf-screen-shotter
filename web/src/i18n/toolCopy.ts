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
  keywords?: string;
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
  q: "Are my PDF files uploaded to a server?",
  a: "No. The conversion runs entirely inside your browser using WebAssembly. Your files are read locally and the images are saved back to your device — no copy is transmitted anywhere. The source code is public, so this can be verified.",
};
const limitsEn: QA = {
  q: "Is there a file size or page limit?",
  a: "No fixed limits. Because your own device does the work, even documents with hundreds of pages convert page by page without running out of memory. Very large jobs simply take longer.",
};
const rangeEn: QA = {
  q: "Can I convert only some pages?",
  a: "Yes. Enter a page range like 1-5,8,11-13 in the Pages field. Single pages and ranges can be combined, separated by commas.",
};
const brokenEn: QA = {
  q: "What happens with password-protected or damaged PDFs?",
  a: "They are skipped with a clear message, and the rest of your files continue converting. Password-protected files cannot be opened yet; support for entering a password is planned.",
};

const stepsEn = (fmt: string): Step[] => [
  {
    name: "Add your PDF",
    text: "Drop one or more PDF files on the page, or click to browse.",
  },
  {
    name: "Choose resolution and pages",
    text: "Pick a DPI preset (150 is recommended) and, if you need it, a page range like 1-5,8.",
  },
  {
    name: "Convert and download",
    text: `Press Convert and download your ${fmt} file, or a ZIP when there are several pages.`,
  },
];

const privacyTr: QA = {
  q: "PDF dosyalarım bir sunucuya yükleniyor mu?",
  a: "Hayır. Dönüşüm, WebAssembly kullanılarak tamamen tarayıcının içinde çalışır. Dosyaların cihazında okunur ve görüntüler yine cihazına kaydedilir — hiçbir kopya bir yere iletilmez. Kaynak kodu açıktır; bu iddia doğrulanabilir.",
};
const limitsTr: QA = {
  q: "Dosya boyutu veya sayfa sınırı var mı?",
  a: "Sabit bir sınır yok. İşi kendi cihazın yaptığı için yüzlerce sayfalık belgeler bile sayfa sayfa, bellek sorunu yaşanmadan dönüştürülür. Çok büyük işler yalnızca daha uzun sürer.",
};
const rangeTr: QA = {
  q: "Yalnızca bazı sayfaları dönüştürebilir miyim?",
  a: "Evet. Sayfalar alanına 1-5,8,11-13 gibi bir aralık yaz. Tek sayfalar ve aralıklar virgülle ayrılarak birlikte kullanılabilir.",
};
const brokenTr: QA = {
  q: "Şifreli veya hasarlı PDF dosyalarında ne olur?",
  a: "Bu dosyalar açık bir mesajla atlanır ve kalan dosyaların dönüşümü sürer. Şifreli dosyalar şimdilik açılamıyor; şifre girme desteği planlanıyor.",
};

const stepsTr = (fmt: string): Step[] => [
  {
    name: "PDF dosyanı ekle",
    text: "Bir veya birden çok PDF dosyasını sayfaya bırak ya da tıklayıp seç.",
  },
  {
    name: "Çözünürlük ve sayfaları seç",
    text: "Bir DPI ön ayarı seç (önerilen 150) ve gerekiyorsa 1-5,8 gibi bir sayfa aralığı gir.",
  },
  {
    name: "Dönüştür ve indir",
    text: `Dönüştür düğmesine bas; tek sayfada ${fmt} dosyasını, birden çok sayfada ZIP arşivini indir.`,
  },
];

export const toolCopy: Record<"png" | "jpg", Record<"en" | "tr", ToolCopy>> = {
  png: {
    en: {
      title: "PDF to PNG — convert in your browser, files never uploaded",
      description:
        "Convert PDF pages to PNG images, free and without limits. Everything runs in your browser — your files never leave your device.",
      h1: "PDF to PNG",
      tagline:
        "Convert PDF pages to PNG images — free, no limits, and your files stay on your device.",
      howToName: "How to convert PDF to PNG in your browser",
      howItWorks: "How it works",
      faqTitle: "Frequently asked questions",
      steps: stepsEn("PNG"),
      faq: [
        privacyEn,
        {
          q: "Which resolution should I choose?",
          a: "150 DPI is right for most uses — presentations, documents, and screens. Choose 300 DPI for printing, and 100 DPI when you want smaller files for quick sharing.",
        },
        rangeEn,
        limitsEn,
        brokenEn,
        {
          q: "How do I get the results?",
          a: "A single converted page downloads directly as a PNG file. Multiple pages are packed into one ZIP archive, named after your document.",
        },
      ],
      crossLink: {
        href: "/png-to-pdf",
        label: "Have PNG images or diagrams? Convert PNG to PDF instead.",
      },
    },
    tr: {
      title: "PDF'i PNG'ye çevir — tarayıcında, dosyalar yüklenmeden",
      description:
        "PDF sayfalarını ücretsiz ve sınırsız biçimde PNG görüntülerine dönüştür. Her şey tarayıcında çalışır — dosyaların cihazından çıkmaz.",
      h1: "PDF'ten PNG'ye",
      tagline:
        "PDF sayfalarını PNG görüntülerine dönüştür — ücretsiz, sınırsız ve dosyaların cihazında kalır.",
      howToName: "Tarayıcıda PDF'ten PNG'ye dönüştürme",
      howItWorks: "Nasıl çalışır",
      faqTitle: "Sık sorulan sorular",
      steps: stepsTr("PNG"),
      faq: [
        privacyTr,
        {
          q: "Hangi çözünürlüğü seçmeliyim?",
          a: "150 DPI çoğu kullanım için doğrudur — sunumlar, belgeler ve ekranlar. Baskı için 300 DPI, hızlı paylaşım için daha küçük dosyalar istiyorsan 100 DPI seç.",
        },
        rangeTr,
        limitsTr,
        brokenTr,
        {
          q: "Sonuçları nasıl alırım?",
          a: "Tek sayfa doğrudan PNG dosyası olarak iner. Birden çok sayfa, belgenin adını taşıyan tek bir ZIP arşivinde toplanır.",
        },
      ],
      crossLink: {
        href: "/tr/png-to-pdf",
        label:
          "Elinde PNG görseller veya şemalar mı var? Görselleri PDF belgesine dönüştür.",
      },
    },
  },
  jpg: {
    en: {
      title: "PDF to JPG — convert in your browser, files never uploaded",
      description:
        "Convert PDF pages to JPG images, free and without limits. Everything runs in your browser — your files never leave your device.",
      h1: "PDF to JPG",
      tagline:
        "Convert PDF pages to JPG images — free, no limits, and your files stay on your device.",
      howToName: "How to convert PDF to JPG in your browser",
      howItWorks: "How it works",
      faqTitle: "Frequently asked questions",
      steps: stepsEn("JPG"),
      faq: [
        privacyEn,
        {
          q: "When is JPG better than PNG?",
          a: "JPG files are much smaller for photographs and scanned pages, which makes them easier to email or upload. For text, diagrams, or anything that needs sharp edges and lossless quality, PNG is the better choice.",
        },
        rangeEn,
        limitsEn,
        brokenEn,
        {
          q: "How do I get the results?",
          a: "A single converted page downloads directly as a JPG file. Multiple pages are packed into one ZIP archive, named after your document.",
        },
      ],
      crossLink: {
        href: "/img-to-pdf",
        label: "Have JPG or PNG images? Convert JPG to PDF instead.",
      },
    },
    tr: {
      title: "PDF'i JPG'ye çevir — tarayıcında, dosyalar yüklenmeden",
      description:
        "PDF sayfalarını ücretsiz ve sınırsız biçimde JPG görüntülerine dönüştür. Her şey tarayıcında çalışır — dosyaların cihazından çıkmaz.",
      h1: "PDF'ten JPG'ye",
      tagline:
        "PDF sayfalarını JPG görüntülerine dönüştür — ücretsiz, sınırsız ve dosyaların cihazında kalır.",
      howToName: "Tarayıcıda PDF'ten JPG'ye dönüştürme",
      howItWorks: "Nasıl çalışır",
      faqTitle: "Sık sorulan sorular",
      steps: stepsTr("JPG"),
      faq: [
        privacyTr,
        {
          q: "JPG ne zaman PNG'den daha iyidir?",
          a: "Fotoğraflar ve taranmış sayfalarda JPG dosyaları çok daha küçüktür; e-postayla göndermesi ve yüklemesi kolaylaşır. Metin, şema ya da keskin kenar ve kayıpsız kalite gerektiren içerikte ise PNG daha doğru seçimdir.",
        },
        rangeTr,
        limitsTr,
        brokenTr,
        {
          q: "Sonuçları nasıl alırım?",
          a: "Tek sayfa doğrudan JPG dosyası olarak iner. Birden çok sayfa, belgenin adını taşıyan tek bir ZIP arşivinde toplanır.",
        },
      ],
      crossLink: {
        href: "/tr/img-to-pdf",
        label:
          "Elinde JPG veya PNG görseller mi var? Görselleri PDF belgesine dönüştür.",
      },
    },
  },
};

const mergeStepsEn: Step[] = [
  {
    name: "Add your PDFs",
    text: "Drop two or more PDF files on the page, or click to browse.",
  },
  {
    name: "Set the order",
    text: "Use the up/down arrows on each file to put them in the order you want merged.",
  },
  {
    name: "Merge and download",
    text: "Press Merge and download the single combined PDF.",
  },
];

const mergeStepsTr: Step[] = [
  {
    name: "PDF dosyalarını ekle",
    text: "İki veya daha fazla PDF dosyasını sayfaya bırak ya da tıklayıp seç.",
  },
  {
    name: "Sırayı ayarla",
    text: "Her dosyanın yanındaki yukarı/aşağı oklarıyla birleştirme sırasını belirle.",
  },
  {
    name: "Birleştir ve indir",
    text: "Birleştir düğmesine bas ve tek bir PDF olarak indir.",
  },
];
export const mergeCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Merge PDF",
    description:
      "Combine multiple PDF files into one document instantly. 100% free, no file size limits, and processed securely in your browser.",
    keywords:
      "merge pdf, combine pdf, join pdf, bind pdf together, merge multiple pdfs, combine pdf files online, free pdf merger",
    h1: "Merge PDF",
    tagline:
      "Combine multiple PDFs into a single document. Fast, free, unlimited, and your files never leave your device.",
    howToName: "How to merge PDF files",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      {
        name: "Upload PDFs",
        text: "Drag and drop the PDF documents you want to merge onto the page.",
      },
      {
        name: "Arrange Order",
        text: "Drag the files locally to arrange them in the exact order you want them to appear.",
      },
      {
        name: "Combine & Download",
        text: "Click merge to download your perfectly combined, single PDF document securely.",
      },
    ],
    faq: [
      { q: "Is there a limit to how many files I can merge?", a: "No! Since the files are processed directly on your computer (not on a server), you can merge as many large PDF files as your device can handle." },
      { q: "Will the quality of my PDF decrease?", a: "Not at all. Your documents are stitched together without any compression, keeping the original quality 100% intact." }
    ],
    crossLink: {
      href: "/compress-pdf",
      label: "Is your merged PDF too large? Compress your PDF size here.",
    },
  },
  tr: {
    title: "PDF Birleştir",
    description: "Birden fazla PDF dosyasını tek bir belgede birleştirin. Sınır yok, yükleme yok. Tamamen cihazınızda çalışan güvenli PDF birleştirici.",
    keywords: "pdf birleştirme, pdf birleştirici, iki pdf birleştirme, toplu pdf birleştirme, pdf sayfalarını birleştir, online pdf birleştir, pdf birleştirme programı",
    h1: "PDF Birleştir",
    tagline: "Parça parça olan belgelerinizi tek bir dosyada toplayın. Çok hızlı, tamamen ücretsiz ve verileriniz cihazınızdan asla çıkmaz.",
    howToName: "İki veya daha fazla PDF nasıl birleştirilir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF'lerinizi Yükleyin", text: "Birleştirmek istediğiniz tüm PDF belgelerini ekrana sürükleyip bırakın." },
      { name: "Sıralamayı Ayarlayın", text: "Yüklediğiniz belgeleri fareyle sürükleyerek (aşağı-yukarı) istediğiniz sıraya sokun." },
      { name: "Birleştir ve İndir", text: "Tek tıkla tüm belgeleri saniyeler içinde bütün bir PDF dosyası olarak indirin." }
    ],
    faq: [
      { q: "Boyut veya dosya sayısı sınırı var mı?", a: "Kesinlikle hayır. Herhangi bir sunucu kullanmadığımız için dilediğiniz kadar büyük dosyayı, istediğiniz sayıda PDF ile birleştirebilirsiniz." },
      { q: "Sayfaların kalitesi veya çözünürlüğü düşer mi?", a: "Hayır. Belgeleriniz sadece arka planda birbirine dikilir, kalite veya çözünürlük kaybına uğramadan orijinal netliğinde birleştirilir." },
      { q: "Birleştirdiğim dosyaları başkaları görebilir mi?", a: "Hayır, birleştirme işlemi sadece sizin bilgisayarınızın RAM'inde gerçekleşir. Dosyalarınız hiçbir bulut sunucusuna gönderilmez." }
    ],
    crossLink: { href: "/tr/compress-pdf", label: "Birleştirdiğiniz belge çok mu büyük oldu? PDF Küçültme aracını deneyin." }
  },
};
export const splitCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Split PDF",
    description:
      "Split PDF files and extract pages easily without uploading. 100% private, free, and secure PDF page separator tool in your browser.",
    keywords:
      "split pdf, separate pdf, extract pages from pdf, cut pdf, divide pdf, extract pdf pages online, free pdf splitter",
    h1: "Split PDF",
    tagline:
      "Extract pages from your PDF into new documents or split large files — free, unlimited, and 100% private.",
    howToName: "How to split PDF files",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      {
        name: "Upload Document",
        text: "Drop the PDF document you want to split or extract pages from.",
      },
      {
        name: "Select Pages",
        text: "Click on the visual grid to select the exact pages you want to keep.",
      },
      {
        name: "Save as PDF",
        text: "Download your selected pages as a brand new PDF document instantly.",
      },
    ],
    faq: [
      { q: "Is it safe to split my PDF here?", a: "Yes! Unlike other tools, we do NOT upload your files to any server. Everything happens securely inside your own web browser." },
      { q: "Can I extract a single page from a 100-page PDF?", a: "Absolutely. Just click on that single page and download it directly." }
    ],
    crossLink: {
      href: "/merge-pdf",
      label: "Want to combine files instead? Try our Merge PDF tool.",
    },
  },
  tr: {
    title: "PDF Böl",
    description: "Programsız ve ücretsiz PDF bölme aracı. PDF sayfalarını ayırın, içinden istediğiniz sayfayı tek tıkla çıkarın. Dosyalarınız sunucuya yüklenmeden %100 güvenli.",
    keywords: "pdf bölme, pdf ayırma, pdf sayfa çıkarma, pdf sayfalarını ayır, pdf'den sayfa alma, pdf kesici, pdf bölücü program",
    h1: "PDF Böl",
    tagline: "Büyük PDF belgelerinizi parçalara ayırın veya içinden sadece istediğiniz sayfaları anında çıkarın. Sunucuya dosya yüklemeden cihazınızda çalışır.",
    howToName: "PDF sayfaları nasıl ayrılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Dosyanızı Seçin", text: "Bölmek veya içinden sayfa çıkarmak istediğiniz PDF belgesini kutuya sürükleyip bırakın." },
      { name: "Sayfaları Belirleyin", text: "Ekranda beliren sayfa önizlemelerine tıklayarak almak istediğiniz sayfaları veya aralıkları seçin." },
      { name: "Anında İndirin", text: "Seçtiğiniz sayfaları tek bir yeni PDF olarak veya ayrı ayrı dosyalar halinde bilgisayarınıza kaydedin." }
    ],
    faq: [
      { q: "PDF bölerken dosyalarım internete yükleniyor mu?", a: "Hayır. Sitemiz tamamen çevrimdışı (tarayıcı içi) çalışır. Dosyalarınız cihazınızdan dışarı çıkmaz, gizli belgeleriniz için dünyanın en güvenli aracıdır." },
      { q: "PDF'den tek bir sayfa alabilir miyim?", a: "Evet. Sadece almak istediğiniz o tek sayfaya tıklayıp İndir demeniz yeterlidir." }
    ],
    crossLink: { href: "/tr/merge-pdf", label: "Sayfaları çıkardıktan sonra birleştirmek mi istiyorsunuz? PDF Birleştirme aracını deneyin." }
  },
};
export const organizeCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Organize PDF",
    description: "Sort, rearrange, delete, and rotate PDF pages easily. Manage your document structure visually right in your browser.",
    keywords: "organize pdf, rearrange pdf pages, sort pdf, delete pdf pages, rotate pdf pages, pdf page manager",
    h1: "Organize PDF",
    tagline: "Take full control of your document. Drag and drop to rearrange pages, rotate them, or delete the ones you don't need.",
    howToName: "How to organize PDF pages",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Document", text: "Select the PDF file you want to organize." },
      { name: "Sort & Edit", text: "Drag pages to reorder them, hover to delete unnecessary pages, or rotate them." },
      { name: "Save Changes", text: "Click apply and download your perfectly organized PDF document." }
    ],
    faq: [
      { q: "Can I delete multiple pages at once?", a: "You can quickly click the delete icon on any page you don't need. The page will be instantly removed from your final document." },
      { q: "Does rearranging pages affect the original file?", a: "No. Your original file remains untouched. You will download a brand new PDF with the updated page order." }
    ],
    crossLink: { href: "/split-pdf", label: "Need to cut a PDF into separate files? Try Split PDF." }
  },
  tr: {
    title: "PDF Düzenle",
    description: "PDF sayfalarınızın sırasını değiştirin, gereksiz sayfaları silin veya döndürün. Ücretsiz ve görsel PDF sayfa yöneticisi.",
    keywords: "pdf düzenle, pdf sayfalarını sırala, pdf sayfa silme, pdf sayfalarını yer değiştirme, pdf düzenleyici, pdf sayfa döndür",
    h1: "PDF Düzenle",
    tagline: "Belgenizin tam kontrolünü elinize alın. Sayfaları sürükleyerek yerlerini değiştirin, döndürün veya istemediğiniz sayfaları kolayca çöpe atın.",
    howToName: "PDF sayfaları nasıl düzenlenir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Belgenizi Yükleyin", text: "Sayfalarını düzenlemek istediğiniz PDF dosyasını seçin." },
      { name: "Sırala ve Yönet", text: "Sayfaları fareyle sürükleyip yerlerini değiştirin. Gereksizleri silin veya ters olanları döndürün." },
      { name: "Yeni Belgeyi İndirin", text: "Kaydet butonuna basarak yepyeni ve düzenlenmiş PDF'inizi cihazınıza indirin." }
    ],
    faq: [
      { q: "Orijinal PDF dosyam bozulur mu?", a: "Hayır, bilgisayarınızdaki orijinal dosyanıza hiçbir zarar gelmez. Yaptığınız değişiklikler sonucunda bilgisayarınıza yepyeni bir dosya indirilir." },
      { q: "Gizli şirket belgelerimi düzenlemem güvenli mi?", a: "Evet, belgeleriniz %100 güvendedir. Tüm sayfa sıralama ve silme işlemleri yalnızca sizin tarayıcınızda gerçekleşir, hiçbir veriniz internete aktarılmaz." }
    ],
    crossLink: { href: "/tr/merge-pdf", label: "Birden fazla PDF belgesini tek dosyada toplamak için PDF Birleştir aracını kullanabilirsiniz." }
  },
};
export const reverseCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Reverse PDF Pages",
    description: "Invert the page order of your PDF document online for free. Flip pages from last-to-first instantly in your browser.",
    keywords: "reverse pdf pages, flip pdf page order, invert pdf pages, last to first pdf, reverse document order",
    h1: "Reverse PDF Pages",
    tagline: "Flip your document backwards in a single click. Ideal for reversing documents scanned from back-to-front.",
    howToName: "How to reverse PDF page order",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file whose page order is backwards." },
      { name: "Reverse", text: "Click reverse to automatically invert the sequence from last page to first." },
      { name: "Download", text: "Download your corrected PDF in the proper sequential order." }
    ],
    faq: [
      { q: "When should I use this tool?", a: "It is perfect when a multi-page scanner scans your physical pages in reverse order (from last page to first page)." },
      { q: "Is the page quality preserved?", a: "Yes, reversing only changes the index of pages; no re-rendering or loss of quality occurs." }
    ],
    crossLink: { href: "/organize-pdf", label: "Need custom manual page sorting? Use Organize PDF." }
  },
  tr: {
    title: "PDF Sayfalarını Tersine Çevir",
    description: "PDF sayfalarının sırasını sondan başa doğru tersine çevirin. Ters taranmış belgeleri tek tıkla düzeltin.",
    keywords: "pdf sayfalarını tersine çevir, pdf sayfa sırasını ters yapma, sondan başa pdf, ters taranmış pdf düzeltme",
    h1: "Sayfaları Tersine Çevir",
    tagline: "Sondan başa taranmış veya sırası karışmış PDF belgelerini tek tıkla tersine çevirin. Sayfa kalitesi %100 korunur.",
    howToName: "PDF sayfa sırası nasıl tersine çevrilir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "Sayfa sırası ters olan belgenizi ekrana bırakın." },
      { name: "Tersine Çevir", text: "Tek tıkla sayfaların dizilimini sondan başa doğru otomatik çevirin." },
      { name: "Düzeltilmiş PDF'i İndirin", text: "Doğru sırada dizilmiş yeni belgenizi anında indirin." }
    ],
    faq: [
      { q: "Bu araç ne zaman kullanılır?", a: "Fotokopi makinesi veya tarayıcı sayfaları sondan başa doğru taradığında, tek tek uğraşmadan tek tıkla düzeltmek için idealdir." },
      { q: "Belgenin kalitesi düşer mi?", a: "Hayır. Yalnızca sayfaların sırası değiştirilir, içindeki metin ve görsellere dokunulmaz." }
    ],
    crossLink: { href: "/tr/organize-pdf", label: "Sayfaları tek tek elle sıralamak istiyorsanız PDF Düzenle aracını kullanın." }
  },
};
export const batesCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Bates Numbering",
    description: "Add legal Bates numbering and custom prefixes to PDF documents online for free. Ideal for law firms, legal discovery, and trials.",
    keywords: "bates numbering pdf, legal bates stamping, bates stamp pdf online, add bates numbers, legal document indexing",
    h1: "Bates Numbering",
    tagline: "Stamp your legal documents with standardized Bates numbers, prefixes, and page digits for court exhibits and evidence.",
    howToName: "How to add Bates numbering to a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Legal Documents", text: "Select the PDF files or exhibits you need to index." },
      { name: "Configure Bates Stamp", text: "Set custom prefix (e.g., CONF-0001), starting number, digit count, and placement." },
      { name: "Download Bates Stamped PDF", text: "Download your professionally indexed legal document." }
    ],
    faq: [
      { q: "What is Bates numbering used for?", a: "Bates numbering is a standard method used in the legal and medical fields to uniquely identify and index pages in discovery documents and court evidence." },
      { q: "Is it safe for confidential client files?", a: "Yes. All stamping is performed strictly in your local browser without transmitting client data across the network." }
    ],
    crossLink: { href: "/protect-pdf", label: "Need to secure your legal exhibits? Use Protect PDF." }
  },
  tr: {
    title: "Bates Numaralandırma",
    description: "Hukuki dava evraklarınıza, sözleşmelere ve delillere profesyonel Bates numarası (Önekli sayfa damgası) ekleyin. Ücretsiz ve güvenli.",
    keywords: "bates numaralandırma, hukuki pdf damgası, bates no ekleme, dava evrakı numaralandırma, bates stamp pdf",
    h1: "Bates Numaralandırma",
    tagline: "Hukuk büroları ve adli süreçler için standart Bates önekleri (Örn: DELİL-0001) ile belgelerinizi resmi olarak indeksleyin.",
    howToName: "PDF belgesine Bates numarası nasıl eklenir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Hukuki Evrakı Yükleyin", text: "Bates numarası vurmak istediğiniz PDF belgesini seçin." },
      { name: "Bates Ayarlarını Yapın", text: "Önek (örn: EK-A-), basamak sayısı ve başlangıç numarasını belirleyin." },
      { name: "Damgalanmış PDF'i İndirin", text: "Mahkemeye ve arşive hazır indekslenmiş belgenizi kaydedin." }
    ],
    faq: [
      { q: "Bates numaralandırma nedir ve nerede kullanılır?", a: "Avukatlık büroları, mahkemeler ve hastanelerde yüzlerce sayfalık delil ve dava dosyalarının takibini kolaylaştırmak için kullanılan resmi numaralama sistemidir." },
      { q: "Müvekkilimin gizli evrakları güvende mi?", a: "Evet. Sayfaların damgalanması tamamen tarayıcınızın kendi içinde yapılır; müvekkil evrakları internete asla sızmaz." }
    ],
    crossLink: { href: "/tr/protect-pdf", label: "Hukuki belgelerinizi şifrelemek için PDF Şifrele aracını kullanın." }
  },
};
export const nupCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "N-Up PDF",
    description: "Combine multiple pages onto a single sheet (2-up, 4-up, 6-up, or 9-up grid) online for free. Save paper when printing PDFs.",
    keywords: "n-up pdf, multiple pages per sheet, 2 up pdf, 4 up pdf, print multiple pdf pages on one sheet, save paper pdf",
    h1: "N-Up PDF",
    tagline: "Fit 2, 4, 6, or 9 pages onto a single sheet of paper. Create handout summaries and save printing costs easily.",
    howToName: "How to fit multiple PDF pages on one sheet",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the document you want to condense into multi-page sheets." },
      { name: "Choose Layout", text: "Select 2-up (2 pages/sheet), 4-up (4 pages/sheet), or higher grid density." },
      { name: "Download Grid PDF", text: "Save your condensed PDF ready for eco-friendly printing." }
    ],
    faq: [
      { q: "Why use N-Up layout?", a: "N-Up layout allows you to print slide decks, lecture notes, or reference docs on far fewer sheets of paper, reducing printing costs." },
      { q: "Can I add page borders?", a: "Yes, you can configure subtle boundary borders between the tiled pages for easier reading." }
    ],
    crossLink: { href: "/booklet-pdf", label: "Want to create a foldable booklet instead? Try Booklet PDF." }
  },
  tr: {
    title: "Tek Sayfaya Çoklu Sayfa (N-Up)",
    description: "Tek bir kağıda 2, 4, 6 veya 9 sayfa sığdırarak PDF oluşturun. Yazıcı kağıdından tasarruf edin ve sunum notları hazırlayın.",
    keywords: "n-up pdf, tek sayfaya 2 sayfa basma, tek sayfaya 4 sayfa pdf, kağıt tasarruflu pdf, slaytları tek sayfada toplama",
    h1: "Tek Sayfaya Çoklu Sayfa (N-Up)",
    tagline: "Bir kağıt üzerine 2, 4 veya daha fazla sayfayı yan yana dizin. Sunum notları, ders slaytları ve kağıt tasarrufu için idealdir.",
    howToName: "Tek bir kağıda birden fazla sayfa nasıl sığdırılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Belgenizi Yükleyin", text: "Sıkıştırmak istediğiniz PDF dosyasını seçin." },
      { name: "Düzeni Seçin", text: "Tek kağıda kaç sayfa basılacağını (2 sayfa, 4 sayfa vb.) belirleyin." },
      { name: "Baskıya Hazır PDF'i İndirin", text: "Sayfaları yan yana dizilmiş yeni belgenizi cihazınıza kaydedin." }
    ],
    faq: [
      { q: "Yazılar okunabilir kalır mı?", a: "2-up ve 4-up düzenlerinde yazılar genellikle rahatça okunabilir. Çok yoğun metinlerde 2-up düzeni önerilir." },
      { q: "Kağıt tasarrufu sağlar mı?", a: "Evet! 4-up düzeni kullandığınızda 100 sayfalık bir dokümanı sadece 25 yaprak kağıda basabilirsiniz." }
    ],
    crossLink: { href: "/tr/booklet-pdf", label: "Katlanabilir kitapçık hazırlamak istiyorsanız Kitapçık Yapma aracını deneyin." }
  },
};
export const pdfaCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "PDF to PDF/A",
    description: "Convert standard PDF documents into PDF/A ISO archival format online for free. Ideal for government and legal long-term preservation.",
    keywords: "pdf to pdf/a, convert pdf to pdfa, pdfa converter, archive pdf, iso 19005 compliant pdf",
    h1: "PDF to PDF/A",
    tagline: "Transform your documents into ISO-standard PDF/A format for official government submissions, court archives, and lifetime storage.",
    howToName: "How to convert PDF to PDF/A",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the standard PDF document you need to archive." },
      { name: "Convert to PDF/A", text: "Our tool embeds all fonts, sets color profiles, and conforms to ISO archival standards." },
      { name: "Download PDF/A", text: "Download your certified archival PDF document." }
    ],
    faq: [
      { q: "What is PDF/A?", a: "PDF/A is an ISO-standardized version of the PDF format designed specifically for the digital preservation and archiving of electronic documents." },
      { q: "Why do government portals require PDF/A?", a: "Because PDF/A guarantees that fonts and formatting will render identically on any device, decades into the future." }
    ],
    crossLink: { href: "/flatten-pdf", label: "Want to lock form fields too? Try Flatten PDF." }
  },
  tr: {
    title: "PDF'ten PDF/A'ya Çevirme",
    description: "PDF belgelerinizi resmi arşivleme standardı olan PDF/A formatına dönüştürün. E-Devlet, mahkeme ve kurumsal arşivler için uygundur.",
    keywords: "pdf to pdfa, pdf a yapma, pdf a dönüştürücü, e devlet pdf a, mahkeme pdf a formatı, pdf a çevirme",
    h1: "PDF'ten PDF/A'ya Çevirme",
    tagline: "Belgelerinizi ISO standartlarında PDF/A arşiv formatına dönüştürün. Resmi kurumlara ve UYAP/E-Devlet sistemlerine sorunsuz yükleyin.",
    howToName: "PDF belgesi PDF/A formatına nasıl çevrilir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Belgenizi Yükleyin", text: "PDF/A'ya dönüştürmek istediğiniz standart PDF dosyasını seçin." },
      { name: "Dönüştürme", text: "Aracımız tüm yazı tiplerini (fontları) ve renk profillerini ISO standartlarına uygun gömer." },
      { name: "PDF/A Dosyasını İndirin", text: "Resmi kurumlara yüklemeye hazır arşiv dosyanızı cihazınıza kaydedin." }
    ],
    faq: [
      { q: "PDF/A formatı neden istenir?", a: "E-Devlet, mahkemeler ve resmi arşivler, belgenin 20 yıl sonra bile aynı font ve tasarımla bozulmadan açılabilmesi için PDF/A standardını zorunlu tutar." },
      { q: "Dönüştürme ücretli mi?", a: "Hayır. Diğer programların aksine sitemizde tamamen ücretsiz ve sınırsız şekilde PDF/A oluşturabilirsiniz." }
    ],
    crossLink: { href: "/tr/flatten-pdf", label: "Form kutularını kalıcı kilitlemek için PDF Düzleştir aracını deneyin." }
  },
};
export const extractCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Extract Text from PDF — locally, files never uploaded",
    description:
      "Extract all readable text from your PDF into a TXT file directly in your browser. No servers involved.",
    keywords:
      "extract text from pdf, pdf to text, pdf to txt, read pdf text, pdf metin çıkar, pdf yazıları al",
    h1: "Extract Text from PDF",
    tagline:
      "Pull all readable text from your PDF into a TXT file — free and 100% private.",
    howToName: "How to extract text from a PDF file in your browser",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to extract readable text from.",
      },
      {
        name: "Extract text",
        text: "We scan all pages locally and pull out every readable word instantly.",
      },
      {
        name: "Download TXT",
        text: "Download the extracted text securely as a simple and clean .txt file.",
      },
    ],
    crossLink: {
      href: "/protect-pdf",
      label: "Need to secure your file? Protect PDF.",
    },
  },
  tr: {
    title: "PDF'ten Metin Çıkar — yazıları kopyala, cihazında kalsın",
    description:
      "PDF dosyanızdaki tüm yazıları TXT dosyası olarak dışa aktarın. Sunucusuz, doğrudan tarayıcınızın içinde çalışır.",
    keywords:
      "pdf metin çıkar, pdf yazıları al, pdf to txt, pdf	en metin kopyala, extract text from pdf",
    h1: "PDF'ten Metin Çıkar",
    tagline:
      "PDF'teki tüm metinleri çıkarıp TXT dosyası olarak kaydedin — ücretsiz ve yerel.",
    howToName: "Tarayıcıda PDF dosyasından metin nasıl çıkarılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Okunabilir metinlerini çıkarmak istediğiniz PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Metni çıkar",
        text: "Tüm sayfaları yerel olarak tarıyor ve okunabilen her kelimeyi anında alıyoruz.",
      },
      {
        name: "TXT indir",
        text: "Çıkarılan metni basit ve temiz bir .txt dosyası olarak güvenle indirin.",
      },
    ],
    crossLink: {
      href: "/tr/protect-pdf",
      label: "Dosyanı şifrelemek mi istiyorsun? PDF Şifrele.",
    },
  },
};
export const sanitizeCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Sanitize PDF",
    description: "Remove hidden metadata, author information, revision history, and GPS tags from PDF files online for free.",
    keywords: "sanitize pdf, remove pdf metadata, strip pdf metadata, clean pdf, anonymize pdf online, remove author from pdf",
    h1: "Sanitize PDF",
    tagline: "Wipe hidden author details, creation dates, camera GPS tags, and embedded software traces from your PDF documents.",
    howToName: "How to sanitize and remove metadata from a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Document", text: "Select the PDF file you want to anonymize and scrub." },
      { name: "Sanitize", text: "Our tool wipes document info dictionary, XMP metadata, and private creator metadata." },
      { name: "Download Clean PDF", text: "Download your completely anonymized PDF ready for safe public distribution." }
    ],
    faq: [
      { q: "What metadata is removed?", a: "Author names, company names, creation/modification dates, software tools used, PDF producer tags, and embedded geolocation info are completely stripped." },
      { q: "Will the visible content change?", a: "No. The visual layout and readable text remain 100% intact; only the hidden background metadata is wiped." }
    ],
    crossLink: { href: "/redact-pdf", label: "Need to black out visible text too? Try Redact PDF." }
  },
  tr: {
    title: "PDF Meta Veri Temizle",
    description: "PDF dosyalarındaki gizli yazar, şirket adı, oluşturulma tarihi ve GPS meta verilerini kalıcı olarak silin ve anonimleştirin.",
    keywords: "pdf meta veri temizleme, pdf yazar bilgisini silme, pdf gizli bilgileri temizle, pdf anonymize, pdf metadata sil",
    h1: "PDF Meta Veri Temizle",
    tagline: "Belgenizin arkasında gizlenen yazar adını, bilgisayar bilgilerini ve oluşturma geçmişini tek tıkla silerek tam gizlilik sağlayın.",
    howToName: "PDF belgesinden meta veriler nasıl temizlenir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Belgenizi Yükleyin", text: "Meta verilerini temizlemek istediğiniz PDF dosyasını seçin." },
      { name: "Temizleme", text: "Sistemimiz yazar adı, yazılım bilgisi ve gizli etiketleri belgeden kazır." },
      { name: "Anonim PDF'i İndirin", text: "Artık kimseye ait bilgi içermeyen tertemiz PDF dosyanızı indirin." }
    ],
    faq: [
      { q: "Hangi bilgiler silinir?", a: "Yazar adı, şirketi, dosyanın oluşturulduğu bilgisayar programı, düzenleme tarihleri ve gizli meta veri etiketleri tamamen silinir." },
      { q: "Sayfadaki yazılar veya tasarım bozulur mu?", a: "Hayır. Sayfa içeriği ve görseller aynen kalır; sadece dosya özelliklerinde yer alan gizli veriler temizlenir." }
    ],
    crossLink: { href: "/tr/redact-pdf", label: "Görünen hassas yazıları da karartmak için PDF Sansürle aracını deneyin." }
  },
};
export const watermarkCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Watermark PDF",
    description: "Add text or image watermarks to your PDF documents for free. Protect copyright and sensitive documents securely in your browser.",
    keywords: "watermark pdf, add watermark to pdf, stamp pdf, pdf watermark creator, brand pdf online, watermark document",
    h1: "Watermark PDF",
    tagline: "Stamp your documents with custom text, copyright notices, or confidentiality markers. Fast, customizable, and 100% private.",
    howToName: "How to add a watermark to a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Document", text: "Select the PDF file you want to protect with a watermark." },
      { name: "Customize Watermark", text: "Type your watermark text, adjust opacity, rotation, font size, and position." },
      { name: "Download Watermarked PDF", text: "Click apply to permanently stamp all pages and download your document." }
    ],
    faq: [
      { q: "Can someone remove the watermark later?", a: "Our tool bakes the watermark directly into the PDF rendering stream, making it very difficult to remove without specialized software." },
      { q: "Is my document uploaded to a server?", a: "No. The watermark stamping happens completely inside your web browser using local processing." }
    ],
    crossLink: { href: "/protect-pdf", label: "Want to lock your PDF with a password too? Try Protect PDF." }
  },
  tr: {
    title: "PDF Filigran Ekle",
    description: "PDF dosyalarınıza ücretsiz ve programsız filigran (watermark), telif yazısı veya logo damgası ekleyin. %100 güvenli ve yerel.",
    keywords: "pdf filigran ekle, pdf watermark ekleme, pdf damga basma, pdf telif yazısı ekle, pdf gizli damgası, online pdf filigran",
    h1: "PDF Filigran Ekle",
    tagline: "Belgelerinize 'GİZLİDİR', şirket adı, telif veya özel yazı damgaları ekleyerek izinsiz kullanımı engelleyin. Verileriniz cihazınızda kalır.",
    howToName: "PDF dosyasına filigran nasıl eklenir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Belgenizi Yükleyin", text: "Filigran eklemek istediğiniz PDF belgesini kutuya bırakın." },
      { name: "Filigranı Özelleştirin", text: "Yazınızı girin, opaklığı (şeffaflığı), açıyı, yazı boyutunu ve konumunu ayarlayın." },
      { name: "Filigranlı PDF'i İndirin", text: "Tek tıkla tüm sayfalara damganızı basın ve yeni belgenizi anında indirin." }
    ],
    faq: [
      { q: "Eklediğim filigran sonradan kolayca silinebilir mi?", a: "Hayır. Filigran belgenin görsel katmanlarına doğrudan işlenir, bu sayede izinsiz kopyalama ve paylaşımı büyük oranda önler." },
      { q: "Belgelerim internete yükleniyor mu?", a: "Asla. Damgalama işlemi tamamen tarayıcınızın belleğinde gerçekleşir, belgeleriniz sunucularımıza gitmez." }
    ],
    crossLink: { href: "/tr/protect-pdf", label: "Belgenize şifre de koymak ister misiniz? PDF Şifrele aracını deneyin." }
  },
};
export const numberCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Add Page Numbers",
    description: "Add page numbers to your PDF documents easily. Customize numbering format, font, size, and position for free online.",
    keywords: "add page numbers to pdf, number pdf pages, paginate pdf, pdf page numbering online, stamp page numbers",
    h1: "Add Page Numbers",
    tagline: "Number your PDF pages with clean, customizable formatting. Choose positions, numbering styles, and margins easily.",
    howToName: "How to add page numbers to a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Choose the PDF document that needs page numbers." },
      { name: "Choose Position & Format", text: "Select bottom-right, bottom-center, header, and choose format like 'Page X of Y'." },
      { name: "Apply & Download", text: "Click apply to number every page and download your numbered PDF." }
    ],
    faq: [
      { q: "Can I skip numbering the cover page?", a: "Yes, you can set the starting page number or choose from which page to begin numbering." },
      { q: "Are existing text and margins overwritten?", a: "No, numbers are stamped into the document margins without interfering with your original content." }
    ],
    crossLink: { href: "/bates-numbering", label: "Need legal Bates stamping instead? Try Bates Numbering." }
  },
  tr: {
    title: "PDF Sayfa Numarası Ekle",
    description: "PDF belgelerinize ücretsiz ve kolayca sayfa numarası ekleyin. Numaraların konumunu, yazı tipini ve stilini dilediğiniz gibi özelleştirin.",
    keywords: "pdf sayfa numarası ekle, pdf sayfaları numaralandırma, pdf sayfa no verme, pdf numaralandır, online pdf sayfa numarası",
    h1: "PDF Sayfa Numarası Ekle",
    tagline: "Raporlarınıza, tezlerinize veya sözleşmelerinize profesyonel sayfa numaraları ekleyin. Alt-orta, sağ-üst gibi tüm konumları destekler.",
    howToName: "PDF belgesine sayfa numarası nasıl eklenir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Dosyanızı Seçin", text: "Numaralandırmak istediğiniz PDF belgesini yükleyin." },
      { name: "Konum ve Formatı Ayarlayın", text: "Numaranın sayfanın neresinde duracağını (alt, üst, sağ, sol) ve biçimini seçin." },
      { name: "Numaralı PDF'i İndirin", text: "Numaralandırılmış ve düzenlenmiş yeni belgenizi tek tıkla kaydedin." }
    ],
    faq: [
      { q: "Kapak sayfasını numarasız bırakabilir miyim?", a: "Evet, başlangıç sayfasını seçerek ilk sayfayı (kapak) numarasız bırakabilirsiniz." },
      { q: "Mevcut yazılarımın üstüne biner mi?", a: "Numaralar sayfa kenar boşluklarına yerleştirilir, orijinal metinlerinizin okunurluğu bozulmaz." }
    ],
    crossLink: { href: "/tr/bates-numbering", label: "Hukuki evraklar için Bates numaralama mı lazım? Bates Numaralandırma aracını deneyin." }
  },
};
export const protectCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Protect PDF",
    description: "Encrypt and protect your PDF files with a strong password. Lock your sensitive documents locally in your browser for ultimate privacy.",
    keywords: "protect pdf, password protect pdf, encrypt pdf, lock pdf file, secure pdf, add password to pdf",
    h1: "Protect PDF",
    tagline: "Keep your sensitive documents safe by locking them with a highly secure, unbreakable password. 100% offline and private.",
    howToName: "How to add a password to a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Document", text: "Drag and drop the PDF you want to protect into the box." },
      { name: "Set a Password", text: "Type a strong password to lock your file. Make sure you don't forget it!" },
      { name: "Encrypt & Save", text: "Click protect and download your newly encrypted PDF document." }
    ],
    faq: [
      { q: "Can you recover my password if I forget it?", a: "No. The encryption happens on your device and we do not store your passwords. If you lose your password, the file cannot be opened." },
      { q: "How strong is the encryption?", a: "We use industry-standard AES encryption to guarantee that your file cannot be brute-forced easily." }
    ],
    crossLink: { href: "/unlock-pdf", label: "Need to remove a password instead? Try Unlock PDF." }
  },
  tr: {
    title: "PDF Şifrele",
    description: "Özel PDF belgelerinize güçlü bir şifre (parola) koyarak kilitleyin. İşlemler sunucuya yüklenmeden %100 güvenli şekilde tarayıcınızda yapılır.",
    keywords: "pdf şifreleme, pdf şifre koyma, pdf parola ekle, pdf kilitleme, güvenli pdf yap, pdf dosyasını şifrele",
    h1: "PDF Şifrele",
    tagline: "Hassas ve gizli belgelerinizi kırılamaz bir şifre ile kilitleyerek yetkisiz kişilerin açmasını engelleyin. Tamamen güvenli ve yerel.",
    howToName: "PDF belgesine nasıl şifre koyulur?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Belgenizi Ekleyin", text: "Korumak ve kilitlemek istediğiniz PDF dosyasını sisteme yükleyin." },
      { name: "Güçlü Bir Şifre Girin", text: "Belgenizi açmak için kullanılacak parolayı yazın. Bu şifreyi unutmamaya dikkat edin!" },
      { name: "Şifrele ve İndir", text: "Tek tıkla dosyanızı AES şifrelemesi ile kilitleyin ve bilgisayarınıza indirin." }
    ],
    faq: [
      { q: "Şifremi unutursam belgeyi siz açabilir misiniz?", a: "Kesinlikle hayır. Verileriniz sunucularımıza gitmediği için şifrelerinizi bilmiyoruz. Şifrenizi kaybederseniz dosyayı bir daha asla açamazsınız." },
      { q: "Dosyam başkalarının eline geçerse ne olur?", a: "Dosyanız 128/256-bit AES standartlarıyla şifrelendiği için parolayı bilmeyen birinin dosyanın içeriğini okuması imkansızdır." }
    ],
    crossLink: { href: "/tr/unlock-pdf", label: "Şifresini bildiğiniz bir PDF'in şifresini temelli kaldırmak için PDF Şifre Kaldırma aracını kullanın." }
  },
};
export const unlockCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Unlock PDF",
    description: "Remove passwords from your PDF files instantly. Unlock secure PDFs locally in your browser without uploading to any server.",
    keywords: "unlock pdf, remove pdf password, pdf password remover, crack pdf, decrypt pdf, remove security from pdf",
    h1: "Unlock PDF",
    tagline: "Easily remove passwords and security restrictions from your PDF documents. 100% free and processed completely offline.",
    howToName: "How to unlock a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Secure PDF", text: "Drag and drop your password-protected PDF document." },
      { name: "Enter Password", text: "Enter the correct password to unlock the file (required for encrypted files)." },
      { name: "Download Unlocked PDF", text: "Click unlock and download your PDF completely free of password restrictions." }
    ],
    faq: [
      { q: "Can I unlock a PDF without knowing the password?", a: "No. Our tool is designed for legitimate users who know their document's password but want to remove it permanently so they don't have to type it every time. We do not provide brute-force cracking tools." },
      { q: "Is it safe to unlock my bank statements here?", a: "Yes, it is the safest option available. Since the decryption happens entirely in your local browser, your sensitive financial documents are never uploaded to the internet." }
    ],
    crossLink: { href: "/protect-pdf", label: "Want to lock a document instead? Use our Protect PDF tool." }
  },
  tr: {
    title: "PDF Şifre Kırma",
    description: "PDF dosyalarınızdaki parola korumasını tamamen kaldırın. Banka ekstreleri veya kilitli belgelerinizi programsız ve güvenle açın.",
    keywords: "pdf şifre kırma, pdf şifre kaldırma, pdf parola kaldır, kilitli pdf açma, pdf şifre çözücü, şifreli pdf",
    h1: "PDF Şifre Kırma",
    tagline: "Şifresini bildiğiniz kilitli PDF dosyalarından parola korumasını tamamen silin. İşlemleriniz %100 gizlilikle, sadece cihazınızda gerçekleşir.",
    howToName: "PDF şifresi nasıl kaldırılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Kilitli PDF'i Yükle", text: "Şifresini kaldırmak istediğiniz PDF belgesini kutuya sürükleyin." },
      { name: "Parolayı Girin", text: "Belgenin mevcut şifresini yazarak dosyanın kilidini açın." },
      { name: "Şifresiz PDF'i İndir", text: "Şifre Kaldır butonuna tıklayın ve belgenizin parolasız yeni halini indirin." }
    ],
    faq: [
      { q: "Şifreyi hiç bilmiyorsam belgeyi kırabilir misiniz?", a: "Hayır. Bu araç, yasadışı şifre kırıcı (brute-force) bir yazılım değildir. Kendi şifrenizi girerek, belgeyi her açtığınızda tekrar tekrar şifre sormasını engellemek (şifreyi temelli silmek) için kullanılır." },
      { q: "Banka veya maaş bordromu yüklemem güvenli mi?", a: "Kesinlikle! Diğer bulut tabanlı sitelerin aksine, sitemizde belgeleriniz hiçbir sunucuya (internete) yüklenmez. Şifre kaldırma işlemi bilgisayarınızın içinde (çevrimdışı) yapılır." }
    ],
    crossLink: { href: "/tr/protect-pdf", label: "Tam tersini yapıp bir belgeyi kilitlemek mi istiyorsunuz? PDF Şifrele aracını deneyin." }
  },
};
export const rotateCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Rotate PDF",
    description: "Rotate PDF pages online for free. Turn your PDF documents upside down or sideways, and save the changes permanently.",
    keywords: "rotate pdf, turn pdf pages, rotate pdf online, flip pdf, fix upside down pdf",
    h1: "Rotate PDF",
    tagline: "Easily rotate specific pages or your entire document. Turn upside-down pages right-side up permanently.",
    howToName: "How to rotate a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Drag and drop the document with the upside-down or sideways pages." },
      { name: "Rotate Pages", text: "Hover over individual pages to rotate them, or use the buttons to rotate all pages at once." },
      { name: "Apply & Download", text: "Click apply to permanently save the new orientation and download the file." }
    ],
    faq: [
      { q: "Is the rotation permanent?", a: "Yes! Unlike some PDF readers that only temporarily rotate your view, our tool permanently rewrites the file so it opens correctly on every device." },
      { q: "Can I rotate just one specific page?", a: "Absolutely. You can choose to rotate all pages at once, or hover over a single sideways page to rotate only that one." }
    ],
    crossLink: { href: "/remove-pages", label: "Found a page you don't need? Use our Remove PDF Pages tool." }
  },
  tr: {
    title: "PDF Döndürme",
    description: "Ters veya yan dönmüş PDF sayfalarınızı kalıcı olarak düzeltin. Programsız ve ücretsiz PDF döndürme aracı.",
    keywords: "pdf döndürme, ters pdf düzeltme, pdf sayfalarını çevir, yan pdf düzeltme, pdf yönünü değiştirme",
    h1: "PDF Döndürme",
    tagline: "Ters taranmış veya yan duran sayfalarınızı tek tıkla düzeltin. Değişiklikler belgenize kalıcı olarak işlenir.",
    howToName: "PDF sayfaları nasıl döndürülür?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Ters Belgeyi Yükle", text: "Yönü bozuk olan PDF belgenizi kutuya sürükleyip bırakın." },
      { name: "Yönünü Düzelt", text: "Fareyle yan duran sayfaların üzerine gelip döndürün veya tüm belgeyi tek tıkla çevirin." },
      { name: "Kalıcı Olarak İndir", text: "Kaydet butonuna bastığınızda, belge yeni yönüyle kalıcı olarak bilgisayarınıza iner." }
    ],
    faq: [
      { q: "Bu döndürme işlemi kalıcı mıdır?", a: "Evet! Bazı PDF okuyucular belgeyi sadece o anlık düz gösterir ancak başkasına gönderdiğinizde yine ters açılır. Bu araç ise belgenin kodlarını yeniden yazarak yönünü sonsuza dek kalıcı olarak düzeltir." },
      { q: "Sadece tek bir sayfayı çevirebilir miyim?", a: "Elbette. İsterseniz tüm sayfaları, isterseniz sadece tarayıcıda ters çıkmış tek bir sayfayı seçerek döndürebilirsiniz." }
    ],
    crossLink: { href: "/tr/remove-pages", label: "Belgenizin içinde boş veya gereksiz sayfalar mı var? PDF Sayfa Silme aracını kullanın." }
  },
};
export const removeCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Remove Pages from PDF — delete unwanted pages locally",
    description:
      "Delete extra or sensitive pages from your PDF document in seconds. No servers involved, 100% private.",
    keywords:
      "remove pdf pages, delete pages from pdf, erase pdf page, extract pages, pdf sayfa sil, sayfa kaldır",
    h1: "Remove Pages",
    tagline:
      "Strip unwanted pages from your PDF cleanly — free, unlimited, and entirely in your browser.",
    howToName: "How to remove pages from a PDF online",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document containing pages you want to delete.",
      },
      {
        name: "Select pages",
        text: "Click on the visual grid locally to remove any unwanted pages.",
      },
      {
        name: "Download PDF",
        text: "Download your streamlined PDF document securely.",
      },
    ],
    crossLink: {
      href: "/rotate-pdf",
      label: "Need to fix sideways pages? Rotate PDF.",
    },
  },
  tr: {
    title: "PDF Sayfa Sil — istenmeyen sayfaları anında çıkar",
    description:
      "PDF dosyanızdan gereksiz veya hatalı sayfaları saniyeler içinde kaldırın. Sunucuya yüklenmez, gizlilik garantili.",
    keywords:
      "pdf sayfa sil, pdf sayfalarını çıkar, pdf	en sayfa kaldır, remove pdf pages, delete pdf pages",
    h1: "PDF Sayfa Sil",
    tagline:
      "İstenmeyen sayfaları PDF belgenizden temizleyin — ücretsiz, sınırsız ve tarayıcınızda.",
    howToName: "PDF dosyasından sayfa nasıl silinir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Silmek istediğiniz sayfaları içeren PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Sayfaları seç",
        text: "İstenmeyen sayfaları kaldırmak için yerel olarak görsel ızgaraya tıklayın.",
      },
      {
        name: "PDF indir",
        text: "İstenmeyen sayfalardan arındırılmış PDF belgenizi güvenle indirin.",
      },
    ],
    crossLink: {
      href: "/tr/rotate-pdf",
      label: "Yan duran sayfaları düzeltmek mi istiyorsunuz? PDF Döndür.",
    },
  },
};
export const imgToPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "JPG to PDF",
    description: "Convert JPG, JPEG, PNG, and WebP images into a single PDF file instantly. Free image to PDF converter with no limits.",
    keywords: "jpg to pdf, convert image to pdf, jpeg to pdf, photos to pdf, merge images into pdf, pictures to pdf online",
    h1: "JPG to PDF",
    tagline: "Combine multiple photos and images into one clean PDF document. Adjust orientation, margins, and order visually.",
    howToName: "How to convert JPG images to PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Images", text: "Drag and drop your JPG, JPEG, or PNG images onto the page." },
      { name: "Reorder & Adjust", text: "Drag images into the desired order and select page orientation (portrait or landscape)." },
      { name: "Create PDF", text: "Click convert to stitch your photos into a single, high-resolution PDF document." }
    ],
    faq: [
      { q: "Is there a limit on how many images I can convert?", a: "No. Since conversion runs locally in your browser, you can merge dozens of photos without hitting server size caps." },
      { q: "Will the image resolution be reduced?", a: "No, images are embedded in their full original resolution unless you choose a compression option." }
    ],
    crossLink: { href: "/pdf-to-jpg", label: "Need to convert PDF pages back to images? Use PDF to JPG." }
  },
  tr: {
    title: "JPG'den PDF'e Çevirme",
    description: "JPG, JPEG ve PNG fotoğraflarınızı tek bir PDF dosyasına dönüştürün. Ücretsiz, sınırsız ve programsız fotoğraf PDF yapma aracı.",
    keywords: "jpg pdf yapma, fotoğrafları pdf yapma, resimleri tek pdf yap, jpg to pdf dönüştürücü, resimden pdf oluştur",
    h1: "JPG'den PDF'e Çevirme",
    tagline: "Birden fazla fotoğrafı veya taranmış evrak görselini tek bir düzenli PDF belgesi haline getirin. Sayfa sırasını ve yönünü kolayca ayarlayın.",
    howToName: "Fotoğraflar nasıl tek bir PDF dosyası yapılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Fotoğrafları Yükleyin", text: "PDF yapmak istediğiniz JPG veya PNG resimlerini sürükleyip bırakın." },
      { name: "Sıralamayı Düzenleyin", text: "Görselleri sürükleyerek istediğiniz sayfa sırasına koyun, dikey/yatay yönü seçin." },
      { name: "PDF Olarak İndirin", text: "Tek tıkla tüm resimlerin birleştiği yüksek kaliteli PDF belgenizi indirin." }
    ],
    faq: [
      { q: "Kaç tane fotoğraf ekleyebilirim?", a: "Herhangi bir sınır yoktur. İşlem kendi bilgisayarınızda çalıştığı için onlarca fotoğrafı tek seferde birleştirebilirsiniz." },
      { q: "Fotoğrafların netliği bozulur mu?", a: "Hayır. Fotoğraflar orijinal netlik ve çözünürlükleri korunarak PDF sayfalarına yerleştirilir." }
    ],
    crossLink: { href: "/tr/pdf-to-jpg", label: "PDF sayfalarını tekrar fotoğrafa dönüştürmek için PDF to JPG aracını kullanın." }
  },
};
export const pngToPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "PNG to PDF",
    description: "Convert PNG images with transparency to PDF documents online for free. Fast, high quality, and 100% private.",
    keywords: "png to pdf, convert png to pdf, png image to pdf document, high quality png to pdf online",
    h1: "PNG to PDF",
    tagline: "Turn your transparent PNG graphics, screenshots, or drawings into crisp PDF documents in seconds.",
    howToName: "How to convert PNG to PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Select PNG Files", text: "Drag and drop the PNG images you want to turn into a PDF." },
      { name: "Configure Layout", text: "Arrange page order, select margins, and choose orientation." },
      { name: "Download PDF", text: "Click convert to download your newly generated PDF file." }
    ],
    faq: [
      { q: "What happens to transparent backgrounds?", a: "Transparent areas in PNGs are rendered on clean white PDF pages by default." },
      { q: "Can I combine PNG and JPG images together?", a: "Yes! Our image converter supports mixed image formats in the same document." }
    ],
    crossLink: { href: "/pdf-to-png", label: "Need to extract PDF pages as PNG? Try PDF to PNG." }
  },
  tr: {
    title: "PNG'den PDF'e Çevirme",
    description: "PNG formatındaki görsellerinizi, logolarınızı ve ekran görüntülerinizi ücretsiz PDF belgesine dönüştürün.",
    keywords: "png pdf yapma, png to pdf çevirici, png yi pdf yapma, şeffaf png pdf yap",
    h1: "PNG'den PDF'e Çevirme",
    tagline: "Ekran görüntülerinizi, grafiklerinizi veya çizimlerinizi saniyeler içinde yüksek kaliteli bir PDF belgesine dönüştürün.",
    howToName: "PNG görseli PDF'e nasıl dönüştürülür?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PNG Görsellerini Seçin", text: "Dönüştürmek istediğiniz PNG dosyalarını ekrana bırakın." },
      { name: "Sayfa Düzenini Seçin", text: "Sayfaların sırasını ve kenar boşluklarını isteğinize göre ayarlayın." },
      { name: "PDF'i İndirin", text: "Dönüştür butonuna basarak tertemiz PDF dosyanızı cihazınıza kaydedin." }
    ],
    faq: [
      { q: "Şeffaf (transparent) alanlar ne olur?", a: "PNG'deki saydam alanlar PDF'te otomatik olarak temiz beyaz arka plan üzerine oturtulur." },
      { q: "PNG ve JPG resimleri aynı anda ekleyebilir miyim?", a: "Evet! Farklı formatlardaki fotoğrafları aynı anda yükleyip tek bir PDF'te toplayabilirsiniz." }
    ],
    crossLink: { href: "/tr/pdf-to-png", label: "PDF sayfalarını kaliteli PNG formatında kaydetmek için PDF'ten PNG'ye aracını kullanın." }
  },
};
export const flattenCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Flatten PDF",
    description: "Flatten interactive PDF forms, annotations, and layers into a single static background. Free, fast, and secure in your browser.",
    keywords: "flatten pdf, make pdf non editable, flatten pdf form fields, lock pdf forms, flatten annotations pdf",
    h1: "Flatten PDF",
    tagline: "Lock form fields, signatures, and annotations into the document background so they can never be modified or removed.",
    howToName: "How to flatten a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the interactive PDF form or annotated document you want to lock." },
      { name: "Flatten", text: "Our tool converts all interactive form fields and notes into permanent page content." },
      { name: "Download", text: "Download your uneditable, flattened PDF file ready for safe sharing." }
    ],
    faq: [
      { q: "What does flattening a PDF do?", a: "Flattening merges fillable form fields, checkboxes, and comments directly into the background layer, making the content read-only." },
      { q: "Can someone unflatten the document later?", a: "No. Once flattened, the interactive fields become permanent raster/vector graphics and cannot be converted back into fillable forms." }
    ],
    crossLink: { href: "/protect-pdf", label: "Need to add password protection too? Try Protect PDF." }
  },
  tr: {
    title: "PDF Düzleştir",
    description: "Doldurulabilir PDF formlarını, imzaları ve notları arka planla birleştirerek kilitli, değiştirilemez hale getirin. Ücretsiz ve yerel.",
    keywords: "pdf düzleştirme, pdf form kilitleme, pdf düzenlenemez yapma, pdf flatten, değiştirilemez pdf yap",
    h1: "PDF Düzleştir",
    tagline: "Form alanlarını, dijital imzaları ve ek açıklamaları kalıcı hale getirin. Belgenizin başkaları tarafından değiştirilmesini engelleyin.",
    howToName: "PDF nasıl düzleştirilir (değiştirilemez yapılır)?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "Düzleştirmek (kilitlemek) istediğiniz form veya imzalı belgeyi seçin." },
      { name: "Düzleştirme", text: "Aracımız tüm doldurulmuş kutucukları ve notları kalıcı sayfa içeriğine dönüştürür." },
      { name: "Kilitli PDF'i İndirin", text: "Artık kimsenin içeriğini bozamayacağı düzleştirilmiş PDF'inizi indirin." }
    ],
    faq: [
      { q: "PDF düzleştirme ne işe yarar?", a: "Doldurduğunuz resmi formların, imzaların veya notların başkaları tarafından değiştirilmesini, silinmesini veya kutucukların kaymasını önler." },
      { q: "Düzleştirilen form tekrar açılabilir mi?", a: "Hayır. Düzleştirme işlemi form alanlarını kalıcı birer görüntü haline getirdiği için sonradan geri alınamaz." }
    ],
    crossLink: { href: "/tr/protect-pdf", label: "Belgenizi tamamen şifrelemek için PDF Şifrele aracını kullanabilirsiniz." }
  },
};
export const signCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Sign PDF",
    description: "Sign PDF documents online for free. Draw, type, or upload your signature securely in your browser without cloud uploads.",
    keywords: "sign pdf, electronic signature pdf, add signature to pdf, esign pdf free, draw signature pdf, sign contract online",
    h1: "Sign PDF",
    tagline: "Add your electronic signature to agreements, contracts, and forms. 100% private — your signature never leaves your computer.",
    howToName: "How to sign a PDF document",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Document", text: "Select the PDF contract or form that requires your signature." },
      { name: "Create Signature", text: "Draw your signature with your mouse/touchscreen, type your name, or upload an image." },
      { name: "Place & Download", text: "Position and resize your signature on the exact page line, then download the signed document." }
    ],
    faq: [
      { q: "Is my signature saved on your servers?", a: "Never. The signature is created and stamped entirely inside your browser's local memory for strict privacy." },
      { q: "Can I add initials or the date as well?", a: "Yes, you can place signatures, initials, dates, and text anywhere on your PDF." }
    ],
    crossLink: { href: "/protect-pdf", label: "Want to lock your signed contract with a password? Use Protect PDF." }
  },
  tr: {
    title: "PDF İmzala",
    description: "PDF sözleşmelerinizi ve evraklarınızı ücretsiz imzalayın. İmzanızı çizin, yazın veya yükleyin. %100 gizli ve güvenli e-imza aracı.",
    keywords: "pdf imzala, pdf e imza ekleme, pdf imzalama programı, sözleşme imzalama online, ücretsiz pdf imza",
    h1: "PDF İmzala",
    tagline: "Dilekçe, sözleşme ve formlarınıza kolayca e-imza ekleyin. Çıktı alıp tarama derdine son. İmzanız cihazınızdan asla dışarı çıkmaz.",
    howToName: "PDF belgesi nasıl imzalanır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Belgeyi Yükleyin", text: "İmzalamak istediğiniz PDF sözleşmesini veya formunu ekleyin." },
      { name: "İmzanızı Oluşturun", text: "Fareyle veya parmağınızla çizin, adınızı yazın veya ıslak imzanızın fotoğrafını yükleyin." },
      { name: "Konumlandır ve İndir", text: "İmzanızı ilgili satıra yerleştirip boyutunu ayarlayın, imzalı belgenizi anında indirin." }
    ],
    faq: [
      { q: "İmzam veya belgem sunucularınıza kaydediliyor mu?", a: "Kesinlikle hayır. İmzanız ve belgeniz sadece sizin tarayıcınızın içinde işlenir, hiçbir yere kaydedilmez veya gönderilmez." },
      { q: "İmzanın yanına tarih ve isim ekleyebilir miyim?", a: "Evet, imzanızın yanına metin aracıyla tarih ve unvan bilgisi de ekleyebilirsiniz." }
    ],
    crossLink: { href: "/tr/protect-pdf", label: "İmzaladığınız sözleşmeyi şifreyle kilitlemek için PDF Şifrele aracını deneyin." }
  },
};
export const extractImagesCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Extract Images",
    description: "Extract all embedded photos and images from any PDF in their original quality. Free online image ripper.",
    keywords: "extract images from pdf, rip images from pdf, get photos from pdf, save images from pdf, download pictures from pdf",
    h1: "Extract Images",
    tagline: "Pull out all embedded photos, diagrams, and illustrations from your PDF documents in their original crisp resolution.",
    howToName: "How to extract images from a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF document containing the photos you want to extract." },
      { name: "Extract", text: "Our tool analyzes the document objects and extracts every embedded image file." },
      { name: "Download Images", text: "Download all extracted pictures individually or packed neatly in a single ZIP file." }
    ],
    faq: [
      { q: "What is the difference between this and PDF to JPG?", a: "'PDF to JPG' converts entire pages into pictures. 'Extract Images' pulls only the actual photos/illustrations out of the document without page text or margins." },
      { q: "Are images recompressed?", a: "No. Images are extracted in their exact original format and quality (JPEG, PNG) as embedded in the PDF." }
    ],
    crossLink: { href: "/pdf-to-jpg", label: "Want to convert whole pages into pictures instead? Try PDF to JPG." }
  },
  tr: {
    title: "PDF'ten Görselleri Çıkar",
    description: "PDF dosyalarındaki tüm gömülü fotoğrafları, logoları ve grafikleri orijinal kalitesinde ayıklayıp bilgisayarınıza indirin.",
    keywords: "pdf görselleri çıkar, pdf ten fotoğraf alma, pdf içindeki resimleri kaydetme, pdf resim ayıklama, pdf fotoğraflarını indir",
    h1: "PDF'ten Görselleri Çıkar",
    tagline: "Belgenizin içindeki fotoğrafları, grafik ve şekilleri orijinal çözünürlüklerini hiç bozmadan tek tıkla dışa aktarın.",
    howToName: "PDF içindeki fotoğraflar ve resimler nasıl kaydedilir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Belgenizi Yükleyin", text: "İçindeki fotoğrafları almak istediğiniz PDF dosyasını seçin." },
      { name: "Ayıklama", text: "Aracımız belgedeki tüm gömülü fotoğraf nesnelerini otomatik olarak bulur." },
      { name: "Resimleri İndirin", text: "Tüm fotoğrafları tek tıkla toplu olarak ZIP arşivi içinde bilgisayarınıza kaydedin." }
    ],
    faq: [
      { q: "PDF to JPG ile bu aracın farkı nedir?", a: "'PDF to JPG' tüm sayfayı bir resme dönüştürür. 'Görselleri Çıkar' ise sadece belgenin içine gömülmüş fotoğrafları (yazısız ve sayfa kenarlıksız) saf haliyle çıkarır." },
      { q: "Fotoğrafların kalitesi düşer mi?", a: "Hayır. Dosyaya gömülü fotoğraflar hiçbir sıkıştırmaya uğramadan %100 orijinal kalitelerinde indirilir." }
    ],
    crossLink: { href: "/tr/pdf-to-jpg", label: "Tüm sayfayı olduğu gibi resim yapmak istiyorsanız PDF to JPG aracını kullanabilirsiniz." }
  },
};
export const compressCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Compress PDF",
    description: "Compress large PDF files without losing quality. Reduce PDF size for email attachments fast and securely right in your browser.",
    keywords: "compress pdf, reduce pdf size, make pdf smaller, shrink pdf, pdf compressor, compress pdf without losing quality, resize pdf",
    h1: "Compress PDF",
    tagline: "Reduce the file size of your PDF documents drastically while keeping the original layout and quality intact.",
    howToName: "How to compress a PDF file",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload your PDF", text: "Select the large PDF file you want to shrink from your device." },
      { name: "Choose Compression", text: "Select your preferred compression level (Recommended, Maximum, or Low)." },
      { name: "Download", text: "Save the highly compressed PDF file instantly to your device." }
    ],
    faq: [
      { q: "Will the quality of my PDF drop?", a: "Our smart compression engine optimizes images and removes unnecessary background data while keeping your text sharp and 100% readable." },
      { q: "Is this secure?", a: "Yes. The compression runs entirely on your device. We do not upload your sensitive documents to any cloud server." }
    ],
    crossLink: { href: "/protect-pdf", label: "Want to secure your newly compressed file? Try Protect PDF." }
  },
  tr: {
    title: "PDF Küçült",
    description: "Büyük PDF dosyalarınızı ücretsiz ve programsız sıkıştırın. WhatsApp ve E-posta için PDF boyutunu anında MB'tan KB'a düşürün.",
    keywords: "pdf küçültme, pdf sıkıştırma, pdf boyutu küçültme, pdf mb düşürme, büyük pdf küçült, pdf dosya boyutu azaltma",
    h1: "PDF Küçült",
    tagline: "E-postaya veya WhatsApp'a sığmayan büyük PDF dosyalarınızı saniyeler içinde sıkıştırın. Metin kalitesi asla bozulmaz.",
    howToName: "PDF dosya boyutu nasıl küçültülür?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Belgeyi Yükleyin", text: "Boyutunu küçültmek (mb düşürmek) istediğiniz PDF dosyasını kutuya bırakın." },
      { name: "Sıkıştırma Seviyesini Seçin", text: "Önerilen, Maksimum veya Düşük sıkıştırma seçeneklerinden birini belirleyin." },
      { name: "Küçültülmüş PDF'i İndirin", text: "Optimize edilmiş ve boyutu ciddi oranda azalmış yeni dosyanızı cihazınıza kaydedin." }
    ],
    faq: [
      { q: "PDF dosyam ne kadar küçülür?", a: "Dosyanın içindeki görsel yoğunluğuna bağlı olarak %40 ile %80 arasında bir boyut düşüşü yaşanır." },
      { q: "Metinler okunmaz hale gelir mi?", a: "Kesinlikle hayır. Akıllı sistemimiz sadece arka plan verilerini ve aşırı büyük görselleri optimize eder. Metinler ve vektörler %100 net kalır." }
    ],
    crossLink: { href: "/tr/protect-pdf", label: "Küçülttüğünüz belgeye şifre koymak ister misiniz? PDF Şifrele aracını deneyin." }
  },
};
export const redactCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Redact PDF",
    description: "Permanently black out and redact sensitive text, ID numbers, and confidential data from PDF files online for free.",
    keywords: "redact pdf, black out text in pdf, censor pdf, remove sensitive data pdf, permanently redact pdf",
    h1: "Redact PDF",
    tagline: "Black out private information, credit card numbers, or confidential terms permanently. 100% private in your browser.",
    howToName: "How to redact a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Document", text: "Select the PDF containing confidential information you want to sanitize." },
      { name: "Draw Blackout Boxes", text: "Drag redaction boxes over sensitive text, figures, or names." },
      { name: "Apply & Download", text: "Click redact to permanently scrub the underlying data and download the safe file." }
    ],
    faq: [
      { q: "Can someone select the text behind the black box?", a: "No! Unlike drawing shapes in basic viewers, our redaction completely scrubs the underlying text data from the file stream." },
      { q: "Are my confidential files secure?", a: "Yes, redaction is executed purely on your local machine. Your confidential files never touch our servers." }
    ],
    crossLink: { href: "/sanitize-pdf", label: "Want to strip hidden metadata and attachments too? Try Sanitize PDF." }
  },
  tr: {
    title: "PDF Sansürle / Karart",
    description: "PDF belgelerinizdeki T.C. kimlik no, hesap numarası gibi gizli bilgileri kalıcı siyah kutularla sansürleyin ve gizleyin.",
    keywords: "pdf sansürleme, pdf yazı karartma, pdf tc gizleme, pdf siyah şerit çekme, pdf gizli bilgileri silme",
    h1: "PDF Sansürle (Karart)",
    tagline: "Hassas kişisel verileri, isimleri ve gizli rakamları kalıcı olarak karartın. Altındaki metinler tamamen kazınır, kopyalanamaz.",
    howToName: "PDF belgesindeki yazılar nasıl sansürlenir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Belgenizi Yükleyin", text: "Gizlemek istediğiniz bilgileri içeren PDF belgesini yükleyin." },
      { name: "Karartma Alanını Seçin", text: "Gizlenecek yazıların, kimlik no veya hesapların üzerine fareyle siyah kutu çizin." },
      { name: "Kalıcı Olarak İndir", text: "Sansürle butonuna basarak altındaki metin verisi tamamen silinmiş güvenli PDF'i indirin." }
    ],
    faq: [
      { q: "Siyah kutunun arkasındaki yazı kopyalanabilir mi?", a: "Kesinlikle hayır! Basit çizim araçlarının aksine, bu araç siyah kutunun altındaki metin kodlarını dosyadan tamamen siler." },
      { q: "Hassas bilgilerim sunucunuza gider mi?", a: "Hayır. Karartma işlemi tamamen tarayıcınızın içinde yapılır, gizli evraklarınız cihazınızda kalır." }
    ],
    crossLink: { href: "/tr/sanitize-pdf", label: "Belgedeki gizli meta verileri ve yazar bilgilerini de temizlemek için PDF Temizle aracını deneyin." }
  },
};
export const repairCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Repair PDF",
    description: "Repair corrupted, damaged, or unreadable PDF files online for free. Recover content from broken PDF documents.",
    keywords: "repair pdf, fix corrupted pdf, recover broken pdf, damaged pdf fixer, open broken pdf online",
    h1: "Repair PDF",
    tagline: "Fix broken cross-reference tables, structural errors, and salvage readable pages from corrupted PDF documents.",
    howToName: "How to repair a corrupted PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Damaged PDF", text: "Select the corrupted PDF that fails to open properly." },
      { name: "Analyze & Fix", text: "Our parser reconstructs the PDF internal catalog and xref tables." },
      { name: "Download Restored PDF", text: "Save the repaired and readable PDF file to your device." }
    ],
    faq: [
      { q: "Can every broken PDF be fixed?", a: "If the underlying page streams exist, our tool can rebuild the index and restore the file. If the file is 100% empty or truncated to zero bytes, recovery is not possible." },
      { q: "Is the repair done privately?", a: "Yes. Reconstruction happens entirely inside your browser's WebAssembly sandbox." }
    ],
    crossLink: { href: "/compress-pdf", label: "Is the repaired file too large? Try Compress PDF." }
  },
  tr: {
    title: "PDF Onar",
    description: "Açılmayan, bozuk veya hasarlı PDF dosyalarını ücretsiz onarın. Bozulmuş PDF belgelerindeki sayfaları kurtarın.",
    keywords: "pdf onarma, bozuk pdf açma, hasarlı pdf düzeltme, pdf tamir etme, açılmayan pdf kurtarma",
    h1: "PDF Onar (Kurtarma)",
    tagline: "Açılırken hata veren veya yapısı bozulan PDF belgelerinin iç indeksini yeniden inşa ederek okunabilir hale getirin.",
    howToName: "Bozuk veya hasarlı PDF nasıl onarılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Hasarlı Belgeyi Yükleyin", text: "Açılmayan veya hata veren PDF dosyasını kutuya bırakın." },
      { name: "Onarım ve Yeniden Yapılandırma", text: "Sistemimiz belgenin hasarlı iç indeksini ve sayfa ağacını onarır." },
      { name: "Kurtarılan PDF'i İndirin", text: "Düzeltilmiş ve tekrar açılabilir hale gelmiş PDF belgenizi indirin." }
    ],
    faq: [
      { q: "Her bozuk PDF kurtarılabilir mi?", a: "Sayfa verileri dosya içinde mevcutsa aracımız indeksi yeniden yazarak dosyayı kurtarır. Dosya tamamen boş veya 0 bayt ise kurtarılamaz." },
      { q: "İşlem sırasında belgem güvenli mi?", a: "Evet, tüm onarım algoritması tarayıcınızda yerel çalışır, dosyalarınız üçüncü şahıslara iletilmez." }
    ],
    crossLink: { href: "/tr/compress-pdf", label: "Onarılan belge çok büyükse PDF Küçültme aracını kullanabilirsiniz." }
  },
};
export const grayscaleCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Grayscale PDF",
    description: "Convert color PDF documents to black and white (grayscale) online for free. Save printer ink and toner easily.",
    keywords: "grayscale pdf, black and white pdf, convert pdf to b&w, remove color from pdf, save printer ink pdf",
    h1: "Grayscale PDF",
    tagline: "Turn vibrant color documents into crisp black and white PDFs. Perfect for saving colored printer ink and creating official copies.",
    howToName: "How to convert a PDF to grayscale",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Color PDF", text: "Select the colored PDF file you want to convert to black and white." },
      { name: "Convert to Grayscale", text: "Our engine maps all color channels into balanced grayscale luminance." },
      { name: "Download B&W PDF", text: "Save your black and white PDF file instantly." }
    ],
    faq: [
      { q: "Does converting to grayscale reduce file size?", a: "Yes, in many cases removing color channel information significantly reduces document file size." },
      { q: "Will images look too dark?", a: "We use standard luminance weighting (ITU-R BT.601) so colored photos convert to natural, readable shades of gray." }
    ],
    crossLink: { href: "/compress-pdf", label: "Want to shrink your document size even further? Try Compress PDF." }
  },
  tr: {
    title: "PDF Siyah Beyaz Yap",
    description: "Renkli PDF belgelerinizi ücretsiz ve programsız siyah beyaz (gri tonlamalı) yapın. Yazıcı mürekkebinden ve toneri tasarruf edin.",
    keywords: "pdf siyah beyaz yapma, renkli pdf i siyah beyaza çevirme, pdf grayscale yapma, yazıcı dostu pdf, pdf renklerini sil",
    h1: "PDF Siyah Beyaz Yap",
    tagline: "Renkli belgeleri, kitapları ve grafikleri net gri tonlamalı (siyah-beyaz) PDF'e dönüştürün. Yazıcı kartuşundan tasarruf edin.",
    howToName: "Renkli PDF nasıl siyah beyaz yapılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Renkli PDF'i Seçin", text: "Siyah beyaza dönüştürmek istediğiniz renkli belgeyi yükleyin." },
      { name: "Gri Tonlamaya Çevir", text: "Aracımız tüm renk kanallarını dengeli gri tonlarına dönüştürür." },
      { name: "Siyah Beyaz PDF'i İndirin", text: "Yazıcı dostu, mürekkep tasarruflu yeni belgenizi kaydedin." }
    ],
    faq: [
      { q: "Siyah beyaz yapmak dosya boyutunu düşürür mü?", a: "Evet, renk kanalları ayıklandığı için belgenin dosya boyutu genellikle ciddi oranda azalır." },
      { q: "Resimler çok karanlık çıkar mı?", a: "Hayır. Doğal gri tonlama algoritması kullanıldığı için fotoğraflar ve renkli grafikler dengeli ve net görünür." }
    ],
    crossLink: { href: "/tr/compress-pdf", label: "Boyutu daha da küçültmek istiyorsanız PDF Küçült aracını deneyin." }
  },
};
export const resizeCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Resize PDF",
    description: "Resize PDF page dimensions to standard sizes like A4, A3, Letter, or Legal online for free. Adjust page scale easily.",
    keywords: "resize pdf, change pdf page size, scale pdf pages, convert pdf to a4, resize pdf to letter",
    h1: "Resize PDF",
    tagline: "Change the physical paper size of your PDF pages. Scale documents to A4, US Letter, A3, or custom dimensions.",
    howToName: "How to resize PDF pages",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the document you want to resize." },
      { name: "Choose Paper Size", text: "Select standard formats like A4, A3, Letter, Legal, or enter custom dimensions." },
      { name: "Download Resized PDF", text: "Save your document scaled perfectly to the new paper size." }
    ],
    faq: [
      { q: "Will my content be distorted when resizing?", a: "Our scaling engine preserves original aspect ratios, fitting your content proportionally without stretching." },
      { q: "Can I convert US Letter to European A4?", a: "Yes, converting between US Letter and standard international A4 is fully supported." }
    ],
    crossLink: { href: "/crop-pdf", label: "Need to cut off margins instead? Try Crop PDF." }
  },
  tr: {
    title: "PDF Boyutlandır (Kağıt Boyutu)",
    description: "PDF sayfalarının kağıt boyutunu A4, A3, Letter veya Legal standartlarına dönüştürün. Ücretsiz ve programsız sayfa ölçekleyici.",
    keywords: "pdf boyutlandırma, pdf a4 yapma, pdf kağıt boyutu değiştirme, pdf letter to a4, pdf sayfa ölçüsü değiştir",
    h1: "PDF Boyutlandır",
    tagline: "Belgelerinizin kağıt boyutunu standart A4, A3, US Letter veya özel ölçülere ölçekleyin. Yazdırma sorunlarına son verin.",
    howToName: "PDF kağıt boyutu nasıl değiştirilir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "Ölçülerini değiştirmek istediğiniz PDF dosyasını seçin." },
      { name: "Yeni Boyutu Seçin", text: "A4, A3, US Letter gibi standart kağıt boyutlarından birini belirleyin." },
      { name: "Ölçeklenmiş PDF'i İndirin", text: "Yeni kağıt standartlarına uygun belgenizi cihazınıza indirin." }
    ],
    faq: [
      { q: "Yazılar ve fotoğraflar basık veya yamuk görünür mü?", a: "Hayır. En-boy oranı korunarak orantılı bir şekilde ölçekleme yapılır, içerikler yamulmaz." },
      { q: "Amerikan Letter formatındaki belgeyi A4 yapabilir miyim?", a: "Evet! Yurt dışından gelen Letter boyutundaki belgeleri tek tıkla standart Türk/Avrupa A4 boyutuna getirebilirsiniz." }
    ],
    crossLink: { href: "/tr/crop-pdf", label: "Kenar boşluklarını kırpmak istiyorsanız PDF Kırp aracını kullanın." }
  },
};
export const scanCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Scan to PDF",
    description: "Scan documents using your webcam or phone camera into a crisp PDF file online for free. 100% private document scanner.",
    keywords: "scan to pdf, web scanner, document scanner online, camera to pdf, scan paper to pdf free",
    h1: "Scan to PDF",
    tagline: "Turn your device camera or webcam into a portable document scanner. Capture, enhance contrast, and export clean PDFs.",
    howToName: "How to scan documents to PDF using a camera",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Open Camera", text: "Allow camera access to capture physical documents or receipts." },
      { name: "Snap Pages", text: "Take photos of each page. Our tool auto-detects document edges and improves readability." },
      { name: "Export PDF", text: "Download your multi-page scanned document as a polished PDF file." }
    ],
    faq: [
      { q: "Are camera photos saved on your servers?", a: "Never. Camera frames and captures are processed strictly in your local browser memory." },
      { q: "Can I scan multiple pages into one file?", a: "Yes, keep snapping consecutive pages and export them all together into one single PDF." }
    ],
    crossLink: { href: "/ocr-pdf", label: "Want to extract text from your scan? Try OCR PDF." }
  },
  tr: {
    title: "Kameradan PDF Tara",
    description: "Kameranızı veya web kameranızı kullanarak fatura ve evraklarınızı anında PDF belgesine dönüştürün. Ücretsiz mobil ve web tarayıcı.",
    keywords: "kameradan pdf yapma, evrak tarama online, telefon kamerasını tarayıcı yapma, kağıdı pdf yap, mobil pdf tarayıcı",
    h1: "Kameradan PDF Tara",
    tagline: "Telefon veya bilgisayar kameranızı taşınabilir bir tarayıcıya dönüştürün. Sözleşme, fiş ve kimlikleri anında PDF yapın.",
    howToName: "Kamera ile evraklar nasıl PDF olarak taranır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Kamerayı Başlatın", text: "Kamera iznini onaylayarak kağıt evraklarınızı vizöre yerleştirin." },
      { name: "Sayfaları Çekin", text: "İstediğiniz kadar sayfa çekin; sistemimiz kontrastı artırıp yazıları netleştirir." },
      { name: "PDF Olarak Kaydedin", text: "Tek tıkla tüm çekilen sayfaları birleşik, temiz bir PDF olarak indirin." }
    ],
    faq: [
      { q: "Kameramdan çekilen fotoğraflar sunucuya yüklenir mi?", a: "Hayır! Kamera akışı ve çekilen görüntüler sadece sizin cihazınızda işlenir, sunucuya hiçbir şey iletilmez." },
      { q: "Birden fazla sayfayı tek PDF yapabilir miyim?", a: "Evet! Arka arkaya dilediğiniz kadar sayfa çekebilir ve hepsini tek bir PDF dosyasında toplayabilirsiniz." }
    ],
    crossLink: { href: "/tr/ocr-pdf", label: "Taranan evraktaki yazıları kopyalamak için PDF OCR aracını kullanın." }
  },
};
export const bookletCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Booklet PDF",
    description: "Convert standard PDF documents into printable saddle-stitch booklets online for free. Print double-sided and fold in half.",
    keywords: "booklet pdf, create pdf booklet, booklet maker online, print pdf as booklet, saddle stitch pdf",
    h1: "Booklet PDF",
    tagline: "Reorder and paginate pages into a foldable booklet format. Print double-sided, fold down the center, and create your book.",
    howToName: "How to make a PDF booklet",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Document", text: "Select the PDF file you want to turn into a booklet." },
      { name: "Generate Imposition", text: "Our tool automatically calculates 2-up imposition so facing pages match when folded." },
      { name: "Print & Fold", text: "Download the booklet PDF, print double-sided (short edge flip), and fold down the spine." }
    ],
    faq: [
      { q: "How should I print the booklet?", a: "Print with double-sided (duplex) printing enabled, setting the flip option to 'Flip on short edge'." },
      { q: "What happens if page count is not a multiple of 4?", a: "Our booklet engine automatically appends blank pages to make the total page count a perfect multiple of 4." }
    ],
    crossLink: { href: "/n-up-pdf", label: "Want regular tiled pages without booklet ordering? Try N-Up PDF." }
  },
  tr: {
    title: "PDF Kitapçık Yapma",
    description: "PDF belgelerinizi ortadan katlanabilir kitapçık (broşür/dergi) formatına dönüştürün. Ücretsiz çift taraflı baskı kitapçık aracı.",
    keywords: "pdf kitapçık yapma, pdf broşür yapma, çift taraflı kitapçık baskısı, pdf kitap yapma, kitapçık düzeni oluştur",
    h1: "PDF Kitapçık Yapma",
    tagline: "Sayfalarınızı ortadan katlandığında kitap gibi okunacak şekilde dizin. Çift taraflı yazdırın, ortadan katlayın ve zımbalayın.",
    howToName: "PDF belgesi nasıl kitapçık formatına getirilir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Belgenizi Yükleyin", text: "Kitapçık haline getirmek istediğiniz PDF dosyasını seçin." },
      { name: "Kitapçık Düzeni Oluştur", text: "Sistemimiz sayfaları katlandığında doğru sıraya gelecek şekilde özel olarak eşleştirir." },
      { name: "İndirin ve Basın", text: "Oluşan PDF'i çift taraflı yazdırıp ortadan katlayarak kitapçığınızı hazır edin." }
    ],
    faq: [
      { q: "Yazıcıdan nasıl çıktı almalıyım?", a: "Yazıcınızın 'Çift Taraflı Yazdırma' (Duplex) ayarını açıp 'Kısa kenardan çevir' seçeneğini işaretlemelisiniz." },
      { q: "Sayfa sayısı 4'ün katı değilse ne olur?", a: "Kitapçık yapısının bozulmaması için sistem son sayfaya otomatik olarak temiz boş sayfalar ekler." }
    ],
    crossLink: { href: "/tr/n-up-pdf", label: "Katlamadan tek sayfaya çoklu sayfa basmak için N-Up aracını deneyin." }
  },
};
export const compareCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Compare PDF",
    description: "Compare two PDF documents and highlight text differences visually online for free. Spot changes between document versions easily.",
    keywords: "compare pdf, compare two pdf files, diff pdf, pdf difference checker, compare contracts pdf",
    h1: "Compare PDF",
    tagline: "Easily compare two PDF documents side-by-side. Highlight added, modified, or deleted text between contract revisions.",
    howToName: "How to compare two PDF files",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Both PDFs", text: "Select the original PDF and the revised version you want to check." },
      { name: "Analyze Differences", text: "Our visual diff engine scans both files and highlights all modified lines in color." },
      { name: "Review Changes", text: "Inspect changes side-by-side directly in your browser." }
    ],
    faq: [
      { q: "Can it detect small word changes in contracts?", a: "Yes, our comparison tool highlights additions, deletions, and subtle word swaps between versions." },
      { q: "Are sensitive legal files uploaded?", a: "No. The comparison runs purely client-side inside your browser." }
    ],
    crossLink: { href: "/edit-pdf", label: "Need to fix errors found during comparison? Try Edit PDF." }
  },
  tr: {
    title: "İki PDF Karşılaştır",
    description: "İki PDF dosyasını yan yana karşılaştırın ve metin farklarını renkli olarak görün. Sözleşme ve evrak revizyonlarını kolayca denetleyin.",
    keywords: "pdf karşılaştırma, iki pdf farkını bulma, pdf diff aracı, sözleşme karşılaştır, pdf metin farkı bul",
    h1: "İki PDF Karşılaştır",
    tagline: "İki PDF belgesini yan yana koyup eklenen, silinen ve değiştirilen tüm yazıları renkli olarak anında tespit edin.",
    howToName: "İki PDF dosyası nasıl karşılaştırılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Her İki Belgeyi Yükleyin", text: "Orijinal PDF ile revize edilmiş ikinci PDF dosyasını ekrana bırakın." },
      { name: "Farkları Tara", text: "Akıllı sistemimiz iki belge arasındaki değişen kelimeleri tespit eder." },
      { name: "Değişiklikleri İnceleyin", text: "Eklenen ve silinen yazıları renkli vurgularla tarayıcınızda görün." }
    ],
    faq: [
      { q: "Sözleşmedeki küçük kelime hilelerini yakalar mı?", a: "Evet! İki evrak arasındaki tek bir harf veya rakam değişikliğini dahi renkli olarak önünüze çıkarır." },
      { q: "Müvekkil sözleşmelerini karşılaştırmak güvenli mi?", a: "Evet, belgeleriniz sunucuya yüklenmez, tamamen bilgisayarınızın RAM'inde karşılaştırılır." }
    ],
    crossLink: { href: "/tr/edit-pdf", label: "Fark ettiğiniz hataları düzeltmek için PDF Düzenle aracını kullanabilirsiniz." }
  },
};
export const cropCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Crop PDF",
    description: "Crop PDF margins and trim unwanted page borders online for free. Adjust visible page areas easily in your browser.",
    keywords: "crop pdf, trim pdf margins, cut pdf borders, crop pdf pages online, adjust pdf margins",
    h1: "Crop PDF",
    tagline: "Trim wide margins, remove unwanted headers or footers, and crop your PDF pages to the exact visible area.",
    howToName: "How to crop a PDF file",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file with borders or margins you want to trim." },
      { name: "Select Crop Area", text: "Drag the bounding box around the content you want to keep." },
      { name: "Download Cropped PDF", text: "Save your trimmed PDF document instantly." }
    ],
    faq: [
      { q: "Can I apply the same crop to all pages?", a: "Yes, you can choose to apply your crop box to all pages at once or adjust individual pages separately." },
      { q: "Is content permanently deleted?", a: "The page bounding box is adjusted so only your selected area is visible and printed." }
    ],
    crossLink: { href: "/auto-crop", label: "Want to automatically trim blank margins? Try Auto-Crop PDF." }
  },
  tr: {
    title: "PDF Kırp",
    description: "PDF sayfalarındaki gereksiz beyaz kenar boşluklarını ve kenarlıkları ücretsiz kırpın. Görünür sayfa alanını kolayca ayarlayın.",
    keywords: "pdf kırpma, pdf kenar boşluğu silme, pdf kenarlık kırp, pdf sayfa kırpıcı, online pdf crop",
    h1: "PDF Kırp",
    tagline: "Geniş kenar boşluklarını, gereksiz alt/üst bilgileri kırpın ve PDF sayfalarınızı tam metne göre hizalayın.",
    howToName: "PDF sayfası nasıl kırpılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "Kenarlarını kırpmak istediğiniz PDF belgesini seçin." },
      { name: "Kırpma Alanını Belirleyin", text: "Tutmak istediğiniz alanın etrafına fareyle bir çerçeve çizin." },
      { name: "Kırpılmış PDF'i İndirin", text: "Kenar fazlalıkları atılmış yeni belgenizi cihazınıza indirin." }
    ],
    faq: [
      { q: "Tüm sayfalara aynı kırpma uygulanabilir mi?", a: "Evet, tek bir çerçeve çizip 'Tüm sayfalara uygula' diyerek tüm belgeyi saniyeler içinde hizalayabilirsiniz." },
      { q: "Dosya kalitesi düşer mi?", a: "Hayır. Sayfa alanı daraltılırken içindeki metin ve görsellerin orijinal çözünürlüğü %100 korunur." }
    ],
    crossLink: { href: "/tr/auto-crop", label: "Boşlukları otomatik kırpmak için Otomatik PDF Kırpma aracını deneyin." }
  },
};
export const ocrCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "OCR PDF",
    description: "Convert scanned PDFs and images into searchable, selectable text. Free Optical Character Recognition tool.",
    keywords: "ocr pdf, extract text from image, scanned pdf to text, optical character recognition, convert image to text",
    h1: "OCR PDF",
    tagline: "Turn unselectable text in scanned images and documents into fully searchable and copyable text formats.",
    howToName: "How to OCR a PDF document",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Scanned File", text: "Select a PDF or image file that contains scanned, unselectable text." },
      { name: "Select Language", text: "Choose the language of the document to improve the text recognition accuracy." },
      { name: "Start OCR", text: "Our AI engine will scan the pixels, recognize the text, and provide you with a copyable text file." }
    ],
    faq: [
      { q: "What is OCR?", a: "OCR stands for Optical Character Recognition. It is a technology that analyzes the shapes (pixels) in an image and translates them into machine-readable, copyable text." },
      { q: "Does it work with handwritten text?", a: "Our tool works incredibly well with printed text (books, receipts, invoices). However, handwritten text recognition depends heavily on how legible the handwriting is." }
    ],
    crossLink: { href: "/extract-text", label: "Is your PDF already a text document? Use the faster Extract Text tool instead." }
  },
  tr: {
    title: "PDF OCR",
    description: "Taranmış belgeleri, kimlikleri veya resimleri OCR teknolojisi ile okunabilir metne (yazıya) dönüştürün. Ücretsiz ve güvenli.",
    keywords: "ocr pdf, resimdeki yazıyı kopyalama, taranmış pdf i metne çevirme, pdf yazı tanıma, optik karakter tanıma, fotoğraftaki yazıyı alma",
    h1: "PDF OCR (Yazı Tanıma)",
    tagline: "Taranmış PDF'ler veya fotoğrafların içindeki seçilemeyen (kopyalanamayan) yazıları tarayıp seçilebilir, kopyalanabilir metinlere dönüştürün.",
    howToName: "Taranmış bir PDF metne nasıl dönüştürülür?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Taranmış Dosyayı Yükle", text: "İçindeki yazıları alamadığınız PDF veya fotoğraf dosyasını seçin." },
      { name: "Tarama Dili Seçimi", text: "Doğruluğu artırmak için belgenin hangi dilde (örn. Türkçe, İngilizce) yazıldığını seçin." },
      { name: "OCR'ı Başlat", text: "Akıllı sistemimiz pikselleri analiz edip harfleri tanıyacak ve size kopyalanabilir bir TXT sunacaktır." }
    ],
    faq: [
      { q: "OCR nedir ve ne işe yarar?", a: "OCR (Optik Karakter Tanıma), bir resmin veya taranmış bir kağıdın üzerindeki mürekkep lekelerini (pikselleri) bilgisayarın anlayabileceği dijital metin karakterlerine dönüştüren yapay zeka teknolojisidir." },
      { q: "El yazısını okuyabilir mi?", a: "Makine ile yazılmış (kitap, fatura, fiş, dilekçe) metinlerde %99'a kadar doğru sonuç verir. El yazısında ise yazının ne kadar okunaklı olduğuna bağlı olarak başarı oranı değişir." }
    ],
    crossLink: { href: "/tr/extract-text", label: "Eğer belgeniz taranmış bir fotoğraf değilse, çok daha hızlı olan Metin Çıkarma aracını kullanabilirsiniz." }
  },
};
export const removeBlankCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Remove Blank Pages",
    description: "Automatically detect and remove blank pages from scanned PDF documents online for free. Clean up empty pages instantly.",
    keywords: "remove blank pages from pdf, delete empty pages pdf, auto detect blank pages, clean scanned pdf, remove blank sheets",
    h1: "Remove Blank Pages",
    tagline: "Scan through multi-page documents to automatically detect and discard accidental blank pages from scanners.",
    howToName: "How to remove blank pages from a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the scanned PDF that contains accidental empty pages." },
      { name: "Auto-Detect", text: "Our smart analyzer inspects page pixel density and identifies blank sheets." },
      { name: "Download Clean PDF", text: "Save your streamlined PDF document without any blank pages." }
    ],
    faq: [
      { q: "How does it detect blank pages?", a: "It scans for text glyphs, vector lines, and image pixel thresholds to reliably distinguish truly empty pages from light content." },
      { q: "Can I review before deletion?", a: "Yes, detected blank pages are highlighted so you can confirm before downloading the final file." }
    ],
    crossLink: { href: "/remove-pages", label: "Want to manually select pages to delete? Try Remove Pages." }
  },
  tr: {
    title: "Boş Sayfaları Otomatik Sil",
    description: "Taranmış PDF dosyalarındaki boş ve beyaz sayfaları otomatik tespit edip silin. Gereksiz sayfaları temizleyin.",
    keywords: "pdf boş sayfaları silme, otomatik boş sayfa silici, taranmış pdf boş sayfa temizleme, pdf beyaz sayfaları kaldır",
    h1: "Boş Sayfaları Otomatik Sil",
    tagline: "Çift taraflı taramalardan kaynaklanan boş, beyaz sayfaları akıllı analizle tek tıkla bulun ve belgenizden ayıklayın.",
    howToName: "PDF'teki boş sayfalar otomatik nasıl silinir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Belgenizi Yükleyin", text: "İçinde boş sayfalar bulunan PDF dosyasını seçin." },
      { name: "Otomatik Tespit", text: "Aracımız sayfalardaki piksel ve yazı yoğunluğunu tarayarak boş sayfaları işaretler." },
      { name: "Temiz PDF'i İndirin", text: "Boş sayfalardan arındırılmış tertemiz belgenizi bilgisayarınıza kaydedin." }
    ],
    faq: [
      { q: "Çok az yazısı olan sayfalar yanlışlıkla silinir mi?", a: "Hayır. Akıllı eşik değeri sayesinde üzerinde imza, dipnot veya logo bulunan sayfalar korunur, yalnızca tamamen boş sayfalar ayıklanır." },
      { q: "Silinen sayfaları görebilir miyim?", a: "Evet, silinecek sayfalar ekranda gösterilir; dilerseniz silinmesini istemediğiniz sayfaları koruyabilirsiniz." }
    ],
    crossLink: { href: "/tr/remove-pages", label: "Sayfaları elle tek tek seçerek silmek için PDF Sayfa Silme aracını deneyin." }
  },
};
export const editMetadataCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Edit Metadata",
    description: "View and edit PDF metadata properties including Title, Author, Subject, and Keywords online for free. 100% private.",
    keywords: "edit pdf metadata, change pdf author, update pdf title, edit pdf properties, pdf metadata editor online",
    h1: "Edit Metadata",
    tagline: "Update document titles, author names, subject tags, and keywords. Fix PDF document properties cleanly.",
    howToName: "How to edit PDF metadata",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file whose metadata properties you want to modify." },
      { name: "Update Fields", text: "Type new values for Document Title, Author, Subject, Creator, and Keywords." },
      { name: "Save & Download", text: "Click save to update internal XMP and Info dictionaries and download the file." }
    ],
    faq: [
      { q: "Why should I edit PDF metadata?", a: "Setting an accurate Document Title ensures browsers and search engines display the correct name instead of a random filename." },
      { q: "Can I remove metadata completely?", a: "Yes, or you can use our dedicated Sanitize PDF tool for one-click total anonymization." }
    ],
    crossLink: { href: "/sanitize-pdf", label: "Want to wipe all metadata with one click? Try Sanitize PDF." }
  },
  tr: {
    title: "PDF Meta Veri Düzenle",
    description: "PDF dosyalarınızın Başlık, Yazar, Konu ve Anahtar Kelime gibi dosya özelliklerini ücretsiz ve kolayca düzenleyin.",
    keywords: "pdf meta veri düzenleme, pdf yazar adı değiştirme, pdf başlık değiştirme, pdf özellikleri düzenle, pdf metadata editor",
    h1: "PDF Meta Veri Düzenle",
    tagline: "Belgenizin dosya özelliklerinde görünen Başlık, Yazar, Konu ve Telif bilgilerini profesyonelce güncelleyin.",
    howToName: "PDF meta verileri ve yazar adı nasıl değiştirilir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "Özelliklerini değiştirmek istediğiniz PDF dosyasını seçin." },
      { name: "Bilgileri Güncelleyin", text: "Başlık, Yazar, Konu ve Anahtar Kelime kutularına yeni bilgileri yazın." },
      { name: "Kaydet ve İndir", text: "Güncellenmiş özelliklere sahip yeni PDF dosyanızı tek tıkla indirin." }
    ],
    faq: [
      { q: "PDF başlığını değiştirmek neden önemlidir?", a: "Tarayıcılarda veya arama motorlarında dosya adı yerine burada yazdığınız 'Başlık' görünür. Doğru bir başlık profesyonellik katar." },
      { q: "Tüm bilgileri tamamen temizlemek mümkün mü?", a: "Evet, dilerseniz alanları boş bırakabilir veya tek tıkla sıfırlamak için PDF Meta Veri Temizle aracımızı kullanabilirsiniz." }
    ],
    crossLink: { href: "/tr/sanitize-pdf", label: "Tüm yazar ve bilgisayar izlerini tek tıkla silmek için PDF Meta Veri Temizle aracını deneyin." }
  },
};
export const base64PdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Base64 to PDF",
    description: "Decode Base64 strings to downloadable PDF files or encode PDF documents to Base64 data URIs online for free.",
    keywords: "base64 to pdf, decode base64 pdf, pdf to base64, convert base64 string to pdf, base64 pdf viewer",
    h1: "Base64 to PDF",
    tagline: "Decode Base64 encoded strings into readable PDF files, or encode your PDF documents into Base64 strings for developer APIs.",
    howToName: "How to convert Base64 to PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Paste Base64 String", text: "Paste your raw data:application/pdf;base64 string or binary text." },
      { name: "Decode & Preview", text: "Our tool parses the Base64 stream and displays a live preview of the PDF." },
      { name: "Download PDF", text: "Download the decoded binary document directly to your computer." }
    ],
    faq: [
      { q: "What is Base64 encoding used for in PDFs?", a: "Base64 is commonly used by developers and REST APIs to transmit binary PDF files as text strings inside JSON payloads." },
      { q: "Can I convert PDF back to Base64?", a: "Yes, bidirectional conversion is supported: PDF-to-Base64 and Base64-to-PDF." }
    ],
    crossLink: { href: "/extract-text", label: "Need to extract readable text instead? Try Extract Text." }
  },
  tr: {
    title: "Base64'ten PDF'e Çevirme",
    description: "Base64 metin kodlarını PDF dosyasına dönüştürün veya PDF'lerinizi API'ler için Base64 koduna çevirin. Ücretsiz ve güvenli.",
    keywords: "base64 to pdf, base64 pdf çözücü, pdf to base64, base64 kodunu pdf yapma, base64 pdf decoder online",
    h1: "Base64'ten PDF'e Çevirme",
    tagline: "Yazılımcılar ve API entegrasyonları için Base64 kodlarını açılabilir PDF dosyasına dönüştürün veya tam tersini yapın.",
    howToName: "Base64 metin dizesi nasıl PDF dosyasına dönüştürülür?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Base64 Kodunu Yapıştırın", text: "data:application/pdf;base64 içeren metni kutuya yapıştırın." },
      { name: "Çözümleme ve Önizleme", text: "Aracımız metni anında ikili (binary) PDF verisine dönüştürür ve önizler." },
      { name: "PDF Olarak İndirin", text: "Çözümlenmiş PDF belgenizi tek tıkla bilgisayarınıza indirin." }
    ],
    faq: [
      { q: "Base64 PDF nerede kullanılır?", a: "Yazılımcılar web servisleri, API'ler ve JSON veritabanlarında PDF dosyalarını metin olarak aktarmak için Base64 formatını kullanır." },
      { q: "PDF'i Base64'e de çevirebilir miyim?", a: "Evet! Hem Base64'ten PDF'e hem de PDF'ten Base64'e çift yönlü dönüşüm yapabilirsiniz." }
    ],
    crossLink: { href: "/tr/extract-text", label: "Düz yazıları ayıklamak için PDF'ten Metin Çıkarma aracını deneyin." }
  },
};
export const invertPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Invert PDF Colors",
    description: "Invert PDF colors to create a comfortable dark mode for reading at night. Free online dark mode PDF converter.",
    keywords: "invert pdf colors, dark mode pdf, invert pdf online, night mode pdf reader, white text on black background pdf",
    h1: "Invert PDF Colors",
    tagline: "Turn bright white pages into high-contrast black backgrounds with white text. Protect your eyes while reading at night.",
    howToName: "How to invert PDF colors for dark mode",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Document", text: "Select the bright PDF ebook or paper you want to invert." },
      { name: "Invert Colors", text: "Our engine flips RGB luminance values, converting white backgrounds to black." },
      { name: "Download Dark PDF", text: "Save your eye-friendly night mode PDF file." }
    ],
    faq: [
      { q: "Why invert PDF colors?", a: "Inverting colors significantly reduces screen glare and eye strain when studying or reading documents in low-light environments." },
      { q: "What happens to images?", a: "Colors in images are inverted as well, producing a complete high-contrast negative mode." }
    ],
    crossLink: { href: "/grayscale-pdf", label: "Prefer standard black-and-white instead? Try Grayscale PDF." }
  },
  tr: {
    title: "PDF Renklerini Ters Çevir (Gece Modu)",
    description: "PDF belgelerinizi karanlık moda (siyah arka plan, beyaz yazı) dönüştürün. Gece okumaları için göz yormayan ücretsiz araç.",
    keywords: "pdf renklerini ters çevir, pdf gece modu, pdf dark mode yapma, siyah arka plan pdf, göz yormayan pdf",
    h1: "PDF Renklerini Ters Çevir",
    tagline: "Parlak beyaz sayfaları yüksek kontrastlı siyah arka plana ve beyaz yazılara dönüştürün. Gece ders çalışırken gözlerinizi koruyun.",
    howToName: "PDF belgesi karanlık moda (gece moduna) nasıl çevrilir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Belgenizi Yükleyin", text: "Renklerini tersine çevirmek istediğiniz PDF kitabını veya makaleyi yükleyin." },
      { name: "Karanlık Moda Çevir", text: "Aracımız tüm beyaz alanları siyaha, siyah yazıları ise beyaza dönüştürür." },
      { name: "Gece Modu PDF'i İndirin", text: "Göz dostu, karanlık modlu yeni belgenizi cihazınıza kaydedin." }
    ],
    faq: [
      { q: "Neden gece modu PDF kullanmalıyım?", a: "Karanlık ortamlarda beyaz ekran ışığı gözü ciddi oranda yorar ve baş ağrısı yapabilir. Siyah arka plan okuma konforunu büyük oranda artırır." },
      { q: "OLED ekranlarda şarj tasarrufu sağlar mı?", a: "Evet! Telefon veya tabletiniz OLED/AMOLED ekrana sahipse siyah arka plan pil tüketimini ciddi oranda azaltır." }
    ],
    crossLink: { href: "/tr/grayscale-pdf", label: "Standart siyah beyaz yapmak istiyorsanız PDF Siyah Beyaz Yap aracını kullanın." }
  },
};
export const markdownPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Markdown to PDF",
    description: "Convert Markdown (.md) text into beautifully formatted PDF documents online for free. Supports code highlighting and tables.",
    keywords: "markdown to pdf, convert md to pdf, markdown pdf converter online, render markdown as pdf, md2pdf",
    h1: "Markdown to PDF",
    tagline: "Transform your Markdown notes, README files, and documentation into elegant, publication-ready PDF documents.",
    howToName: "How to convert Markdown to PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Enter Markdown", text: "Paste your Markdown text or upload an existing .md file." },
      { name: "Preview & Style", text: "Review the rendered typography, tables, and syntax-highlighted code blocks." },
      { name: "Export PDF", text: "Download your beautifully styled PDF document in one click." }
    ],
    faq: [
      { q: "Are code blocks and syntax highlighting supported?", a: "Yes, programming code blocks with syntax styling, tables, and blockquotes are rendered cleanly." },
      { q: "Is internet needed for rendering?", a: "No. The Markdown parser runs completely inside your browser." }
    ],
    crossLink: { href: "/html-to-pdf", label: "Have raw HTML markup instead? Try HTML to PDF." }
  },
  tr: {
    title: "Markdown'dan PDF'e Çevirme",
    description: "Markdown (.md) notlarınızı, kod bloklarınızı ve tablolarınızı şık bir PDF belgesine dönüştürün. Ücretsiz online MD to PDF.",
    keywords: "markdown pdf yapma, md to pdf çevirici, markdown dan pdf oluşturma, github readme pdf yap, md2pdf online",
    h1: "Markdown'dan PDF'e Çevirme",
    tagline: "Markdown notlarınızı, GitHub README dosyalarınızı ve dökümantasyonlarınızı profesyonel mizanpaja sahip PDF belgelerine dönüştürün.",
    howToName: "Markdown (.md) dosyası nasıl PDF yapılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Markdown Yazınızı Ekleyin", text: "Markdown metninizi kutuya yapıştırın veya .md dosyanızı yükleyin." },
      { name: "Önizleme", text: "Tabloların, başlıkların ve kod bloklarının şık tasarımını anında görün." },
      { name: "PDF Olarak İndirin", text: "Tek tıkla baskıya ve paylaşıma hazır PDF belgenizi indirin." }
    ],
    faq: [
      { q: "Yazılım kod blokları ve tablolar destekleniyor mu?", a: "Evet! Kod renklendirmesi (syntax highlighting), tablolar, alıntılar ve listeler eksiksiz olarak PDF'e aktarılır." },
      { q: "Notlarım internete aktarılıyor mu?", a: "Hayır. Dönüştürme motoru tamamen tarayıcınızın içinde çalışır; notlarınız güvendedir." }
    ],
    crossLink: { href: "/tr/html-to-pdf", label: "Doğrudan HTML kodunu PDF yapmak için HTML'den PDF'e aracını deneyin." }
  },
};
export const htmlPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "HTML to PDF",
    description: "Convert HTML code, styled web snippets, and invoices into PDF documents online for free. Fast and accurate rendering.",
    keywords: "html to pdf, convert html to pdf, web page to pdf, render html as pdf, html2pdf online converter",
    h1: "HTML to PDF",
    tagline: "Convert raw HTML code, web templates, invoices, and CSS styling into printable PDF documents in seconds.",
    howToName: "How to convert HTML to PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Paste HTML", text: "Paste your HTML markup and CSS styles or upload an .html file." },
      { name: "Render Preview", text: "Our rendering engine displays an exact visual representation of your webpage." },
      { name: "Download PDF", text: "Export your styled HTML layout as a vector PDF document." }
    ],
    faq: [
      { q: "Are custom CSS styles supported?", a: "Yes, embedded inline CSS, fonts, flexbox, and grid layouts render accurately into PDF pages." },
      { q: "Is this suitable for generating invoices?", a: "Absolutely. You can paste HTML invoice templates and generate downloadable PDF receipts instantly." }
    ],
    crossLink: { href: "/markdown-to-pdf", label: "Looking for Markdown conversion? Try Markdown to PDF." }
  },
  tr: {
    title: "HTML'den PDF'e Çevirme",
    description: "HTML kodlarınızı, web şablonlarınızı ve fatura tasarımlarınızı CSS stilleriyle birlikte ücretsiz PDF belgesine dönüştürün.",
    keywords: "html pdf yapma, html to pdf çevirici, web kodunu pdf yapma, html fatura pdf oluştur, online html2pdf",
    h1: "HTML'den PDF'e Çevirme",
    tagline: "HTML ve CSS kodlarınızı, web sayfalarınızı ve fatura şablonlarınızı tek tıkla şık bir PDF belgesi haline getirin.",
    howToName: "HTML kodları nasıl PDF dosyasına dönüştürülür?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "HTML Kodunu Yapıştırın", text: "HTML ve CSS kodlarınızı kutuya yapıştırın veya .html dosyanızı yükleyin." },
      { name: "Görsel Önizleme", text: "Sayfa tasarımınızı ekranda inceleyin." },
      { name: "PDF Olarak İndirin", text: "Dönüştür butonuna basarak tüm stilleriyle kusursuz PDF belgenizi indirin." }
    ],
    faq: [
      { q: "CSS stilleri ve renkler korunur mu?", a: "Evet! CSS stilleri, renkler, tablolar ve yazı tipleri birebir PDF sayfalarına aktarılır." },
      { q: "Fatura şablonları için uygun mu?", a: "Kesinlikle! HTML ile tasarlanmış e-ticaret faturalarını veya makbuzları saniyeler içinde PDF yapabilirsiniz." }
    ],
    crossLink: { href: "/tr/markdown-to-pdf", label: "Markdown notlarınızı PDF yapmak için Markdown'dan PDF'e aracını kullanın." }
  },
};
export const extractPagesCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Extract PDF Pages",
    description: "Extract specific pages from a PDF into a new standalone document online for free. Fast, precise page extraction.",
    keywords: "extract pdf pages, pull pages from pdf, save specific pages pdf, export single pdf page, split selected pages",
    h1: "Extract PDF Pages",
    tagline: "Select exact page numbers or ranges (e.g. 1-3, 7, 12) and extract them instantly into a brand new PDF document.",
    howToName: "How to extract pages from a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Document", text: "Select the PDF file containing pages you want to pull out." },
      { name: "Select Page Range", text: "Click on thumbnail previews or enter page numbers (e.g., 2, 5-8) to extract." },
      { name: "Download Extracted PDF", text: "Save your new compact document containing only the selected pages." }
    ],
    faq: [
      { q: "What is the difference between Extract and Split?", a: "'Extract' lets you cherry-pick specific pages into a single new document. 'Split' cuts an entire document into individual one-page files or intervals." },
      { q: "Is original formatting preserved?", a: "Yes, fonts, vector graphics, and embedded images on extracted pages remain 100% untouched." }
    ],
    crossLink: { href: "/split-pdf", label: "Want to split every page into separate files? Try Split PDF." }
  },
  tr: {
    title: "PDF Sayfalarını Ayıkla",
    description: "PDF belgenizden sadece istediğiniz belirli sayfaları (Örn: 2-5, 12) seçip yepyeni bir PDF dosyası olarak kaydedin.",
    keywords: "pdf sayfa ayıklama, pdf ten belirli sayfaları alma, pdf sayfa seçip kaydetme, pdf tek sayfa çıkarma",
    h1: "PDF Sayfalarını Ayıkla",
    tagline: "Yüzlerce sayfalık belgenin içinden sadece ihtiyacınız olan 2-3 sayfayı cımbızla çeker gibi ayıklayıp tek dosyada toplayın.",
    howToName: "PDF belgesinden belirli sayfalar nasıl ayıklanır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Belgenizi Yükleyin", text: "İçinden sayfa seçmek istediğiniz PDF dosyasını yükleyin." },
      { name: "Sayfaları Seçin", text: "Görsellere tıklayarak veya sayfa aralığı yazarak (örn: 1-5, 10) istediğiniz sayfaları belirleyin." },
      { name: "Ayıklanan PDF'i İndirin", text: "Yalnızca seçtiğiniz sayfalardan oluşan yeni belgenizi indirin." }
    ],
    faq: [
      { q: "PDF Bölme ile Sayfa Ayıklama arasındaki fark nedir?", a: "'Bölme' tüm belgeyi parçalara ayırır. 'Sayfa Ayıklama' ise 100 sayfalık bir rapordan sadece istediğiniz 5 sayfayı çekip tek dosya yapmanızı sağlar." },
      { q: "Ayıklanan sayfaların kalitesi düşer mi?", a: "Hayır. Sayfalar hiçbir sıkıştırmaya veya kalite kaybına uğramadan orijinal netliğinde aktarılır." }
    ],
    crossLink: { href: "/tr/split-pdf", label: "Tüm sayfaları ayrı dosyalara bölmek için PDF Böl aracını kullanın." }
  },
};
export const annotatePdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Annotate PDF",
    description: "Highlight text, draw arrows, insert sticky notes, and markup PDF files online for free. Ideal for grading and proofreading.",
    keywords: "annotate pdf, highlight pdf text, markup pdf, add sticky notes to pdf, draw on pdf online",
    h1: "Annotate PDF",
    tagline: "Mark up documents with colorful highlighters, sticky notes, arrows, and freehand pens. Perfect for student notes and document reviews.",
    howToName: "How to annotate and markup a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Choose the PDF document you want to markup or review." },
      { name: "Add Annotations", text: "Use highlighter pens, rectangle boxes, comment pins, and text notes." },
      { name: "Download Annotated PDF", text: "Save your fully annotated PDF ready for sharing with colleagues or teachers." }
    ],
    faq: [
      { q: "Are annotations compatible with Adobe Acrobat?", a: "Yes, our annotations follow standard PDF ISO specifications and display seamlessly in Adobe Reader, Apple Preview, and browsers." },
      { q: "Can I erase annotations?", a: "You can click on any annotation to delete, resize, or change its color before saving." }
    ],
    crossLink: { href: "/edit-pdf", label: "Need to insert full text blocks? Try Edit PDF." }
  },
  tr: {
    title: "PDF Not Ekle & Çizim",
    description: "PDF makalelerine ve ders notlarına fosforlu kalemle vurgular yapın, oklar çizin ve yapışkan notlar ekleyin. Ücretsiz inceleme aracı.",
    keywords: "pdf not ekleme, pdf fosforlu kalemle çizme, pdf metin vurgulama, pdf üzerine çizim yapma, pdf ders notu alma",
    h1: "PDF Not Ekle & Çizim",
    tagline: "Ders kitaplarınıza ve makalelerinize renkli fosforlu kalemlerle notlar alın, oklar ve şekiller çizerek önemli yerleri işaretleyin.",
    howToName: "PDF belgesine nasıl not ve çizim eklenir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Ders Notunu veya Makaleyi Yükleyin", text: "İşaretleme yapmak istediğiniz PDF dosyasını yükleyin." },
      { name: "Çizim ve Vurgu Yapın", text: "Fosforlu kalem, tükenmez kalem veya yapışkan not araçlarını kullanarak sayfaları işaretleyin." },
      { name: "Notlu PDF'i İndirin", text: "Tüm notlarınızın işlendiği yeni PDF dosyasını kaydedin." }
    ],
    faq: [
      { q: "Eklediğim notlar Adobe Reader'da açılır mı?", a: "Evet! Eklediğiniz tüm vurgu ve notlar uluslararası standartlara uygundur; telefonda, tablette ve tüm PDF okuyucularda görünür." },
      { q: "Yanlış çizdiğim bir yeri silebilir miyim?", a: "Evet, çizdiğiniz herhangi bir çizgiye veya nota tıklayarak çöp kutusu simgesiyle silebilirsiniz." }
    ],
    crossLink: { href: "/tr/edit-pdf", label: "Doğrudan yeni metin blokları yazmak istiyorsanız PDF Düzenle aracını kullanın." }
  },
};
export const editPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Edit PDF",
    description: "Add text, shapes, highlights, and comments to PDF documents online for free. Full-featured client-side PDF editor.",
    keywords: "edit pdf, edit pdf online free, add text to pdf, write on pdf, pdf editor online, modify pdf document",
    h1: "Edit PDF",
    tagline: "Type new text, draw shapes, highlight sentences, and insert images onto any PDF document directly in your browser.",
    howToName: "How to edit a PDF document",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file you want to edit." },
      { name: "Add Elements", text: "Click to insert text boxes, draw freehand annotations, or highlight paragraphs." },
      { name: "Save Changes", text: "Download your updated and edited PDF document instantly." }
    ],
    faq: [
      { q: "Can I add text anywhere on the page?", a: "Yes, click the text tool and click anywhere on the canvas to type with custom fonts, colors, and sizes." },
      { q: "Are existing texts modified?", a: "You can overlay new text and whiteout/redact existing sections without losing document structure." }
    ],
    crossLink: { href: "/sign-pdf", label: "Need to add a signature too? Try Sign PDF." }
  },
  tr: {
    title: "PDF Düzenle",
    description: "PDF dosyalarınızın üzerine yeni yazılar yazın, şekiller çizin, metinleri vurgulayın ve resim ekleyin. Ücretsiz PDF düzenleyici.",
    keywords: "pdf düzenleme, pdf üzerine yazı yazma, pdf editleme, pdf düzenleyici online, pdf e metin ekleme",
    h1: "PDF Düzenle",
    tagline: "Belgenizin üzerine tıklayıp istediğiniz yere yeni yazılar ekleyin, önemli cümleleri sarıyla vurgulayın ve şekiller çizin.",
    howToName: "PDF belgesi üzerine nasıl yazı yazılır ve düzenlenir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Belgenizi Yükleyin", text: "Düzenlemek istediğiniz PDF dosyasını seçin." },
      { name: "Yazı ve Çizim Ekleyin", text: "Metin aracını seçip dilediğiniz yere tıklayarak yazın veya fosforlu kalemle vurgulayın." },
      { name: "Düzenlenmiş PDF'i İndirin", text: "Kaydet butonuna basarak yeni belgenizi bilgisayarınıza kaydedin." }
    ],
    faq: [
      { q: "İstediğim yazı tipini ve boyutunu seçebilir miyim?", a: "Evet! Eklediğiniz metinlerin font boyutunu, rengini ve konumunu dilediğiniz gibi ayarlayabilirsiniz." },
      { q: "Orijinal dosyamın düzeni bozulur mu?", a: "Hayır, yeni eklemeler temiz bir katman olarak belgenize eklenir ve orijinal düzen korunur." }
    ],
    crossLink: { href: "/tr/sign-pdf", label: "Belgenizi imzalamak için PDF İmzala aracını kullanabilirsiniz." }
  },
};
export const pdfFormsCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Fill PDF Forms",
    description: "Fill out interactive PDF forms and sign fillable fields online for free. 100% private client-side form filler.",
    keywords: "fill pdf forms, fillable pdf form, complete pdf form online, fill tax form pdf, sign pdf forms",
    h1: "Fill PDF Forms",
    tagline: "Fill text fields, check boxes, select radio buttons, and complete fillable government, tax, or employment PDF forms.",
    howToName: "How to fill out a PDF form",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Fillable PDF", text: "Select the interactive form (AcroForm or XFA) you need to complete." },
      { name: "Fill Out Fields", text: "Type your responses into the highlighted form fields and tick checkboxes." },
      { name: "Save Completed Form", text: "Download your completed form, with options to keep fields editable or flatten them." }
    ],
    faq: [
      { q: "Are sensitive tax/financial details protected?", a: "Yes! The entire form filling engine operates in local memory. None of your entered personal details are uploaded to any server." },
      { q: "Can I lock the form after filling?", a: "Yes, you can use our Flatten PDF tool to prevent further editing before submitting." }
    ],
    crossLink: { href: "/flatten-pdf", label: "Want to lock your filled form answers permanently? Try Flatten PDF." }
  },
  tr: {
    title: "PDF Form Doldurucu",
    description: "Doldurulabilir resmi PDF formlarını, başvuru evraklarını ve dilekçeleri tarayıcınızda ücretsiz doldurun ve kaydedin.",
    keywords: "pdf form doldurma, interaktif pdf formu doldurucu, resmi evrak pdf doldur, dilekçe pdf formu doldurma",
    h1: "PDF Form Doldurucu",
    tagline: "Vize, iş başvurusu ve resmi vergi formlarını kutucuklara tıklayarak bilgisayarınızdan doldurun. Çıktı alıp elle yazmaya son.",
    howToName: "İnteraktif PDF formu nasıl doldurulur?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Form Belgesini Yükleyin", text: "Doldurmak istediğiniz interaktif PDF formunu seçin." },
      { name: "Kutucukları Doldurun", text: "Vurgulanan metin kutularına bilgilerinizi yazın ve onay kutularını işaretleyin." },
      { name: "Doldurulmuş Formu İndirin", text: "Tüm alanları doldurulmuş belgenizi tek tıkla kaydedin." }
    ],
    faq: [
      { q: "Kişisel ve finansal bilgilerim güvende mi?", a: "Kesinlikle evet. Form doldurma işlemi tamamen tarayıcınızın içinde çalışır, girdiğiniz hiçbir kişisel bilgi sunucularımıza gitmez." },
      { q: "Doldurduktan sonra başkalarının değiştirmesini nasıl engellerim?", a: "Formu doldurduktan sonra 'PDF Düzleştir' aracımızı kullanarak kutucukları kilitli hale getirebilirsiniz." }
    ],
    crossLink: { href: "/tr/flatten-pdf", label: "Doldurduğunuz formu değiştirilemez yapmak için PDF Düzleştir aracını deneyin." }
  },
};
export const mixpdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Mix PDF",
    description: "Interleave and alternate pages from two PDF files into one sequential document online for free. Perfect for double-sided scanner scans.",
    keywords: "mix pdf, alternate pdf pages, interleave pdf, merge odd and even pages, combine duplex scans",
    h1: "Mix PDF",
    tagline: "Combine odd and even page scans automatically. Interleave two separate PDF documents into a perfect sequential flow.",
    howToName: "How to alternate and mix PDF pages",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Both PDFs", text: "Upload the odd-pages PDF document and the even-pages PDF document." },
      { name: "Set Interleave Rules", text: "Choose standard 1-1 alternating order and reverse the even stack if scanned backwards." },
      { name: "Download Mixed PDF", text: "Download your perfectly interleaved, single sequential document." }
    ],
    faq: [
      { q: "Why use the Mix PDF tool?", a: "When scanning double-sided pages with a single-sided feeder, you end up with one file of front pages and one file of back pages. This tool stitches them together in alternating order (1, 2, 3, 4...)." },
      { q: "Can it handle reversed back pages?", a: "Yes, you can enable 'Reverse second document' to automatically flip back-to-front scans." }
    ],
    crossLink: { href: "/merge-pdf", label: "Want to append files end-to-end instead? Try Merge PDF." }
  },
  tr: {
    title: "Mix PDF",
    description: "İki ayrı PDF dosyasındaki sayfaları tek-çift (1, 2, 3, 4...) sırasıyla otomatik harmanlayıp birleştirin. Çift taraflı taramalar için idealdir.",
    keywords: "mix pdf, pdf sayfalarını karıştır, tek çift sayfa birleştirme, interleave pdf, arkalı önlü tarama birleştirme, pdf harmanlama",
    h1: "Mix PDF",
    tagline: "Tek taraflı tarayıcılarla taranmış ön ve arka sayfaları tek tıkla 1, 2, 3, 4 sırasıyla harmanlayıp kusursuz tek dosya yapın.",
    howToName: "Ön ve arka yüz taranmış PDF sayfaları nasıl sırayla birleştirilir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "İki Belgeyi Yükleyin", text: "Ön yüzleri içeren birinci PDF ile arka yüzleri içeren ikinci PDF'i seçin." },
      { name: "Sıralama Kuralını Seçin", text: "Sayfaların tek-çift şeklinde birbiri ardına dizilmesini ayarlayın." },
      { name: "Harmanlanmış PDF'i İndirin", text: "Tüm sayfaların doğru sırada birleştiği tek PDF dosyasını indirin." }
    ],
    faq: [
      { q: "Bu araç en çok ne zaman işe yarar?", a: "Arkalı-önlü taranması gereken evrakları tek yönlü tarayıcıyla önce önleri sonra arkaları taradığınızda, sayfaları elle tek tek taşımadan otomatik sıraya sokmak için kullanılır." },
      { q: "Arka sayfalar tersten tarandıysa düzelir mi?", a: "Evet! 'İkinci dosyayı tersten sırala' seçeneğiyle sondan başa taranmış arka sayfaları otomatik düzeltir." }
    ],
    crossLink: { href: "/tr/merge-pdf", label: "Belgeleri uç uca eklemek istiyorsanız PDF Birleştir aracını kullanın." }
  },
};
export const splithalfpdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Split Pages in Half",
    description: "Split two-page scanned PDF spreads into individual single pages (vertically or horizontally) online for free.",
    keywords: "split pdf pages in half, split two page scans, cut pdf in half, split book scan pdf, horizontal vertical pdf split",
    h1: "Split Pages in Half",
    tagline: "Cut two-page side-by-side book scans or double spreads down the middle into individual single pages.",
    howToName: "How to split scanned double-page PDFs in half",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Scanned Spread", text: "Select the PDF with side-by-side two-page scans." },
      { name: "Select Cut Direction", text: "Choose Vertical cut (for side-by-side book spreads) or Horizontal cut." },
      { name: "Download Split PDF", text: "Download your clean PDF where every book page is now a separate single sheet." }
    ],
    faq: [
      { q: "Is this ideal for book scans?", a: "Yes! Scanning an open book creates one file page containing both left and right book pages. This tool splits them into proper single-page reading order." },
      { q: "Is the resolution maintained?", a: "Yes, pages are split precisely down the vector/raster coordinate grid without loss of sharpness." }
    ],
    crossLink: { href: "/split-pdf", label: "Want standard page splitting? Try Split PDF." }
  },
  tr: {
    title: "Sayfaları Ortadan İkiye Böl",
    description: "Kitap taramalarındaki yan yana iki sayfayı (sol ve sağ) ortadan ikiye bölerek tek tek sayfalara dönüştürün. Ücretsiz ve yerel.",
    keywords: "pdf sayfalarını ikiye bölme, kitap taramasını bölme, yan yana iki sayfayı ayırma, pdf ortadan kesme",
    h1: "Sayfaları Ortadan İkiye Böl",
    tagline: "Açık kitap taramalarındaki sol ve sağ sayfaları tam ortasından keserek her sayfayı ayrı birer yaprak haline getirin.",
    howToName: "Taranmış iki sayfalık PDF'ler ortadan nasıl bölünür?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Kitap Taramasını Yükleyin", text: "Yan yana iki sayfa içeren taranmış PDF belgenizi seçin." },
      { name: "Bölme Yönünü Seçin", text: "Dikey kesim (Sol-Sağ kitap sayfaları) veya Yatay kesimi belirleyin." },
      { name: "Ayrılmış PDF'i İndirin", text: "Her sayfanın tek tek sıralandığı düzenli e-kitap PDF'inizi indirin." }
    ],
    faq: [
      { q: "E-Kitap okuyucular için uygun mu?", a: "Evet! Kindle veya tabletlerde yan yana duran küçük kitap taramalarını tam ekran rahat okunabilir tek sayfalara dönüştürür." },
      { q: "Yazılar kesilir mi?", a: "Sayfaları tam orta ekseninden böler, böylece sol ve sağ sayfalar kusursuz ayrılır." }
    ],
    crossLink: { href: "/tr/split-pdf", label: "Standart sayfa ayırma için PDF Böl aracını kullanın." }
  },
};
export const extractbykeywordCopy = {
  en: {
    title: "Extract Pages by Keyword",
    description: "Search and extract only the PDF pages that contain specific keywords or phrases into a new document online for free.",
    keywords: "extract pdf pages by keyword, search and split pdf, filter pdf pages by word, extract pages containing text",
    h1: "Extract Pages by Keyword",
    tagline: "Search a massive PDF for specific terms (e.g., 'Invoice', 'Confidential', 'Tax') and save only matching pages to a new PDF.",
    howToName: "How to extract PDF pages by keyword",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the large multi-page document you want to filter." },
      { name: "Enter Keyword", text: "Type the target word, phrase, or regular expression you are searching for." },
      { name: "Download Filtered PDF", text: "Download a clean new PDF containing only the pages where your keyword was found." }
    ],
    faq: [
      { q: "Is keyword matching case-sensitive?", a: "You can toggle between case-sensitive and case-insensitive matching." },
      { q: "What if a keyword appears multiple times on the same page?", a: "The page is included once in the filtered result, preserving correct document order." }
    ],
    crossLink: { href: "/extract-pages", label: "Want to select pages by number instead? Try Extract Pages." }
  },
  tr: {
    title: "Kelimeye Göre Sayfa Ayıkla (Arama)",
    description: "Belirli bir kelimenin (Örn: 'Fatura', 'Madde 5', 'Sözleşme') geçtiği PDF sayfalarını otomatik bulup ayrı bir dosya yapın.",
    keywords: "kelimeye göre pdf sayfa çıkarma, aranan kelimenin sayfalarını ayırma, pdf te arama yapıp sayfaları bölme",
    h1: "Kelimeye Göre Sayfa Ayıkla",
    tagline: "Yüzlerce sayfalık arşivde aradığınız kelimenin geçtiği tüm sayfaları saniyeler içinde tespit edip tek bir PDF'te toplayın.",
    howToName: "Belirli bir kelimenin geçtiği PDF sayfaları nasıl ayıklanır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Büyük Belgeyi Yükleyin", text: "İçinde arama yapmak istediğiniz çok sayfalı PDF'i seçin." },
      { name: "Aranacak Kelimeyi Girin", text: "Bulmak istediğiniz kelimeyi veya ifadeyi (örn: 'Bilanço') yazın." },
      { name: "Filtrelenmiş PDF'i İndirin", text: "Sadece bu kelimenin yer aldığı sayfalardan oluşan yeni belgenizi indirin." }
    ],
    faq: [
      { q: "Büyük-küçük harf duyarlı mı?", a: "Dilerseniz büyük/küçük harf duyarlılığını açıp kapatabilirsiniz." },
      { q: "Hukuk ve muhasebe arşivleri için nasıl kullanılır?", a: "Bin sayfalık dava veya muhasebe dosyasında sadece müvekkilinizin adının geçtiği sayfaları anında çekip ayıklayabilirsiniz." }
    ],
    crossLink: { href: "/tr/extract-pages", label: "Sayfa numarasına göre ayıklamak için PDF Sayfalarını Ayıkla aracını deneyin." }
  },
};

export const splitbysizeCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Split PDF by File Size",
    description: "Divide massive PDF documents into multiple smaller files that stay strictly under your specified MB limit (e.g. 10MB or 25MB) online for free.",
    keywords: "split pdf by size, split pdf by mb, split pdf for email attachment, chunk large pdf, divide pdf by size limit, break down massive pdf",
    h1: "Split PDF by File Size",
    tagline: "Divide massive PDF documents into multiple smaller files that stay strictly under your specified MB limit (e.g. 10MB or 25MB).",
    howToName: "How to split a PDF by MB size limit",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Massive PDF", text: "Select the large PDF document you need to break down." },
      { name: "Set MB Size Limit", text: "Choose a preset (e.g., 5MB, 10MB, 25MB) or enter your target maximum megabyte limit." },
      { name: "Download Chunks", text: "Download your ZIP collection of smaller PDF files, each strictly within your size budget." }
    ],
    faq: [
      { q: "Why split by file size instead of page count?", a: "Email services (like Gmail or Outlook) and government/corporate portals enforce strict file size limits (such as 10MB or 25MB). Splitting by MB guarantees each piece uploads and sends smoothly." },
      { q: "Are individual pages split or truncated?", a: "No. The tool accurately divides documents at full page boundaries so no visual content or formatting is lost." },
      { q: "What format are the split parts delivered in?", a: "All divided PDF parts are neatly packaged and downloaded together as a single ZIP archive." }
    ],
    crossLink: { href: "/compress-pdf", label: "Want to shrink the file without splitting? Try Compress PDF." }
  },
  tr: {
    title: "PDF'i Dosya Boyutuna Göre Böl (MB Sınırı)",
    description: "Büyük PDF belgelerini belirlediğiniz MB sınırının (örn: 10MB veya 25MB) altında kalacak şekilde ücretsiz ve güvenli olarak parçalara ayırın.",
    keywords: "pdf mb ye göre bölme, boyuta göre pdf parçalama, eposta için pdf bölme, büyük pdf parçalara ayır, dosya boyutuna göre pdf böl",
    h1: "PDF'i Dosya Boyutuna Göre Böl (MB Sınırı)",
    tagline: "Büyük PDF belgelerini belirlediğiniz MB sınırının (örn: 10MB veya 25MB) altında kalacak şekilde otomatik olarak daha küçük dosyalara bölün.",
    howToName: "PDF dosyası megabayt (MB) sınırına göre nasıl bölünür?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Büyük Belgenizi Yükleyin", text: "Boyutunu küçülterek parçalamak istediğiniz büyük PDF dosyasını seçin." },
      { name: "Maksimum MB Sınırını Belirleyin", text: "Hazır butonlardan (örn: 5MB, 10MB, 25MB) seçin veya istediğiniz maksimum MB değerini girin." },
      { name: "Parçaları İndirin", text: "Belirlediğiniz MB sınırını aşmayan tüm PDF parçalarını tek bir ZIP arşivi olarak indirin." }
    ],
    faq: [
      { q: "Neden sayfa sayısı yerine dosya boyutuna göre bölmeliyim?", a: "Gmail, Outlook veya kurumsal başvuru portalları 'en fazla 10 MB' veya 'en fazla 25 MB' gibi katı dosya boyutu limitleri uygular. Boyuta göre bölme, her parçanın bu sınırlara tam uymasını sağlar." },
      { q: "Sayfalar ortadan kesilir veya bozulur mu?", a: "Hayır. Bölme işlemi tam sayfa sınırlarından yapılır; metinler, tablolar ve sayfa bütünlüğü %100 korunur." },
      { q: "Bölünen dosyalar nasıl teslim edilir?", a: "Oluşturulan tüm PDF parçaları numaralandırılarak tek bir ZIP arşivi içerisinde bilgisayarınıza iner." }
    ],
    crossLink: { href: "/tr/compress-pdf", label: "Bölmek yerine dosyayı küçültmek istiyorsanız PDF Küçült aracını deneyin." }
  },
};
export const addmarginsCopy = {
  en: {
    title: "Add Margins to PDF",
    description: "Add white margins and extra padding to PDF pages for hole punching or binding online for free. Custom margin sizes.",
    keywords: "add margins to pdf, add padding to pdf, extra margins for hole punching, gutter margin pdf, widen pdf margins",
    h1: "Add Margins to PDF",
    tagline: "Add extra white padding around your PDF pages. Perfect for ring binders, spiral binding, and booklet margins.",
    howToName: "How to add margins to a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file that needs extra border space." },
      { name: "Set Margin Sizes", text: "Specify top, bottom, left, and right margin padding (in millimeters or inches)." },
      { name: "Download Padded PDF", text: "Download your document with extra margin spacing applied to all pages." }
    ],
    faq: [
      { q: "Why add margins to a PDF?", a: "Adding left gutter margins ensures text is not obscured when binding documents in folders, spiral binders, or books." },
      { q: "Is the page scaled down?", a: "Content is proportionally scaled down inside the new margin boundaries without clipping." }
    ],
    crossLink: { href: "/crop-pdf", label: "Need to remove margins instead? Try Crop PDF." }
  },
  tr: {
    title: "PDF Kenar Boşluğu Ekle",
    description: "PDF sayfalarına delgeç, ciltleme veya spiral payı için ekstra beyaz kenar boşlukları ekleyin. Ücretsiz ve pratik.",
    keywords: "pdf kenar boşluğu ekleme, ciltleme payı pdf, delgeç payı bırakma, pdf e pay ekle, kenar boşluğu genişletme",
    h1: "PDF Kenar Boşluğu Ekle",
    tagline: "Sayfaların kenarlarına delgeç veya spiral ciltleme boşluğu bırakın. Yazıların ciltte kaybolmasını önleyin.",
    howToName: "PDF sayfalarına kenar boşluğu nasıl eklenir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Belgenizi Yükleyin", text: "Kenar boşluğu eklemek istediğiniz PDF dosyasını seçin." },
      { name: "Boşluk Ölçüsünü Girin", text: "Sol, sağ, üst veya alt kenarlar için kaç mm boşluk bırakılacağını belirleyin." },
      { name: "Genişletilmiş PDF'i İndirin", text: "Ciltlemeye ve delgeçle delmeye hazır yeni belgenizi indirin." }
    ],
    faq: [
      { q: "Yazılar sayfa dışına taşar mı?", a: "Hayır. Eklenen boşluğa göre sayfa içeriği orantılı olarak yeniden boyutlandırılır, hiçbir yazı kesilmez." },
      { q: "Spiral ciltleme için hangi kenara boşluk bırakmalıyım?", a: "Standart kitap ve tez ciltlemelerinde genellikle Sol (Left) kenara 15-20 mm boşluk eklenir." }
    ],
    crossLink: { href: "/tr/crop-pdf", label: "Kenar boşluklarını silmek istiyorsanız PDF Kırp aracını deneyin." }
  },
};
export const pdftosvgCopy = {
  en: {
    title: "PDF to SVG",
    description: "Convert PDF pages and vector graphics into scalable SVG vector files online for free. Infinitely zoomable output.",
    keywords: "pdf to svg, convert pdf to vector, vector pdf converter, export pdf as svg, scalable vector graphics pdf",
    h1: "PDF to SVG",
    tagline: "Turn PDF diagrams, CAD drawings, and logos into scalable SVG vector graphics without losing any resolution.",
    howToName: "How to convert PDF to SVG vector graphics",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the vector PDF document or logo you want to convert." },
      { name: "Vector Conversion", text: "Our renderer translates PDF vector paths, bezier curves, and fonts into SVG markup." },
      { name: "Download SVG", text: "Download your scalable vector (.svg) graphics ready for web and design tools." }
    ],
    faq: [
      { q: "Why convert PDF to SVG?", a: "SVG files are infinitely scalable vectors that never pixelate, making them perfect for websites, Figma, Illustrator, and cutting machines." },
      { q: "Are vector paths preserved?", a: "Yes, text outlines, curves, and strokes are converted directly into clean SVG path elements." }
    ],
    crossLink: { href: "/pdf-to-png", label: "Need a raster PNG image instead? Try PDF to PNG." }
  },
  tr: {
    title: "PDF'ten SVG'ye Çevirme (Vektör)",
    description: "PDF çizimlerini, logoları ve mimari planları kalitesi hiç bozulmayan ölçeklenebilir SVG vektör formatına dönüştürün.",
    keywords: "pdf to svg, pdf vektör yapma, pdf i svg ye çevirme, figma için pdf aktarma, çizimi svg yapma",
    h1: "PDF'ten SVG'ye Çevirme (Vektör)",
    tagline: "PDF logolarınızı, CAD çizimlerinizi ve grafiklerinizi kalitesi asla bozulmayan SVG vektör dosyalarına dönüştürün.",
    howToName: "PDF belgesi SVG vektör formatına nasıl dönüştürülür?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Çizimini Yükleyin", text: "Vektöre dönüştürmek istediğiniz PDF dosyasını seçin." },
      { name: "Vektörel Dönüşüm", text: "Aracımız tüm çizgileri ve eğrileri kusursuz SVG kodlarına dönüştürür." },
      { name: "SVG Dosyasını İndirin", text: "İllustrator veya Figma'da düzenlenebilir vektör dosyanızı indirin." }
    ],
    faq: [
      { q: "SVG formatının avantajı nedir?", a: "SVG vektörel bir formattır; ne kadar yakınlaştırırsanız yakınlaştırın asla bulanıklaşmaz veya pikselleşmez." },
      { q: "Figma ve Adobe Illustrator'da açılır mı?", a: "Evet! Çıktı olarak aldığınız SVG dosyalarını Figma, Canva ve Illustrator'da doğrudan düzenleyebilirsiniz." }
    ],
    crossLink: { href: "/tr/pdf-to-png", label: "Standart görsel almak istiyorsanız PDF'ten PNG'ye aracını deneyin." }
  },
};
export const extractimagesCopy = {
  en: {
    title: "Extract Images",
    description: "Extract all images from a PDF.",
    h1: "Extract Images",
    tagline: "Extract all images from a PDF.",
    howToName: "How to use Extract Images",
    howItWorks: "Upload your file and process it instantly in your browser.",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a PDF document containing photos or graphics onto the page.",
      },
      {
        name: "Extract images",
        text: "We scan the resource dictionaries locally to safely extract all embedded image files.",
      },
      {
        name: "Download ZIP",
        text: "Download a ZIP archive containing all the original, untouched images from your document.",
      },
    ],
  },
  tr: {
    title: "Görselleri Çıkar",
    description: "PDF içindeki tüm resimleri ayıkla.",
    h1: "Görselleri Çıkar",
    tagline: "PDF içindeki tüm resimleri ayıkla.",
    howToName: "Görselleri Çıkar Nasıl Kullanılır",
    howItWorks: "Dosyanızı yükleyin ve tarayıcınızda anında işleyin.",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Fotoğraf veya grafikler içeren PDF belgenizi sayfaya bırakın.",
      },
      {
        name: "Görselleri çıkar",
        text: "Gömülü tüm resim dosyalarını güvenle çıkarmak için kaynak dizinlerini yerel olarak tarıyoruz.",
      },
      {
        name: "ZIP indir",
        text: "Belgenizdeki tüm orijinal, dokunulmamış görselleri içeren ZIP arşivini indirin.",
      },
    ],
  },
};

export const addpagenumbersCopy = {
  en: {
    title: "Add Page Numbers",
    description: "Insert page numbers into a PDF.",
    keywords:
      "add page numbers, paginate pdf, number pages, insert page numbers, sayfa numarası ekle, numaralandır",
    h1: "Add Page Numbers",
    tagline: "Insert page numbers into a PDF.",
    howToName: "How to use Add Page Numbers",
    howItWorks: "Upload your file and process it instantly in your browser.",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document that needs pagination onto the page.",
      },
      {
        name: "Add numbers",
        text: "We automatically calculate the position and stamp sequential page numbers locally.",
      },
      {
        name: "Download PDF",
        text: "Download your neatly organized and professionally numbered document.",
      },
    ],
  },
  tr: {
    title: "Sayfa Numarası",
    description: "PDF sayfalarına otomatik numara ekle.",
    keywords:
      "sayfa numarası ekle, pdf numaralandırma, sayfalandır, add page numbers to pdf",
    h1: "Sayfa Numarası",
    tagline: "PDF sayfalarına otomatik numara ekle.",
    howToName: "Sayfa Numarası Nasıl Kullanılır",
    howItWorks: "Dosyanızı yükleyin ve tarayıcınızda anında işleyin.",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Sayfa numarası eklenmesi gereken PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Numara ekle",
        text: "Doğru konumu otomatik hesaplayarak sıralı sayfa numaralarını belgenize yerel olarak basıyoruz.",
      },
      {
        name: "PDF indir",
        text: "Profesyonel bir şekilde numaralandırılmış ve düzenlenmiş belgenizi anında indirin.",
      },
    ],
  },
};

export const removeblankpagesCopy = {
  en: {
    title: "Remove Blank Pages",
    description: "Detect and delete empty pages.",
    keywords:
      "remove blank pages, delete empty pages, clean pdf, boş sayfa sil, boş sayfaları çıkar",
    h1: "Remove Blank Pages",
    tagline: "Detect and delete empty pages.",
    howToName: "How to use Remove Blank Pages",
    howItWorks: "Upload your file and process it instantly in your browser.",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document containing unwanted blank pages.",
      },
      {
        name: "Scan for blanks",
        text: "We analyze the document locally to instantly detect completely empty pages.",
      },
      {
        name: "Download PDF",
        text: "Download your perfectly clean and streamlined PDF document.",
      },
    ],
  },
  tr: {
    title: "Boş Sayfaları Sil",
    description: "Boş veya beyaz sayfaları tespit edip sil.",
    keywords:
      "boş sayfa sil, yazısız sayfa sil, boşluk temizle, remove blank pages",
    h1: "Boş Sayfaları Sil",
    tagline: "Boş veya beyaz sayfaları tespit edip sil.",
    howToName: "Boş Sayfaları Sil Nasıl Kullanılır",
    howItWorks: "Dosyanızı yükleyin ve tarayıcınızda anında işleyin.",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "İstenmeyen boş sayfalar içeren PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Boş sayfaları tara",
        text: "Tamamen boş sayfaları anında tespit etmek için belgeyi yerel olarak analiz ediyoruz.",
      },
      {
        name: "PDF indir",
        text: "Mükemmel şekilde temizlenmiş ve arındırılmış PDF belgenizi indirin.",
      },
    ],
  },
};

export const removeAnnotationsCopy = {
  en: {
    title: "Remove Annotations from PDF",
    description: "Strip all sticky notes, comments, highlights, and markup stamps from PDF documents online for free. 100% clean output.",
    keywords: "remove annotations from pdf, delete pdf comments, strip pdf highlights, clean markup pdf, remove sticky notes pdf",
    h1: "Remove Annotations from PDF",
    tagline: "Erase all personal notes, teacher markings, review highlights, and drawing stamps to restore a pristine clean document.",
    howToName: "How to remove annotations and comments from a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Marked PDF", text: "Select the PDF file containing unwanted comments, highlights, or review marks." },
      { name: "Strip Annotations", text: "Our tool purges all annotation dictionary objects from the PDF structure." },
      { name: "Download Clean PDF", text: "Download your completely clean, unannotated document." }
    ],
    faq: [
      { q: "Will the original document text be damaged?", a: "No. Only the annotation overlay layers (comments, highlights, stamps) are removed; original document text remains intact." },
      { q: "Can I remove specific annotations only?", a: "You can strip all annotations automatically, or use our Annotate PDF tool to selectively delete individual notes." }
    ],
    crossLink: { href: "/annotate-pdf", label: "Need to add new notes instead? Try Annotate PDF." }
  },
  tr: {
    title: "PDF Not ve Çizimleri Temizle",
    description: "PDF belgelerindeki tüm ek açıklamaları, sarı vurguları, yapışkan notları ve çizimleri tek tıkla silerek belgeyi tertemiz yapın.",
    keywords: "pdf notları silme, pdf sarı vurguları temizleme, pdf ek açıklamaları kaldır, temiz pdf yap",
    h1: "PDF Not ve Çizimleri Temizle",
    tagline: "Başkalarının aldığı notları, karalamaları, sarı vurguları ve yorumları tek tıkla temizleyip orijinal temiz haline döndürün.",
    howToName: "PDF belgesindeki notlar ve çizimler nasıl silinir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Notlu Belgeyi Yükleyin", text: "İçinde çizim ve notlar bulunan PDF dosyasını seçin." },
      { name: "Notları Temizle", text: "Aracımız tüm ek açıklama ve vurgu katmanlarını belgeden temizler." },
      { name: "Tertemiz PDF'i İndirin", text: "Tüm karalamalardan arındırılmış pürüzsüz belgenizi kaydedin." }
    ],
    faq: [
      { q: "Orijinal yazılarım silinir mi?", a: "Hayır! Yalnızca sonradan eklenmiş olan notlar, fosforlu kalem vurguları ve yorumlar silinir; ana metinler korunur." },
      { q: "Tek tek silmek mümkün mü?", a: "Hepsini tek tıkla temizleyebilir veya 'PDF Not Ekle & Çizim' aracımızdan dilediğiniz notu tek tek silebilirsiniz." }
    ],
    crossLink: { href: "/tr/annotate-pdf", label: "Yeni notlar eklemek için PDF Not Ekle & Çizim aracını kullanın." }
  },
};
export const pdfToWebpCopy = {
  en: {
    title: "PDF to WebP",
    description: "Convert PDF pages into lightweight, high-quality next-gen WebP images online for free. Boost website loading speeds.",
    keywords: "pdf to webp, convert pdf to webp, next gen image converter, pdf page to webp, compress pdf to webp",
    h1: "PDF to WebP",
    tagline: "Convert PDF pages into next-generation WebP images. Enjoy superior compression and smaller file sizes for your website.",
    howToName: "How to convert PDF to WebP images",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file you want to convert to web-optimized images." },
      { name: "Choose Quality", text: "Select resolution and compression quality for optimal web performance." },
      { name: "Download WebP", text: "Download your ultra-lightweight WebP image package." }
    ],
    faq: [
      { q: "Why use WebP instead of JPG?", a: "WebP images are typically 30% smaller than JPG files at the same visual quality, dramatically speeding up web page load times." },
      { q: "Are all modern browsers compatible?", a: "Yes, WebP is supported across Chrome, Safari, Firefox, Edge, and mobile browsers." }
    ],
    crossLink: { href: "/pdf-to-jpg", label: "Need universal JPG format instead? Try PDF to JPG." }
  },
  tr: {
    title: "PDF'ten WebP'ye Çevirme",
    description: "PDF sayfalarını web siteleri için optimize edilmiş, ultra hafif yeni nesil WebP görsel formatına dönüştürün.",
    keywords: "pdf to webp, pdf webp dönüştürücü, web sitesi için pdf resim yapma, hafif görsel formatı webp",
    h1: "PDF'ten WebP'ye Çevirme",
    tagline: "PDF sayfalarınızı JPG'den %30 daha hafif olan yeni nesil WebP formatına çevirin. Web sitenizin açılış hızını artırın.",
    howToName: "PDF belgesi WebP fotoğraf formatına nasıl çevrilir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "Görsele dönüştürmek istediğiniz PDF dosyasını seçin." },
      { name: "Kalite Ayarını Yapın", text: "Web siteniz için en uygun çözünürlüğü ve sıkıştırma oranını belirleyin." },
      { name: "WebP Dosyalarını İndirin", text: "Hızlı yüklenen yeni nesil WebP resimlerinizi ZIP olarak indirin." }
    ],
    faq: [
      { q: "WebP formatının JPG'den farkı nedir?", a: "WebP aynı görüntü kalitesini JPG'ye göre %30 daha az dosya boyutuyla sunar; sitenizin Google PageSpeed puanını yükseltir." },
      { q: "Tüm tarayıcılarda açılır mı?", a: "Evet! Chrome, Safari, iPhone ve Android tüm modern cihazlar WebP formatını sorunsuz destekler." }
    ],
    crossLink: { href: "/tr/pdf-to-jpg", label: "Standart JPG fotoğrafı almak için PDF to JPG aracını kullanın." }
  },
};
export const autoCropCopy = {
  en: {
    title: "Auto-Crop PDF",
    description: "Automatically detect and trim white margins from PDF pages online for free. Tight crop to readable content.",
    keywords: "auto crop pdf, automatic pdf margin trimmer, remove white borders pdf, tight crop pdf online",
    h1: "Auto-Crop PDF",
    tagline: "Detect empty whitespace around text and automatically crop every page to its exact content boundaries.",
    howToName: "How to auto-crop white borders from a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file with excessive white borders." },
      { name: "Auto-Detect Bounds", text: "Our algorithm scans each page to calculate the tightest bounding box around the text." },
      { name: "Download Trimmed PDF", text: "Save your cleanly cropped PDF with all unnecessary borders removed." }
    ],
    faq: [
      { q: "Is this helpful for Kindle/E-readers?", a: "Yes! Removing wide white borders allows small e-ink screens and tablets to zoom in text much larger for easier reading." },
      { q: "Does it crop pages with different content sizes?", a: "Yes, our engine dynamically detects content bounds page-by-page." }
    ],
    crossLink: { href: "/crop-pdf", label: "Want manual control over crop areas? Try Crop PDF." }
  },
  tr: {
    title: "Otomatik PDF Kırpma",
    description: "PDF sayfalarındaki gereksiz beyaz kenarlıkları otomatik analizle tespit edip kırpın. E-kitap okuyucular için idealdir.",
    keywords: "otomatik pdf kırpma, pdf kenar boşluklarını otomatik sil, akıllı pdf crop, e kitap için pdf kırpma",
    h1: "Otomatik PDF Kırpma",
    tagline: "Yazıların etrafındaki boş beyaz alanları yapay zeka ile otomatik algılayıp kırpın. Kindle ve tabletlerde tam ekran okuyun.",
    howToName: "PDF kenar boşlukları otomatik olarak nasıl kırpılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "Gereksiz beyaz kenarlıkları olan PDF dosyasını seçin." },
      { name: "Akıllı Algılama", text: "Sistemimiz sayfadaki metin ve görsellerin sınırlarını otomatik hesaplar." },
      { name: "Kırpılmış PDF'i İndirin", text: "Beyaz fazlalıkları atılmış tam ekran PDF belgenizi indirin." }
    ],
    faq: [
      { q: "E-Kitap ve tablet okumalarında ne fayda sağlar?", a: "Beyaz boşluklar temizlendiğinde yazılar ekrana çok daha büyük ve okunaklı oturur; gözleriniz yorulmaz." },
      { q: "Her sayfa farklı kırpılabilir mi?", a: "Evet! Sistemimiz her sayfadaki metin yoğunluğuna göre dinamik kırpma uygular." }
    ],
    crossLink: { href: "/tr/crop-pdf", label: "Elle manuel kırpmak için PDF Kırp aracını kullanın." }
  },
};
export const extractTocCopy = {
  en: {
    title: "Extract Table of Contents (Bookmarks)",
    description: "Extract the Table of Contents (Bookmarks outline tree) from any PDF into Markdown, text, or JSON format online for free.",
    keywords: "extract table of contents from pdf, export pdf bookmarks, pdf outline to markdown, extract pdf toc, pdf index exporter",
    h1: "Extract Table of Contents",
    tagline: "Export the structured bookmark outline, chapter hierarchy, and page references from any PDF into clean Markdown text.",
    howToName: "How to extract a PDF Table of Contents",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF book or report with structured bookmarks." },
      { name: "Extract Outline", text: "Our parser reads the internal PDF bookmark catalog and nesting levels." },
      { name: "Download Markdown TOC", text: "Save your Table of Contents as clean Markdown or text." }
    ],
    faq: [
      { q: "Are page numbers included?", a: "Yes, every chapter heading is exported with its corresponding target page number." },
      { q: "What if the PDF has no bookmarks?", a: "If the file lacks an embedded outline catalog, no TOC can be extracted." }
    ],
    crossLink: { href: "/split-bookmarks", label: "Want to split the PDF at each chapter bookmark? Try Split by Bookmarks." }
  },
  tr: {
    title: "PDF İçindekiler Tablosunu Çıkar (Yer İmleri)",
    description: "PDF kitaplarının ve raporlarının içindekiler tablosunu ve bölüm başlıklarını Markdown veya metin olarak dışa aktarın.",
    keywords: "pdf içindekiler tablosu çıkarma, pdf yer imlerini kaydetme, pdf fihrist çıkarma, kitap içindekiler markdown yapma",
    h1: "PDF İçindekiler Tablosunu Çıkar",
    tagline: "Kitap ve tezlerdeki içindekiler ağacını, bölüm başlıklarını ve sayfa numaralarını tek tıkla düzenli Markdown metni olarak kaydedin.",
    howToName: "PDF içindekiler tablosu nasıl dışa aktarılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Kitabını Yükleyin", text: "İçindekiler ağacı olan PDF dosyasını seçin." },
      { name: "Fihristi Ayıkla", text: "Aracımız tüm bölüm başlıklarını ve sayfa numaralarını hiyerarşik olarak okur." },
      { name: "Markdown/Metin Olarak İndirin", text: "İçindekiler tablonuzu not uygulamalarınızda kullanmak üzere indirin." }
    ],
    faq: [
      { q: "Sayfa numaraları yer alır mı?", a: "Evet! Her bölüm başlığının yanında kitabın hangi sayfasında olduğu net olarak listelenir." },
      { q: "Notion ve Obsidian ile uyumlu mu?", a: "Evet! Çıktı Markdown formatında olduğu için Notion, Obsidian ve Word'e doğrudan yapıştırılabilir." }
    ],
    crossLink: { href: "/tr/split-bookmarks", label: "Belgeyi bölümlere göre ayrı dosyalara bölmek için Yer İmlerine Göre Böl aracını deneyin." }
  },
};

export const overlayPdfCopy = {
  en: {
    title: "Add Letterhead to PDF (Overlay & Stamp)",
    description: "Add company letterhead stationery, corporate templates, or background stamps to your PDF documents online for free.",
    keywords: "add letterhead to pdf, pdf overlay, pdf stationery template, pdf background stamp, merge pdf layers",
    h1: "Add Letterhead to PDF",
    tagline: "Superimpose your company letterhead, stationery template, or background stamp over your multi-page documents.",
    howToName: "How to add a letterhead or overlay onto a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Main PDF", text: "Select your content document (invoices, reports, or letters)." },
      { name: "Upload Letterhead PDF", text: "Select the background stationery or header template." },
      { name: "Download Merged PDF", text: "Save your document with the professional letterhead stamped behind every page." }
    ],
    faq: [
      { q: "Can I place the overlay in the background or foreground?", a: "Yes, you can choose whether the overlay appears under your text (as stationery) or over it (as a stamp)." },
      { q: "Is it applied to every page?", a: "Yes, you can choose to apply it to all pages, first page only, or all pages except the first." }
    ],
    crossLink: { href: "/watermark-pdf", label: "Need a text watermark instead? Try Watermark PDF." }
  },
  tr: {
    title: "PDF'e Antetli Kağıt Ekle (Şablon & Damga)",
    description: "PDF fatura ve yazılarınıza şirket antetli kağıt şablonu, kurumsal çerçeve veya arka plan damgası ekleyin. Ücretsiz ve pratik.",
    keywords: "pdf antetli kağıt ekleme, pdf antet giydirme, kurumsal antet pdf yapma, pdf arka plan şablonu, pdf overlay",
    h1: "PDF'e Antetli Kağıt Ekle",
    tagline: "Şirket antetli kağıdınızı, kurumsal şablonunuzu veya arka plan logonuzu fatura ve raporlarınızın altına şablon olarak yerleştirin.",
    howToName: "PDF belgesine antetli kağıt şablonu nasıl eklenir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Metin Belgenizi Yükleyin", text: "Fatura, teklif veya yazı içeren ana PDF dosyanızı seçin." },
      { name: "Antetli Şablonu Ekleyin", text: "Şirket logonuzu ve antetinizi içeren şablon PDF'ini seçin." },
      { name: "Birleştirilmiş PDF'i İndirin", text: "Antetli kağıt üzerine basılmış gibi profesyonelce hazırlanan belgenizi indirin." }
    ],
    faq: [
      { q: "Antet yazının arkasında mı kalır?", a: "Evet! Varsayılan olarak şablon arka plan olarak yerleştirilir, böylece metinlerinizin okunurluğu asla bozulmaz." },
      { q: "Hangi sayfalara uygulanır?", a: "Tüm sayfalara, yalnızca ilk sayfaya (kapak/ön yazı) veya ilk sayfa hariç tüm sayfalara uygulama seçeneğiniz vardır." }
    ],
    crossLink: { href: "/tr/watermark-pdf", label: "Metin damgası basmak için PDF Filigran Ekle aracını kullanın." }
  },
};

export const changeBgCopy = {
  en: {
    title: "Change PDF Background Color",
    description: "Change the background color of your PDF pages to sepia, dark mode, or custom pastel tones online for free.",
    keywords: "change pdf background color, sepia pdf reader, eye care pdf background, tinted pdf pages, custom pdf background",
    h1: "Change PDF Background Color",
    tagline: "Tint page backgrounds with warm sepia, paper cream, or eye-friendly pastel colors for comfortable reading.",
    howToName: "How to change PDF background color",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file whose background you want to colorize." },
      { name: "Select Tint Color", text: "Choose Sepia, Warm Cream, Pastel Green, or enter a custom hex color." },
      { name: "Download Tinted PDF", text: "Save your eye-friendly colorized document." }
    ],
    faq: [
      { q: "Why use sepia or cream backgrounds?", a: "Warm tones reduce blue light emission and eye fatigue during long reading sessions." },
      { q: "Are images affected?", a: "No, text and images retain their original colors while the page canvas color is updated." }
    ],
    crossLink: { href: "/invert-pdf", label: "Looking for full dark mode? Try Invert PDF Colors." }
  },
  tr: {
    title: "PDF Arka Plan Rengini Değiştir",
    description: "PDF sayfalarının arka planını göz yormayan sepya, krem veya özel renklere dönüştürün. Ücretsiz ve pratik.",
    keywords: "pdf arka plan rengi değiştirme, sepya pdf okuyucu, göz dinlendirici pdf arka planı, krem rengi pdf yap",
    h1: "PDF Arka Plan Rengini Değiştir",
    tagline: "Parlak beyaz sayfaları sıcak sepya, kitap kağıdı kremi veya pastel tonlara boyayarak uzun okumalarda gözlerinizi koruyun.",
    howToName: "PDF arka plan rengi nasıl değiştirilir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "Arka planını değiştirmek istediğiniz PDF kitabını seçin." },
      { name: "Rengi Belirleyin", text: "Sepya, Krem, Pastel Yeşil veya dilediğiniz özel bir renk tonunu seçin." },
      { name: "Renklendirilmiş PDF'i İndirin", text: "Göz dostu yeni arka plana sahip belgenizi cihazınıza kaydedin." }
    ],
    faq: [
      { q: "Göz sağlığı için hangi renk önerilir?", a: "Sıcak sepya ve hafif sarı/krem tonları mavi ışığı kırarak göz yorgunluğunu en aza indirir." },
      { q: "Resimler ve yazılar bozulur mu?", a: "Hayır. Yalnızca beyaz kağıt arka planı boyanır, yazılar ve fotoğraflar net kalır." }
    ],
    crossLink: { href: "/tr/invert-pdf", label: "Tamamen siyah gece modu için PDF Renklerini Ters Çevir aracını deneyin." }
  },
};

export const autoRedactCopy = {
  en: {
    title: "Auto-Redact PDF",
    description: "Automatically find and redact credit cards, emails, SSNs, and phone numbers in PDF files online for free.",
    keywords: "auto redact pdf, automatic pii redaction, redact credit cards pdf, redact ssn pdf, scrub private data pdf",
    h1: "Auto-Redact PDF",
    tagline: "Automatically detect sensitive PII (Social Security numbers, credit card numbers, email addresses) and black them out in one click.",
    howToName: "How to auto-redact sensitive data in a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the document containing private customer or patient information." },
      { name: "Select PII Patterns", text: "Choose patterns to scrub: Credit Cards, SSN/ID numbers, Emails, or Phone Numbers." },
      { name: "Apply Redaction", text: "Download your scrubbed PDF with all detected private data permanently blacked out." }
    ],
    faq: [
      { q: "Is the underlying text data removed?", a: "Yes. Our engine completely scrubs the underlying character vectors from the PDF code stream." },
      { q: "Is sensitive customer data sent to a cloud server?", a: "No! Pattern matching and redaction run 100% locally inside your web browser." }
    ],
    crossLink: { href: "/redact-pdf", label: "Want to manually black out custom text? Try Redact PDF." }
  },
  tr: {
    title: "Otomatik PDF Sansürleme (KVKK)",
    description: "PDF belgelerindeki T.C. Kimlik No, Kredi Kartı, Telefon ve E-posta bilgilerini otomatik tespit edip kalıcı olarak karartın.",
    keywords: "otomatik tc sansürleme, kvkk pdf temizleme, kredi kartı karartma pdf, otomatik pdf sansürleyici, pii gizleme",
    h1: "Otomatik PDF Sansürleme (KVKK)",
    tagline: "T.C. Kimlik Numarası, IBAN, kredi kartı ve e-posta gibi hassas KVKK verilerini tek tıkla otomatik bulup kalıcı karartın.",
    howToName: "PDF belgesindeki kişisel veriler otomatik nasıl sansürlenir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Hassas Belgeyi Yükleyin", text: "Gizlenmesi gereken müşteri veya personel evrakını seçin." },
      { name: "Gizlenecek Veri Tipini Seçin", text: "T.C. Kimlik, Kredi Kartı, Telefon veya E-posta kalıplarını işaretleyin." },
      { name: "Sansürlenmiş PDF'i İndirin", text: "Tüm hassas verilerin kalıcı siyah şeritle örtüldüğü güvenli PDF'i indirin." }
    ],
    faq: [
      { q: "KVKK ve GDPR uyumlu mu?", a: "Evet! Veriler siyah kutuların arkasından kopyalanamayacak şekilde dosyadan tamamen kazınır." },
      { q: "Müşteri bilgilerim internete yüklenir mi?", a: "Kesinlikle hayır! Tarama işlemi tamamen tarayıcınızın içinde yerel çalışır." }
    ],
    crossLink: { href: "/tr/redact-pdf", label: "Elle serbest seçimle karartma yapmak için PDF Sansürle aracını deneyin." }
  },
};
export const smartMarkdownCopy = {
  en: {
    title: "Smart PDF to Markdown (AI)",
    description: "Convert complex PDF documents into structured, LLM-ready Markdown (.md) with table and header hierarchy recognition.",
    keywords: "pdf to markdown ai, convert pdf to md, smart pdf markdown converter, rag pdf to markdown, llm ready pdf parser",
    h1: "Smart PDF to Markdown",
    tagline: "Structure headings, preserve data tables, and extract clean, readable Markdown syntax from complex PDF layouts.",
    howToName: "How to convert PDF to structured Markdown",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Document", text: "Select the PDF book, research paper, or report." },
      { name: "Smart Extraction", text: "Our layout engine analyzes font weights and spacing to detect H1-H6 headers and tables." },
      { name: "Download Markdown", text: "Download your clean .md file formatted perfectly for Obsidian, Notion, or AI models." }
    ],
    faq: [
      { q: "Is this optimized for LLMs and AI pipelines?", a: "Yes! Clean Markdown headers (#, ##), bullet points, and tables (|---|) maximize semantic understanding for AI RAG systems." },
      { q: "Are tables converted to Markdown format?", a: "Yes, tabular data is structured into standard GitHub-flavored Markdown grid tables." }
    ],
    crossLink: { href: "/extract-text", label: "Need raw unformatted text instead? Try Extract Text." }
  },
  tr: {
    title: "Akıllı PDF'ten Markdown Yapıcı (Yapay Zeka)",
    description: "Karmaşık PDF belgelerini başlık hiyerarşisi (#, ##) ve tablolarıyla birlikte yapay zeka dostu Markdown (.md) formatına dönüştürün.",
    keywords: "pdf markdown yapma, pdf to md ai, yapay zeka için pdf metne çevirme, obsidian pdf markdown, notion pdf aktarma",
    h1: "Akıllı PDF'ten Markdown Yapıcı",
    tagline: "Başlıkları (#, ##), listeleri ve tabloları akıllıca algılayarak PDF'lerinizi Notion, Obsidian ve LLM'ler için kusursuz Markdown'a çevirin.",
    howToName: "PDF belgesi akıllı Markdown formatına nasıl çevrilir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "Dönüştürmek istediğiniz makale veya raporu seçin." },
      { name: "Akıllı Yapılandırma", text: "Sistemimiz başlık büyüklüklerini ve tabloları analiz ederek Markdown sözdizimine döker." },
      { name: "Markdown Dosyasını İndirin", text: "Obsidian veya Notion'da doğrudan kullanabileceğiniz .md dosyasını indirin." }
    ],
    faq: [
      { q: "Yapay zeka (ChatGPT/Claude/RAG) sistemleri için neden Markdown?", a: "Markdown, başlık ve tablo yapısını koruduğu için yapay zeka modelleri tarafından en yüksek doğrulukla anlaşılan formattır." },
      { q: "Tablolar düzgün çevrilir mi?", a: "Evet! PDF'teki tablolar standart GitHub Markdown tablo formatına (|---|) dönüştürülür." }
    ],
    crossLink: { href: "/tr/extract-text", label: "Düz metin almak istiyorsanız PDF'ten Metin Çıkarma aracını deneyin." }
  },
};

export const contrastEnhancerCopy = {
  en: {
    title: "PDF Contrast Enhancer",
    description: "Enhance faded text, darken washed-out scans, and increase contrast of poorly scanned PDF files online for free.",
    keywords: "enhance pdf contrast, darken faded pdf text, fix light scan pdf, sharpen scanned document, boost pdf readability",
    h1: "PDF Contrast Enhancer",
    tagline: "Darken faint text and increase sharpness on old or low-quality document scans for crystal-clear readability.",
    howToName: "How to enhance PDF contrast and darken text",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Faded Scan", text: "Select the light, washed-out PDF document." },
      { name: "Adjust Contrast Level", text: "Boost contrast and adjust black-point threshold to sharpen text strokes." },
      { name: "Download Sharpened PDF", text: "Save your clean, high-contrast readable PDF." }
    ],
    faq: [
      { q: "Can it fix faint photocopy scans?", a: "Yes! The contrast enhancer recalibrates gamma and pixel luminance to turn light gray text into bold black." },
      { q: "Is file size increased?", a: "No, optimizing contrast often reduces background noise and compression artifacts." }
    ],
    crossLink: { href: "/ocr-pdf", label: "Want to extract text from the scan? Try OCR PDF." }
  },
  tr: {
    title: "PDF Kontrast Artırıcı (Soluk Yazı Düzeltme)",
    description: "Soluk çıkmış fotokopileri, silik taranmış evrakları ve açık gri yazıları koyulaştırarak netleştirin. Ücretsiz netleştirici.",
    keywords: "pdf kontrast artırma, silik pdf koyulaştırma, soluk fotokopi netleştirme, taranmış evrakı belirginleştirme",
    h1: "PDF Kontrast Artırıcı",
    tagline: "Okunması zor olan silik fotokopileri ve soluk taranmış evrakları koyulaştırıp pırıl pırıl, net bir hale getirin.",
    howToName: "Silik taranmış PDF yazıları nasıl koyulaştırılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Silik Belgeyi Yükleyin", text: "Yazıları soluk olan PDF dosyasını seçin." },
      { name: "Kontrast Ayarını Yükseltin", text: "Koyulaştırma seviyesini ayarlayarak harflerin belirginleşmesini sağlayın." },
      { name: "Netleşmiş PDF'i İndirin", text: "Okunabilirliği artırılmış net belgenizi bilgisayarınıza kaydedin." }
    ],
    faq: [
      { q: "Eski dilekçe ve kimlik fotokopilerinde işe yarar mı?", a: "Evet! Gri tonlu gürültüyü temizleyip soluk harfleri koyu siyaha çevirerek evrakları okunur kılar." },
      { q: "Yazıcıdan çıktı alırken faydası olur mu?", a: "Kesinlikle. Silik sayfaları koyulaştırıp bastığınızda yazıcıdan çok daha net çıktılar alırsınız." }
    ],
    crossLink: { href: "/tr/ocr-pdf", label: "Belgedeki yazıları kopyalamak istiyorsanız PDF OCR aracını kullanın." }
  },
};

export const pdfToHtmlCopy = {
  en: {
    title: "PDF to HTML",
    description: "Convert PDF documents into clean, responsive HTML web pages online for free. Preserves layout, fonts, and images.",
    keywords: "pdf to html, convert pdf to webpage, pdf to html5 converter, extract html from pdf, pdf to responsive html",
    h1: "PDF to HTML",
    tagline: "Turn your PDF documents into responsive HTML web pages with clean CSS styling. Publish PDF content directly to the web.",
    howToName: "How to convert a PDF into an HTML web page",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the document you want to publish as a web page." },
      { name: "Convert to HTML", text: "Our engine maps paragraphs, font styles, and images into clean HTML5 markup." },
      { name: "Download HTML", text: "Download your ready-to-publish HTML and CSS package." }
    ],
    faq: [
      { q: "Is the generated HTML mobile-friendly?", a: "Yes, text reflows and scales cleanly for desktop and mobile screens." },
      { q: "Are embedded images included?", a: "Yes, images are exported or encoded inline as data URIs within the HTML structure." }
    ],
    crossLink: { href: "/html-to-pdf", label: "Want to do the reverse (HTML to PDF)? Try HTML to PDF." }
  },
  tr: {
    title: "PDF'ten HTML'e Çevirme (Web Sayfası)",
    description: "PDF belgelerinizi internette yayınlanabilir temiz HTML5 ve CSS web sayfası kodlarına dönüştürün. Ücretsiz ve pratik.",
    keywords: "pdf to html, pdf i web sitesi yapma, pdf html dönüştürücü, pdf den web sayfası oluşturma",
    h1: "PDF'ten HTML'e Çevirme",
    tagline: "PDF dökümanlarınızı web sitenize doğrudan ekleyebileceğiniz temiz HTML ve CSS kodlarına dönüştürün.",
    howToName: "PDF belgesi nasıl HTML web sayfasına dönüştürülür?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Dosyanızı Seçin", text: "Web sayfası haline getirmek istediğiniz PDF belgesini yükleyin." },
      { name: "HTML5 Dönüşümü", text: "Sistemimiz yazıları ve resimleri temiz web kodlarına dönüştürür." },
      { name: "HTML Dosyasını İndirin", text: "Web sitenize yüklemeye hazır HTML kodlarınızı indirin." }
    ],
    faq: [
      { q: "Mobil cihazlarla uyumlu mu?", a: "Evet! Oluşturulan HTML kodları telefon ve bilgisayar ekranlarına uyum sağlar." },
      { q: "İçindeki fotoğraflar kaybolur mu?", a: "Hayır, fotoğraflar HTML kodunun içine eksiksiz olarak gömülür." }
    ],
    crossLink: { href: "/tr/html-to-pdf", label: "Tam tersini yapıp HTML kodunu PDF yapmak için HTML'den PDF'e aracını deneyin." }
  },
};
export const extractFontsCopy = {
  en: {
    title: "Extract PDF Fonts",
    description: "Identify and extract embedded TTF, OTF, and WOFF font files from PDF documents online for free. Typography inspector.",
    keywords: "extract fonts from pdf, what font is in pdf, download pdf fonts, extract ttf from pdf, pdf font finder",
    h1: "Extract PDF Fonts",
    tagline: "Identify font families used in any PDF document and extract embedded TrueType (TTF) and OpenType (OTF) font files.",
    howToName: "How to extract and identify fonts from a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file whose typography you want to inspect." },
      { name: "Inspect Typefaces", text: "Our parser lists every embedded font name, encoding, and format." },
      { name: "Download Fonts", text: "Download extracted embedded font files to your computer." }
    ],
    faq: [
      { q: "Can subsetted fonts be extracted?", a: "Our tool extracts embedded font descriptors and subsetted glyph programs where permissible." },
      { q: "Is font identification accurate?", a: "Yes, PostScript font names and internal font dictionaries are read directly from the PDF catalog." }
    ],
    crossLink: { href: "/extract-colors", label: "Want to extract color palettes too? Try Extract Colors." }
  },
  tr: {
    title: "PDF Yazı Tiplerini Çıkar (Font Bulucu)",
    description: "PDF belgelerinde hangi fontların (yazı tiplerinin) kullanıldığını öğrenin ve gömülü TTF/OTF font dosyalarını indirin.",
    keywords: "pdf font bulma, pdf te hangi yazı tipi kullanılmış, pdf font çıkarma, pdf yazı fontunu öğrenme, ttf çıkarma",
    h1: "PDF Yazı Tiplerini Çıkar",
    tagline: "Beğendiğiniz bir PDF tasarımında hangi fontların kullanıldığını anında tespit edin ve gömülü yazı tipi dosyalarını bilgisayarınıza indirin.",
    howToName: "PDF içindeki yazı tipleri ve fontlar nasıl bulunur?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "Fontlarını öğrenmek istediğiniz PDF dosyasını seçin." },
      { name: "Yazı Tiplerini Tara", text: "Aracımız belgedeki tüm gömülü font isimlerini ve formatlarını listeler." },
      { name: "Fontları İndirin", text: "Gömülü TTF veya OTF font dosyalarını bilgisayarınıza kaydedin." }
    ],
    faq: [
      { q: "Hangi font olduğunu kesin söyler mi?", a: "Evet! PDF'in teknik başlıklarına bakarak fontun tam adını (örn: Helvetica Bold, Roboto) kesin olarak gösterir." },
      { q: "Gömülü fontları bilgisayarıma kurabilir miyim?", a: "Belgeye tam gömülmüş (embedded) fontları indirip bilgisayarınıza yazı tipi olarak yükleyebilirsiniz." }
    ],
    crossLink: { href: "/tr/extract-colors", label: "Renk paletini de çıkarmak için PDF Renk Paleti Çıkarıcı aracını deneyin." }
  },
};

export const removeImagesCopy = {
  en: {
    title: "Remove Images from PDF",
    description: "Strip and delete all embedded raster images and photos from PDF files online for free. Produce text-only documents.",
    keywords: "remove images from pdf, delete all photos in pdf, text only pdf, strip pictures from pdf, ink saver pdf",
    h1: "Remove Images from PDF",
    tagline: "Purge all photos, banners, and bitmap graphics from your PDF documents to drastically reduce file size and save printing ink.",
    howToName: "How to remove all images from a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the image-heavy PDF file you want to convert to text-only." },
      { name: "Strip Images", text: "Our tool purges all XObject raster image streams while preserving text and layout." },
      { name: "Download Clean PDF", text: "Save your ultra-lightweight text-only PDF file." }
    ],
    faq: [
      { q: "Will text and formatting be preserved?", a: "Yes! All fonts, typography, tables, and vector layout lines remain 100% intact; only pixel photos are removed." },
      { q: "Does this drastically reduce file size?", a: "Yes, stripping heavy images often shrinks documents by 80% to 95%." }
    ],
    crossLink: { href: "/remove-text", label: "Want to do the opposite (remove all text)? Try Remove Text." }
  },
  tr: {
    title: "PDF'teki Tüm Resimleri Sil (Salt Metin)",
    description: "PDF belgelerindeki tüm fotoğrafları ve görselleri silerek salt metin haline getirin. Dosya boyutunu küçültün ve mürekkep tasarrufu yapın.",
    keywords: "pdf teki resimleri silme, pdf fotoğrafları kaldırma, salt metin pdf yapma, yazıcı dostu pdf resimsiz",
    h1: "PDF'teki Tüm Resimleri Sil",
    tagline: "Ağır görselleri, reklamları ve fotoğrafları belgenizden temizleyin. Yalnızca yazıları bırakarak dosya boyutunu %90 düşürün.",
    howToName: "PDF içindeki tüm fotoğraflar nasıl silinir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Görselli Belgeyi Yükleyin", text: "İçindeki fotoğrafları silmek istediğiniz PDF dosyasını seçin." },
      { name: "Görselleri Temizle", text: "Aracımız tüm raster görsel akışlarını belgeden ayıklar." },
      { name: "Salt Metin PDF'i İndirin", text: "Fotoğraflardan arındırılmış hafif ve temiz PDF'inizi indirin." }
    ],
    faq: [
      { q: "Yazılar ve tablolar silinir mi?", a: "Hayır! Tüm yazılar, fontlar ve sayfa düzeni aynen korunur; sadece fotoğraf ve resimler silinir." },
      { q: "Baskı alırken mürekkep tasarrufu sağlar mı?", a: "Evet! Arka plan resimlerini ve fotoğrafları silerek yazıcı tonerinden devasa tasarruf edebilirsiniz." }
    ],
    crossLink: { href: "/tr/remove-text", label: "Yazıları silip sadece görselleri bırakmak için PDF'teki Tüm Yazıları Sil aracını deneyin." }
  },
};

export const extractUrlsCopy = {
  en: {
    title: "Extract URLs from PDF",
    description: "Extract and list all clickable hyperlinks, web URLs, and email addresses from PDF files online for free.",
    keywords: "extract urls from pdf, get links from pdf, list all links in pdf, export hyperlinks pdf, extract email addresses pdf",
    h1: "Extract URLs from PDF",
    tagline: "Extract all clickable hyperlinks, web references, and email addresses from your PDF documents in one organized list.",
    howToName: "How to extract all links and URLs from a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file containing web links and resources." },
      { name: "Scan Annotations", text: "Our parser detects URI link annotations and plain-text URLs across all pages." },
      { name: "Export Link List", text: "Copy the extracted URLs or download them as a clean text file." }
    ],
    faq: [
      { q: "Does it find both clickable links and plain text URLs?", a: "Yes, it parses active PDF link annotations as well as unlinked http/https web addresses in text." },
      { q: "Can I export as CSV?", a: "Yes, you can copy the list with page numbers for easy auditing." }
    ],
    crossLink: { href: "/extract-text", label: "Want to extract full document text? Try Extract Text." }
  },
  tr: {
    title: "PDF Linklerini ve URL'leri Çıkar",
    description: "PDF belgelerinin içindeki tüm tıklanabilir web bağlantılarını, internet sitelerini ve e-posta adreslerini tek bir listede toplayın.",
    keywords: "pdf link çıkarma, pdf teki linkleri bulma, pdf url ayıklama, pdf web sitelerini listeleme, pdf link toplayıcı",
    h1: "PDF Linklerini ve URL'leri Çıkar",
    tagline: "Makale, katalog ve raporların içindeki tüm web sitesi linklerini ve kaynak bağlantılarını tek tıkla toplu liste halinde çıkarın.",
    howToName: "PDF içindeki tüm web bağlantıları nasıl listelenir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "İçinde bağlantılar olan PDF dosyasını seçin." },
      { name: "Bağlantıları Tara", text: "Sistemimiz sayfadaki tüm tıklanabilir linkleri ve internet adreslerini ayıklar." },
      { name: "Link Listesini İndirin", text: "Tüm bağlantıların sayfa numaralarıyla listelendiği dosyayı kopyalayın veya indirin." }
    ],
    faq: [
      { q: "Tıklanamayan düz metin linkleri de bulur mu?", a: "Evet! Hem tıklanabilir mavi linkleri hem de metin olarak yazılmış 'www...' veya 'http...' adreslerini yakalar." },
      { q: "Hangi sayfada olduğu yazar mı?", a: "Evet, her linkin belgenin kaçıncı sayfasında yer aldığı yanında belirtilir." }
    ],
    crossLink: { href: "/tr/extract-text", label: "Tüm metinleri almak istiyorsanız PDF'ten Metin Çıkarma aracını kullanın." }
  },
};

export const removeDuplicatesCopy = {
  en: {
    title: "Remove Duplicate Pages",
    description: "Automatically detect and remove duplicate or identical pages from PDF documents online for free.",
    keywords: "remove duplicate pages from pdf, delete duplicate pdf pages, find identical pages in pdf, clean duplicate scans",
    h1: "Remove Duplicate Pages",
    tagline: "Scan multi-page documents to automatically detect identical or repeated pages from accidental double scanning.",
    howToName: "How to remove duplicate pages from a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the document containing repeated or duplicate pages." },
      { name: "Scan for Duplicates", text: "Our algorithm calculates content hashes and visual similarity across all pages." },
      { name: "Download Unique PDF", text: "Download your streamlined PDF file with all duplicate sheets removed." }
    ],
    faq: [
      { q: "How are duplicate pages detected?", a: "Our tool compares character streams and visual raster hashes to accurately identify identical pages without false positives." },
      { q: "Is the first occurrence of the page preserved?", a: "Yes, the original first occurrence is kept, and only subsequent exact duplicates are removed." }
    ],
    crossLink: { href: "/remove-pages", label: "Want to manually select specific pages to delete? Try Remove Pages." }
  },
  tr: {
    title: "PDF Çift Sayfaları Sil (Yinelenen)",
    description: "PDF dosyalarınızdaki birbirinin aynısı olan mükerrer (çift) sayfaları otomatik olarak tespit edip temizleyin.",
    keywords: "pdf çift sayfaları silme, yinelenen sayfaları kaldırma, mükerrer pdf sayfa silici, aynı sayfaları sil pdf",
    h1: "PDF Çift Sayfaları Sil",
    tagline: "Yanlışlıkla iki kere taranmış veya tekrarlayan aynı sayfaları otomatik analizle bulun ve belgenizden ayıklayın.",
    howToName: "PDF belgesindeki aynı (mükerrer) sayfalar nasıl silinir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "İçinde mükerrer sayfalar olan PDF dosyasını seçin." },
      { name: "Çift Sayfaları Tara", text: "Sistemimiz sayfaları karşılaştırarak birebir aynı olanları işaretler." },
      { name: "Tekil PDF'i İndirin", text: "Tekrarlayan sayfalardan arındırılmış temiz belgenizi cihazınıza indirin." }
    ],
    faq: [
      { q: "Sayfanın ilk kopyası korunur mu?", a: "Evet! Sayfanın orijinal ilk hali korunur, yalnızca sonradan tekrar eden kopyaları silinir." },
      { q: "Çok benzer ama farklı sayfalar silinir mi?", a: "Hayır. Yalnızca içeriği %100 birebir aynı olan mükerrer sayfalar temizlenir." }
    ],
    crossLink: { href: "/tr/remove-pages", label: "Sayfaları elle tek tek silmek için PDF Sayfa Silme aracını deneyin." }
  },
};
export const extractAttachmentsCopy = {
  en: {
    title: "Extract PDF Attachments",
    description: "Extract and download all embedded file attachments (ZIP, XML, images, audio) from PDF documents online for free.",
    keywords: "extract pdf attachments, download files from pdf, extract embedded files pdf, get pdf attachment, save pdf files",
    h1: "Extract PDF Attachments",
    tagline: "Unpack embedded files, invoices, XML schemas, and audio attachments packaged inside your PDF documents.",
    howToName: "How to extract attachments from a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file containing embedded attachments." },
      { name: "List Files", text: "Our tool parses the embedded file tree and lists every attached asset." },
      { name: "Download Attachments", text: "Download all embedded files individually or packed in a single ZIP." }
    ],
    faq: [
      { q: "What types of attachments can be extracted?", a: "Any file type embedded in the PDF: XML e-invoices (ZUGFeRD/Factur-X), ZIP archives, Word docs, spreadsheets, or images." },
      { q: "Is it safe to unpack confidential attachments?", a: "Yes, file extraction happens entirely client-side without sending attachment data across the web." }
    ],
    crossLink: { href: "/extract-images", label: "Need embedded page images instead? Try Extract Images." }
  },
  tr: {
    title: "PDF Dosya Eklerini Çıkar (Ekler)",
    description: "PDF dosyalarının içine gömülmüş e-fatura XML dosyalarını, ZIP arşivlerini ve ek belgeleri tek tıkla bilgisayarınıza indirin.",
    keywords: "pdf eklerini çıkarma, pdf dosya eki indir, e fatura xml çıkarma, pdf içine gömülü dosyaları alma",
    h1: "PDF Dosya Eklerini Çıkar",
    tagline: "PDF içerisine gömülmüş e-fatura XML dosyalarını, sözleşme eklerini ve sıkıştırılmış dosyaları kolayca ayıklayın.",
    howToName: "PDF içindeki gömülü dosya ekleri nasıl indirilir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Ekli Belgeyi Yükleyin", text: "İçinde dosya eki bulunan PDF belgesini seçin." },
      { name: "Ekleri Listele", text: "Aracımız belgedeki tüm gömülü dosyaları tespit edip listeler." },
      { name: "Ekleri İndirin", text: "İstediğiniz dosyayı tek tek veya tüm ekleri ZIP olarak indirin." }
    ],
    faq: [
      { q: "E-Fatura XML dosyalarını çıkarabilir mi?", a: "Evet! UBL-TR ve ZUGFeRD standartlarındaki e-fatura PDF'lerinin içindeki orijinal XML verisini anında ayıklar." },
      { q: "Hangi dosya türlerini destekler?", a: "Word, Excel, ZIP, ses, görsel veya PDF içine eklenmiş her türlü dosya formatını başarıyla çıkarır." }
    ],
    crossLink: { href: "/tr/extract-images", label: "Sayfadaki fotoğrafları almak için PDF'ten Görselleri Çıkar aracını deneyin." }
  },
};

export const extractColorsCopy = {
  en: {
    title: "Extract PDF Color Palette",
    description: "Extract dominant color palettes, brand colors, and HEX/RGB codes from PDF designs and brochures online for free.",
    keywords: "extract colors from pdf, pdf color palette generator, get hex codes from pdf, brand colors pdf extractor",
    h1: "Extract PDF Color Palette",
    tagline: "Analyze PDF artwork and brand guidelines to extract dominant HEX, RGB, and CMYK color palettes in seconds.",
    howToName: "How to extract a color palette from a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the design brochure, brand guideline, or presentation." },
      { name: "Analyze Swatches", text: "Our algorithm clusters vector fills, text colors, and image swatches." },
      { name: "Copy HEX Codes", text: "Copy color HEX values or export the full palette swatch sheet." }
    ],
    faq: [
      { q: "Can I use these colors in Figma/Photoshop?", a: "Yes, you can copy the exact HEX codes (#FFFFFF) directly into design applications." },
      { q: "Does it detect vector fill colors?", a: "Yes, it parses vector fills, strokes, and dominant raster image colors." }
    ],
    crossLink: { href: "/extract-fonts", label: "Want to identify typography too? Try Extract Fonts." }
  },
  tr: {
    title: "PDF Renk Paleti Çıkarıcı (HEX Kodları)",
    description: "PDF katalog ve tasarımlarındaki kurumsal renk paletlerini, baskı renklerini ve HEX/RGB kodlarını tek tıkla çıkarın.",
    keywords: "pdf renk paleti bulma, pdf hex kodu alma, kurumsal renkleri çıkarma, pdf renk analizi, tasarım renkleri pdf",
    h1: "PDF Renk Paleti Çıkarıcı",
    tagline: "Katalog, logo ve broşürlerdeki baskı renklerini analiz edin. Tasarımcılar için birebir HEX ve RGB kodlarını anında kopyalayın.",
    howToName: "PDF tasarımından renk kodları (HEX) nasıl alınır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Tasarım PDF'ini Yükleyin", text: "Renklerini öğrenmek istediğiniz PDF broşürünü seçin." },
      { name: "Renkleri Analiz Et", text: "Sistemimiz sayfadaki hakim renkleri ve vektör tonlarını ayıklar." },
      { name: "HEX Kodlarını Kopyalayın", text: "Figma ve Photoshop'ta kullanmak için renk kodlarını tek tıkla kopyalayın." }
    ],
    faq: [
      { q: "Tasarımcılar için ne fayda sağlar?", a: "Müşterinin gönderdiği PDF kılavuzundaki tam kurumsal renk kodlarını saniyeler içinde almanızı sağlar." },
      { q: "HEX ve RGB değerleri doğru çıkar mı?", a: "Evet! PDF içindeki vektör dolguları taranarak %100 birebir renk değerleri verilir." }
    ],
    crossLink: { href: "/tr/extract-fonts", label: "Yazı tiplerini de öğrenmek istiyorsanız PDF Yazı Tiplerini Çıkar aracını kullanın." }
  },
};

export const removeTextCopy = {
  en: {
    title: "Remove Text from PDF",
    description: "Strip all readable text layers from PDF documents online for free. Keep only pictures, diagrams, and artwork.",
    keywords: "remove text from pdf, delete text layer pdf, image only pdf, strip words from pdf, make pdf pictures only",
    h1: "Remove Text from PDF",
    tagline: "Erase all typography and text content while preserving embedded photos, illustrations, and background artwork.",
    howToName: "How to remove all text from a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the document whose text you want to erase." },
      { name: "Strip Text Streams", text: "Our parser removes all font glyphs and text rendering commands." },
      { name: "Download Image-Only PDF", text: "Save your clean PDF containing only visual graphics and photos." }
    ],
    faq: [
      { q: "Why remove text from a PDF?", a: "It is ideal for extracting pure visual artwork, coloring pages, architectural drawings, or stripping confidential text." },
      { q: "Are vector drawings preserved?", a: "Yes, non-text vector paths and raster images are completely untouched." }
    ],
    crossLink: { href: "/remove-images", label: "Want to remove images instead? Try Remove Images." }
  },
  tr: {
    title: "PDF'teki Tüm Yazıları Sil (Salt Görsel)",
    description: "PDF belgelerindeki tüm yazıları ve metin katmanlarını silerek geriye sadece çizimleri ve fotoğrafları bırakın.",
    keywords: "pdf yazılarını silme, pdf metin katmanını temizleme, sadece resim kalsın pdf, boyama sayfası pdf metin sil",
    h1: "PDF'teki Tüm Yazıları Sil",
    tagline: "Belgedeki tüm yazıları ve başlıkları temizleyin; mimari çizimleri, fotoğrafları ve grafik şablonlarını saf halde tutun.",
    howToName: "PDF içindeki tüm yazılar nasıl silinir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "Yazılarını silmek istediğiniz PDF dosyasını seçin." },
      { name: "Metinleri Temizle", text: "Sistemimiz tüm karakter ve yazı komutlarını belgeden kaldırır." },
      { name: "Salt Görsel PDF'i İndirin", text: "Yazısız, sadece görsellerden oluşan yeni belgenizi indirin." }
    ],
    faq: [
      { q: "Mimari çizimler ve boyama sayfaları için uygun mu?", a: "Evet! Çizimlerin üzerindeki ölçü ve açıklamaları silerek temiz şablonlar elde etmek için idealdir." },
      { q: "Fotoğraflar silinir mi?", a: "Hayır! Tüm fotoğraf ve şekiller orijinal yerinde korunur, yalnızca yazılar temizlenir." }
    ],
    crossLink: { href: "/tr/remove-images", label: "Resimleri silip sadece yazıları bırakmak için PDF'teki Tüm Resimleri Sil aracını kullanın." }
  },
};

export const extractJavascriptCopy = {
  en: {
    title: "Extract PDF JavaScript",
    description: "Audit, inspect, and extract embedded JavaScript code from PDF documents online for free. Security analysis tool.",
    keywords: "extract javascript from pdf, inspect pdf js, pdf malware analysis, detect pdf scripts, security audit pdf",
    h1: "Extract PDF JavaScript",
    tagline: "Inspect embedded Acrobat JavaScript code, action triggers, and form scripts to audit document security and safety.",
    howToName: "How to extract and audit JavaScript in a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file you want to audit for embedded scripts." },
      { name: "Inspect Scripts", text: "Our parser scans document open actions, form field triggers, and script dictionaries." },
      { name: "Review Code", text: "View and copy all extracted JavaScript code blocks securely in a sandbox." }
    ],
    faq: [
      { q: "Why check for JavaScript in PDFs?", a: "Malicious PDFs often use embedded JavaScript for exploits. Checking scripts lets you verify document safety before opening in desktop readers." },
      { q: "Is the JavaScript executed?", a: "No! The code is statically extracted and displayed as inert text without executing in your browser." }
    ],
    crossLink: { href: "/sanitize-pdf", label: "Want to strip all scripts automatically? Try Sanitize PDF." }
  },
  tr: {
    title: "PDF JavaScript Kodlarını Ayıkla (Güvenlik)",
    description: "PDF belgelerinin içine gömülmüş JavaScript kodlarını, form makrolarını ve şüpheli yazılımları güvenle inceleyin ve ayıklayın.",
    keywords: "pdf javascript çıkarma, pdf virüs analizi, zararlı pdf kod kontrolü, pdf script ayıklama, siber güvenlik pdf",
    h1: "PDF JavaScript Kodlarını Ayıkla",
    tagline: "PDF içerisindeki gizli form betiklerini, otomatik açılış kodlarını ve güvenlik risklerini çalıştırmadan güvenle inceleyin.",
    howToName: "PDF içindeki JavaScript kodları nasıl incelenir ve çıkarılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Şüpheli PDF'i Yükleyin", text: "İçinde kod olduğundan şüphelendiğiniz PDF dosyasını seçin." },
      { name: "Statik Analiz", text: "Sistemimiz belgeyi çalıştırmadan içindeki tüm JavaScript kod bloklarını tarar." },
      { name: "Kodları İnceleyin", text: "Bulunan tüm betikleri güvenli bir şekilde ekranda inceleyin veya dışa aktarın." }
    ],
    faq: [
      { q: "PDF dosyalarında virüs veya zararlı kod olabilir mi?", a: "Evet, bazı zararlı PDF'ler arka planda çalışan JavaScript kodları barındırabilir. Bu araç kodu çalıştırmadan metin olarak görmenizi sağlar." },
      { q: "Kodlar bilgisayarıma zarar verir mi?", a: "Hayır! Kodlar kesinlikle çalıştırılmaz; yalnızca zararsız düz metin olarak ekranda gösterilir." }
    ],
    crossLink: { href: "/tr/sanitize-pdf", label: "Tüm zararlı kodları ve izleri tek tıkla silmek için PDF Meta Veri Temizle aracını kullanın." }
  },
};

export const splitBookmarksCopy = {
  en: {
    title: "Split PDF by Bookmarks (Chapters)",
    description: "Automatically split a large PDF book or catalog into separate chapter files based on embedded Table of Contents bookmarks.",
    keywords: "split pdf by bookmarks, split pdf by chapter, split ebook by toc, split document by outline, bookmark chapter splitter",
    h1: "Split PDF by Bookmarks",
    tagline: "Automatically carve books, manuals, and reports into separate PDF files for every major chapter bookmark.",
    howToName: "How to split a PDF by bookmarks and chapters",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF with Bookmarks", text: "Select the ebook or manual containing bookmark outlines." },
      { name: "Select Bookmark Level", text: "Choose which bookmark hierarchy level (e.g. Top-level Chapters) to split on." },
      { name: "Download Chapter Files", text: "Download all individual chapter PDFs neatly named and organized in a ZIP archive." }
    ],
    faq: [
      { q: "Are output files named after chapters?", a: "Yes! Each split PDF file is automatically named using the title of its corresponding bookmark." },
      { q: "What if my PDF doesn't have bookmarks?", a: "If your file has no embedded bookmark catalog, use our Split by Page Count or Split by Size tools instead." }
    ],
    crossLink: { href: "/extract-toc", label: "Want to view the bookmark outline first? Try Extract Table of Contents." }
  },
  tr: {
    title: "PDF'i Yer İmlerine (Bölümlere) Göre Böl",
    description: "PDF kitaplarını ve raporlarını içindekiler tablosundaki yer imlerine göre otomatik olarak bölüm bölüm ayrı dosyalara bölün.",
    keywords: "yer imlerine göre pdf bölme, pdf kitap bölümlere ayırma, fihriste göre pdf kesme, bölüm bölüm pdf yapma",
    h1: "PDF'i Yer İmlerine Göre Böl",
    tagline: "Yüzlerce sayfalık e-kitapları ve kullanım kılavuzlarını her bir ana bölüm başlığına (yer imine) göre otomatik ayrı dosyalara ayırın.",
    howToName: "PDF kitapları bölümlerine göre nasıl ayrılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Kitap PDF'ini Yükleyin", text: "İçinde yer imleri bulunan PDF kitabını seçin." },
      { name: "Bölüm Seviyesini Belirleyin", text: "Hangi ana başlık seviyesinden bölüneceğini seçin." },
      { name: "Bölüm Dosyalarını İndirin", text: "Her bölümün kendi başlığıyla adlandırıldığı ayrı PDF'leri ZIP olarak indirin." }
    ],
    faq: [
      { q: "Dosya adları bölüm ismi mi olur?", a: "Evet! Her ayrılan PDF dosyası otomatik olarak ilgili bölümün adını (örn: 'Bölüm 1 - Giriş.pdf') alır." },
      { q: "Yer imi olmayan dosyalarda çalışır mı?", a: "Yer imi yoksa 'PDF Böl' veya 'Boyuta Göre Böl' araçlarımızı kullanabilirsiniz." }
    ],
    crossLink: { href: "/tr/extract-toc", label: "Önce içindekiler tablosunu görmek için İçindekileri Çıkar aracını deneyin." }
  },
};

export const splitBlankCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Split PDF by Blank Page",
    description: "Automatically split a continuous batch of scanned documents into separate files wherever a blank separator page is detected.",
    keywords: "split pdf by blank page, batch scan separator, split on blank page, scan barcode separator pdf, split batch scans",
    h1: "Split PDF by Blank Page",
    tagline: "Use blank divider sheets during batch scanning. Our tool automatically splits the batch into separate documents at every blank page.",
    howToName: "How to split batch scans using blank divider pages",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload Batch Scan", text: "Select the single large PDF containing multiple documents separated by blank sheets." },
      { name: "Auto-Detect Dividers", text: "Our analyzer finds blank divider pages and creates split boundary markers." },
      { name: "Download Separate PDFs", text: "Download all distinct documents extracted from the batch into a single ZIP file." }
    ],
    faq: [
      { q: "How do blank separator sheets work?", a: "In high-volume office scanning, inserting a blank sheet between different paper documents allows this tool to automatically split them into separate files." },
      { q: "Are the blank divider sheets kept in the output?", a: "No, the blank divider pages are automatically discarded so your final documents are clean." }
    ],
    crossLink: { href: "/remove-blank-pages", label: "Want to just delete blank pages without splitting? Try Remove Blank Pages." }
  },
  tr: {
    title: "Boş Sayfaya Göre PDF Böl",
    description: "Toplu taranmış evrakları aralarına koyduğunuz boş ayraç sayfalarını tespit ederek otomatik olarak ayrı dosyalara bölün.",
    keywords: "boş sayfaya göre pdf bölme, toplu tarama ayırıcı, boş kağıtla evrak bölme, otomatik dosya ayırıcı pdf",
    h1: "Boş Sayfaya Göre PDF Böl",
    tagline: "Toplu evrak taramalarında araya koyduğunuz boş beyaz kağıtları ayraç olarak kullanın; sistem belgeleri otomatik ayrı dosyalara bölsün.",
    howToName: "Toplu taranmış belgeler boş sayfalarla nasıl ayrılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Toplu Taramayı Yükleyin", text: "Aralarında boş ayraç sayfaları bulunan büyük PDF dosyasını seçin." },
      { name: "Boş Sayfaları Algıla", text: "Sistemimiz ayraç olarak kullanılan boş sayfaları otomatik tespit eder." },
      { name: "Ayrı Belgeleri İndirin", text: "Her evrakın ayrı bir PDF haline getirildiği dosyaları tek tıkla indirin." }
    ],
    faq: [
      { q: "Ofislerde toplu tarama için nasıl kullanılır?", a: "Onlarca farklı faturayı veya sözleşmeyi aralarına birer boş kağıt koyup tek seferde tarayıcıya atabilirsiniz. Bu araç hepsini tek tek faturaya böler." },
      { q: "Araya koyduğum boş kağıtlar çıktı dosyasında kalır mı?", a: "Hayır. Boş ayraç sayfaları otomatik olarak çöpe atılır, elinize sadece temiz evraklar kalır." }
    ],
    crossLink: { href: "/tr/remove-blank-pages", label: "Bölmeden sadece boş sayfaları silmek istiyorsanız Boş Sayfaları Otomatik Sil aracını deneyin." }
  },
};
export const viewerPrefsCopy = {
  en: {
    title: "Edit PDF Viewer Preferences",
    description: "Configure default PDF open behavior: start in full screen, hide toolbars, set single/two-page spread, and zoom levels.",
    keywords: "pdf viewer preferences, set pdf default zoom, hide toolbars pdf, open pdf full screen, pdf display settings",
    h1: "Edit PDF Viewer Preferences",
    tagline: "Control how PDF readers display your document upon opening. Set default page layout, full-screen mode, and zoom level.",
    howToName: "How to configure PDF viewer preferences",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file whose opening display mode you want to customize." },
      { name: "Configure Preferences", text: "Select Two-Page Spread, Fit Window Zoom, Full Screen, or Hide Menubars." },
      { name: "Save Preferences", text: "Download your updated PDF file with embedded viewer preferences." }
    ],
    faq: [
      { q: "Do these settings work in Adobe Reader and Apple Preview?", a: "Yes, standard PDF ViewerPreferences dictionary tags are respected by major desktop readers." },
      { q: "Can I force full-screen presentation mode?", a: "Yes, you can enable 'Open in Full Screen' for presentation slide decks." }
    ],
    crossLink: { href: "/edit-metadata", label: "Want to change title and author info too? Try Edit Metadata." }
  },
  tr: {
    title: "PDF Açılış ve Görünüm Tercihleri",
    description: "PDF dosyanız açıldığında tam ekran başlama, çift sayfa gösterme, menüleri gizleme ve varsayılan yakınlaştırma ayarlarını yapın.",
    keywords: "pdf açılış ayarları, pdf tam ekran açma, pdf varsayılan yakınlaştırma, çift sayfa pdf açılış, pdf görünüm tercihleri",
    h1: "PDF Açılış ve Görünüm Tercihleri",
    tagline: "Belgenizin kullanıcılar tarafından açıldığında nasıl görüneceğini belirleyin. Tam ekran, çift sayfa kitap görünümü veya menü gizleme.",
    howToName: "PDF açılış tercihleri ve görünüm ayarları nasıl yapılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "Görünüm ayarlarını düzenlemek istediğiniz PDF dosyasını seçin." },
      { name: "Açılış Modunu Seçin", text: "Tam Ekran, Yan Yana Çift Sayfa, Sayfayı Ekrana Sığdır gibi seçenekleri belirleyin." },
      { name: "Ayarları Kaydedip İndirin", text: "Açılış tercihleri işlenmiş yeni belgenizi indirin." }
    ],
    faq: [
      { q: "Sunumlar için tam ekran yapılabilir mi?", a: "Evet! 'Tam Ekranda Başlat' seçeneğiyle belgenin bir slayt gibi doğrudan tam ekran açılmasını sağlayabilirsiniz." },
      { q: "Adobe Reader ve telefonda çalışır mı?", a: "Evet, uluslararası PDF ViewerPreferences standardı tüm modern PDF okuyucularda geçerlidir." }
    ],
    crossLink: { href: "/tr/edit-metadata", label: "Başlık ve yazar bilgisini de düzenlemek için PDF Meta Veri Düzenle aracını kullanın." }
  },
};

export const extractHiddenTextCopy = {
  en: {
    title: "Extract Hidden Text from PDF",
    description: "Find and uncover invisible text, OCR layers, white-on-white text, and obscured data in PDF files online for free.",
    keywords: "extract hidden text pdf, find invisible text in pdf, uncover white on white text, pdf hidden layer reader, audit hidden pdf text",
    h1: "Extract Hidden Text from PDF",
    tagline: "Detect invisible OCR layers, white-colored text on white backgrounds, and obscured content hidden in document streams.",
    howToName: "How to extract hidden and invisible text from a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the document you want to audit for hidden or invisible content." },
      { name: "Scan Layers", text: "Our forensic analyzer flags text with zero opacity, hidden render modes, or covered layers." },
      { name: "Review Hidden Content", text: "Inspect and copy all discovered hidden text strings directly." }
    ],
    faq: [
      { q: "Why would a PDF have hidden text?", a: "Scanned PDFs often contain an invisible OCR text layer behind images. Some documents may also contain hidden metadata or whiteout text." },
      { q: "Is this useful for document audits?", a: "Yes, compliance and legal teams use hidden text inspection to ensure sensitive data hasn't been improperly masked." }
    ],
    crossLink: { href: "/sanitize-pdf", label: "Want to permanently wipe hidden data? Try Sanitize PDF." }
  },
  tr: {
    title: "PDF Gizli Metinleri Bul (Görünmeyen Yazılar)",
    description: "PDF belgelerinde beyaz üstüne beyaz yazılmış, gizlenmiş veya görünmez OCR katmanlarında kalmış gizli metinleri ortaya çıkarın.",
    keywords: "pdf gizli metin bulma, görünmeyen yazıları çıkarma, beyaz üstüne beyaz yazı pdf, pdf gizli katman okuyucu",
    h1: "PDF Gizli Metinleri Bul",
    tagline: "Görsellerin arkasında gizlenen OCR yazılarını, saydam metinleri ve maskelenmiş gizli bilgileri tek tıkla tespit edin.",
    howToName: "PDF içindeki gizli ve görünmez yazılar nasıl bulunur?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "İçinde gizli yazı olduğundan şüphelendiğiniz PDF dosyasını seçin." },
      { name: "Gizli Katmanları Tara", text: "Sistemimiz şeffaf, görünmez ve üzeri kapatılmış tüm metinleri analiz eder." },
      { name: "Gizli Yazıları İnceleyin", text: "Ortaya çıkarılan gizli metinleri ekranda okuyun ve kopyalayın." }
    ],
    faq: [
      { q: "Bir PDF'te neden gizli metin olur?", a: "Taranmış evrakların arkasında görünmez arama katmanları bulunur veya bazı kişiler yazıları beyaz renge boyayarak gizlemeye çalışır." },
      { q: "Hukuki incelemeler için uygun mu?", a: "Evet! Adli ve hukuki belge incelemelerinde gizlenmiş veya üzeri örtülmüş bilgileri yakalamak için idealdir." }
    ],
    crossLink: { href: "/tr/sanitize-pdf", label: "Gizli bilgileri tamamen temizlemek için PDF Meta Veri Temizle aracını deneyin." }
  },
};

export const wipeBookmarksCopy = {
  en: {
    title: "Wipe PDF Bookmarks",
    description: "Remove all bookmarks, outlines, and chapter table of contents links from PDF files online for free.",
    keywords: "wipe pdf bookmarks, delete all bookmarks pdf, remove pdf outline tree, strip table of contents pdf",
    h1: "Wipe PDF Bookmarks",
    tagline: "Cleanly remove the entire bookmark navigation tree and outline hierarchy from your PDF document in one click.",
    howToName: "How to remove all bookmarks from a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file with bookmarks you want to wipe." },
      { name: "Wipe Outlines", text: "Our tool purges the internal /Outlines root catalog dictionary." },
      { name: "Download Clean PDF", text: "Save your streamlined PDF without any bookmark navigation panel." }
    ],
    faq: [
      { q: "Will page contents or text be changed?", a: "No. Only the left-side bookmark outline tree is removed; visible pages remain completely untouched." },
      { q: "Why wipe bookmarks?", a: "To remove outdated chapter hierarchies or clean up documents before official archival." }
    ],
    crossLink: { href: "/extract-toc", label: "Want to export the bookmarks before wiping? Try Extract Table of Contents." }
  },
  tr: {
    title: "PDF Yer İmlerini ve Fihristi Sil",
    description: "PDF belgelerindeki tüm yer imlerini, içindekiler ağacını ve bölüm bağlantılarını tek tıkla tamamen silin ve temizleyin.",
    keywords: "pdf yer imlerini silme, pdf içindekiler ağacını kaldırma, pdf fihrist silici, temiz yer imsiz pdf",
    h1: "PDF Yer İmlerini ve Fihristi Sil",
    tagline: "Belgenizin sol tarafında açılan gereksiz veya hatalı yer imi fihrist ağacını tek tıkla tamamen kaldırın.",
    howToName: "PDF içindeki tüm yer imleri nasıl silinir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "İçindeki yer imlerini silmek istediğiniz PDF dosyasını seçin." },
      { name: "Yer İmlerini Temizle", text: "Sistemimiz iç fihrist kataloğunu belgeden tamamen kazır." },
      { name: "Temiz PDF'i İndirin", text: "Yer imi paneli kaldırılmış temiz PDF belgenizi indirin." }
    ],
    faq: [
      { q: "Sayfalardaki metinler silinir mi?", a: "Hayır! Sayfa içeriklerine kesinlikle dokunulmaz, yalnızca sol paneldeki yer imi fihristi kaldırılır." },
      { q: "Neden yer imlerini silmek isteyebilirim?", a: "Eski, bozuk veya yanlış sayfalara giden yer imi ağaçlarını temizleyip belgeyi sadeleştirmek için kullanılır." }
    ],
    crossLink: { href: "/tr/extract-toc", label: "Silmeden önce içindekiler listesini kaydetmek için İçindekileri Çıkar aracını deneyin." }
  },
};

export const extractTablesCopy = {
  en: {
    title: "Extract Tables from PDF",
    description: "Extract structured tabular data from PDF files into CSV or Excel formats online for free. Fast table extractor.",
    keywords: "extract tables from pdf, pdf table to excel, pdf to csv, extract data from pdf table, convert pdf table to spreadsheet",
    h1: "Extract Tables from PDF",
    tagline: "Extract grid tables, financial statements, and invoice rows from PDF documents directly into clean CSV spreadsheets.",
    howToName: "How to extract tables from a PDF into Excel/CSV",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file containing financial tables or data grids." },
      { name: "Detect Tables", text: "Our parser detects cell boundaries, rows, and headers across the document." },
      { name: "Export CSV/Excel", text: "Download your structured table data ready for Excel or Google Sheets." }
    ],
    faq: [
      { q: "Can I open the extracted CSV in Microsoft Excel?", a: "Yes, the extracted CSV files open seamlessly in Excel, Google Sheets, Numbers, or any database." },
      { q: "Are complex multi-column tables supported?", a: "Yes, our engine analyzes cell coordinates to maintain row and column alignment." }
    ],
    crossLink: { href: "/extract-text", label: "Need raw unformatted text instead? Try Extract Text." }
  },
  tr: {
    title: "PDF'ten Tablo Çıkarma (Excel/CSV)",
    description: "PDF belgelerindeki tabloları, fiyat listelerini ve finansal verileri ayıklayıp Excel veya CSV formatında indirin.",
    keywords: "pdf ten tablo çıkarma, pdf tablo excel yapma, pdf to csv, pdf teki tabloyu kopyalama, bilanço pdf excel aktar",
    h1: "PDF'ten Tablo Çıkarma (Excel/CSV)",
    tagline: "Fatura, bilanço ve fiyat listelerindeki tabloları tek tıkla Excel ve Google E-Tablolar'da düzenlenebilir CSV formatına aktarın.",
    howToName: "PDF tablosu Excel veya CSV formatına nasıl aktarılır?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "Tablolu PDF'i Yükleyin", text: "İçinde tablo bulunan PDF dosyasını seçin." },
      { name: "Tabloyu Algıla", text: "Aracımız satır ve sütun çizgilerini tespit ederek hücreleri ayıklar." },
      { name: "Excel/CSV Olarak İndirin", text: "Excel'de doğrudan açılabilir tertemiz veri dosyanızı indirin." }
    ],
    faq: [
      { q: "Satırlar ve sütunlar birbirine karışır mı?", a: "Hayır. Hücre koordinatları taranarak satır ve sütun hizalamaları eksiksiz korunur." },
      { q: "Finansal verilerim güvende mi?", a: "Evet, tüm ayıklama işlemi tarayıcınızda yerel çalışır, mali verileriniz sunuculara gitmez." }
    ],
    crossLink: { href: "/tr/extract-text", label: "Düz metinleri kopyalamak istiyorsanız PDF'ten Metin Çıkarma aracını kullanın." }
  },
};
export const pdfToJsonCopy = {
  en: {
    title: "PDF to JSON",
    description: "Extract text, metadata, page dimensions, and structural objects from PDF files into structured JSON for developers.",
    keywords: "pdf to json, parse pdf to json, extract pdf json, pdf data parser developer, pdf structure to json online",
    h1: "PDF to JSON",
    tagline: "Parse PDF pages into structured JSON data trees. Extract text blocks, bounding boxes, font metadata, and document hierarchies.",
    howToName: "How to parse a PDF into structured JSON",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file you want to parse for programmatic use." },
      { name: "JSON Parsing", text: "Our parser extracts page tree hierarchies, text spans, coordinates, and metadata." },
      { name: "Download JSON", text: "Download your clean, formatted JSON file ready for software development." }
    ],
    faq: [
      { q: "What data fields are included in the JSON?", a: "The JSON includes document metadata, total page counts, page dimensions, text content, font styling, and word bounding-box coordinates." },
      { q: "Is this suitable for AI and LLM pipelines?", a: "Yes! Structured JSON simplifies feeding document context into AI embedding and Retrieval-Augmented Generation (RAG) models." }
    ],
    crossLink: { href: "/extract-text", label: "Looking for plain text output instead? Try Extract Text." }
  },
  tr: {
    title: "PDF'ten JSON'a Çevirme (Geliştirici)",
    description: "PDF dosyalarının sayfa hiyerarşisini, koordinatlarını ve metin bloklarını yazılımcılar için yapılandırılmış JSON verisine dönüştürün.",
    keywords: "pdf to json, pdf json çevirici, pdf parse etme, yapay zeka için pdf json, yazılımcı pdf araçları",
    h1: "PDF'ten JSON'a Çevirme",
    tagline: "Yazılımcılar ve yapay zeka (LLM/RAG) sistemleri için PDF belgelerini yapılandırılmış, temiz JSON veri ağacına dönüştürün.",
    howToName: "PDF belgesi nasıl JSON verisine dönüştürülür?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "Ayrıştırmak (parse etmek) istediğiniz PDF dosyasını seçin." },
      { name: "JSON Çözümleme", text: "Sistemimiz sayfa ağacını, koordinatları ve metin bloklarını JSON nesnelerine döker." },
      { name: "JSON Dosyasını İndirin", text: "Projelerinizde kullanabileceğiniz formatlanmış JSON dosyanızı indirin." }
    ],
    faq: [
      { q: "JSON dosyasında hangi bilgiler yer alır?", a: "Belge meta verileri, sayfa boyutları, metin blokları, font aileleri ve kelime koordinatları eksiksiz yer alır." },
      { q: "Yapay zeka (RAG) projeleri için uygun mu?", a: "Evet! LLM ve RAG sistemlerine veri beslerken JSON formatı en yüksek doğruluğu sağlar." }
    ],
    crossLink: { href: "/tr/extract-text", label: "Düz metin almak istiyorsanız PDF'ten Metin Çıkarma aracını deneyin." }
  },
};
export const scanToPdfCopy = {
  en: {
    title: "Scan to PDF — camera scanner",
    description:
      "Use your webcam or mobile camera to snap pictures of documents and instantly turn them into a single PDF.",
    keywords:
      "scan to pdf, camera to pdf, webcam scanner, dijital tarayıcı, kameradan pdf yap, fotoğraf pdf",
    h1: "Camera Scanner to PDF",
    tagline: "Turn your device into a portable document scanner.",
    howToName: "How to scan documents to PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Use camera",
        text: "Use your webcam or phone camera to take clear photos of your documents.",
      },
      {
        name: "Crop and enhance",
        text: "Locally adjust the corners and enhance the contrast for perfect readability.",
      },
      {
        name: "Download PDF",
        text: "Download your newly created, high-quality scanned PDF document.",
      },
    ],
  },
  tr: {
    title: "Kameradan PDF — Scan to PDF",
    description:
      "Bilgisayar veya telefon kameranızı kullanarak fiziksel evraklarınızı anında tek bir PDF belgesine dönüştürün.",
    keywords:
      "kameradan pdf yap, fotoğrafı pdf yap, web tarayıcı, scan to pdf, camera scanner",
    h1: "Kamera Tarayıcı (Scan to PDF)",
    tagline: "Cihazınızı portatif bir tarayıcıya dönüştürün.",
    howToName: "Kameradan PDF nasıl yapılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "Kamerayı kullan",
        text: "Belgelerinizin net fotoğraflarını çekmek için web kameranızı veya telefon kameranızı kullanın.",
      },
      {
        name: "Kırp ve iyileştir",
        text: "Mükemmel okunabilirlik için köşeleri yerel olarak ayarlayın ve kontrastı artırın.",
      },
      {
        name: "PDF indir",
        text: "Yeni oluşturulmuş, yüksek kaliteli taranmış PDF belgenizi indirin.",
      },
    ],
  },
};

export const audioReaderCopy = {
  en: {
    title: "PDF Audio Reader",
    description: "Listen to your PDF documents with natural text-to-speech audio reader online for free. Read aloud PDF papers and ebooks.",
    keywords: "pdf audio reader, read pdf aloud, pdf text to speech, listen to pdf online, tts pdf reader",
    h1: "PDF Audio Reader",
    tagline: "Turn your PDF ebooks, research papers, and documents into spoken audio using browser speech synthesis.",
    howToName: "How to listen to a PDF with text-to-speech",
    howItWorks: "How it works",
    faqTitle: "Frequently asked questions",
    steps: [
      { name: "Upload PDF", text: "Select the document you want to listen to." },
      { name: "Choose Voice & Speed", text: "Select your preferred voice language, pitch, and playback speed." },
      { name: "Listen", text: "Click play to listen to your document read aloud seamlessly." }
    ],
    faq: [
      { q: "Is internet needed for speech synthesis?", a: "No! It uses your device's built-in Web Speech API engine completely offline." },
      { q: "Can I adjust playback speed?", a: "Yes, you can slow down or speed up the narration (0.5x to 2x speed)." }
    ],
    crossLink: { href: "/extract-text", label: "Want to read text manually? Try Extract Text." }
  },
  tr: {
    title: "Sesli PDF Okuyucu (Metinden Sese)",
    description: "PDF kitaplarınızı ve makalelerinizi sesli dinleyin. Doğal ses tonuyla Türkçe ve İngilizce metin okuma aracı.",
    keywords: "sesli pdf okuma, pdf i seslendir, pdf text to speech, sesli kitap yapma, pdf dinleme programı",
    h1: "Sesli PDF Okuyucu",
    tagline: "Makaleleri, kitapları ve ders notlarını ekrana bakmadan sesli olarak dinleyin. Gözlerinizi dinlendirin.",
    howToName: "PDF belgesi sesli olarak nasıl dinlenir?",
    howItWorks: "Nasıl çalışır?",
    faqTitle: "Sık Sorulan Sorular",
    steps: [
      { name: "PDF Belgenizi Yükleyin", text: "Dinlemek istediğiniz PDF kitabını veya makaleyi seçin." },
      { name: "Ses ve Hız Ayarı Yapın", text: "Okuma hızını (1x, 1.5x) ve ses tonunu belirleyin." },
      { name: "Dinlemeye Başlayın", text: "Oynat butonuna basarak sayfaların sesli okunmasını dinleyin." }
    ],
    faq: [
      { q: "Türkçe dil desteği var mı?", a: "Evet! Cihazınızın Türkçe ses sentezleyicisini kullanarak akıcı ve doğal sesle okuma yapar." },
      { q: "Yurtdışındayken veya internetsiz dinlenebilir mi?", a: "Evet! Tarayıcınızın kendi yerel ses motorunu kullandığı için internet kotası harcamaz." }
    ],
    crossLink: { href: "/tr/extract-text", label: "Düz metin olarak kopyalamak için PDF'ten Metin Çıkarma aracını deneyin." }
  },
};


