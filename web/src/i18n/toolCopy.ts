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
    title: "N-Up PDF — multiple pages per sheet",
    description:
      "Combine multiple PDF pages onto a single sheet (2-up, 4-up, 9-up). Perfect for printing slides or saving paper. Fast, free, and totally local.",
    keywords:
      "n-up pdf, multiple pages per sheet, print multiple pages, pdf layout, 2-up, 4-up, çoklu sayfa yazdırma",
    h1: "N-Up PDF",
    tagline: "Shrink and combine multiple pages onto a single sheet instantly.",
    howToName: "How to combine multiple pages onto one sheet",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to format for N-up printing.",
      },
      {
        name: "Select grid",
        text: "Choose how many pages to print per sheet and arrange them locally.",
      },
      {
        name: "Download PDF",
        text: "Download your perfectly arranged PDF, ready to save paper and ink.",
      },
    ],
    faq: [
      {
        q: "What is N-Up printing?",
        a: "N-Up refers to printing multiple pages on a single sheet of paper. For example, 4-up prints 4 reduced-size pages on one sheet, saving paper and ink.",
      },
      {
        q: "Does this affect the quality of my PDF?",
        a: "The content itself is not compressed or blurred, but it is scaled down to fit multiple pages on one sheet. Vector text remains perfectly crisp.",
      },
      {
        q: "Is it safe and private?",
        a: "Yes. All processing happens locally in your web browser. Your files are never uploaded to our servers.",
      },
    ],
    crossLink: {
      href: "/compress-pdf",
      label: "Need to reduce file size instead? Compress PDF.",
    },
  },
  tr: {
    title: "N-Up PDF — tek yaprağa çoklu sayfa",
    description:
      "Birden fazla PDF sayfasını tek bir yaprakta birleştirin (2, 4, 9 sayfa vb.). Sunum yazdırmak veya kağıt tasarrufu sağlamak için mükemmel. Hızlı, ücretsiz ve yerel.",
    keywords:
      "n-up pdf, tek sayfaya çoklu sayfa, yaprak başına birden fazla sayfa, pdf yazdırma düzeni",
    h1: "N-Up PDF",
    tagline:
      "Birden fazla sayfayı anında küçültüp tek bir yaprakta birleştirin.",
    howToName: "Birden fazla sayfa tek yaprakta nasıl birleştirilir",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "N-up baskı için biçimlendirmek istediğiniz PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Izgarayı seç",
        text: "Yaprak başına kaç sayfa yazdırılacağını seçin ve yerel olarak düzenleyin.",
      },
      {
        name: "PDF indir",
        text: "Kağıt ve mürekkep tasarrufu için mükemmel şekilde düzenlenmiş PDF belgenizi indirin.",
      },
    ],
    faq: [
      {
        q: "N-Up yazdırma nedir?",
        a: "N-Up, tek bir kağıt yaprağına birden fazla sayfa yazdırmayı ifade eder. Örneğin, 4-up tek bir yaprağa küçültülmüş 4 sayfa yazdırır ve kağıt ve mürekkep tasarrufu sağlar.",
      },
      {
        q: "Bu işlem PDF kalitesini etkiler mi?",
        a: "İçeriğin kendisi sıkıştırılmaz veya bulanıklaştırılmaz, ancak birden fazla sayfayı bir yaprağa sığdırmak için ölçeklendirilir. Vektörel metinler kusursuz keskinliğini korur.",
      },
      {
        q: "Güvenli ve gizli mi?",
        a: "Evet. Tüm işlemler web tarayıcınızda yerel olarak gerçekleşir. Dosyalarınız asla sunucularımıza yüklenmez.",
      },
    ],
    crossLink: {
      href: "/tr/compress-pdf",
      label:
        "Bunun yerine dosya boyutunu küçültmek mi istiyorsunuz? PDF Sıkıştır.",
    },
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
    title: "Booklet PDF — create printable booklets",
    description:
      "Convert your PDF into a printable booklet layout. Free and completely local.",
    keywords:
      "create booklet, pdf booklet, print booklet, saddle stitch pdf, booklet maker, kitapçık yap, pdf kitapçık",
    h1: "Booklet PDF",
    tagline: "Rearrange pages into a saddle-stitch booklet layout.",
    howToName: "How to create a booklet",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to convert into a printable booklet.",
      },
      {
        name: "Arrange pages",
        text: "We calculate the folding order and place two pages per sheet locally.",
      },
      {
        name: "Download PDF",
        text: "Download your document perfectly formatted for double-sided booklet printing.",
      },
    ],
  },
  tr: {
    title: "Kitapçık PDF — yazdırılabilir kitapçık oluştur",
    description: "PDF dosyanızı yazdırılabilir kitapçık düzenine dönüştürün.",
    keywords:
      "pdf kitapçık, kitapçık yap, kitapçık bastır, booklet maker, create booklet, kitapçık düzeni",
    h1: "Kitapçık PDF",
    tagline: "Sayfaları kitapçık düzeninde yeniden sıralayın.",
    howToName: "Kitapçık nasıl oluşturulur",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Yazdırılabilir kitapçığa dönüştürmek istediğiniz PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Sayfaları düzenle",
        text: "Katlama sırasını hesaplıyor ve yerel olarak yaprak başına iki sayfa yerleştiriyoruz.",
      },
      {
        name: "PDF indir",
        text: "Çift taraflı kitapçık baskısı için mükemmel biçimlendirilmiş belgenizi indirin.",
      },
    ],
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
    title: "Remove Blank Pages — clean up your PDF",
    description: "Automatically detect and remove blank pages from your PDF.",
    keywords:
      "remove blank pages, delete empty pages, clean pdf, erase blank sheets, pdf boş sayfa sil, boş sayfaları kaldır",
    h1: "Remove Blank Pages",
    tagline: "Clean up your documents instantly and locally.",
    howToName: "How to remove blank pages",
    howItWorks: "How it works",
    steps: [
      { name: "Upload PDF", text: "Select the PDF file." },
      { name: "Process", text: "We detect empty pages." },
      { name: "Download", text: "Download the cleaned PDF." },
    ],
  },
  tr: {
    title: "Boş Sayfaları Sil — PDF'inizi temizleyin",
    description:
      "PDF'inizdeki boş sayfaları otomatik olarak tespit edip kaldırın.",
    keywords:
      "pdf boş sayfa sil, boş sayfaları çıkar, pdf temizle, remove blank pages, delete empty pages",
    h1: "Boş Sayfaları Sil",
    tagline: "Belgelerinizi anında ve yerel olarak temizleyin.",
    howToName: "Boş sayfalar nasıl silinir",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "PDF Yükle", text: "PDF dosyasını seçin." },
      { name: "İşle", text: "Boş sayfaları tespit ediyoruz." },
      { name: "İndir", text: "Temizlenmiş PDF'i indirin." },
    ],
  },
};

export const editMetadataCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Edit PDF Metadata — change author, title, and keywords locally",
    description:
      "View and edit PDF properties and metadata fields like Author, Title, Subject, and Keywords without uploading your file.",
    keywords:
      "edit pdf metadata, change pdf author, modify pdf properties, pdf tags, pdf meta veri düzenle",
    h1: "Edit PDF Metadata",
    tagline: "Change document properties locally and instantly.",
    howToName: "How to edit PDF metadata",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document whose metadata you want to modify.",
      },
      {
        name: "Edit properties",
        text: "Update the title, author, subject, and keywords locally.",
      },
      {
        name: "Download PDF",
        text: "Download your updated PDF document with correctly modified metadata.",
      },
    ],
  },
  tr: {
    title:
      "PDF Meta Verilerini Düzenle — yazar, başlık ve anahtar kelimeleri yerel olarak değiştir",
    description:
      "PDF özelliklerini ve Yazar, Başlık, Konu gibi meta veri alanlarını dosyanızı yüklemeden görüntüleyin ve düzenleyin.",
    keywords:
      "pdf meta veri düzenle, pdf yazar değiştir, pdf özelliklerini değiştir, edit metadata pdf",
    h1: "PDF Meta Verilerini Düzenle",
    tagline: "Belge özelliklerini anında ve yerel olarak değiştirin.",
    howToName: "PDF meta verileri nasıl düzenlenir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Meta verilerini değiştirmek istediğiniz PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Özellikleri düzenle",
        text: "Başlık, yazar, konu ve anahtar kelimeleri yerel olarak güncelleyin.",
      },
      {
        name: "PDF indir",
        text: "Doğru bir şekilde değiştirilmiş meta verileriyle güncellenmiş PDF belgenizi indirin.",
      },
    ],
  },
};

export const base64PdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Base64 to PDF & PDF to Base64 — developer tools",
    description:
      "Convert a PDF to a Base64 string for embedding in code, or decode a Base64 string back into a PDF file locally.",
    keywords:
      "pdf to base64, base64 to pdf, encode pdf, decode pdf, base64 converter, pdf base64 çevir",
    h1: "Base64 PDF Converter",
    tagline: "Encode or decode PDFs to and from Base64 instantly.",
    howToName: "How to use the Base64 converter",
    howItWorks: "How it works",
    steps: [
      {
        name: "Paste or upload",
        text: "Paste your Base64 string or upload a PDF document.",
      },
      {
        name: "Convert instantly",
        text: "We convert between Base64 and PDF formats instantly and locally.",
      },
      {
        name: "Download or copy",
        text: "Download the generated PDF or copy the Base64 string directly.",
      },
    ],
  },
  tr: {
    title: "Base64'ten PDF'e ve PDF'ten Base64'e — geliştirici araçları",
    description:
      "Koda gömmek için PDF'yi Base64 dizgesine dönüştürün veya bir Base64 dizgesini yerel olarak PDF dosyasına çevirin.",
    keywords:
      "pdf to base64, base64 to pdf, pdf kodlama, base64 çevirici, pdf encode decode",
    h1: "Base64 PDF Dönüştürücü",
    tagline: "PDF'leri anında Base64'e kodlayın veya çözün.",
    howToName: "Base64 dönüştürücü nasıl kullanılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "Yapıştır veya yükle",
        text: "Base64 dizesini yapıştırın veya bir PDF belgesi yükleyin.",
      },
      {
        name: "Anında dönüştür",
        text: "Base64 ve PDF formatları arasında anında ve yerel olarak dönüşüm sağlıyoruz.",
      },
      {
        name: "İndir veya kopyala",
        text: "Oluşturulan PDF'yi indirin veya Base64 dizesini doğrudan kopyalayın.",
      },
    ],
  },
};

