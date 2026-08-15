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
    title: "Reverse PDF Pages — change page order",
    description:
      "Reverse the order of pages in your PDF document instantly. Fast, free, and completely local.",
    keywords:
      "reverse pdf, invert page order, flip pdf pages, reverse pdf order, pdf ters çevir, sondan başa pdf",
    h1: "Reverse PDF Pages",
    tagline: "Reverse your PDF page order from last to first in seconds.",
    howToName: "How to reverse PDF page order",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document whose page order you want to invert.",
      },
      {
        name: "Reverse order",
        text: "We instantly flip the entire document so the last page becomes the first locally.",
      },
      {
        name: "Download PDF",
        text: "Download your properly reversed PDF document.",
      },
    ],
    faq: [
      {
        q: "Why would I need to reverse PDF pages?",
        a: "This tool is extremely useful if a document was fed backwards into a physical scanner, resulting in the last page appearing first.",
      },
      {
        q: "Are my files uploaded?",
        a: "No. The entire process runs inside your web browser locally. Your files are never uploaded to our servers.",
      },
    ],
    crossLink: {
      href: "/organize-pdf",
      label: "Need to manually reorder pages? Organize PDF.",
    },
  },
  tr: {
    title: "PDF Sayfalarını Tersine Çevir — sayfa sırasını değiştirin",
    description:
      "PDF belgenizdeki sayfaların sırasını anında tersine çevirin. Hızlı, ücretsiz ve tamamen yerel.",
    keywords:
      "pdf ters çevir, pdf sayfa sırasını ters çevir, pdf sondan başa, sayfaları tersine çevir",
    h1: "Sayfaları Tersine Çevir",
    tagline:
      "PDF sayfa sıranızı saniyeler içinde sondan başa doğru tersine çevirin.",
    howToName: "PDF sayfa sırası nasıl tersine çevrilir",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Sayfa sırasını tersine çevirmek istediğiniz PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Sırayı tersine çevir",
        text: "Son sayfa ilk sayfa olacak şekilde tüm belgeyi yerel olarak anında ters çeviriyoruz.",
      },
      {
        name: "PDF indir",
        text: "Düzgün bir şekilde ters çevrilmiş PDF belgenizi indirin.",
      },
    ],
    faq: [
      {
        q: "PDF sayfalarını neden tersine çevirmem gerekir?",
        a: "Bu araç, fiziksel bir tarayıcıya sayfalar ters yerleştirildiğinde ve son sayfa ilk sırada çıktığında son derece yararlıdır.",
      },
      {
        q: "Dosyalarım sunucuya yükleniyor mu?",
        a: "Hayır. Tüm işlemler doğrudan tarayıcınızın içinde yerel olarak gerçekleşir. Dosyalarınız asla sunucularımıza yüklenmez.",
      },
    ],
    crossLink: {
      href: "/tr/organize-pdf",
      label: "Sayfaları elle mi sıralamak istiyorsunuz? PDF Düzenle.",
    },
  },
};
export const batesCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Add Bates Numbering to PDF — professional document stamping",
    description:
      "Add Bates numbers to your PDF documents instantly. Perfect for legal professionals. Free, fast, and completely local.",
    keywords:
      "bates numbering, bates stamp, legal stamp pdf, add bates number, bates damgası, bates numaralandırma",
    h1: "Bates Numbering",
    tagline: "Stamp your PDF with professional Bates numbers in seconds.",
    howToName: "How to add Bates numbering to a PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the legal or professional documents you want to stamp.",
      },
      {
        name: "Configure numbering",
        text: "Set the prefix, suffix, and starting number perfectly locally.",
      },
      {
        name: "Download PDF",
        text: "Download your legally formatted and Bates stamped PDF document.",
      },
    ],
    faq: [
      {
        q: "What is Bates numbering?",
        a: "Bates numbering (or Bates stamping) is used in the legal, medical, and business fields to place identifying numbers and/or date/time-marks on images and documents as they are scanned or processed.",
      },
      {
        q: "Are my confidential legal files uploaded?",
        a: "No. The entire process runs inside your web browser locally. Your files are never uploaded to our servers, ensuring complete confidentiality.",
      },
    ],
    crossLink: {
      href: "/watermark-pdf",
      label: "Need a custom watermark instead? Watermark PDF.",
    },
  },
  tr: {
    title: "PDF'ye Bates Numaralandırması Ekle — profesyonel belge damgalama",
    description:
      "PDF belgelerinize anında Bates numaraları ekleyin. Hukuk profesyonelleri için mükemmeldir. Ücretsiz, hızlı ve tamamen yerel.",
    keywords:
      "bates numaralandırma, bates damgası, pdf bates ekle, hukuki damga, bates numbering",
    h1: "Bates Numaralandırması",
    tagline:
      "PDF'inizi saniyeler içinde profesyonel Bates numaralarıyla damgalayın.",
    howToName: "PDF'ye Bates numaralandırması nasıl eklenir",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Damgalamak istediğiniz yasal veya profesyonel belgeleri sayfaya bırakın.",
      },
      {
        name: "Numaralandırmayı ayarla",
        text: "Önek, sonek ve başlangıç numarasını yerel olarak mükemmel şekilde ayarlayın.",
      },
      {
        name: "PDF indir",
        text: "Yasal olarak biçimlendirilmiş ve Bates damgası basılmış PDF belgenizi indirin.",
      },
    ],
    faq: [
      {
        q: "Bates numaralandırması nedir?",
        a: "Bates numaralandırması (veya Bates damgalama), hukuk, tıp ve iş alanlarında, görüntü ve belgelere tarandıkları veya işlendikleri sırada tanımlayıcı numaralar ve/veya tarih/saat işaretleri yerleştirmek için kullanılır.",
      },
      {
        q: "Gizli yasal dosyalarım sunucuya yükleniyor mu?",
        a: "Hayır. Tüm işlemler doğrudan tarayıcınızın içinde yerel olarak gerçekleşir. Dosyalarınız asla sunucularımıza yüklenmez, böylece tam gizlilik sağlanır.",
      },
    ],
    crossLink: {
      href: "/tr/watermark-pdf",
      label:
        "Bunun yerine özel bir filigrana mı ihtiyacınız var? PDF Filigran Ekle.",
    },
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
    title: "Convert to PDF/A — archive your documents safely",
    description:
      "Convert your PDF to PDF/A format for long-term archiving. Fast, free, and completely local processing.",
    keywords:
      "pdf to pdf/a, pdf/a converter, archive pdf, iso compliant pdf, long term pdf, pdfa, pdf/a",
    h1: "Convert to PDF/A",
    tagline:
      "Ensure your documents are ready for long-term archiving and standard compliance.",
    howToName: "How to convert to PDF/A format",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to convert for long-term archiving.",
      },
      {
        name: "Convert to PDF/A",
        text: "We locally embed all fonts and strip incompatible features to meet ISO standards.",
      },
      {
        name: "Download PDF",
        text: "Download your compliant PDF/A file, perfectly preserved for the future.",
      },
    ],
    faq: [
      {
        q: "What is PDF/A?",
        a: "PDF/A is an ISO-standardized version of the Portable Document Format (PDF) specialized for use in the archiving and long-term preservation of electronic documents.",
      },
      {
        q: "Is this a full strict compliance conversion?",
        a: "This tool performs a basic conversion (setting required metadata and flattening object streams) which satisfies many archiving systems, but it does not embed color profiles or missing fonts automatically.",
      },
      {
        q: "Are my files uploaded?",
        a: "No. The entire process runs inside your web browser locally. Your files are never uploaded to our servers.",
      },
    ],
    crossLink: {
      href: "/flatten-pdf",
      label: "Need to flatten annotations instead? Flatten PDF.",
    },
  },
  tr: {
    title: "PDF/A'ya Dönüştür — belgelerinizi güvenle arşivleyin",
    description:
      "Uzun süreli arşivleme için PDF'inizi PDF/A formatına dönüştürün. Hızlı, ücretsiz ve tamamen yerel işlem.",
    keywords:
      "pdf/a dönüştürücü, pdf i pdf/a yap, arşiv pdf, uzun süreli pdf, iso pdf, pdf to pdf/a",
    h1: "PDF/A'ya Dönüştür",
    tagline:
      "Belgelerinizin uzun vadeli arşivlemeye ve standartlara uygun olduğundan emin olun.",
    howToName: "PDF/A formatına nasıl dönüştürülür",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Uzun süreli arşivleme için dönüştürmek istediğiniz PDF belgesini bırakın.",
      },
      {
        name: "PDF/A'ya dönüştür",
        text: "ISO standartlarını karşılamak için tüm yazı tiplerini gömüyor ve uyumsuz özellikleri yerel olarak kaldırıyoruz.",
      },
      {
        name: "PDF indir",
        text: "Gelecek için mükemmel şekilde korunmuş, uyumlu PDF/A dosyanızı indirin.",
      },
    ],
    faq: [
      {
        q: "PDF/A nedir?",
        a: "PDF/A, Taşınabilir Belge Formatının (PDF) elektronik belgelerin arşivlenmesi ve uzun süreli korunması amacıyla özel olarak ISO standartlarında geliştirilmiş bir sürümüdür.",
      },
      {
        q: "Bu tam ve katı bir standart dönüştürmesi mi?",
        a: "Bu araç, temel bir dönüştürme (gerekli meta verileri ayarlama ve nesne akışlarını düzleştirme) gerçekleştirir. Çoğu arşivleme sistemi için yeterlidir, ancak renk profillerini veya eksik yazı tiplerini otomatik olarak gömmez.",
      },
      {
        q: "Dosyalarım sunucuya yükleniyor mu?",
        a: "Hayır. Tüm işlemler doğrudan tarayıcınızın içinde yerel olarak gerçekleşir. Dosyalarınız asla sunucularımıza yüklenmez.",
      },
    ],
    crossLink: {
      href: "/tr/flatten-pdf",
      label:
        "Bunun yerine açıklamaları düzleştirmek mi istiyorsunuz? PDF Düzleştir.",
    },
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
    title: "Sanitize PDF — remove metadata, files never uploaded",
    description:
      "Remove author, creation date, and all hidden metadata from your PDF file for maximum privacy. No servers involved.",
    keywords:
      "sanitize pdf, clean pdf metadata, remove pdf properties, secure pdf, clear metadata, pdf temizle",
    h1: "Sanitize PDF",
    tagline:
      "Strip hidden metadata and digital footprints from your PDF — free and 100% private.",
    howToName: "How to remove metadata from a PDF file in your browser",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to cleanse of digital footprints.",
      },
      {
        name: "Clean data",
        text: "We completely strip author names, dates, and all hidden metadata locally.",
      },
      {
        name: "Download PDF",
        text: "Download your sanitized, perfectly clean PDF file for maximum privacy.",
      },
    ],
    crossLink: {
      href: "/protect-pdf",
      label: "Need even more privacy? Protect PDF.",
    },
  },
  tr: {
    title: "PDF Temizle — meta verileri sil, dosyalar cihazında kalsın",
    description:
      "PDF dosyanızdaki yazar, oluşturulma tarihi ve gizli meta verilerini silerek tam gizlilik sağlayın. Sunucu kullanılmaz.",
    keywords:
      "pdf temizle, pdf meta veri sil, pdf yazar sil, pdf arındır, sanitize pdf, remove metadata",
    h1: "PDF Temizle (Meta Veri Sil)",
    tagline:
      "PDF'teki gizli meta verileri ve dijital izleri temizleyin — ücretsiz ve yerel.",
    howToName: "Tarayıcıda PDF dosyasından meta veriler nasıl silinir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Dijital ayak izlerinden arındırmak istediğiniz PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Verileri temizle",
        text: "Yazar isimlerini, tarihleri ve tüm gizli meta verileri yerel olarak tamamen siliyoruz.",
      },
      {
        name: "PDF indir",
        text: "Maksimum gizlilik için temizlenmiş ve arındırılmış PDF belgenizi güvenle indirin.",
      },
    ],
    crossLink: {
      href: "/tr/protect-pdf",
      label: "Daha fazla gizlilik mi lazım? PDF Şifrele.",
    },
  },
};
export const watermarkCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Add Watermark to PDF — free, secure, local",
    description:
      "Stamp your PDF with a custom text watermark. Protect your documents from unauthorized use. Processed completely in your browser.",
    keywords:
      "watermark pdf, add watermark, stamp pdf, pdf logo, protect pdf, pdf filigran, filigran ekle",
    h1: "Watermark PDF",
    tagline:
      "Add a diagonal watermark to every page of your document in seconds.",
    howToName: "How to add a watermark to a PDF online",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to stamp with a watermark.",
      },
      {
        name: "Customize watermark",
        text: "Type your text, adjust the opacity, and rotate it perfectly locally.",
      },
      {
        name: "Download PDF",
        text: "Download your professionally watermarked PDF document securely.",
      },
    ],
    crossLink: {
      href: "/protect-pdf",
      label: "Want to lock the file? Protect PDF.",
    },
  },
  tr: {
    title: "PDF'e Filigran Ekle — ücretsiz, güvenli, yerel",
    description:
      "PDF'inize özel metin filigranı (damga) ekleyin. Belgelerinizi izinsiz kullanıma karşı koruyun. Tamamen tarayıcınızda işlenir.",
    keywords:
      "pdf filigran ekle, filigran oluştur, pdf damga, watermark pdf, pdf arkasına yazı yaz",
    h1: "Filigran Ekle",
    tagline:
      "Belgenizin her sayfasına saniyeler içinde damga (filigran) vurun.",
    howToName: "PDF dosyasına nasıl filigran eklenir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Filigran damgalamak istediğiniz PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Filigranı özelleştir",
        text: "Metninizi yazın, opaklığını ayarlayın ve yerel olarak mükemmel şekilde döndürün.",
      },
      {
        name: "PDF indir",
        text: "Profesyonelce filigran eklenmiş PDF belgenizi güvenle indirin.",
      },
    ],
    crossLink: {
      href: "/tr/protect-pdf",
      label: "Dosyayı kilitlemek mi istiyorsunuz? PDF Şifrele.",
    },
  },
};
export const numberCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Add Page Numbers to PDF — free, fast, local",
    description:
      "Easily add page numbers to your PDF documents. Customize format and position. Processed securely on your device.",
    keywords:
      "add page numbers to pdf, number pdf pages, paginate pdf, pdf page numbers, pdf sayfa numarası",
    h1: "Add Page Numbers",
    tagline: "Organize your documents by adding page numbers instantly.",
    howToName: "How to add page numbers to a PDF online",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to add page numbers to.",
      },
      {
        name: "Format numbers",
        text: "Choose the exact position and style for your page numbers locally.",
      },
      {
        name: "Download PDF",
        text: "Download your properly paginated and numbered PDF document.",
      },
    ],
    crossLink: {
      href: "/watermark-pdf",
      label: "Want to stamp every page? Add Watermark.",
    },
  },
  tr: {
    title: "PDF'e Sayfa Numarası Ekle — ücretsiz, hızlı, yerel",
    description:
      "PDF belgelerinize kolayca sayfa numarası ekleyin. Formatı ve konumu ayarlayın. Tamamen cihazınızda güvenle işlenir.",
    keywords:
      "pdf sayfa numarası ekle, sayfa numaralandırma, pdf numaralandır, add page numbers to pdf",
    h1: "Sayfa Numarası Ekle",
    tagline: "Belgelerinizi anında numaralandırarak daha düzenli hale getirin.",
    howToName: "PDF dosyasına nasıl sayfa numarası eklenir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Sayfa numarası eklemek istediğiniz PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Numaraları biçimlendir",
        text: "Sayfa numaralarınızın tam konumunu ve stilini yerel olarak seçin.",
      },
      {
        name: "PDF indir",
        text: "Düzgün bir şekilde numaralandırılmış PDF belgenizi indirin.",
      },
    ],
    crossLink: {
      href: "/tr/watermark-pdf",
      label: "Her sayfaya damga mı vurmak istiyorsunuz? Filigran Ekle.",
    },
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
    title: "Rotate PDF — turn pages 90, 180, or 270 degrees locally",
    description:
      "Rotate individual PDF pages or all pages at once. Your files stay on your device — free, fast, and secure.",
    keywords:
      "rotate pdf, turn pdf, flip pdf, pdf orientation, upside down pdf, pdf döndür, pdf çevir",
    h1: "Rotate PDF",
    tagline:
      "Turn upside-down or sideways pages to the right orientation — free, instant, and 100% private.",
    howToName: "How to rotate PDF pages in your browser",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document containing pages that need rotating.",
      },
      {
        name: "Rotate pages",
        text: "Rotate individual pages or the entire document instantly and locally.",
      },
      {
        name: "Download PDF",
        text: "Download your correctly oriented PDF document securely.",
      },
    ],
    crossLink: {
      href: "/remove-pages",
      label: "Need to remove extra pages instead? Remove Pages.",
    },
  },
  tr: {
    title: "PDF Döndür — sayfaları 90, 180 veya 270 derece çevir",
    description:
      "PDF sayfalarını tek tek veya topluca çevirin. Dosyalarınız cihazınızdan asla çıkmaz — ücretsiz ve güvenli.",
    keywords:
      "pdf döndür, pdf yönünü değiştir, ters pdf düzelt, sayfaları çevir, rotate pdf",
    h1: "PDF Döndür",
    tagline:
      "Ters veya yan duran sayfaları doğru açıda hizalayın — ücretsiz, anında ve %100 gizli.",
    howToName: "Tarayıcıda PDF sayfaları nasıl döndürülür",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Döndürülmesi gereken sayfalar içeren PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Sayfaları döndür",
        text: "Tek tek sayfaları veya tüm belgeyi yerel olarak anında döndürün.",
      },
      {
        name: "PDF indir",
        text: "Doğru yönde ayarlanmış PDF belgenizi güvenle indirin.",
      },
    ],
    crossLink: {
      href: "/tr/remove-pages",
      label: "İstenmeyen sayfaları silmek mi istiyorsunuz? Sayfa Sil.",
    },
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
    title: "JPG to PDF — convert images to PDF document locally",
    description:
      "Convert JPG, PNG, and WebP images into a single PDF document in your browser. Organize, adjust orientation and margin, 100% private.",
    keywords:
      "image to pdf, jpg to pdf, jpeg to pdf, pictures to pdf, photo to pdf, resimden pdf, jpg pdf yap",
    h1: "JPG to PDF",
    tagline:
      "Turn your images into a clean PDF document — free, instant, and 100% private.",
    howToName: "How to convert JPG images to PDF online",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your images",
        text: "Drop one or more JPG/JPEG photos you want to combine into a document.",
      },
      {
        name: "Arrange pages",
        text: "We instantly process your images locally to assemble them into a structured file.",
      },
      {
        name: "Download PDF",
        text: "Download your high-quality, multi-page PDF document securely.",
      },
    ],
    crossLink: {
      href: "/pdf-to-jpg",
      label: "Need to extract images from a PDF? Convert PDF to JPG.",
    },
  },
  tr: {
    title: "JPG'den PDF'e — fotoğrafları ve görselleri PDF'e dönüştür",
    description:
      "JPG, PNG ve WebP görsellerinizi tarayıcınızda tek bir PDF belgesine dönüştürün. Sayfa yapısı ve kenar boşluklarını ayarlayın, %100 gizli.",
    keywords:
      "resimden pdf yap, fotoğraftan pdf, jpg to pdf, jpeg to pdf, image to pdf, resimleri pdf yap",
    h1: "JPG'den PDF'e",
    tagline:
      "Görsellerinizi anında PDF belgesine dönüştürün — ücretsiz, sınırsız ve tarayıcınızda.",
    howToName: "Görsellerden PDF nasıl oluşturulur",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "Resimleri ekle",
        text: "Tek bir belgede birleştirmek istediğiniz bir veya daha fazla JPG/JPEG fotoğrafını bırakın.",
      },
      {
        name: "Sayfaları düzenle",
        text: "Fotoğraflarınızı düzgün yapılandırılmış bir belgede toplamak için yerel olarak anında işliyoruz.",
      },
      {
        name: "PDF indir",
        text: "Yüksek kaliteli ve çok sayfalı yeni PDF belgenizi güvenle indirin.",
      },
    ],
    crossLink: {
      href: "/tr/pdf-to-jpg",
      label:
        "PDF içindeki görselleri dışarı mı çıkarmak istiyorsunuz? PDF'ten JPG'ye.",
    },
  },
};
export const pngToPdfCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "PNG to PDF — convert PNG images to PDF document locally",
    description:
      "Convert PNG, JPG, and WebP images into a high-quality PDF document in your browser. Maintain transparency and sharp edges, 100% private.",
    keywords:
      "png to pdf, convert png to pdf, transparent image to pdf, png pdf yap, png den pdf",
    h1: "PNG to PDF",
    tagline:
      "Turn your PNG images into a clean PDF document — free, instant, and 100% private.",
    howToName: "How to convert PNG images to PDF online",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your images",
        text: "Drop one or more PNG image files you want to combine into a document.",
      },
      {
        name: "Arrange pages",
        text: "We instantly process your images locally to assemble them into a structured file.",
      },
      {
        name: "Download PDF",
        text: "Download your high-quality, multi-page PDF document securely.",
      },
    ],
    crossLink: {
      href: "/pdf-to-png",
      label: "Need to extract lossless PNGs from a PDF? Convert PDF to PNG.",
    },
  },
  tr: {
    title: "PNG'den PDF'e — PNG görsellerini ve şemalarını PDF'e dönüştür",
    description:
      "PNG, JPG ve WebP görsellerinizi tarayıcınızda tek bir PDF belgesine dönüştürün. Şeffaflık ve keskin kenarları koruyun, %100 gizli.",
    keywords:
      "png to pdf, png pdf yap, png dönüştürücü, resim pdf çevir, png to pdf converter",
    h1: "PNG'den PDF'e",
    tagline:
      "PNG görsellerinizi anında PDF belgesine dönüştürün — ücretsiz, sınırsız ve tarayıcınızda.",
    howToName: "PNG görsellerinden PDF nasıl oluşturulur",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "Resimleri ekle",
        text: "Tek bir belgede birleştirmek istediğiniz bir veya daha fazla PNG dosyasını sayfaya bırakın.",
      },
      {
        name: "Sayfaları düzenle",
        text: "Resimlerinizi düzgün yapılandırılmış bir belgede toplamak için yerel olarak anında işliyoruz.",
      },
      {
        name: "PDF indir",
        text: "Yüksek çözünürlüklü ve çok sayfalı yeni PDF belgenizi güvenle indirin.",
      },
    ],
    crossLink: {
      href: "/tr/pdf-to-png",
      label:
        "PDF içindeki sayfaları kayıpsız PNG olarak mı çıkarmak istiyorsunuz? PDF'ten PNG'ye.",
    },
  },
};
export const flattenCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Flatten PDF — make form fields and annotations uneditable locally",
    description:
      "Convert interactive PDF forms, highlights, and annotations into static page content. 100% private, processed in your browser.",
    keywords:
      "flatten pdf, make pdf uneditable, flatten form, lock pdf form, pdf düzleştir, form kilitle",
    h1: "Flatten PDF",
    tagline:
      "Turn PDF form fields and annotations into static content — free and 100% private.",
    howToName: "How to flatten PDF forms in your browser",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF containing forms or annotations you want to flatten.",
      },
      {
        name: "Flatten contents",
        text: "We merge all interactive fields and annotations into the document permanently locally.",
      },
      {
        name: "Download PDF",
        text: "Download your uneditable, perfectly flattened PDF document.",
      },
    ],
    crossLink: {
      href: "/protect-pdf",
      label: "Need to password-protect your document? Try Protect PDF.",
    },
  },
  tr: {
    title: "PDF Düzleştir — form alanlarını ve notları sabit katmana dönüştür",
    description:
      "İnteraktif PDF formlarını, açıklamaları ve işaretlemeleri sabit sayfa içeriğine dönüştürün. %100 gizli, tarayıcınızda çalışır.",
    keywords:
      "pdf düzleştir, pdf flatten, düzenlenemez pdf yap, pdf formu kilitle, form düzleştirme",
    h1: "PDF Düzleştir",
    tagline:
      "PDF form alanlarını sabit ve düzenlenemez içeriğe dönüştürün — ücretsiz ve %100 gizli.",
    howToName: "PDF formları tarayıcıda nasıl düzleştirilir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Düzleştirmek istediğiniz form veya açıklamalar içeren PDF belgesini bırakın.",
      },
      {
        name: "İçerikleri düzleştir",
        text: "Etkileşimli tüm alanları ve açıklamaları belgeye kalıcı ve yerel olarak birleştiriyoruz.",
      },
      {
        name: "PDF indir",
        text: "Düzenlenemez, mükemmel şekilde düzleştirilmiş PDF belgenizi indirin.",
      },
    ],
    crossLink: {
      href: "/tr/protect-pdf",
      label:
        "Belgenizi şifreyle mi korumak istiyorsunuz? PDF Şifrele aracını deneyin.",
    },
  },
};
export const signCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Sign PDF — add signatures locally without uploading",
    description:
      "Sign PDF documents with your drawn, typed, or uploaded signature. 100% private, your files and signature never leave your device.",
    keywords:
      "sign pdf, e-sign pdf, electronic signature, draw signature, pdf imza, pdf imzala, e-imza pdf",
    h1: "Sign PDF",
    tagline:
      "Stamp your signature onto any PDF document — free, instant, and 100% private.",
    howToName: "How to sign a PDF online for free",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to electronically sign.",
      },
      {
        name: "Add signature",
        text: "Draw, type, or upload your signature locally and position it securely.",
      },
      {
        name: "Download PDF",
        text: "Download your signed and finalized PDF document.",
      },
    ],
    crossLink: {
      href: "/flatten-pdf",
      label: "Want to lock your form fields after signing? Try Flatten PDF.",
    },
  },
  tr: {
    title: "PDF İmzala — tarayıcında güvenle imza ekle",
    description:
      "PDF belgelerine çizdiğiniz, yazdığınız veya yüklediğiniz imzanızı ekleyin. %100 gizli, dosyanız ve imzanız cihazınızdan çıkmaz.",
    keywords:
      "pdf imzala, pdf imza ekle, e-imza pdf, dijital imza, elektronik imza, sign pdf",
    h1: "PDF İmzala",
    tagline:
      "PDF belgelerinizi tarayıcınızda güvenle imzalayın — ücretsiz ve %100 gizli.",
    howToName: "PDF belgesine internetten imza nasıl eklenir",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Elektronik olarak imzalamak istediğiniz PDF belgesini sayfaya bırakın.",
      },
      {
        name: "İmza ekle",
        text: "İmzanızı yerel olarak çizin, yazın veya yükleyin ve güvenle konumlandırın.",
      },
      {
        name: "PDF indir",
        text: "İmzalanmış ve son halini almış PDF belgenizi indirin.",
      },
    ],
    crossLink: {
      href: "/tr/flatten-pdf",
      label:
        "İmzaladıktan sonra form alanlarını kilitlemek mi istiyorsunuz? PDF Düzleştir.",
    },
  },
};
export const extractImagesCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Extract Images from PDF — download embedded JPG and PNG",
    description:
      "Extract all embedded raster images from PDF documents in original quality. 100% private, files never leave your device.",
    keywords:
      "extract images from pdf, pdf to jpg, pdf pictures, save pdf images, pdf resim çıkar, pdf foto al",
    h1: "Extract Images",
    tagline:
      "Extract embedded JPG and PNG images from your PDF — free and 100% private.",
    howToName: "How to extract images from a PDF in your browser",
    howItWorks: "How it works",
    steps: [
      {
        name: "Upload PDF",
        text: "Drop your PDF document containing images or photos.",
      },
      {
        name: "Extract",
        text: "We extract all embedded raster images at their original resolution.",
      },
      {
        name: "Download ZIP",
        text: "Download all extracted images bundled in a convenient ZIP archive.",
      },
    ],
    crossLink: {
      href: "/pdf-to-png",
      label: "Want to render full PDF pages as images? Try PDF to PNG.",
    },
  },
  tr: {
    title: "PDF Resim Çıkar — gömülü fotoğrafları orijinal kalitede indir",
    description:
      "PDF belgelerindeki tüm gömülü resimleri ve fotoğrafları orijinal kalitede ayıklayın. %100 gizli, dosyanız cihazınızdan çıkmaz.",
    keywords:
      "pdf resim çıkar, pdf fotoğrafları al, pdf ten resim ayıkla, pdf to jpg, extract images from pdf",
    h1: "PDF Resim Çıkar",
    tagline:
      "PDF'teki gömülü JPG ve PNG resimlerini ayıklayın — ücretsiz ve %100 gizli.",
    howToName: "PDF içindeki resimler tarayıcıda nasıl çıkarılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF Yükle",
        text: "Resim veya fotoğraf içeren PDF belgenizi sürükleyip bırakın.",
      },
      {
        name: "Resimleri Çıkar",
        text: "Belgedeki tüm gömülü resimler orijinal çözünürlüklerinde ayıklanır.",
      },
      {
        name: "ZIP İndir",
        text: "Çıkarılan tüm görselleri tek bir ZIP dosyası olarak anında indirin.",
      },
    ],
    crossLink: {
      href: "/tr/pdf-to-png",
      label:
        "Tüm sayfayı görüntü olarak kaydetmek mi istiyorsunuz? PDF - PNG dönüştürücü.",
    },
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
    title: "Redact PDF — hide sensitive information",
    description:
      "Permanently black out sensitive text, images, or graphics in your PDF. 100% private and fast.",
    keywords:
      "redact pdf, blackout text in pdf, hide pdf text, censor pdf, secure redact, pdf karart, pdf sansür",
    h1: "Redact PDF",
    tagline:
      "Black out sensitive content in your PDF documents in seconds — free and completely local.",
    howToName: "How to redact a PDF file",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document containing sensitive information you need to hide.",
      },
      {
        name: "Blackout text",
        text: "Draw completely opaque redaction boxes over sensitive areas locally.",
      },
      {
        name: "Download PDF",
        text: "Download your redacted PDF document, perfectly sanitized and secure.",
      },
    ],
    faq: [
      {
        q: "Are my files uploaded?",
        a: "No. The redaction happens entirely on your device. Your files are completely private.",
      },
    ],
    crossLink: {
      href: "/sanitize-pdf",
      label: "Want to remove hidden metadata too? Try Sanitize PDF.",
    },
  },
  tr: {
    title: "PDF Karartma — hassas bilgileri gizleyin",
    description:
      "PDF'inizdeki hassas bilgileri gizlemek için üzerlerine siyah kutular çizin. %100 gizli ve hızlı.",
    keywords:
      "pdf karart, pdf sansürle, pdf gizli metin, redact pdf, pdf blackout, metin sansürleme",
    h1: "PDF Karartma",
    tagline:
      "PDF belgelerinizdeki hassas içerikleri saniyeler içinde karartın — ücretsiz ve %100 gizli.",
    howToName: "Bir PDF dosyası nasıl karartılır",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Gizlemeniz gereken hassas bilgiler içeren PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Metni karart",
        text: "Hassas alanların üzerine yerel olarak tamamen opak karartma kutuları çizin.",
      },
      {
        name: "PDF indir",
        text: "Mükemmel şekilde temizlenmiş ve güvenli hale getirilmiş karartılmış PDF belgenizi indirin.",
      },
    ],
    faq: [
      {
        q: "Dosyalarım bir yere yükleniyor mu?",
        a: "Hayır. Karartma işlemi tamamen cihazınızda gerçekleşir. Dosyalarınız %100 gizli kalır.",
      },
    ],
    crossLink: {
      href: "/tr/sanitize-pdf",
      label: "Gizli meta verilerini de temizlemek ister misiniz? PDF Temizle.",
    },
  },
};
export const repairCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Repair PDF — fix corrupted documents locally",
    description:
      "Fix and recover corrupted or broken PDF files instantly in your browser. 100% private, no uploads.",
    keywords:
      "repair pdf, fix pdf, recover pdf, corrupt pdf, broken pdf, pdf onar, bozuk pdf düzelt",
    h1: "Repair PDF",
    tagline:
      "Fix corrupted PDF files and recover data instantly — free and completely local.",
    howToName: "How to repair a PDF file",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the corrupted or damaged PDF document you want to repair.",
      },
      {
        name: "Repair file",
        text: "We scan and reconstruct the PDF structure locally to recover its contents.",
      },
      {
        name: "Download PDF",
        text: "Download your fully repaired and usable PDF document securely.",
      },
    ],
    faq: [
      {
        q: "Are my files uploaded?",
        a: "No. The repair happens entirely on your device using WebAssembly technology. Your files are completely private.",
      },
    ],
    crossLink: {
      href: "/sanitize-pdf",
      label: "Want to clean hidden metadata? Try Sanitize PDF.",
    },
  },
  tr: {
    title: "PDF Onar — bozuk belgeleri tarayıcıda düzelt",
    description:
      "Bozuk veya açılmayan PDF dosyalarınızı tarayıcınızda anında onarın ve kurtarın. %100 gizli, yükleme yok.",
    keywords:
      "pdf onar, bozuk pdf kurtar, pdf tamir et, hasarlı pdf aç, repair pdf, fix corrupt pdf",
    h1: "PDF Onar",
    tagline:
      "Bozuk PDF dosyalarınızı onarın ve verilerinizi kurtarın — ücretsiz ve tamamen yerel.",
    howToName: "Bozuk bir PDF dosyası nasıl onarılır",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Onarmak istediğiniz bozuk veya hasarlı PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Dosyayı onar",
        text: "İçerikleri kurtarmak için PDF yapısını yerel olarak tarıyor ve yeniden oluşturuyoruz.",
      },
      {
        name: "PDF indir",
        text: "Tamamen onarılmış ve kullanılabilir PDF belgenizi güvenle indirin.",
      },
    ],
    faq: [
      {
        q: "Dosyalarım bir yere yükleniyor mu?",
        a: "Hayır. Onarım işlemi WebAssembly teknolojisi kullanılarak tamamen cihazınızda gerçekleşir. Dosyalarınız %100 gizli kalır.",
      },
    ],
    crossLink: {
      href: "/tr/sanitize-pdf",
      label: "Gizli meta verilerini temizlemek ister misiniz? PDF Temizle.",
    },
  },
};
export const grayscaleCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Grayscale PDF — convert to black & white locally",
    description:
      "Convert your PDF documents to grayscale to save ink and reduce file size. Fast, local, and private.",
    keywords:
      "grayscale pdf, black and white pdf, b&w pdf, remove colors from pdf, pdf siyah beyaz, renksiz pdf",
    h1: "Grayscale PDF",
    tagline:
      "Remove colors from your PDF files to create black and white documents — free and completely local.",
    howToName: "How to convert PDF to grayscale",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the colored PDF document you want to convert.",
      },
      {
        name: "Apply grayscale",
        text: "We instantly convert all colored text, images, and backgrounds to black & white locally.",
      },
      {
        name: "Download PDF",
        text: "Download your perfectly grayscaled PDF document.",
      },
    ],
    faq: [
      {
        q: "Why convert to grayscale?",
        a: "Grayscale PDFs are perfect for printing text documents, saving you expensive color ink and reducing file sizes in some cases.",
      },
      {
        q: "Will the text remain selectable?",
        a: "No. The grayscale process rasterizes the pages as images, so text will no longer be selectable.",
      },
    ],
    crossLink: {
      href: "/compress-pdf",
      label: "Want to reduce PDF size? Try Compress PDF.",
    },
  },
  tr: {
    title: "Siyah Beyaz PDF — yerel olarak dönüştür",
    description:
      "Mürekkep tasarrufu yapmak ve dosya boyutunu küçültmek için PDF'lerinizi gri tonlamaya çevirin. Hızlı, yerel ve gizli.",
    keywords:
      "pdf siyah beyaz yap, siyah beyaz pdf, gri tonlama pdf, grayscale pdf, renksiz pdf",
    h1: "Siyah Beyaz PDF",
    tagline:
      "PDF dosyalarınızdan renkleri kaldırarak siyah beyaz belgeler oluşturun — ücretsiz ve tamamen yerel.",
    howToName: "PDF siyah beyaza nasıl dönüştürülür",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Dönüştürmek istediğiniz renkli PDF belgesini sayfaya bırakın.",
      },
      {
        name: "Siyah beyaz yap",
        text: "Tüm renkli metin, görüntü ve arka planları yerel olarak anında siyah beyaza dönüştürüyoruz.",
      },
      {
        name: "PDF indir",
        text: "Mükemmel şekilde siyah beyaz yapılmış PDF belgenizi indirin.",
      },
    ],
    faq: [
      {
        q: "Neden siyah beyaza çevirmeliyim?",
        a: "Siyah beyaz PDF'ler metin belgelerini yazdırmak için mükemmeldir; pahalı renkli mürekkepten tasarruf etmenizi sağlar ve bazen dosya boyutunu küçültür.",
      },
      {
        q: "Metinler seçilebilir kalacak mı?",
        a: "Hayır. Gri tonlama işlemi belgeleri resim olarak tarar, bu yüzden metinler seçilemez hale gelir.",
      },
    ],
    crossLink: {
      href: "/tr/compress-pdf",
      label: "PDF boyutunu küçültmek mi istiyorsunuz? PDF Sıkıştır.",
    },
  },
};
export const resizeCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Resize PDF — change page size and add margins",
    description:
      "Scale your PDF pages to standard sizes like A4 or Letter, and add uniform margins. 100% private.",
    keywords:
      "resize pdf, change pdf size, add margins to pdf, scale pdf, pdf boyutlandır, pdf kenarlık ekle",
    h1: "Resize PDF",
    tagline:
      "Scale PDF pages to standard dimensions and add beautiful margins — free and completely local.",
    howToName: "How to resize a PDF file",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to resize or add margins to.",
      },
      {
        name: "Set dimensions",
        text: "Adjust the page size and margins locally to fit your exact requirements.",
      },
      {
        name: "Download PDF",
        text: "Download your perfectly resized PDF document.",
      },
    ],
    faq: [
      {
        q: "Does this distort my images?",
        a: "No, the original pages are scaled down proportionally and centered on the new canvas, preserving aspect ratios.",
      },
      {
        q: "Will this reduce the resolution?",
        a: "No. Your pages are scaled to the new dimensions without any loss of quality.",
      },
    ],
    crossLink: {
      href: "/crop-pdf",
      label: "Need to cut a part of the page? Try Crop PDF.",
    },
  },
  tr: {
    title: "PDF Boyutlandır — boyut değiştir ve boşluk ekle",
    description:
      "PDF sayfalarınızı A4 veya Letter gibi standart boyutlara ölçeklendirin ve kenar boşlukları ekleyin. %100 gizli.",
    keywords:
      "pdf boyutlandır, pdf yeniden boyutlandır, pdf kenar boşluğu ekle, resize pdf, change pdf dimensions",
    h1: "PDF Boyutlandır",
    tagline:
      "PDF sayfalarını standart boyutlara ölçeklendirin ve kenar boşlukları ekleyin — ücretsiz ve tamamen yerel.",
    howToName: "Bir PDF dosyası nasıl boyutlandırılır",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Yeniden boyutlandırmak veya kenar boşlukları eklemek istediğiniz PDF belgesini bırakın.",
      },
      {
        name: "Boyutları ayarla",
        text: "Tam gereksinimlerinize uyması için sayfa boyutunu ve kenar boşluklarını yerel olarak ayarlayın.",
      },
      {
        name: "PDF indir",
        text: "Mükemmel şekilde yeniden boyutlandırılmış PDF belgenizi indirin.",
      },
    ],
    faq: [
      {
        q: "Bu işlem görsellerimi bozar mı?",
        a: "Hayır, orijinal sayfalar orantılı olarak küçültülür ve yeni tuvalin ortasına yerleştirilir, en-boy oranları korunur.",
      },
      {
        q: "Bu işlem çözünürlüğü düşürür mü?",
        a: "Hayır. Sayfalarınız herhangi bir kalite kaybı olmadan yeni boyutlara ölçeklenir.",
      },
    ],
    crossLink: {
      href: "/tr/crop-pdf",
      label: "Sayfanın bir kısmını mı kesmek istiyorsunuz? PDF Kırp.",
    },
  },
};
export const scanCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Scan to PDF — scan physical documents",
    description:
      "Use your device camera to scan physical documents and create high-quality PDFs instantly. 100% private.",
    keywords:
      "scan to pdf, document scanner, scan pages, digitalize document, paper to pdf, pdf tarayıcı, belge tara",
    h1: "Scan to PDF",
    tagline:
      "Turn your device into a document scanner and generate PDF files directly in your browser.",
    howToName: "How to scan documents to PDF",
    howItWorks: "How it works",
    faqTitle: "Frequently Asked Questions",
    steps: [
      {
        name: "Grant Camera Access",
        text: "Allow the browser to access your camera to begin scanning.",
      },
      {
        name: "Capture Pages",
        text: "Take photos of your physical documents one by one.",
      },
      {
        name: "Create PDF",
        text: "Click Create PDF to combine all captured pages into a single document.",
      },
    ],
    faq: [
      {
        q: "Is my camera feed private?",
        a: "Absolutely. Everything happens on your device locally. Your camera feed and photos are never uploaded or sent anywhere.",
      },
      {
        q: "Are my photos uploaded?",
        a: "No. Everything runs directly on your device. We never upload any photos.",
      },
    ],
    crossLink: {
      href: "/img-to-pdf",
      label: "Have images already? Convert Images to PDF.",
    },
  },
  tr: {
    title: "Kameradan PDF — fiziksel belgeleri tarayın",
    description:
      "Fiziksel belgeleri taramak ve anında PDF oluşturmak için cihazınızın kamerasını kullanın. %100 gizli.",
    keywords:
      "pdf tara, belge tara, kağıt tarayıcı, scan to pdf, pdf tarama aracı, tarayıcıdan pdf yap",
    h1: "Kameradan PDF",
    tagline:
      "Cihazınızı bir tarayıcıya dönüştürün ve doğrudan tarayıcınızda PDF dosyaları oluşturun.",
    howToName: "Belgeler PDF'e nasıl taranır",
    howItWorks: "Nasıl çalışır",
    faqTitle: "Sıkça Sorulan Sorular",
    steps: [
      {
        name: "Kamera İzni Verin",
        text: "Taramaya başlamak için tarayıcının kameranıza erişmesine izin verin.",
      },
      {
        name: "Sayfaları Çekin",
        text: "Fiziksel belgelerinizin fotoğraflarını sırayla çekin.",
      },
      {
        name: "PDF Oluştur",
        text: "Tüm çekilen sayfaları tek bir belgeye dönüştürmek için PDF Oluştur butonuna tıklayın.",
      },
    ],
    faq: [
      {
        q: "Kamera görüntüm gizli mi?",
        a: "Kesinlikle. Her şey cihazınızda yerel olarak gerçekleşir. Kamera görüntünüz ve fotoğraflarınız hiçbir yere yüklenmez veya gönderilmez.",
      },
      {
        q: "Fotoğraflarım yükleniyor mu?",
        a: "Hayır. Her şey cihazınızda çalışır, fotoğraflarınız asla yüklenmez.",
      },
    ],
    crossLink: {
      href: "/tr/img-to-pdf",
      label: "Fotoğraflarınız hazır mı? Görselleri PDF Yap.",
    },
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
    title: "Compare PDF — find differences between documents",
    description: "Visually compare two PDF files side by side.",
    keywords:
      "compare pdf, diff pdf, pdf comparison, find differences pdf, compare documents, pdf karşılaştır, pdf fark bul",
    h1: "Compare PDF",
    tagline: "Spot differences between two documents instantly.",
    howToName: "How to compare PDFs",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add PDFs",
        text: "Drop the two PDF documents you want to visually compare side-by-side.",
      },
      {
        name: "Highlight differences",
        text: "We instantly overlay the pages locally to highlight any visual changes.",
      },
      {
        name: "Review files",
        text: "Review the diff perfectly without uploading any sensitive documents.",
      },
    ],
  },
  tr: {
    title: "PDF Karşılaştır — belgeler arası farkları bul",
    description: "İki PDF dosyasını yan yana görsel olarak karşılaştırın.",
    keywords:
      "pdf karşılaştır, pdf fark bul, iki pdf kıyasla, compare pdf, belge karşılaştırma aracı",
    h1: "PDF Karşılaştır",
    tagline: "İki belge arasındaki farkları anında tespit edin.",
    howToName: "PDF'ler nasıl karşılaştırılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF'leri ekle",
        text: "Yan yana görsel olarak karşılaştırmak istediğiniz iki PDF belgesini bırakın.",
      },
      {
        name: "Farkları vurgula",
        text: "Tüm görsel değişiklikleri vurgulamak için sayfaları yerel olarak anında üst üste bindiriyoruz.",
      },
      {
        name: "Dosyaları incele",
        text: "Hassas belgeleri hiçbir yere yüklemeden farklılıkları mükemmel bir şekilde inceleyin.",
      },
    ],
  },
};

