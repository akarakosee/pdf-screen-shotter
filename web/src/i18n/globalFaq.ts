export interface QA {
  q: string;
  a: string;
}

export const globalFaqCopy: Record<'en' | 'tr', { title: string; items: QA[] }> = {
  en: {
    title: 'Frequently asked questions',
    items: [
      {
        q: 'Why do my PDFs load or process slowly?',
        a: "Since there is no server involved, all processing speed depends entirely on your computer and browser's hardware. Large files may take longer on older devices or if your browser is under heavy load.",
      },
      {
        q: 'Is there a file size or page limit?',
        a: 'No fixed limits. Because your own device does the work, even documents with hundreds of pages are processed without running out of memory. Very large jobs simply take longer.',
      },
      {
        q: 'What happens with password-protected or damaged PDFs?',
        a: 'Password-protected PDF files cannot be processed by other tools until their password is removed. You can first use our free "Unlock PDF" tool on this website to remove the password with 100% privacy, and then freely use your unlocked file across any of our tools. Corrupted or unreadable PDF files are safely skipped with a clear error message.',
      },
      {
        q: 'Do I need an internet connection to use the tools?',
        a: 'You only need an internet connection to load the website initially. Once the page is loaded, the tools work entirely offline because all the processing happens directly inside your browser.',
      },
      {
        q: 'Is there a limit on how many files I can process per day?',
        a: 'Absolutely no limits. Since your own device is doing the processing, there are no server costs, meaning you can convert, merge, or split as many documents as you want, completely free forever.',
      },
      {
        q: 'Does the quality of my PDF decrease after processing?',
        a: 'No. We use high-quality rendering engines. For image conversions, you can even select the exact DPI (up to 300 for print quality) to ensure no loss of detail. Merging and splitting operations preserve the original document quality perfectly.',
      },
    ],
  },
  tr: {
    title: 'Sıkça Sorulan Sorular',
    items: [
      {
        q: 'PDF dosyalarım neden yavaş yükleniyor veya yavaş işleniyor?',
        a: 'İşlemlerin tamamı kendi cihazınızda gerçekleştiği (hiçbir sunucu kullanılmadığı) için, hız tamamen bilgisayarınızın ve tarayıcınızın donanım kapasitesine bağlı olarak değişir. Eski cihazlarda çok büyük dosyaların işlenmesi biraz daha uzun sürebilir.',
      },
      {
        q: 'Dosya boyutu veya sayfa sınırı var mı?',
        a: 'Sabit bir sınır yok. İşi kendi cihazınız yaptığı için yüzlerce sayfalık belgeler bile bellek sorunu yaşanmadan işlenir. Çok büyük işler yalnızca daha uzun sürer.',
      },
      {
        q: 'Şifreli veya hasarlı PDF dosyalarında ne olur?',
        a: 'Şifre korumalı PDF dosyaları, parolaları kaldırılmadan diğer araçlarımızda doğrudan işlenemez. Belgelerinizi kullanmadan önce sitemizdeki ücretsiz "PDF Şifre Kaldır" (Unlock PDF) aracını kullanarak parolanızı çözebilir, ardından kilidi açılan dosyanızı tüm araçlarımızda güvenle işleyebilirsiniz. Hasarlı veya açılamayan dosyalar ise net bir uyarı mesajıyla güvenli şekilde atlanır.',
      },
      {
        q: 'Araçları kullanmak için internet bağlantısına ihtiyacım var mı?',
        a: 'Sadece siteyi ilk açtığınızda internete ihtiyacınız vardır. Sayfa yüklendikten sonra tüm araçlar tamamen çevrimdışı (offline) çalışır, çünkü bütün işlemler doğrudan tarayıcınızın içinde gerçekleşir.',
      },
      {
        q: 'Günde kaç dosya işleyebileceğime dair bir sınır var mı?',
        a: 'Kesinlikle hiçbir sınır yok. İşlemleri sizin kendi cihazınız yaptığı için herhangi bir sunucu maliyeti oluşmaz; bu sayede dilediğiniz kadar belgeyi dönüştürebilir, birleştirebilir veya bölebilirsiniz. Tamamen ve sonsuza dek ücretsizdir.',
      },
      {
        q: 'İşlem sonrasında PDF\'imin kalitesi düşer mi?',
        a: 'Hayır. Yüksek kaliteli işleme motorları kullanıyoruz. Görüntüye dönüştürme işlemlerinde kalite kaybı yaşamamak için tam DPI değerini (baskı kalitesi için 300\'e kadar) kendiniz seçebilirsiniz. Birleştirme ve bölme işlemleri ise orijinal belge kalitesini birebir korur.',
      },
    ],
  },
};