export const invertPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Invert PDF Colors — dark mode for PDFs",
    description:
      "Invert the colors of your PDF document for easier night reading. All processing is done locally.",
    keywords:
      "invert pdf colors, dark mode pdf, negative pdf, reverse colors pdf, pdf renkleri tersine çevir, pdf karanlık mod",
    h1: "Invert PDF Colors",
    tagline: "Turn bright documents into dark mode PDFs.",
    howToName: "How to invert PDF colors",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to invert.",
      },
      {
        name: "Invert colors",
        text: "We reverse all colors locally to create a perfect dark mode reading experience.",
      },
      {
        name: "Download PDF",
        text: "Download your inverted, eye-friendly PDF document.",
      },
    ],
  },
  tr: {
    title: "PDF Renklerini Ters Çevir — PDF'ler için karanlık mod",
    description:
      "Gece okumasını kolaylaştırmak için PDF belgenizin renklerini tersine çevirin. Tüm işlemler yerel olarak yapılır.",
    keywords:
      "pdf karanlık mod, pdf renk tersine çevir, invert pdf, dark mode pdf, negatif pdf",
    h1: "PDF Renklerini Ters Çevir",
    tagline: "Parlak belgeleri karanlık mod PDF'lerine dönüştürün.",
    howToName: "PDF renkleri nasıl tersine çevrilir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Renklerini tersine çevirmek istediğiniz PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Renkleri tersine çevir",
        text: "Mükemmel bir karanlık mod okuma deneyimi için tüm renkleri yerel olarak tersine çeviriyoruz.",
      },
      {
        name: "PDF indir",
        text: "Tersine çevrilmiş, göz dostu PDF belgenizi indirin.",
      },
    ],
  },
};

export const markdownPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Markdown to PDF — convert MD files locally",
    description:
      "Write or paste Markdown syntax and instantly export it to a beautifully formatted PDF document. Runs 100% in your browser.",
    keywords:
      "markdown to pdf, md to pdf, convert markdown, render md as pdf, markdown pdf yap, md çevirici",
    h1: "Markdown to PDF",
    tagline: "Convert MD files to styled PDFs instantly.",
    howToName: "How to convert Markdown to PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add Markdown",
        text: "Write or paste your Markdown text directly into the editor.",
      },
      {
        name: "Style and preview",
        text: "Customize the CSS and instantly preview the rendered document locally.",
      },
      {
        name: "Download PDF",
        text: "Download your beautifully styled, print-ready PDF document.",
      },
    ],
  },
  tr: {
    title: "Markdown'dan PDF'e — MD dosyalarını yerel olarak dönüştür",
    description:
      "Markdown formatında yazın veya yapıştırın, anında şık bir PDF belgesine dönüştürün. %100 tarayıcınızda çalışır.",
    keywords:
      "markdown pdf yap, md to pdf, markdown çevirici, convert md to pdf",
    h1: "Markdown to PDF",
    tagline: "MD dosyalarını anında şekilli PDF'lere dönüştürün.",
    howToName: "Markdown PDF'e nasıl dönüştürülür",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "Markdown ekle",
        text: "Markdown metninizi doğrudan düzenleyiciye yazın veya yapıştırın.",
      },
      {
        name: "Biçimlendir ve önizle",
        text: "CSS'yi özelleştirin ve oluşturulan belgeyi yerel olarak anında önizleyin.",
      },
      {
        name: "PDF indir",
        text: "Güzel biçimlendirilmiş, baskıya hazır PDF belgenizi indirin.",
      },
    ],
  },
};

export const htmlPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "HTML to PDF — render raw HTML code locally",
    description:
      "Paste raw HTML code and convert it directly into a PDF document. Perfect for developers saving web snippets.",
    keywords:
      "html to pdf, webpage to pdf, save as pdf, convert html, render html to pdf, html pdf yap",
    h1: "HTML to PDF",
    tagline: "Convert raw HTML code to a PDF document.",
    howToName: "How to convert HTML to PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add HTML",
        text: "Write or paste your raw HTML and CSS code directly into the editor.",
      },
      {
        name: "Live preview",
        text: "We render the HTML locally so you can see exactly how it will look.",
      },
      {
        name: "Download PDF",
        text: "Download your perfectly rendered PDF document.",
      },
    ],
  },
  tr: {
    title: "HTML'den PDF'e — ham HTML kodunu yerel dönüştür",
    description:
      "Ham HTML kodunu yapıştırın ve doğrudan PDF belgesine dönüştürün. Web içeriklerini kaydetmek isteyen geliştiriciler için mükemmeldir.",
    keywords:
      "html pdf yap, web sayfasını pdf kaydet, html to pdf, convert html to pdf",
    h1: "HTML to PDF",
    tagline: "Ham HTML kodunu PDF belgesine dönüştürün.",
    howToName: "HTML PDF'e nasıl dönüştürülür",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "HTML ekle",
        text: "Ham HTML ve CSS kodunuzu doğrudan düzenleyiciye yazın veya yapıştırın.",
      },
      {
        name: "Canlı önizleme",
        text: "Nasıl görüneceğini tam olarak görebilmeniz için HTML'yi yerel olarak oluşturuyoruz.",
      },
      {
        name: "PDF indir",
        text: "Mükemmel şekilde oluşturulmuş PDF belgenizi indirin.",
      },
    ],
  },
};

export const extractPagesCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Extract PDF Pages — save specific pages",
    description:
      "Visually select specific pages from a PDF document and save them as a brand new PDF file.",
    keywords:
      "extract pdf pages, separate pages, pull out pages, pdf split, pdf sayfa çıkar, pdf sayfa al",
    h1: "Extract Pages",
    tagline: "Pick the pages you want to keep.",
    howToName: "How to extract PDF pages",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to extract specific pages from.",
      },
      {
        name: "Select pages",
        text: "Click the exact pages you want to keep using the local visual grid.",
      },
      {
        name: "Download PDF",
        text: "Download a new PDF containing only your selected pages securely.",
      },
    ],
  },
  tr: {
    title: "Sayfaları Çıkar — belirli sayfaları yeni bir PDF yap",
    description:
      "Bir PDF belgesindeki belirli sayfaları görsel olarak seçin ve bunları yepyeni bir PDF dosyası olarak kaydedin.",
    keywords:
      "pdf sayfa çıkar, pdf içinden sayfa al, sayfaları ayır, extract pages from pdf",
    h1: "Sayfaları Çıkar",
    tagline: "Sadece tutmak istediğiniz sayfaları seçin.",
    howToName: "PDF sayfaları nasıl çıkarılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Belirli sayfaları çıkarmak istediğiniz PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Sayfaları seç",
        text: "Yerel görsel ızgarayı kullanarak saklamak istediğiniz sayfaları seçin.",
      },
      {
        name: "PDF indir",
        text: "Yalnızca seçtiğiniz sayfaları içeren yeni PDF belgenizi güvenle indirin.",
      },
    ],
  },
};

export const annotatePdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Annotate PDF — draw and add text to your PDF files",
    description:
      "Add text annotations and highlights to your PDF documents entirely in your browser.",
    keywords:
      "annotate pdf, highlight pdf, add notes to pdf, draw on pdf, pdf not al, pdf çiz, pdf vurgula",
    h1: "Annotate PDF",
    tagline: "Add text and notes to your documents.",
    howToName: "How to annotate a PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to review or annotate.",
      },
      {
        name: "Add annotations",
        text: "Highlight text, add sticky notes, or draw directly on the pages locally.",
      },
      {
        name: "Download PDF",
        text: "Download your fully annotated and reviewed PDF document.",
      },
    ],
  },
  tr: {
    title: "PDF Not Ekle — PDF dosyalarına metin ve çizim ekle",
    description:
      "Tamamen tarayıcınızda PDF belgelerinize metin ve notlar ekleyin.",
    keywords:
      "pdf not al, pdf üstünü çiz, pdf highlight, pdf vurgula, annotate pdf",
    h1: "PDF Not Ekle",
    tagline: "Belgelerinize metin ve notlar ekleyin.",
    howToName: "PDF'e nasıl not eklenir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "İncelemek veya not eklemek istediğiniz PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Notlar ekle",
        text: "Yerel olarak metni vurgulayın, yapışkan notlar ekleyin veya doğrudan sayfalara çizin.",
      },
      {
        name: "PDF indir",
        text: "Tamamen notlandırılmış ve incelenmiş PDF belgenizi indirin.",
      },
    ],
  },
};

export const editPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Edit PDF — modify and hide text in your PDF files",
    description:
      "Apply whiteout and hide sensitive information in your PDFs directly in your browser.",
    keywords:
      "edit pdf, modify pdf, change pdf text, replace pdf image, free pdf editor, pdf düzenle, pdf yazı değiştir",
    h1: "Edit PDF",
    tagline: "Hide sensitive information with whiteout.",
    howToName: "How to edit a PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to edit or whiteout.",
      },
      {
        name: "Edit content",
        text: "Add new text, shapes, or use whiteout to hide unwanted information locally.",
      },
      {
        name: "Download PDF",
        text: "Download your completely updated and edited PDF document.",
      },
    ],
  },
  tr: {
    title: "PDF Düzenle — PDF dosyalarında metin gizle ve düzenle",
    description:
      "Tarayıcınızda doğrudan PDF dosyalarınızdaki hassas bilgileri gizleyin (whiteout).",
    keywords:
      "pdf düzenle, pdf metin değiştir, pdf editör, pdf yazı ekle, ücretsiz pdf düzenleyici",
    h1: "PDF Düzenle",
    tagline: "Hassas bilgileri beyazlatarak (whiteout) gizleyin.",
    howToName: "PDF nasıl düzenlenir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Düzenlemek veya silmek istediğiniz PDF belgesini sayfaya bırakın.",
      },
      {
        name: "İçeriği düzenle",
        text: "İstenmeyen bilgileri gizlemek için yeni metin veya şekiller ekleyin, veya düzeltici kullanın.",
      },
      {
        name: "PDF indir",
        text: "Tamamen güncellenmiş ve düzenlenmiş PDF belgenizi indirin.",
      },
    ],
  },
};