export const cropCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "Crop PDF — remove margins",
    description: "Crop your PDF pages to remove unnecessary margins.",
    keywords:
      "crop pdf, trim pdf margins, cut pdf borders, resize page area, pdf kırp, pdf sayfa kes",
    h1: "Crop PDF",
    tagline: "Trim PDF margins quickly and locally.",
    howToName: "How to crop a PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the PDF document you want to trim or adjust margins for.",
      },
      {
        name: "Crop area",
        text: "Draw a rectangle over the pages to define the exact visible area locally.",
      },
      {
        name: "Download PDF",
        text: "Download your perfectly cropped PDF document.",
      },
    ],
  },
  tr: {
    title: "PDF Kırp — kenar boşluklarını kaldır",
    description: "PDF sayfalarınızı kırparak gereksiz boşlukları temizleyin.",
    keywords:
      "pdf kırp, pdf kes, sayfa kırpma, boşlukları al, crop pdf, trim pdf",
    h1: "PDF Kırp",
    tagline: "Kenar boşluklarını hızlıca kesin.",
    howToName: "PDF nasıl kırpılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Kırpmak veya kenar boşluklarını ayarlamak istediğiniz PDF belgesini bırakın.",
      },
      {
        name: "Alanı kırp",
        text: "Görünür alanı yerel olarak tam tanımlamak için sayfaların üzerine bir dikdörtgen çizin.",
      },
      {
        name: "PDF indir",
        text: "Mükemmel şekilde kırpılmış PDF belgenizi indirin.",
      },
    ],
  },
};

