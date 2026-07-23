# PDF Araç Seti — Web Ürünü: Kapsamlı Planlama ve Sistem Mimarisi

> Durum: Planlama (kodlama başlamadı) · Tarih: 21 Temmuz 2026
> Karar seti: PDF araç seti (genişleyebilir) · Global/EN öncelikli çok dilli · Ücretsiz + reklam · Bütçe ≤ $10/ay

---

## 1. Vizyon ve Konumlandırma

**Vizyon:** iLovePDF / Smallpdf tarzı bir PDF araç seti — ama tek kritik farkla: **tüm işlem tarayıcıda gerçekleşir, dosyalar asla sunucuya yüklenmez.**

**Konumlandırma cümlesi (hero mesajı):**
> "Convert, split and merge PDFs — 100% in your browser. Your files never leave your device."

Bu fark neden kazandırır:
- Rakiplerin çoğu dosyayı sunucuya yükler → gizlilik endişesi (özellikle sözleşme, fatura, kimlik gibi belgelerde). "Files never leave your device" hem güven mesajı hem SEO/pazarlama kancası.
- Sunucu maliyeti ~0 → $10/ay bütçe sorunsuz yeter, viral büyümede bile maliyet patlamaz.
- Sınır koymak gerekmez: rakiplerin "günde 2 dosya, max 50 MB" limitleri bizde yok — çünkü işlemi kullanıcının cihazı yapıyor. "No limits, no signup" ikinci kanca.

**Hedef kitle:** Global, İngilizce öncelikli. Öğrenciler, ofis çalışanları, "pdf to png" gibi aramalar yapan herkes. Trafik kaynağı %90+ organik arama (SEO) olacak — bu ürün kategorisinde kullanıcılar Google'dan gelir, işini yapar, gider.