export const pdfFormsCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "PDF Forms — fill and manage PDF forms",
    description:
      "Fill interactive PDF forms quickly and easily, right in your browser.",
    keywords:
      "fill pdf form, interactive pdf, type in pdf, complete pdf form, fill and sign, pdf form doldur",
    h1: "PDF Forms",
    tagline: "Fill interactive PDF forms quickly.",
    howToName: "How to fill PDF forms",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the interactive PDF form you need to complete.",
      },
      {
        name: "Fill form",
        text: "Type directly into form fields and select checkboxes locally and securely.",
      },
      {
        name: "Download PDF",
        text: "Download your filled PDF form, ready to print or email.",
      },
    ],
  },
  tr: {
    title: "PDF Formları — PDF formlarını doldurun ve yönetin",
    description:
      "Etkileşimli PDF formlarını tarayıcınızda hızlıca ve kolayca doldurun.",
    keywords:
      "pdf form doldur, pdf yazı yaz, etkileşimli pdf, fill and sign pdf, pdf doldurma aracı",
    h1: "PDF Formları",
    tagline: "Etkileşimli PDF formlarını hızlıca doldurun.",
    howToName: "PDF formları nasıl doldurulur",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Doldurmanız gereken etkileşimli PDF formunu sayfaya bırakın.",
      },
      {
        name: "Formu doldur",
        text: "Doğrudan form alanlarına yazın ve onay kutularını yerel olarak güvenle seçin.",
      },
      {
        name: "PDF indir",
        text: "Yazdırmaya veya e-postayla göndermeye hazır, doldurulmuş PDF formunuzu indirin.",
      },
    ],
  },
};

export const mixpdfCopy = {
  en: {
    title: "Alternate & Mix PDF",
    description: "Interleave pages from two PDFs.",
    keywords:
      "mix pdf, alternate pdf pages, interleave pdf, blend pdf, pdf sayfalarını karıştır, pdf harmanla",
    h1: "Alternate & Mix PDF",
    tagline: "Interleave pages from two PDFs.",
    howToName: "How to use Alternate & Mix PDF",
    howItWorks: "Upload your file and process it instantly in your browser.",
    steps: [
      {
        name: "Add PDFs",
        text: "Drop the two PDF documents you want to interleave onto the page.",
      },
      {
        name: "Mix pages",
        text: "We locally alternate pages from both documents to create a single, merged file.",
      },
      {
        name: "Download PDF",
        text: "Download your perfectly mixed document securely.",
      },
    ],
  },
  tr: {
    title: "Alternate & Mix PDF",
    description: "Interleave pages from two PDFs.",
    keywords:
      "pdf sayfalarını karıştır, pdf harmanla, sırayla birleştir, mix pdf pages",
    h1: "Alternate & Mix PDF",
    tagline: "Interleave pages from two PDFs.",
    howToName: "Alternate & Mix PDF Nasıl Kullanılır",
    howItWorks: "Dosyanızı yükleyin ve tarayıcınızda anında işleyin.",
    steps: [
      {
        name: "PDF'leri ekle",
        text: "Sayfalarını harmanlamak istediğiniz iki PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Sayfaları karıştır",
        text: "Tek bir belge oluşturmak için her iki dosyanın sayfalarını yerel olarak sırayla birleştiriyoruz.",
      },
      {
        name: "PDF indir",
        text: "Mükemmel bir şekilde harmanlanmış yeni belgenizi güvenle indirin.",
      },
    ],
  },
};

export const splithalfpdfCopy = {
  en: {
    title: "Split PDF in Half",
    description: "Split 2-up spreads into 1-up pages.",
    keywords:
      "split pdf in half, divide page, cut page in middle, split scanned book, pdf ikiye böl, sayfayı ortadan kes",
    h1: "Split PDF in Half",
    tagline: "Split 2-up spreads into 1-up pages.",
    howToName: "How to use Split PDF in Half",
    howItWorks: "Upload your file and process it instantly in your browser.",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a PDF containing scanned 2-up spreads or side-by-side pages.",
      },
      {
        name: "Split spreads",
        text: "We calculate the center locally and cut each spread into two separate pages.",
      },
      {
        name: "Download PDF",
        text: "Download your perfectly separated, 1-up page document.",
      },
    ],
  },
  tr: {
    title: "Split PDF in Half",
    description: "Split 2-up spreads into 1-up pages.",
    keywords:
      "pdf ikiye böl, sayfayı ortadan kes, split pdf in half, kitap taraması ayır",
    h1: "Split PDF in Half",
    tagline: "Split 2-up spreads into 1-up pages.",
    howToName: "Split PDF in Half Nasıl Kullanılır",
    howItWorks: "Dosyanızı yükleyin ve tarayıcınızda anında işleyin.",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Yan yana taranmış kitap veya dergi sayfaları içeren PDF belgesini bırakın.",
      },
      {
        name: "Sayfaları ayır",
        text: "Merkez noktasını yerel olarak hesaplayıp her sayfayı tam ortadan ikiye bölüyoruz.",
      },
      {
        name: "PDF indir",
        text: "Mükemmel şekilde ayrılmış ve tekli sayfalara dönüştürülmüş belgenizi indirin.",
      },
    ],
  },
};

export const extractbykeywordCopy = {
  en: {
    title: "Extract by Keyword",
    description: "Extract pages containing specific text.",
    keywords:
      "extract pdf by keyword, search and extract pdf, filter pdf pages, find text extract page, kelimeye göre sayfa çıkar",
    h1: "Extract by Keyword",
    tagline: "Extract pages containing specific text.",
    howToName: "How to use Extract by Keyword",
    howItWorks: "Upload your file and process it instantly in your browser.",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a large PDF document and enter the specific keyword you are looking for.",
      },
      {
        name: "Search text",
        text: "We scan all pages locally to locate every instance of your exact keyword.",
      },
      {
        name: "Download PDF",
        text: "Download a new PDF containing only the pages that matched your search.",
      },
    ],
  },
  tr: {
    title: "Extract by Keyword",
    description: "Extract pages containing specific text.",
    keywords:
      "kelimeye göre sayfa çıkar, pdf içinde ara ve çıkar, metne göre pdf böl, extract by keyword",
    h1: "Extract by Keyword",
    tagline: "Extract pages containing specific text.",
    howToName: "Extract by Keyword Nasıl Kullanılır",
    howItWorks: "Dosyanızı yükleyin ve tarayıcınızda anında işleyin.",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Büyük boyutlu PDF belgenizi bırakın ve aradığınız anahtar kelimeyi yazın.",
      },
      {
        name: "Metni ara",
        text: "Anahtar kelimenizin geçtiği yerleri bulmak için tüm sayfaları yerel olarak tarıyoruz.",
      },
      {
        name: "PDF indir",
        text: "Yalnızca aramanızla eşleşen sayfaları içeren yeni PDF belgenizi indirin.",
      },
    ],
  },
};

export const splitbysizeCopy = {
  en: {
    title: "Split by Size",
    description: "Split PDF into smaller parts by MB size.",
    keywords:
      "split pdf by size, divide pdf size, chunk pdf, reduce file size split, pdf boyuta göre böl, mb a göre pdf böl",
    h1: "Split by Size",
    tagline: "Split PDF into smaller parts by MB size.",
    howToName: "How to use Split by Size",
    howItWorks: "Upload your file and process it instantly in your browser.",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a large PDF document and specify your maximum desired file size in MB.",
      },
      {
        name: "Calculate parts",
        text: "We analyze the document locally to split it securely without exceeding the limit.",
      },
      {
        name: "Download ZIP",
        text: "Download a ZIP archive containing all the perfectly sized PDF parts.",
      },
    ],
  },
  tr: {
    title: "Split by Size",
    description: "Split PDF into smaller parts by MB size.",
    keywords:
      "pdf boyuta göre böl, dosya boyutuna göre ayır, parçalara böl, split pdf by size",
    h1: "Split by Size",
    tagline: "Split PDF into smaller parts by MB size.",
    howToName: "Split by Size Nasıl Kullanılır",
    howItWorks: "Dosyanızı yükleyin ve tarayıcınızda anında işleyin.",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Büyük PDF belgenizi bırakın ve istediğiniz maksimum dosya boyutunu MB olarak girin.",
      },
      {
        name: "Parçaları hesapla",
        text: "Belgeyi sınırı aşmayacak şekilde güvenle bölmek için yerel olarak analiz ediyoruz.",
      },
      {
        name: "ZIP indir",
        text: "Tam istediğiniz boyutta parçalara ayrılmış PDF dosyalarınızı içeren ZIP arşivini indirin.",
      },
    ],
  },
};

export const addmarginsCopy = {
  en: {
    title: "Add Margins",
    description: "Add white padding around PDF pages.",
    keywords:
      "add margins to pdf, increase white space, padding pdf, resize margins, pdf boşluk ekle, pdf kenar boşluğu",
    h1: "Add Margins",
    tagline: "Add white padding around PDF pages.",
    howToName: "How to use Add Margins",
    howItWorks: "Upload your file and process it instantly in your browser.",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a PDF document that needs extra padding or binding space.",
      },
      {
        name: "Adjust margins",
        text: "We calculate the new dimensions and add perfect white borders locally.",
      },
      {
        name: "Download PDF",
        text: "Download your perfectly padded document, ready for printing or binding.",
      },
    ],
  },
  tr: {
    title: "Add Margins",
    description: "Add white padding around PDF pages.",
    keywords:
      "pdf kenar boşluğu ekle, pdf marj ekle, beyaz boşluk ekle, add margins to pdf",
    h1: "Add Margins",
    tagline: "Add white padding around PDF pages.",
    howToName: "Add Margins Nasıl Kullanılır",
    howItWorks: "Dosyanızı yükleyin ve tarayıcınızda anında işleyin.",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Ekstra kenar boşluğuna veya cilt payına ihtiyaç duyan PDF belgenizi bırakın.",
      },
      {
        name: "Boşlukları ayarla",
        text: "Yeni boyutları hesaplayarak sayfaların etrafına yerel olarak beyaz kenarlıklar ekliyoruz.",
      },
      {
        name: "PDF indir",
        text: "Baskı veya ciltleme için mükemmel şekilde ayarlanmış yeni belgenizi indirin.",
      },
    ],
  },
};