export const ocrCopy: Record<"en" | "tr", ToolCopy> = {
  en: {
    title: "OCR PDF — extract text from scanned documents",
    description: "Convert scanned PDFs into searchable text documents.",
    keywords:
      "ocr pdf, optical character recognition, scanned pdf to text, searchable pdf, pdf ocr, metin tanıma, taranmış pdf okuma",
    h1: "OCR PDF",
    tagline: "Make scanned documents searchable with AI.",
    howToName: "How to use OCR on a PDF",
    howItWorks: "How it works",
    steps: [
      {
        name: "Add your PDF",
        text: "Drop the scanned PDF document you want to make searchable.",
      },
      {
        name: "Run OCR",
        text: "We locally analyze the images and extract the text using AI models.",
      },
      {
        name: "Download PDF",
        text: "Download a new, perfectly searchable PDF document with embedded text.",
      },
    ],
  },
  tr: {
    title: "OCR PDF — taranmış belgelerden metin çıkar",
    description: "Taranmış PDF'leri aranabilir metin belgelerine dönüştürün.",
    keywords:
      "pdf ocr, ocr pdf, metin tanıma, resimdeki yazıyı okuma, taranmış pdf çeviri, aranabilir pdf",
    h1: "OCR PDF",
    tagline: "Yapay zeka ile taranmış belgeleri aranabilir yapın.",
    howToName: "PDF'te OCR nasıl kullanılır",
    howItWorks: "Nasıl çalışır",
    steps: [
      {
        name: "PDF dosyanı ekle",
        text: "Aranabilir hale getirmek istediğiniz taranmış PDF belgesini sayfaya bırakın.",
      },
      {
        name: "OCR uygula",
        text: "Yapay zeka modelleri kullanarak görüntüleri yerel olarak analiz ediyor ve metni çıkarıyoruz.",
      },
      {
        name: "PDF indir",
        text: "İçine metin gömülmüş, tamamen aranabilir yeni PDF belgenizi indirin.",
      },
    ],
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