**İsim/domain önerileri** (müsaitlik kontrol edilmeli, .com ~$10/yıl):
- Tarz A (açıklayıcı): `pdftopng.app`, `localpdf.tools`, `pdfonyourdevice.com`
- Tarz B (marka): `snappdf.io`, `pagelight.app`, `quietpdf.com`
- Öneri: kısa + "pdf" kelimesini içeren bir .com (SEO'da exact-match hafif avantaj + akılda kalıcılık). Domain tek zorunlu masraf.

---

## 2. Ürün Kapsamı ve Araç Yol Haritası

### Faz 1 — Lansman (MVP): mevcut projenin web'e taşınması
1. **PDF → PNG** (amiral gemisi; masaüstü uygulamanın birebir web karşılığı)
   - Çoklu dosya + sürükle-bırak
   - DPI/kalite ön ayarları: 100 / 150 / 200 / 300 (mevcut mantıkla aynı)
   - Sayfa aralığı seçimi (yeni; webde beklenen özellik)
   - İlk sayfa canlı önizleme (mevcut UX'in taşınması)
   - Tek sayfa → PNG indir; çoklu sayfa → otomatik ZIP
   - İlerleme çubuğu + iptal + hata dayanıklılığı (sayfa bazlı hata devam eder — mevcut edge-case matrisi aynen korunur)
2. **PDF → JPG** (aynı motor, farklı çıktı formatı; neredeyse bedava ikinci araç, ayrı SEO sayfası)

### Faz 2 — Araç seti genişlemesi (her araç = yeni SEO sayfası)
3. **Merge PDF** (birleştirme) — en çok aranan PDF aracı
4. **Split PDF** (bölme / sayfa çıkarma)
5. **Rotate PDF** (döndürme)
6. **Images → PDF** (PNG/JPG'den PDF oluşturma — ters yön)

### Faz 3 — İleri araçlar
7. **Compress PDF** (sıkıştırma)
8. **PDF → Text** (metin çıkarma)
9. **Reorder/Delete pages** (görsel sayfa düzenleyici)
10. Watermark, page numbers, PDF şifre kaldırma (şifre bilinen) vb.

**Kural:** Her araç kendi URL'inde yaşar (`/pdf-to-png`, `/merge-pdf`...). Bu hem SEO stratejisinin temeli hem de mimariyi modüler tutar. Araçlar ortak bir "motor katmanı"nı paylaşır (bkz. §4).

**Kapsam dışı (bilinçli):** OCR, PDF düzenleme (metin editing), e-imza, Word↔PDF dönüşümü. Bunlar ya çok ağır (client-side zor) ya da ayrı ürün kategorisi. İleride değerlendirilir.

---

## 3. Gelir Modeli ve Maliyet Planı

### Gelir: Reklam (Google AdSense)
- **AdSense onay gereksinimleri (2026):** özgün içerik, About/Privacy Policy/Contact sayfaları (zorunlu), profesyonel tasarım, mobil uyum. Minimum site yaşı veya trafik şartı resmi olarak yok ama içerik kalitesi kritik — bu yüzden her araç sayfasının altına 500-1000 kelimelik özgün "how to / FAQ" içeriği yazılacak (aynı zamanda SEO için de gerekli).
- **Reklam yerleşimi ilkesi:** araç çalışma alanına asla reklam girmez. Yerleşimler: (a) araç altı içerik bölgesi, (b) dönüşüm bitti/indirme ekranı (en değerli slot — kullanıcı işini bitirdi, dikkat müsait), (c) masaüstünde sağ kenar. Agresif reklam = güven mesajıyla çelişir; az ama doğru yerde.
- **Beklenti yönetimi:** araç sitelerinde RPM (1000 gösterim başı gelir) ~$1–5 arası. Anlamlı gelir için aylık on binlerce ziyaret gerekir → ilk 6-12 ay gelir değil trafik büyütme dönemi.
- İleride: AdSense yerine/yanına Carbon Ads (geliştirici kitlesi) veya "buy me a coffee" bağışı denenebilir.

### Maliyet (hedef: ≤ $10/ay)
| Kalem | Servis | Maliyet |
|---|---|---|
| Domain (.com) | Cloudflare Registrar | ~$10/yıl (≈$0.85/ay) |
| Hosting + CDN | Cloudflare Pages (free tier) | $0 — sınırsız bant genişliği, sınırsız istek, 500 build/ay |
| SSL, DNS, DDoS koruması | Cloudflare (free) | $0 |
| Analitik | Cloudflare Web Analytics veya Plausible self-host yerine CF free | $0 |
| Hata izleme | Sentry free tier | $0 |
| **Toplam** | | **≈ $1/ay** (bütçenin ~%10'u) |

Client-side mimari sayesinde trafik 100 katına çıksa bile maliyet değişmez. Kalan bütçe ileride ihtiyaç olursa (ör. Cloudflare Workers Paid $5/ay) hazır durur ama Faz 1-2-3'ün hiçbirinde gerekmiyor.

---

## 4. Sistem Mimarisi

### 4.1 Ana karar: %100 client-side işleme
"Bana öner" demiştin — öneri net: **tarayıcıda (client-side) işleme.** Gerekçe:
- $10/ay bütçe ile sunucu tarafı PDF render etmek ölçeklenemez (CPU-yoğun iş; ücretsiz tier'lar birkaç yüz dönüşümde biter).
- Gizlilik = ana pazarlama farkımız; sunucu olsaydı bu mesaj yalan olurdu.
- Modern tarayıcılar WASM ile masaüstüne yakın performans verir; 1000+ sayfalık PDF'ler bile sayfa-sayfa (streaming) işlenerek bellek güvenli kalır — masaüstü uygulamadaki sequential yaklaşımın aynısı.
- Dezavantaj: çok eski cihazlarda yavaşlık, tarayıcı bellek sınırları. Kabul edilebilir; sayfa-sayfa işleme + Web Worker ile yönetilir.

### 4.2 Render motoru
İki aday:
- **MuPDF.js (WASM):** masaüstü uygulamanın kullandığı PyMuPDF'in birebir web kardeşi — aynı render motoru, pixel-perfect çıktı, `drawPageAsPNG` hazır API. **Önerilen.** Böylece web çıktısı masaüstü çıktısıyla birebir aynı olur. Lisans notu: MuPDF AGPL — kaynak açık tutulursa ücretsiz; site kodunu GitHub'da açık tutmak (zaten repo var) bu şartı karşılar.
- **PDF.js (Mozilla, Apache 2.0):** en yaygın, lisans derdi yok, canvas'a render → PNG. Kalite iyi ama bazı karmaşık PDF'lerde MuPDF kadar sadık değil.
- **Plan:** motor, arayüzden soyutlanır (adapter deseni). MuPDF.js ile başla; lisans/boyut sorun olursa PDF.js'e geçiş tek modül değişikliği olur.

### 4.3 Katmanlı mimari (masaüstü mimarisinin web'e izdüşümü)

```
┌──────────────────────────────────────────────────────┐
│  UI Katmanı (sayfalar + bileşenler)                  │
│  /pdf-to-png  /merge-pdf  /split-pdf ...             │
│  DropZone · OptionsPanel · Preview · ProgressPanel   │
├──────────────────────────────────────────────────────┤
│  Uygulama Katmanı (araç orkestrasyonu)               │
│  ToolController · JobQueue · CancelToken             │
│  (= mevcut export_service.py karşılığı)              │
├──────────────────────────────────────────────────────┤
│  Worker Katmanı (Web Worker — UI donmaz)             │
│  render-worker.ts  (= export_worker.py karşılığı)    │
│  sayfa-sayfa işleme · progress mesajları · iptal     │
├──────────────────────────────────────────────────────┤
│  Motor Katmanı (adapter)                             │
│  PdfEngine arayüzü → MuPDF.js (WASM)                 │
│  (= pdf_service.py karşılığı)                        │
├──────────────────────────────────────────────────────┤
│  Çıktı Katmanı                                       │
│  PNG/JPG blob · ZIP paketleme (fflate) · indirme     │
└──────────────────────────────────────────────────────┘
```

Mevcut masaüstü mimarisi (models / services / ui / worker ayrımı) zaten web'e taşınmaya çok uygun — aynı sorumluluk ayrımı korunuyor, sadece diller değişiyor (Python→TypeScript, QThread→Web Worker, PyMuPDF→MuPDF.js).

### 4.4 Teknoloji yığını
| Katman | Seçim | Gerekçe |
|---|---|---|
| Framework | **Astro** (+ React adaları) | Statik-öncelikli → SEO mükemmel, JS sadece araç bileşenlerinde yüklenir (hız = sıralama faktörü). Çok dilli routing yerleşik. |
| Dil | TypeScript | Tip güvenliği; models/ dataclass'larının karşılığı interface'ler |
| Stil | Tailwind CSS | Hızlı, tutarlı, tasarım token'ları ile |
| PDF motoru | MuPDF.js (WASM) — adapter arkasında | §4.2 |
| ZIP | fflate | Küçük, hızlı, worker-uyumlu |
| İşleme | Web Worker + Comlink | UI donmaz; progress/cancel sinyalleri (Qt signals karşılığı) |
| Hosting | Cloudflare Pages | $0, sınırsız bant genişliği, global CDN, otomatik SSL |
| CI/CD | GitHub → Cloudflare Pages otomatik deploy | Push = yayın; preview deploy'lar PR başına |
| Analitik | Cloudflare Web Analytics | $0, çerezsiz → basit cookie banner yeterliliği |
| Hata izleme | Sentry (free) | Tarayıcı hatalarını yakalama |

### 4.5 Veri akışı (PDF → PNG örneği)
1. Kullanıcı dosyaları bırakır → `File` API ile okunur (ağa hiçbir şey gitmez)
2. Validasyon: uzantı, magic bytes, şifre kontrolü, 0 sayfa kontrolü (mevcut edge-case matrisi birebir uygulanır)
3. İlk sayfa düşük DPI render → önizleme kartı
4. "Convert" → Worker'a `ExportOptions {dpi, pageRange, format}` gönderilir
5. Worker sayfa-sayfa render eder; her sayfada `ProgressData {current, total, fileName}` mesajı → UI progress bar + log
6. Sayfa hatası → loglanır, atlanır, sayaç tutulur (run devam eder)
7. Bitiş/iptal → `ExportResult {success, fail, duration}` özeti; tek dosya direkt PNG, çoklu ZIP olarak indirilir
8. Bellek: her sayfa render sonrası blob ZIP stream'ine yazılır, canvas temizlenir → 1000+ sayfa güvenli

### 4.6 Güvenlik ve uyumluluk
- Dosya sunucuya gitmediği için veri işleme riski minimal; yine de GDPR uyumlu Privacy Policy (analitik + AdSense çerezleri için), cookie consent (AdSense için zorunlu — EU'da Google CMP), Terms of Use sayfaları hazırlanır (AdSense onayı için de şart).
- CSP başlıkları, `Cross-Origin-Embedder-Policy` (WASM thread'leri için gerekebilir) Cloudflare Pages `_headers` dosyasıyla verilir.

---

## 5. Frontend Planı ve Tasarım

### 5.1 Site haritası
```
/                     → ana sayfa: araç ızgarası + değer önerisi
/pdf-to-png           → amiral araç (her araç aynı şablon)
/pdf-to-jpg, /merge-pdf, /split-pdf ... (fazlara göre açılır)
/blog/...             → SEO içerikleri (AdSense onayı + trafik)
/about  /privacy  /terms  /contact
/tr/... /es/... /de/...  → dil kopyaları (alt dizin stratejisi)
```

### 5.2 Araç sayfası şablonu (tüm araçlar aynı iskelet)
1. **Başlık + tek cümle açıklama** ("Convert PDF pages to PNG images. Free, no limits, files stay on your device.")
2. **DropZone** — sayfanın kahramanı; büyük, sürükle-bırak + "Choose files", çoklu dosya
3. **Seçenekler paneli** (dosya seçilince görünür): kalite kartları (100/150/200/300 DPI, "Recommended: 150" rozetli), sayfa aralığı, format
4. **Önizleme** — ilk sayfa canlı önizleme (masaüstündeki preview kartı)
5. **İşlem ekranı** — progress bar, sayfa sayacı, dosya bazlı durum listesi, Cancel butonu
6. **Sonuç ekranı** — özet (X sayfa, Y başarılı, süre), büyük "Download ZIP" butonu, "Convert more" linki, diğer araçlara çapraz linkler ("Now merge them →")
7. **İçerik bölümü** — "How to convert PDF to PNG", 4-6 soruluk FAQ (FAQ schema markup ile), gizlilik açıklaması
8. Reklam slotları: içerik bölümü içi + sonuç ekranı altı

Adım geçişleri tek sayfada state ile olur (upload → options → processing → done). Sayfa yenilenmez.

### 5.3 Tasarım dili
- **Kişilik:** temiz, güven veren, "hafif ve hızlı" hissi. İlham: Smallpdf'in sadeliği + TinyWow'un araç ızgarası; ama daha az kalabalık.
- **Renk:** nötr zemin (beyaz/koyu gri), tek güçlü vurgu rengi (öneri: canlı bir mavi-mor arası ton veya markaya göre; PDF klişesi kırmızıdan bilinçli kaçış → farklılaşma). Başarı=yeşil, hata=kırmızı, sadece anlamsal kullanım.
- **Tipografi:** Inter veya Geist (değişken font, tek aile). Başlıklar 600, gövde 400.
- **Bileşen sistemi:** Button (primary/secondary/ghost), Card, DropZone, ProgressBar, FileChip (dosya + boyut + kaldır), Toast, Badge, LanguageSwitcher. Tailwind token'ları ile tanımlanır → tutarlılık ve dark mode desteği baştan.
- **Dark mode:** evet, sistem tercihine göre otomatik + manuel geçiş (geliştirici/öğrenci kitle bekliyor).
- **Mobil:** tam responsive; mobilde DropZone "tap to choose" ağırlıklı. Mobil trafik bu kategoride %40+ ve AdSense onayında mobil uyum kriter.
- **Erişilebilirlik:** WCAG AA — klavye ile tüm akış, aria-live ile progress duyuruları, kontrast oranları, odak halkaları.
- **Güven işaretleri:** DropZone altında kalıcı satır: "🔒 Files are processed on your device and never uploaded." + footer'da açık kaynak GitHub linki.

### 5.4 Performans hedefleri
- Lighthouse 95+ (SEO için kritik); Astro statik + araç JS'i lazy-load
- WASM (~1-3 MB) sadece kullanıcı dosya bıraktığında/hover'da preload edilir — ilk boyama etkilenmez
- Core Web Vitals: LCP < 2s, CLS ~0 (reklam alanlarına sabit yükseklik rezervasyonu — reklamlar CLS'i bozmasın)

---

## 6. Çok Dillilik (i18n)

- **Strateji:** alt dizin (`/tr/`, `/es/`, `/de/`...) — tek domain, SEO otoritesi bölünmez. `hreflang` etiketleri ile.
- **Lansman:** EN + TR (TR'yi zaten yazabiliyorsun, bedava ikinci pazar).
- **Faz 2+:** ES, DE, FR, PT — "pdf to png" aramaları bu dillerde de yüksek hacimli ve rekabet İngilizceden düşük → çok dillilik bu üründe ciddi bir büyüme kaldıracı.
- UI metinleri JSON sözlüklerde; araç sayfası içerikleri (how-to/FAQ) dil başına özgün çeviri (makine çevirisi + insan düzeltmesi; ham makine çevirisi AdSense/Google kalite riskidir).

---

## 7. SEO ve Büyüme Planı

- **Araç sayfası = landing page:** her araç bir ana anahtar kelimeyi hedefler ("pdf to png" ~yüz binlerce aylık arama). Title/meta/H1 + FAQ schema + HowTo schema.
- **Uzun kuyruk blog içerikleri:** "how to convert pdf to png on mac/windows/iphone", "pdf to png without losing quality", "300 dpi pdf to png for printing"... Her biri araç sayfasına iç link verir. AdSense onayı için gereken 15-25 özgün içerik bu blogla sağlanır.
- **Farklılaşma mesajı her yerde:** "no upload, no limits, no signup" — rakiplerin limit sayfalarından gelen hayal kırıklığı trafiğini yakalar.
- **Launch kanalları:** Product Hunt, Hacker News (Show HN — "privacy-first, client-side PDF tools" teknik kitlenin sevdiği hikâye), Reddit (r/productivity, r/selfhosted), açık kaynak repo (GitHub yıldızları → güven + backlink).
- **Ölçüm:** Cloudflare Analytics ile sayfa/araç bazlı trafik; hedefler — 3. ay: ilk organik trafik + AdSense onayı, 6. ay: 10K ziyaret/ay, 12. ay: 50K+ ziyaret/ay.

---

## 8. Uygulama Yol Haritası (kodlamaya başlandığında)

| Faz | Süre (tahmini) | İçerik | Bitti sayılma kriteri |
|---|---|---|---|
| 0. Temel | 1 hafta | Domain al, repo/CI kur, Astro iskeleti, tasarım token'ları, bileşen kütüphanesi | Boş site canlıda, Lighthouse 95+ |
| 1. Çekirdek motor | 1-2 hafta | PdfEngine adapter + MuPDF.js entegrasyonu + Worker altyapısı + testler | 1000 sayfalık PDF'i donmadan, iptal edilebilir şekilde dönüştürür |
| 2. PDF→PNG aracı | 1-2 hafta | Tam araç akışı (upload→options→progress→done), edge-case matrisi, mobil | Masaüstü uygulamayla aynı çıktı, tüm edge-case'ler yeşil |
| 3. Lansman hazırlığı | 1 hafta | PDF→JPG, about/privacy/terms/contact, EN+TR i18n, SEO meta/schema, analitik | AdSense başvurusuna hazır site |
| 4. Lansman + içerik | sürekli | PH/HN lansmanı, blog içerikleri (haftada 1-2), AdSense başvurusu | Onay + ilk organik trafik |
| 5. Araç seti | araç başına ~1 hafta | Merge → Split → Rotate → Images-to-PDF | Her araç kendi SEO sayfasıyla canlı |

**Test stratejisi:** motor katmanı için birim testleri (bilinen PDF'ler → beklenen piksel çıktıları, masaüstü çıktısıyla karşılaştırmalı "golden file" testleri), edge-case PDF koleksiyonu (şifreli, bozuk, 0 sayfa, dev dosya), Playwright ile uçtan uca akış testi.

---

## 9. Riskler ve Karşı Önlemler

| Risk | Etki | Önlem |
|---|---|---|
| MuPDF AGPL lisansı | Kod kapalı olursa ücret gerekir | Repo açık kaynak kalır; alternatif olarak adapter ile PDF.js'e geçiş hazır |
| Tarayıcıda dev PDF bellek sorunu | Sekme çöker | Sayfa-sayfa streaming, canvas geri dönüşümü, 300 DPI + 1000 sayfa kombinasyonunda kullanıcı uyarısı |
| AdSense onay reddi | Gelir gecikir | Onay öncesi 15+ özgün içerik, zorunlu sayfalar, mobil uyum; ret halinde düzeltip yeniden başvuru (yaygın süreç) |
| SEO'da yavaş büyüme | Trafik 6+ ay alır | Beklenti baştan böyle kuruldu; uzun kuyruk + çok dillilik + launch kanalları ile hızlandırma |
| Rakiplerin marka gücü | Zor sıralamalar | Ana kelimelerde değil uzun kuyrukta + "no upload/privacy" farklılaşmasında yarış |
| Safari/eski tarayıcı WASM sorunları | Bazı kullanıcılar dönüştüremez | Feature detection + destek tablosu + hata mesajında masaüstü uygulamaya yönlendirme (dist zaten var) |

---

## 10. Açık Sorular (bir sonraki oturumda karara bağlanacak)

1. Domain ismi — kısa liste çıkarıp müsaitlik kontrolü yapılacak
2. Marka rengi ve logo yönü
3. MuPDF.js paket boyutu ölçümü → PDF.js ile pratik karşılaştırma (kodlamaya başlamadan küçük bir teknik deneme, "spike", yapılabilir)
4. Masaüstü uygulamanın geleceği: sitede "Download desktop app" olarak sunulsun mu? (Öneri: evet — bedava güven ve farklılaşma unsuru)