export const pdftosvgCopy = {
  en: {
    title: "PDF to SVG",
    description: "Convert PDF pages to SVG vectors.",
    keywords:
      "pdf to svg, vectorise pdf, convert to svg, pdf vektör yap, pdf svg çevir",
    h1: "PDF to SVG",
    tagline: "Convert PDF pages to SVG vectors.",
    howToName: "How to use PDF to SVG",
    howItWorks: "Upload your file and process it instantly in your browser.",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to convert to vectors.",
      },
      {
        name: "Convert to SVG",
        text: "We locally parse the PDF drawing commands and render them into highly accurate SVG graphics.",
      },
      {
        name: "Download ZIP",
        text: "Download a ZIP archive containing your infinitely scalable vector files.",
      },
    ],
  },
  tr: {
    title: "PDF to SVG",
    description: "Convert PDF pages to SVG vectors.",
    keywords: "pdf svg çevir, pdf to svg, vektörel pdf, svg dönüştürücü",
    h1: "PDF to SVG",
    tagline: "Convert PDF pages to SVG vectors.",
    howToName: "PDF to SVG Nasıl Kullanılır",
    howItWorks: "Dosyanızı yükleyin ve tarayıcınızda anında işleyin.",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Vektörel grafiklere dönüştürmek istediğiniz PDF belgesini sayfaya bırakın.",
      },
      {
        name: "SVG'ye çevir",
        text: "Belgedeki çizim komutlarını yerel olarak ayrıştırıp son derece hassas SVG grafiklerine dönüştürüyoruz.",
      },
      {
        name: "ZIP indir",
        text: "Sonsuz ölçeklenebilir ve kayıpsız vektör dosyalarınızı içeren ZIP arşivini indirin.",
      },
    ],
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
    title: "Remove Annotations — clear comments and forms from PDF",
    description:
      "Instantly strip all highlights, sticky notes, comments, and form fields from your PDF.",
    keywords:
      "remove annotations, delete pdf comments, clear highlights, clean pdf, pdf notları sil, açıklamaları kaldır",
    h1: "Remove Annotations",
    tagline: "Remove all annotations, comments, and form fields from your PDF.",
    howToName: "How to remove annotations from a PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a PDF filled with sticky notes, highlights, or form fields.",
      },
      {
        name: "Clean document",
        text: "We safely strip all interactive annotations and comments directly within your browser.",
      },
      {
        name: "Download PDF",
        text: "Download a completely clean, read-only version of your original document.",
      },
    ],
  },
  tr: {
    title: "Açıklamaları Sil — PDF yorumlarını ve formlarını temizle",
    description:
      "PDF belgenizdeki tüm vurguları, yapışkan notları, yorumları ve form alanlarını tek tıkla silin.",
    keywords:
      "pdf notları sil, pdf yorumları kaldır, açıklamaları temizle, remove annotations",
    h1: "Açıklamaları Sil",
    tagline:
      "PDF belgenizdeki tüm açıklamaları, yorumları ve form alanlarını temizleyin.",
    howToName: "PDF açıklamaları nasıl silinir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Vurgular, yorumlar veya doldurulmuş form alanları içeren PDF belgesini bırakın.",
      },
      {
        name: "Belgeyi temizle",
        text: "Tüm etkileşimli açıklamaları ve yorumları tarayıcınızın içinde güvenli bir şekilde siliyoruz.",
      },
      {
        name: "PDF indir",
        text: "Orijinal belgenizin tamamen temizlenmiş, salt okunur yeni versiyonunu indirin.",
      },
    ],
  },
};

export const pdfToWebpCopy = {
  en: {
    title: "PDF to WebP — convert in your browser",
    description:
      "Convert PDF pages to WebP format for 30% smaller file sizes with no loss in quality.",
    keywords:
      "pdf to webp, webp converter, convert pdf to image, pdf resim yap, pdf webp çevir",
    h1: "PDF to WebP",
    tagline:
      "Convert PDF pages to modern, lightweight WebP images directly in your browser.",
    howToName: "How to convert PDF to WebP",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to convert into images.",
      },
      {
        name: "Convert pages",
        text: "We render each page locally into a high-quality, lightweight WebP image.",
      },
      {
        name: "Download ZIP",
        text: "Download a ZIP archive containing your fast-loading, web-optimized image files.",
      },
    ],
  },
  tr: {
    title: "PDF to WebP — tarayıcınızda dönüştürün",
    description:
      "Kalite kaybı olmadan %30 daha küçük dosya boyutları için PDF sayfalarını WebP formatına dönüştürün.",
    keywords: "pdf webp çevir, pdf to webp, pdf resim yap, webp dönüştürücü",
    h1: "PDF to WebP",
    tagline:
      "PDF sayfalarını tarayıcınızda doğrudan modern ve hafif WebP görüntülerine dönüştürün.",
    howToName: "PDF WebP formatına nasıl dönüştürülür",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Görüntü dosyalarına dönüştürmek istediğiniz PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Sayfaları çevir",
        text: "Her sayfayı yerel olarak yüksek kaliteli ve çok hafif WebP görsellerine dönüştürüyoruz.",
      },
      {
        name: "ZIP indir",
        text: "Web için optimize edilmiş, süper hızlı yüklenen görsellerinizi tek bir ZIP arşivinde indirin.",
      },
    ],
  },
};

export const autoCropCopy = {
  en: {
    title: "Auto-Crop PDF — remove white margins automatically",
    description:
      "Automatically detect and crop out unnecessary white margins from your PDF pages.",
    keywords:
      "auto crop pdf, smart crop, remove white margins, auto trim pdf, pdf otomatik kırp, kenar boşluklarını sil",
    h1: "Auto-Crop PDF",
    tagline:
      "Smart detection automatically removes white borders and margins from every page.",
    howToName: "How to auto-crop a PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a scanned document or a PDF with large white borders.",
      },
      {
        name: "Detect margins",
        text: "We analyze each page locally to detect the exact content bounding box.",
      },
      {
        name: "Download PDF",
        text: "Download your mobile-friendly document with all unnecessary white margins perfectly cropped.",
      },
    ],
  },
  tr: {
    title: "Otomatik Kırp — beyaz boşlukları otomatik kaldır",
    description:
      "PDF sayfalarınızdaki gereksiz beyaz boşlukları ve kenar boşluklarını otomatik olarak tespit edip kırpın.",
    keywords:
      "pdf otomatik kırp, akıllı kırpma, boşlukları sil, beyaz marj sil, auto crop pdf",
    h1: "Otomatik Kırp",
    tagline:
      "Akıllı tarama sistemi sayesinde tüm sayfalardaki gereksiz beyaz çerçeveleri otomatik olarak kırpın.",
    howToName: "PDF otomatik olarak nasıl kırpılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Geniş beyaz kenarlıkları olan veya taranmış PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Sınırları bul",
        text: "Asıl içerik alanını bulmak için her sayfayı yerel olarak tek tek analiz ediyoruz.",
      },
      {
        name: "PDF indir",
        text: "Gereksiz beyaz boşlukları mükemmel şekilde kırpılmış, mobilde okunması kolay belgenizi indirin.",
      },
    ],
  },
};

export const extractTocCopy = {
  en: {
    title: "Extract Bookmarks — export PDF Table of Contents",
    description:
      "Instantly extract the Table of Contents (Bookmarks) from any PDF and save it as a Markdown file.",
    keywords:
      "extract toc, get pdf bookmarks, extract table of contents, pdf içindekiler çıkar, pdf menü al",
    h1: "Extract Bookmarks (TOC)",
    tagline:
      "Export your PDF's outline tree structure to a structured text file in one click.",
    howToName: "How to extract bookmarks from a PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a PDF document containing a table of contents or bookmarks.",
      },
      {
        name: "Parse outlines",
        text: "We scan the internal document structure locally to extract the entire bookmark hierarchy.",
      },
      {
        name: "Download Markdown",
        text: "Download a neatly structured text file containing your complete table of contents.",
      },
    ],
  },
  tr: {
    title: "İçindekileri Çıkar — PDF Başlık Ağacını Dışa Aktar",
    description:
      "Herhangi bir PDF'in İçindekiler Tablosunu (Yer İmlerini) anında çıkarın ve Markdown dosyası olarak kaydedin.",
    keywords:
      "pdf içindekiler çıkar, pdf toc al, yer imlerini al, extract table of contents, extract bookmarks",
    h1: "İçindekileri Çıkar",
    tagline:
      "PDF belgenizin başlık hiyerarşisini tek tıkla yapılandırılmış bir metin dosyasına aktarın.",
    howToName: "PDF'ten içindekiler nasıl çıkarılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "İçindekiler tablosu veya yer imleri içeren PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Başlıkları çıkar",
        text: "Tüm yer imi hiyerarşisini çıkarmak için belgenin iç yapısını yerel olarak tarıyoruz.",
      },
      {
        name: "Markdown indir",
        text: "Tüm içindekiler tablosunu içeren düzenli ve yapılandırılmış metin dosyasını indirin.",
      },
    ],
  },
};

export const overlayPdfCopy = {
  en: {
    title: "Add Letterhead — overlay a template behind your PDF",
    description:
      "Stamp a company letterhead or invoice template to the background of every page in your PDF document.",
    keywords:
      "overlay pdf, superimpose pdf, merge layers, pdf üst üste koy, pdf katman birleştir, şeffaf pdf ekle",
    h1: "Add Letterhead (Overlay)",
    tagline:
      "Seamlessly embed a template PDF into the background of your target document.",
    howToName: "How to add a letterhead to a PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add target PDF",
        text: "Select the main PDF document you want to stamp with a letterhead.",
      },
      {
        name: "Add template",
        text: "Select your 1-page letterhead or design template PDF to use as the background.",
      },
      {
        name: "Download PDF",
        text: "Download your newly branded document with the template seamlessly applied to every page.",
      },
    ],
  },
  tr: {
    title: "Antet Ekle — PDF'inizin arka planına şablon ekleyin",
    description:
      "Şirket antetli kağıdınızı veya fatura şablonunuzu PDF belgenizin her sayfasının arka planına ekleyin.",
    keywords:
      "pdf üst üste bindir, pdf katman birleştir, overlay pdf, şeffaf katman ekle, antetli kağıt pdf",
    h1: "Antet / Şablon Ekle",
    tagline:
      "Şablon bir PDF'i, hedef belgenizin tüm sayfalarının arka planına kusursuzca gömün.",
    howToName: "PDF'e antet veya şablon nasıl eklenir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "Ana PDF'i ekle",
        text: "Antet veya şablon eklemek istediğiniz asıl PDF belgesini seçin.",
      },
      {
        name: "Şablonu ekle",
        text: "Arka plan olarak kullanılacak tek sayfalık tasarım veya antetli kağıdınızı seçin.",
      },
      {
        name: "PDF indir",
        text: "Şablonun tüm sayfalara kusursuzca uygulandığı yeni kurumsal belgenizi indirin.",
      },
    ],
  },
};

export const changeBgCopy = {
  en: {
    title: "Change PDF Background — Dark Mode & Sepia",
    description:
      "Change the background color of your transparent or white PDFs. Perfect for Dark Mode reading or eye protection.",
    keywords:
      "change pdf background, add background color, remove background pdf, pdf arka plan değiştir, pdf renk değiştir",
    h1: "Change Background Color",
    tagline:
      "Instantly set a custom background color for your PDF pages to reduce eye strain.",
    howToName: "How to change the background color of a PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a transparent or white PDF document onto the page.",
      },
      {
        name: "Select color",
        text: "Choose a soothing color like Dark Gray or Sepia to reduce eye strain.",
      },
      {
        name: "Download PDF",
        text: "Download your newly recolored document, perfectly optimized for nighttime reading.",
      },
    ],
  },
  tr: {
    title: "Arka Plan Rengini Değiştir — Gece Modu & Sepya",
    description:
      "Şeffaf veya beyaz PDF'lerinizin arka plan rengini değiştirin. Gece okuması ve göz koruması için mükemmeldir.",
    keywords:
      "pdf arka plan değiştir, pdf arka plan rengi, pdf renk değiştir, pdf arkaplan sil, change pdf background",
    h1: "Arka Plan Rengini Değiştir",
    tagline:
      "Göz yorgunluğunu azaltmak için PDF sayfalarınızın arka planına anında özel bir renk atayın.",
    howToName: "PDF arka plan rengi nasıl değiştirilir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Şeffaf veya beyaz arka planlı PDF belgenizi sayfaya bırakın.",
      },
      {
        name: "Rengi seç",
        text: "Göz yorgunluğunu azaltmak için Koyu Gri veya Sepya gibi dinlendirici bir renk belirleyin.",
      },
      {
        name: "PDF indir",
        text: "Gece okuması veya uzun çalışmalar için mükemmel hale getirilmiş yeni belgenizi indirin.",
      },
    ],
  },
};

export const autoRedactCopy = {
  en: {
    title: "Auto-Redact PII — hide sensitive information",
    description:
      "Automatically detect and censor Emails, Phone Numbers, and Credit Cards from your PDF using client-side AI.",
    keywords:
      "auto redact pdf, smart redact, hide sensitive info, auto censor pdf, otomatik sansür, pdf hassas veri gizle",
    h1: "Auto-Redact PDF",
    tagline:
      "Black out Personally Identifiable Information (PII) with zero uploads.",
    howToName: "How to auto-redact a PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the document containing personally identifiable information (PII) onto the page.",
      },
      {
        name: "Scan and redact",
        text: "Our local AI scans the text to detect and draw black boxes over sensitive data.",
      },
      {
        name: "Download PDF",
        text: "Download the safely censored document, completely redacting sensitive information.",
      },
    ],
  },
  tr: {
    title: "Otomatik Sansür — kişisel verileri gizleyin",
    description:
      "PDF'nizdeki E-posta, Telefon ve Kredi Kartı gibi kişisel verileri (PII) otomatik olarak tespit edip sansürleyin.",
    keywords:
      "otomatik sansür, pdf hassas veri karart, akıllı redact, otomatik gizle, auto redact pdf",
    h1: "Otomatik PDF Sansür",
    tagline:
      "Kişisel verilerinizi %100 gizlilikle otomatik siyah kutulara alın.",
    howToName: "PDF nasıl otomatik sansürlenir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Kişisel veri veya gizli bilgiler (PII) içeren belgeyi sayfaya bırak.",
      },
      {
        name: "Tara ve sansürle",
        text: "Yapay zekamız metni tarayıp hassas verilerin üzerine siyah kutular çizer.",
      },
      {
        name: "PDF olarak indir",
        text: "Hassas bilgileri tamamen sansürlenmiş güvenli PDF belgenizi indirin.",
      },
    ],
  },
};

export const smartMarkdownCopy = {
  en: {
    title: "Smart PDF to Markdown — AI-ready export",
    description:
      "Convert PDFs to structured Markdown. Infers headings (H1, H2, H3) based on font sizes automatically.",
    keywords:
      "smart markdown, ai pdf to md, structured markdown converter, akıllı markdown, pdf ten markdown a",
    h1: "Smart PDF to Markdown",
    tagline:
      "Perfect for LLMs and AI agents. Get structured MD files instantly.",
    howToName: "How to convert PDF to Markdown",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a text-heavy PDF document or report onto the page.",
      },
      {
        name: "Analyze structure",
        text: "We analyze font sizes locally to accurately infer document hierarchy and headings.",
      },
      {
        name: "Download Markdown",
        text: "Download a clean, structured Markdown (.md) file ready for AI agents or text editors.",
      },
    ],
  },
  tr: {
    title: "Akıllı PDF to Markdown — Yapay Zeka Çıktısı",
    description:
      "PDF'leri yapılandırılmış Markdown formatına dönüştürün. Başlıkları font boyutlarına göre otomatik algılar.",
    keywords:
      "akıllı markdown, pdf to md, yapılandırılmış md, smart markdown converter, pdf ten md ye",
    h1: "PDF to Markdown",
    tagline:
      "LLM ve yapay zeka ajanları için kusursuz. Anında yapılandırılmış MD dosyaları alın.",
    howToName: "PDF Markdown'a nasıl dönüştürülür",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Metin ağırlıklı PDF belgenizi veya makalenizi sayfaya bırak.",
      },
      {
        name: "Yapıyı analiz et",
        text: "Belge hiyerarşisini ve başlıkları doğru çıkarmak için font boyutlarını yerel olarak analiz ediyoruz.",
      },
      {
        name: "Markdown indir",
        text: "Yapay zeka araçları için hazır, yapılandırılmış temiz Markdown (.md) dosyanızı indirin.",
      },
    ],
  },
};

export const contrastEnhancerCopy = {
  en: {
    title: "Enhance PDF — adjust contrast & brightness",
    description:
      "Fix bad scans by increasing contrast and brightness. Make faded text crisp and readable again.",
    keywords:
      "enhance pdf contrast, darken pdf text, readable pdf, improve scan quality, pdf kontrast artır, soluk yazıyı koyulaştır",
    h1: "Enhance Scanned PDF",
    tagline: "Adjust brightness and contrast of poor PDF scans effortlessly.",
    howToName: "How to enhance a scanned PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the poorly scanned or faded PDF document onto the page.",
      },
      {
        name: "Enhance contrast",
        text: "We locally process image filters to increase brightness and adjust contrast for perfect readability.",
      },
      {
        name: "Download PDF",
        text: "Download the enhanced, crisp, and clear document instantly.",
      },
    ],
  },
  tr: {
    title: "PDF Netleştir — kontrast ve parlaklık artır",
    description:
      "Kötü taranmış soluk belgelerin kontrastını artırarak metinleri cam gibi net hale getirin.",
    keywords:
      "pdf kontrast artır, soluk yazıyı netleştir, tarama kalitesi artır, enhance pdf contrast, darken text",
    h1: "Taranmış PDF Netleştir",
    tagline:
      "Soluk PDF taramalarının parlaklığını ve kontrastını zahmetsizce ayarlayın.",
    howToName: "Taranmış PDF nasıl netleştirilir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Kötü taranmış veya soluk görünen PDF belgenizi sayfaya bırakın.",
      },
      {
        name: "Kontrastı artır",
        text: "Mükemmel okunabilirlik için parlaklık ve kontrast filtrelerini yerel olarak uyguluyoruz.",
      },
      {
        name: "PDF indir",
        text: "Metinlerin cam gibi netleştiği, geliştirilmiş belgenizi anında indirin.",
      },
    ],
  },
};

export const pdfToHtmlCopy = {
  en: {
    title: "PDF to HTML — export as web page",
    description:
      "Convert your PDF documents into clean, semantic HTML files directly in your browser.",
    keywords:
      "pdf to html, convert pdf to web page, pdf to code, pdf html yap, web sayfası yap, pdf i koda çevir",
    h1: "PDF to HTML Converter",
    tagline:
      "Publish your PDFs on the web easily without losing text formatting.",
    howToName: "How to convert PDF to HTML",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to publish on the web.",
      },
      {
        name: "Convert layout",
        text: "We locally parse the text and layout to create a semantic, responsive web page.",
      },
      {
        name: "Download HTML",
        text: "Download a clean HTML file that maintains your original text formatting.",
      },
    ],
  },
  tr: {
    title: "PDF to HTML — web sayfası yap",
    description:
      "PDF belgelerinizi doğrudan tarayıcınızda temiz ve anlamsal (semantic) HTML dosyalarına dönüştürün.",
    keywords:
      "pdf html yap, pdf ten web sayfasına, pdf to html, web uymulu pdf, kodu html çevir",
    h1: "PDF HTML Çevirici",
    tagline: "PDF'lerinizi web'de kolayca yayınlayın.",
    howToName: "PDF HTML'e nasıl çevrilir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "İnternette sayfa olarak yayınlamak istediğiniz PDF belgesini buraya bırakın.",
      },
      {
        name: "Düzeni dönüştür",
        text: "Anlamsal (semantic) bir web sayfası oluşturmak için metni ve düzeni yerel olarak ayrıştırıyoruz.",
      },
      {
        name: "HTML indir",
        text: "Orijinal metin formatınızı koruyan, web uyumlu temiz HTML dosyasını indirin.",
      },
    ],
  },
};

export const extractFontsCopy = {
  en: {
    title: "Extract Fonts from PDF — recover TTF/OTF",
    description:
      "Find and extract embedded TrueType (TTF) and OpenType (OTF) font files from any PDF.",
    keywords:
      "extract fonts, get pdf fonts, download pdf font, pdf font çıkar, font ayıkla, pdf yazı tipi al",
    h1: "Extract PDF Fonts",
    tagline:
      "A lifesaver for graphic designers. Recover original fonts instantly.",
    howToName: "How to extract fonts from PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a PDF document containing custom embedded typography.",
      },
      {
        name: "Extract fonts",
        text: "We scan the resource dictionaries locally to recover raw TTF and OTF font files.",
      },
      {
        name: "Download ZIP",
        text: "Download a ZIP archive containing all the original font files used in the document.",
      },
    ],
  },
  tr: {
    title: "PDF Font Çıkarıcı — TTF/OTF Kurtar",
    description:
      "Herhangi bir PDF içine gömülmüş TrueType (TTF) ve OpenType (OTF) font dosyalarını bulup çıkarın.",
    keywords:
      "pdf font çıkar, yazı tipi al, font ayıkla, pdf içindeki fontu bul, extract fonts",
    h1: "PDF Font Kurtarıcı",
    tagline:
      "Tasarımcılar için hayat kurtarıcı. Orijinal fontları saniyeler içinde geri alın.",
    howToName: "PDF'den font nasıl çıkarılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Özel tipografi ve gömülü fontlar içeren PDF belgesini sayfaya bırak.",
      },
      {
        name: "Fontları ayıkla",
        text: "TTF ve OTF font dosyalarını kurtarmak için PDF kaynak sözlüklerini yerel olarak tarıyoruz.",
      },
      {
        name: "ZIP indir",
        text: "Belgede kullanılan tüm orijinal font dosyalarını içeren tek bir ZIP arşivi indirin.",
      },
    ],
  },
};

export const removeImagesCopy = {
  en: {
    title: "Remove Images from PDF — ink saver",
    description:
      "Strip all images, photos, and heavy graphics from your PDF to save 90% printer ink.",
    keywords:
      "remove images from pdf, delete pictures, text only pdf, strip images, pdf resimleri sil, grafik sil",
    h1: "Remove Images from PDF",
    tagline:
      "Create text-only documents instantly. Perfect for printing long slides.",
    howToName: "How to remove images from PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a heavy PDF filled with photos or graphics onto the page.",
      },
      {
        name: "Strip images",
        text: "We safely locate and delete all heavy image objects directly within the browser.",
      },
      {
        name: "Download PDF",
        text: "Download an ink-saving, text-only document that prints instantly.",
      },
    ],
  },
  tr: {
    title: "Görselleri Sil — Mürekkep Tasarrufu",
    description:
      "Yazıcı mürekkebinden %90 tasarruf etmek için PDF'nizdeki tüm resimleri ve ağır grafikleri silin.",
    keywords:
      "pdf resimleri sil, grafikleri kaldır, sadece metin pdf, resimsiz pdf, remove pdf images",
    h1: "PDF Resimlerini Sil",
    tagline:
      "Saniyeler içinde sadece-metin belgeleri oluşturun. Slayt yazdırmak için ideal.",
    howToName: "PDF'den resimler nasıl silinir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Fotoğraflar ve ağır grafiklerle dolu PDF belgenizi sayfaya bırakın.",
      },
      {
        name: "Resimleri sil",
        text: "Tarayıcı içinde tüm ağır görsel nesneleri güvenli bir şekilde bulup kalıcı olarak siliyoruz.",
      },
      {
        name: "PDF indir",
        text: "Yazıcıdan anında çıkan, mürekkep tasarruflu, yalnızca metinden oluşan belgenizi indirin.",
      },
    ],
  },
};

export const extractUrlsCopy = {
  en: {
    title: "Extract URLs from PDF — link parser",
    description:
      "Find all clickable links, URLs, and external references inside a PDF and export them.",
    keywords:
      "extract urls, get pdf links, find hyperlinks, pdf linkleri çıkar, bağlantıları al, url ayıkla",
    h1: "Extract Links from PDF",
    tagline:
      "Parse academic papers and reports for external references in one click.",
    howToName: "How to extract links from PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop an academic paper or report containing hyperlinks.",
      },
      {
        name: "Parse links",
        text: "We scan through all pages locally to locate click annotations and external references.",
      },
      {
        name: "Download TXT",
        text: "Download a clean text file listing all the URLs found in your document.",
      },
    ],
  },
  tr: {
    title: "Linkleri Çıkar — URL Ayrıştırıcı",
    description:
      "Bir PDF'in içindeki tüm tıklanabilir bağlantıları, URL'leri ve harici referansları bulup dışa aktarın.",
    keywords:
      "pdf linkleri çıkar, url ayıkla, bağlantıları al, extract links, get pdf urls",
    h1: "PDF'den Link Çıkar",
    tagline:
      "Akademik makaleler ve raporlardaki bağlantıları tek tıkla listeleyin.",
    howToName: "PDF'den linkler nasıl çıkarılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Tıklanabilir bağlantılar içeren makale veya raporu sayfaya bırakın.",
      },
      {
        name: "Linkleri bul",
        text: "Bağlantı noktalarını ve harici referansları bulmak için tüm sayfaları yerel olarak tarıyoruz.",
      },
      {
        name: "TXT indir",
        text: "Belgenizde bulunan tüm URL'leri listeleyen temiz bir metin dosyasını indirin.",
      },
    ],
  },
};

export const removeDuplicatesCopy = {
  en: {
    title: "Remove Duplicate Pages — de-duplicator",
    description:
      "Automatically find and delete visually identical pages from your PDF.",
    keywords:
      "remove duplicate pages, delete repeated pages, clean pdf, mükerrer sayfa sil, aynı sayfaları sil, kopya sayfa kaldır",
    h1: "Remove Duplicate Pages",
    tagline:
      "Clean up merged or poorly scanned documents by eliminating double pages.",
    howToName: "How to remove duplicate PDF pages",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a poorly scanned or merged document with duplicate pages.",
      },
      {
        name: "Compare pages",
        text: "We perform a fast, local pixel-hash comparison to identify visually identical pages.",
      },
      {
        name: "Download PDF",
        text: "Download a clean, de-duplicated document free of any double pages.",
      },
    ],
  },
  tr: {
    title: "Kopya Sayfaları Sil — Tekilleştirici",
    description:
      "PDF'nizdeki görsel olarak tamamen aynı olan kopya sayfaları otomatik bulup silin.",
    keywords:
      "kopya sayfa sil, mükerrer sayfaları kaldır, aynı sayfaları çıkar, remove duplicate pages",
    h1: "Kopya Sayfaları Sil",
    tagline: "Hatalı taranmış belgelerdeki çifte sayfaları yok edin.",
    howToName: "PDF'deki çift sayfalar nasıl silinir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Çift çekilmiş veya kopya sayfalar barındıran belgeyi sayfaya bırak.",
      },
      {
        name: "Sayfaları kıyasla",
        text: "Görsel olarak tamamen aynı olan sayfaları bulmak için hızlı bir piksel karşılaştırması yapıyoruz.",
      },
      {
        name: "PDF indir",
        text: "Kopya sayfalardan tamamen arındırılmış temiz ve tekilleştirilmiş belgenizi indirin.",
      },
    ],
  },
};

export const extractAttachmentsCopy = {
  en: {
    title: "Extract Attachments — recover embedded files",
    description:
      "Find and extract hidden XML, Word, Excel, or other files embedded inside a PDF.",
    keywords:
      "extract attachments, download embedded files, pdf attachments, pdf eklerini çıkar, gömülü dosya al",
    h1: "Extract PDF Attachments",
    tagline: "Recover hidden files and portfolios instantly.",
    howToName: "How to extract attachments from PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a PDF containing portfolios or embedded e-invoice XML files.",
      },
      {
        name: "Extract files",
        text: "We scan the embedded files dictionary locally to securely recover all attachments.",
      },
      {
        name: "Download ZIP",
        text: "Download a single ZIP archive containing all the hidden attached files.",
      },
    ],
  },
  tr: {
    title: "Ek Dosyaları Sök — Gömülü dosyaları kurtar",
    description:
      "PDF içine gizlenmiş XML, Word, Excel gibi gömülü ek dosyaları (attachments) bulup çıkarın.",
    keywords:
      "pdf eklerini çıkar, gömülü dosyaları al, ek dosya indir, extract attachments pdf",
    h1: "PDF Ek Dosyası Çıkarıcı",
    tagline:
      "E-faturalardaki veya kurum belgelerindeki gizli dosyaları kurtarın.",
    howToName: "PDF'den ekler nasıl çıkarılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "İçinde e-fatura XML'i veya ekli portfolyo dosyaları bulunan belgeyi bırak.",
      },
      {
        name: "Dosyaları ayıkla",
        text: "Tüm ekleri güvenle kurtarmak için gömülü dosyalar bölümünü yerel olarak tarıyoruz.",
      },
      {
        name: "ZIP indir",
        text: "Belge içine gizlenmiş tüm ek dosyaları içeren tek bir ZIP arşivini indirin.",
      },
    ],
  },
};

export const extractColorsCopy = {
  en: {
    title: "Extract Color Palette — find HEX codes",
    description:
      "Scan your PDF to extract a complete color palette of all HEX codes used in vectors, backgrounds, and fonts.",
    keywords:
      "extract colors, pdf color palette, get hex codes, find pdf colors, pdf renk paleti çıkar, renk kodlarını al",
    h1: "PDF Color Palette Extractor",
    tagline: "The ultimate tool for graphic designers and brand managers.",
    howToName: "How to extract colors from PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a beautifully designed PDF or vector graphic onto the page.",
      },
      {
        name: "Scan colors",
        text: "We locally analyze all raw drawing operations to extract the exact HEX color codes.",
      },
      {
        name: "Download Palette",
        text: "Download a comprehensive text file containing the entire document color palette.",
      },
    ],
  },
  tr: {
    title: "Renk Paleti Çıkarıcı — HEX Kodlarını Bul",
    description:
      "Vektörlerde, arka planlarda ve metinlerde kullanılan tüm HEX renk kodlarını çıkarıp tam bir renk paleti oluşturun.",
    keywords:
      "pdf renk paleti çıkar, hex kodları al, renkleri bul, extract pdf colors, get color palette",
    h1: "PDF Renk Hırsızı",
    tagline: "Grafikerler ve tasarımcılar için bulunmaz bir araç.",
    howToName: "PDF'den renkler nasıl çıkarılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Güzel tasarlanmış bir PDF veya vektörel grafik belgesini sayfaya bırak.",
      },
      {
        name: "Renkleri tara",
        text: "Tam HEX kodlarını çıkarmak için tüm ham çizim operasyonlarını yerel olarak analiz ediyoruz.",
      },
      {
        name: "Paleti indir",
        text: "Belgede kullanılan tüm renk paletini içeren kapsamlı metin dosyasını indirin.",
      },
    ],
  },
};

export const removeTextCopy = {
  en: {
    title: "Remove Text from PDF — template mode",
    description:
      "Strip all text from a PDF, leaving only images, graphics, and backgrounds intact.",
    keywords:
      "remove text from pdf, delete text, image only pdf, clear text, pdf metin sil, yazıları kaldır",
    h1: "Remove Text from PDF",
    tagline:
      "Perfect for stealing templates or preparing documents for translation.",
    howToName: "How to remove text from PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the document you want to use as a visual template.",
      },
      {
        name: "Strip text",
        text: "We safely delete all text drawing operators locally, leaving backgrounds intact.",
      },
      {
        name: "Download PDF",
        text: "Download your text-free document, perfectly prepped for translation or recreation.",
      },
    ],
  },
  tr: {
    title: "Metinleri Sil — Sadece Görsel/Şablon",
    description:
      "Sadece resimlerin ve arka planların kalması için PDF'teki tüm metinleri tamamen silin.",
    keywords:
      "pdf metin sil, yazıları tamamen kaldır, sadece resim pdf, remove text from pdf",
    h1: "PDF Yazılarını Sil",
    tagline: "Şablonları kopyalamak veya çeviri altlığı hazırlamak için ideal.",
    howToName: "PDF'den metin nasıl silinir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Görsel şablon olarak kullanmak istediğiniz PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Metni sil",
        text: "Arka planlara dokunmadan, sadece metin çizim komutlarını yerel olarak güvenle siliyoruz.",
      },
      {
        name: "PDF indir",
        text: "Çeviri veya yeniden tasarım için hazır, metinden arındırılmış şablonunuzu indirin.",
      },
    ],
  },
};

export const extractJavascriptCopy = {
  en: {
    title: "Extract JavaScript — malware analysis",
    description:
      "Scan and extract embedded JavaScript code from PDF documents for security and malware analysis.",
    keywords:
      "extract javascript, find pdf scripts, get embedded js, pdf js çıkar, pdf script ayıkla, güvenlik analizi",
    h1: "PDF JavaScript Extractor",
    tagline: "The ultimate tool for cyber security analysts.",
    howToName: "How to extract JavaScript from PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a potentially malicious PDF document onto the page.",
      },
      {
        name: "Scan and extract",
        text: "We parse the document structure locally to find and extract all embedded JavaScript code.",
      },
      {
        name: "Download JS",
        text: "Download a clean .js file to safely analyze the code.",
      },
    ],
  },
  tr: {
    title: "JS Sökücü — Malware Analizi",
    description:
      "Siber güvenlik ve zararlı yazılım analizi için PDF belgelerine gizlenmiş JavaScript kodlarını tespit edip çıkarın.",
    keywords:
      "pdf js çıkar, pdf javascript al, betikleri ayıkla, gömülü kodu bul, extract pdf javascript",
    h1: "PDF JavaScript Sökücü",
    tagline: "Siber güvenlik uzmanları için eşsiz bir araç.",
    howToName: "PDF'den JavaScript nasıl çıkarılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Şüpheli olabilecek PDF belgesini sayfaya bırak.",
      },
      {
        name: "Tara ve ayıkla",
        text: "Tüm belge yapısını yerel olarak tarayıp gizlenmiş JavaScript kodlarını tespit ediyoruz.",
      },
      {
        name: "JS dosyasını indir",
        text: "Kodları güvenle analiz edebilmek için temiz bir .js dosyası olarak indir.",
      },
    ],
  },
};

export const splitBookmarksCopy = {
  en: {
    title: "Split by Bookmarks — auto chapter split",
    description:
      "Automatically split large textbooks or reports into multiple PDFs based on their Table of Contents (TOC) bookmarks.",
    keywords:
      "split by bookmarks, divide by chapters, split pdf sections, pdf yer imlerine göre böl, bölümlere ayır",
    h1: "Split PDF by Bookmarks",
    tagline: "Instantly break down textbooks into chapters.",
    howToName: "How to split PDF by TOC",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a large textbook or report that contains a Table of Contents.",
      },
      {
        name: "Detect chapters",
        text: "We instantly read the bookmarks to identify all chapter breakpoints.",
      },
      {
        name: "Split and download",
        text: "Extract and download a ZIP file containing each chapter as a separate PDF.",
      },
    ],
  },
  tr: {
    title: "Bölümlere Göre Parçala — İçindekiler Ayırıcı",
    description:
      "Büyük ders kitaplarını veya raporları, İçindekiler (TOC) tablosundaki bölüm başlıklarına göre otomatik olarak ayrı PDF'lere bölün.",
    keywords:
      "pdf yer imlerine göre böl, bölümlere göre ayır, split by bookmarks pdf, chapter split",
    h1: "İçindekiler Tablosuna Göre Böl",
    tagline: "Yüzlerce sayfalık kitapları saniyeler içinde bölümlere ayırın.",
    howToName: "PDF bölümlere göre nasıl ayrılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "İçindekiler tablosu (TOC) bulunan büyük bir ders kitabı veya raporu sayfaya bırak.",
      },
      {
        name: "Bölümleri algıla",
        text: "İçindekiler listesini anında okuyarak bölüm başlangıç noktalarını belirliyoruz.",
      },
      {
        name: "Böl ve indir",
        text: "Her bir bölümü ayrı bir PDF'e ayırıp tek bir ZIP arşivi olarak indir.",
      },
    ],
  },
};

export const splitBlankCopy = {
  en: {
    title: "Split by Blank Page — auto scanner split",
    description:
      "Automatically divide a large scanned PDF into multiple documents whenever a blank page is detected.",
    keywords:
      "split at blank pages, divide by empty page, scan separator, pdf boş sayfada böl, ayırıcı sayfa",
    h1: "Split PDF by Blank Page",
    tagline: "A lifesaver for batch scanning and archiving.",
    howToName: "How to split PDF by blank pages",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop your batch-scanned PDF file onto the page.",
      },
      {
        name: "Scan for blanks",
        text: "We analyze every pixel locally to detect completely blank separator pages.",
      },
      {
        name: "Split and download",
        text: "Download a ZIP archive containing your perfectly separated individual documents.",
      },
    ],
  },
  tr: {
    title: "Boş Sayfadan Parçala — Tarayıcı Ayırıcı",
    description:
      "Tarayıcıdan toplu olarak taranmış büyük bir belgeyi, aradaki boş sayfaları tespit ederek otomatik olarak ayrı PDF'lere bölün.",
    keywords:
      "pdf boş sayfada böl, tarama ayırıcı, boş sayfadan sonra ayır, split at blank page",
    h1: "Boş Sayfalardan Böl",
    tagline: "Arşivciler ve fotokopi merkezleri için devrim niteliğinde.",
    howToName: "PDF boş sayfalara göre nasıl bölünür",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Toplu olarak taranmış PDF belgesini sayfaya bırak.",
      },
      {
        name: "Boş sayfaları tara",
        text: "Belgeyi ayıran tamamen boş sayfaları bulmak için her pikseli yerel olarak analiz ediyoruz.",
      },
      {
        name: "Böl ve indir",
        text: "Kusursuzca ayrılmış bireysel evraklarınızı tek bir ZIP arşivi halinde indir.",
      },
    ],
  },
};

export const viewerPrefsCopy = {
  en: {
    title: "Viewer Preferences — PDF auto open settings",
    description:
      "Configure how your PDF behaves when opened. Force full screen mode, hide toolbars, or center the window automatically.",
    keywords:
      "edit viewer preferences, pdf initial view, fullscreen pdf, pdf görünüm ayarları, başlangıç görünümü düzenle",
    h1: "Set PDF Viewer Preferences",
    tagline: "Professional presentation settings for eBooks and reports.",
    howToName: "How to set PDF initial view",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to configure.",
      },
      {
        name: "Set preferences",
        text: "Choose to force full-screen mode, hide toolbars, or center the window automatically.",
      },
      {
        name: "Save settings",
        text: "Download the modified PDF with your new professional presentation settings applied.",
      },
    ],
  },
  tr: {
    title: "Açılış Ayarları — PDF görünümünü ayarla",
    description:
      "PDF'iniz açıldığında nasıl davranacağını kodlayın. Tam ekranda açmaya zorlayın veya menü çubuklarını gizleyin.",
    keywords:
      "pdf görünüm ayarları, tam ekran açılış, pdf başlangıç görünümü, edit viewer preferences",
    h1: "PDF Açılış Ayarları (ViewerPrefs)",
    tagline: "E-kitaplar ve profesyonel sunumlar için olmazsa olmaz.",
    howToName: "PDF açılış ayarları nasıl yapılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Açılış ayarlarını değiştirmek istediğin PDF belgesini sayfaya bırak.",
      },
      {
        name: "Tercihleri belirle",
        text: "Tam ekran moduna zorlamayı, araç çubuklarını gizlemeyi veya pencereyi ortalamayı seç.",
      },
      {
        name: "Ayarları kaydet",
        text: "Profesyonel sunum ayarlarının uygulandığı yeni PDF belgesini indir.",
      },
    ],
  },
};

export const extractHiddenTextCopy = {
  en: {
    title: "Extract Hidden Text — forensics tool",
    description:
      "A forensics tool to detect and extract invisible or white-on-white text hidden inside a PDF document.",
    keywords:
      "extract hidden text, find invisible text, get ocr layer, pdf gizli metin çıkar, görünmez yazıları bul",
    h1: "Hidden Text Detector",
    tagline: "Uncover hidden trackers, SEO spam, or steganography.",
    howToName: "How to detect hidden text in PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a suspicious PDF document onto the page.",
      },
      {
        name: "Scan for forensics",
        text: "We analyze raw content streams locally to detect invisible rendering modes and hidden text.",
      },
      {
        name: "Download report",
        text: "Download a text file containing all the hidden trackers, SEO spam, or steganography we found.",
      },
    ],
  },
  tr: {
    title: "Gizli Yazı Dedektörü — Forensics aracı",
    description:
      "Adli bilişim (forensics) amaçlı olarak PDF içine gizlenmiş, görünmez kodlu veya beyaz metinleri tespit edip çıkarın.",
    keywords:
      "pdf gizli metin çıkar, görünmez yazıları al, ocr katmanını bul, extract hidden text",
    h1: "Gizli Metin Sökücü",
    tagline: "SEO spamlarnı veya görünmez filigranları ortaya çıkarın.",
    howToName: "PDF'den gizli metin nasıl çıkarılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Şüpheli gördüğün PDF belgesini sayfaya bırak.",
      },
      {
        name: "Adli analiz yap",
        text: "Görünmez katmanları ve gizli metinleri bulmak için belgenin ham veri akışını yerel olarak tarıyoruz.",
      },
      {
        name: "Raporu indir",
        text: "Bulduğumuz tüm gizli SEO spam'lerini ve takipçileri içeren metin dosyasını indir.",
      },
    ],
  },
};

export const wipeBookmarksCopy = {
  en: {
    title: "Wipe Bookmarks — remove TOC",
    description:
      "Completely delete the Table of Contents (Bookmarks) structure from a PDF for privacy or file size reduction.",
    keywords:
      "remove bookmarks, wipe outlines, delete toc, pdf yer imlerini sil, içindekiler tablosunu temizle",
    h1: "Remove PDF Bookmarks",
    tagline: "Hide your document structure before publishing.",
    howToName: "How to delete PDF bookmarks",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a PDF document that contains a Table of Contents or bookmarks.",
      },
      {
        name: "Destroy outlines",
        text: "We safely remove the entire outlines hierarchy and document structure locally.",
      },
      {
        name: "Download clean PDF",
        text: "Download your cleaned document, free of any internal structural metadata.",
      },
    ],
  },
  tr: {
    title: "İçindekiler Silici — Outline Yok Et",
    description:
      'Gizlilik veya boyut tasarrufu amacıyla PDF içindeki "İçindekiler" (Bookmarks/Outlines) ağacını tamamen yok edin.',
    keywords:
      "pdf yer imlerini sil, outline temizle, içindekileri kaldır, remove pdf bookmarks",
    h1: "PDF İçindekiler Silici",
    tagline: "Belgenizin iskeletini ve başlık hiyerarşisini gizleyin.",
    howToName: "PDF içindekiler nasıl silinir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "İçindekiler tablosu veya yer imleri (bookmarks) olan PDF belgesini sayfaya bırak.",
      },
      {
        name: "Yapıyı yok et",
        text: "Belgenin tüm iskelet yapısını ve içindekiler hiyerarşisini güvenli bir şekilde tamamen siliyoruz.",
      },
      {
        name: "Temiz PDF'i indir",
        text: "İç yapısal meta verilerden tamamen arındırılmış temiz belgenizi indir.",
      },
    ],
  },
};

export const extractTablesCopy = {
  en: {
    title: "Extract Tables — PDF to CSV",
    description:
      "Mathematically analyze bounding boxes to extract tabular data from PDF into an Excel-ready CSV format.",
    keywords:
      "extract tables pdf, pdf to csv, pdf to excel, get grid data, pdf tablo çıkar, pdf excel yap, tablo ayıkla",
    h1: "PDF to CSV Converter",
    tagline: "Automated tabular data extraction for analysts.",
    howToName: "How to extract PDF tables",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop a PDF document containing tabular data onto the page.",
      },
      {
        name: "Analyze layout",
        text: "We mathematically calculate text alignments and bounding boxes to reconstruct rows and columns.",
      },
      {
        name: "Download CSV",
        text: "Download the extracted data as an Excel-ready CSV file.",
      },
    ],
  },
  tr: {
    title: "Tablo Çıkarıcı — PDF to CSV",
    description:
      "PDF içindeki metin hizalamalarını matematiksel analiz ederek verileri Excel (CSV) formatına dökün.",
    keywords:
      "pdf tablo çıkar, pdf excel yap, pdf to csv, tablo ayıkla, extract tables",
    h1: "PDF Tablo Çıkarıcı (CSV)",
    tagline: "Fatura ve veri analizleri için birebir.",
    howToName: "PDF içindeki tablolar nasıl çıkarılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "İçinde tablolar bulunan PDF belgesini sayfaya bırak.",
      },
      {
        name: "Düzeni analiz et",
        text: "Satır ve sütunları yeniden oluşturmak için metin hizalamalarını matematiksel olarak hesaplıyoruz.",
      },
      {
        name: "CSV olarak indir",
        text: "Çıkarılan tüm tablo verilerini Excel'de açılabilir bir CSV dosyası olarak indir.",
      },
    ],
  },
};

export const pdfToJsonCopy = {
  en: {
    title: "PDF to JSON — for developers",
    description:
      "Convert a PDF into a structured JSON payload containing text, fonts, and bounding box coordinates.",
    keywords:
      "pdf to json, structured pdf data, parse pdf, extract data json, pdf json yap, verileri json al",
    h1: "PDF to JSON Converter",
    tagline: "A developer tool for AI pipelines and parsing.",
    howToName: "How to convert PDF to JSON",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to parse onto the page.",
      },
      {
        name: "Parse structure",
        text: "We process the document locally to build a complete structural tree with exact coordinates.",
      },
      {
        name: "Download JSON",
        text: "Download the raw JSON data, ready to be used in AI pipelines or developer tools.",
      },
    ],
  },
  tr: {
    title: "PDF to JSON — Yazılımcılar İçin",
    description:
      "Yazılımcılar ve AI projeleri için PDF belgelerini tüm yapısal haritası ve koordinatlarıyla JSON formatına çevirin.",
    keywords:
      "pdf json yap, verileri json al, pdf to json, parse pdf, yapılandırılmış veri",
    h1: "PDF to JSON Çevirici",
    tagline: "Geliştiricilerin aradığı o eşsiz araç.",
    howToName: "PDF JSON formatına nasıl çevrilir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Ayrıştırmak (parse) istediğin PDF belgesini sayfaya bırak.",
      },
      {
        name: "Yapıyı ayrıştır",
        text: "Tam koordinatları içeren yapısal bir veri haritası oluşturmak için belgeyi yerel olarak işliyoruz.",
      },
      {
        name: "JSON olarak indir",
        text: "Yapay zeka veya yazılım projelerinde kullanılmaya hazır ham JSON verisini indir.",
      },
    ],
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
    title: "Audio Reader — Text to Speech",
    description:
      "Extract raw text from a PDF optimized for audio reading (Text-to-Speech) software and audiobooks.",
    keywords:
      "listen to pdf, read pdf aloud, pdf text to speech, tts pdf, sesli pdf okuma, pdf dinle, metin seslendirme",
    h1: "PDF Audio Reader Prep",
    tagline: "Prepare your documents for smooth listening.",
    howToName: "How to make a PDF ready for audio",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to listen to onto the page.",
      },
      {
        name: "Extract flowing text",
        text: "We extract and clean the raw text locally, removing page numbers and weird line breaks.",
      },
      {
        name: "Download TXT",
        text: "Download a clean text file perfectly optimized for Text-to-Speech (TTS) engines.",
      },
    ],
  },
  tr: {
    title: "Sesli Okuma — TTS Hazırlık",
    description:
      "PDF belgelerindeki metinleri Sesli Kitap (Text-to-Speech) uygulamalarının pürüzsüz okuyabilmesi için saf txt formatına dökün.",
    keywords:
      "sesli pdf okuma, pdf dinle, metin seslendirme, tts pdf, listen to pdf, read aloud pdf",
    h1: "Sesli Okuyucu Hazırlığı",
    tagline: "Belgelerinizi dinlemek için en temiz formata çevirin.",
    howToName: "PDF sese nasıl çevrilir",
    howItWorks: "Nasıl çalışır",
    steps: [
      { name: "Yükle", text: "Okunabilir bir PDF seçin." },
      { name: "Ayıkla", text: "Sayfa numaraları ve kırılmalar temizlenir." },
      { name: "İndir", text: "Ses motorları için pürüzsüz bir metin indirin." },
    ],
  },
};
