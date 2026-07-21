# PDF Araç Seti — Teknik Sistem Tasarımı (System Design)

> WEB_PLANI.md'nin mühendislik derinleştirmesi. Durum: tasarım (kodlama yok). Tarih: 21 Temmuz 2026.

---

## 1. Gereksinimler

### 1.1 Fonksiyonel
- F1: Çoklu PDF yükleme (drag-drop + picker), dosya başına validasyon
- F2: PDF → PNG/JPG, DPI seçimi (100/150/200/300), sayfa aralığı
- F3: İlk sayfa canlı önizleme
- F4: Sayfa bazlı ilerleme, iptal, sayfa hatasında devam
- F5: Tek çıktı → doğrudan indirme; çoklu → ZIP
- F6: Faz 2+ araçları (merge/split/rotate/images→pdf) aynı altyapı üzerinde
- F7: i18n (EN/TR başlangıç), dark mode

### 1.2 Fonksiyonel olmayan
- N1: Sunucu tarafında hiçbir dosya işlenmez/saklanmaz (gizlilik garantisi = ürün sözü)
- N2: 1000+ sayfa @300 DPI donmadan ve sekme çökmeden işlenebilmeli
- N3: LCP < 2s, Lighthouse ≥ 95, CLS ≈ 0 (reklam alanları rezerve)
- N4: Aylık maliyet ≤ $10 (hedef ~$1); trafik artışı maliyeti değiştirmemeli
- N5: Tek geliştirici sürdürebilirliği: az bağımlılık, sıkı modül sınırları
- N6: Tarayıcı desteği: son 2 yıl Chrome/Firefox/Safari/Edge; WASM zorunlu, feature detection ile zarif düşüş

### 1.3 Kısıtlar
- Ekip: 1 kişi. Bütçe: $10/ay. Sunucu yok (statik hosting + CDN yalnız).
- MuPDF.js AGPL → repo açık kaynak kalmalı (zaten öyle).

---

## 2. Yüksek Seviye Tasarım

### 2.1 Bileşen diyagramı

```
                    ┌────────────────────────────┐
   GitHub push ───▶ │  Cloudflare Pages (CDN)    │  statik varlıklar:
                    │  HTML/CSS/JS + WASM + i18n │  hepsi immutable, hash'li
                    └─────────────┬──────────────┘
                                  │ ilk yükleme (≈70KB JS) + lazy WASM
┌─────────────────────────────────▼─────────────────────────────────────┐
│ TARAYICI                                                              │
│                                                                       │
│  Main thread                          Worker thread                   │
│  ┌──────────────────────┐             ┌───────────────────────────┐   │
│  │ UI (Astro sayfaları  │  postMessage│ render-worker             │   │
│  │  + React adaları)    │◀───────────▶│  ┌─────────────────────┐  │   │
│  │  ToolShell           │  (Comlink)  │  │ PdfEngine (adapter) │  │   │
│  │  DropZone/Options/   │             │  │  └─ MuPdfEngine     │  │   │
│  │  Progress/Result     │             │  │     (WASM instance) │  │   │
│  └──────────┬───────────┘             │  └─────────────────────┘  │   │
│             │                         │  ZipStream (fflate)       │   │
│  ┌──────────▼───────────┐             └───────────────────────────┘   │
│  │ JobController        │                                             │
│  │  kuyruk·iptal·durum  │             Çıktı: Blob → <a download>      │
│  └──────────────────────┘                                             │
└───────────────────────────────────────────────────────────────────────┘
```

### 2.2 Modül/dizin yapısı (monorepo, tek paket)

```
src/
├── pages/                      # Astro — her araç bir sayfa (SEO)
│   ├── index.astro
│   ├── pdf-to-png.astro        # + [lang]/ kopyaları i18n routing ile
│   └── ...
├── components/                 # React adaları (yalnız araç UI'ı hydrate olur)
│   ├── ToolShell.tsx           # upload→options→processing→done state makinesi
│   ├── DropZone.tsx  OptionsPanel.tsx  Preview.tsx
│   ├── ProgressPanel.tsx  ResultPanel.tsx  FileChip.tsx
│   └── ui/                     # Button, Card, Toast, Badge...
├── app/
│   ├── JobController.ts        # kuyruk, iptal, worker yaşam döngüsü
│   ├── validators.ts           # magic bytes, uzantı, boyut, şifre ön-testi
│   └── download.ts             # Blob → dosya indirme, ZIP adlandırma
├── workers/
│   └── render.worker.ts        # tek worker; mesaj protokolü §3.3
├── engine/
│   ├── PdfEngine.ts            # arayüz (motor sözleşmesi)
│   ├── MuPdfEngine.ts          # MuPDF.js implementasyonu
│   └── (PdfJsEngine.ts)        # yedek implementasyon — gerekirse
├── tools/                      # araç tanımları (motor üstü orkestrasyon)
│   ├── toPng.ts  toJpg.ts      # Faz 1
│   └── merge.ts  split.ts ...  # Faz 2+
├── i18n/                       # en.json, tr.json ...
└── core/
    ├── types.ts                # ExportOptions/ProgressData/ExportResult
    └── config.ts               # DPI presetleri, limitler (masaüstü core/config.py karşılığı)
```

Masaüstü eşlemesi: `services/export_service.py → app/JobController + tools/`, `services/pdf_service.py → engine/`, `ui/export_worker.py → workers/`, `models/ → core/types.ts`.

---

## 3. Derin Tasarım

### 3.1 Tip sözleşmeleri (data model)

```ts
type ToolId = 'pdf-to-png' | 'pdf-to-jpg' | 'merge' | 'split' | 'rotate' | 'img-to-pdf';

interface ExportOptions {
  dpi: 100 | 150 | 200 | 300;
  format: 'png' | 'jpg';
  jpgQuality?: number;          // 0.8 varsayılan
  pageRange?: string;           // "1-5,8,11-13" — parse edilmiş: number[]
}

interface JobFile { id: string; file: File; pageCount: number; status: FileStatus; }

interface ProgressData {        // worker → UI (her sayfada)
  fileId: string; page: number; totalPages: number;
  fileIndex: number; totalFiles: number;
}

interface PageError { fileId: string; page: number; message: string; }

interface ExportResult {
  totalPages: number; succeeded: number; failed: PageError[];
  durationMs: number; output: Blob; outputName: string; cancelled: boolean;
}
```

### 3.2 Motor arayüzü (adapter sözleşmesi)

```ts
interface PdfEngine {
  init(): Promise<void>;                              // WASM yükle (idempotent)
  open(data: ArrayBuffer): Promise<PdfDoc>;           // şifreli → EncryptedError
  pageCount(doc: PdfDoc): number;
  renderPage(doc: PdfDoc, page: number, dpi: number): Promise<ImageData | Blob>;
  close(doc: PdfDoc): void;                           // WASM belleğini serbest bırak
}
```

Kurallar: motor yalnız worker içinde yaşar (main thread'e asla import edilmez); UI motor tipini bilmez; MuPDF↔PDF.js geçişi tek dosya değişikliği.

### 3.3 Worker mesaj protokolü

```
UI → Worker:  { type:'start', files: ArrayBuffer[], meta: FileMeta[], options }
              { type:'preview', file: ArrayBuffer, dpi: 72 }
              { type:'inspect', fileId, file: ArrayBuffer }   // ADR-003: render'sız sayfa sayımı
              { type:'cancel' }
Worker → UI:  { type:'ready' }                        // WASM init bitti
              { type:'preview-done', blob }
              { type:'inspect-done', fileId, pageCount }      // ADR-003; hata → file-error
              { type:'progress', data: ProgressData }
              { type:'page-error', error: PageError } // devam eder
              { type:'file-error', fileId, message }  // sıradaki dosyaya geçer
              { type:'done', result: ExportResult }
              { type:'fatal', message }               // worker yeniden yaratılır
```

- ArrayBuffer'lar `postMessage`'a **transferable** olarak verilir (kopyasız, bellek 2×'lenmez).
- İptal: cooperative — worker her sayfa döngüsünde cancel bayrağını kontrol eder; o ana dek ZIP'e yazılmış sayfalar korunur ve kısmi ZIP indirilebilir (masaüstündeki "partial results kept" davranışı).
- `fatal` (WASM OOM vb.) sonrası JobController worker'ı terminate edip yenisini spawn eder → sekme çökmesi izole edilir. Bu, worker kullanmanın ikinci büyük gerekçesi (birincisi: UI donmaması).

### 3.4 Bellek stratejisi (N2'nin kalbi)
1. Sayfa render → PNG encode → ZIP stream'ine **anında** yaz (fflate streaming API) → render buffer'ı ve WASM pixmap'i hemen serbest bırak. Aynı anda bellekte ≤1 sayfa bitmap'i bulunur.
2. ZIP çıktısı parçalar halinde biriktirilir; `done`'da tek Blob'a çevrilir. Tarayıcı Blob'ları gerektiğinde diske taşır (tarayıcının kendi yönetimi) → 2-4 GB'lık çıktılar bile mümkün.
3. Koruma rayı: `sayfaSayısı × (dpi/72)² × genişlik × yükseklik × 4` ile kaba tahmin; tahmini tek sayfa bitmap'i > ~500 MB ise (ör. A0 poster @300 DPI) kullanıcıya uyarı + düşük DPI önerisi.
4. Girdi PDF'in ArrayBuffer'ı işlem bitene dek tutulmak zorunda (motor lazy okur) — 500 MB+ girdi dosyalarında toplam bellek uyarısı gösterilir.

### 3.5 WASM yükleme ve önbellek stratejisi
- WASM (~2-3 MB) ilk boyamaya dahil edilmez. Preload tetikleyicileri: DropZone hover / `dragenter` / dosya seçici açılması — kullanıcı dosyayı bırakana kadar init çoğunlukla bitmiş olur.
- Tüm varlıklar content-hash'li dosya adlarıyla `Cache-Control: immutable, max-age=1y` (Cloudflare `_headers`). İkinci ziyarette WASM diskten gelir.
- Service Worker (Faz 2'de): varlıkları önbelleğe alıp aracı **tamamen çevrimdışı** çalışır yapar — "works offline" üçüncü pazarlama kancası olur. Faz 1'de eklenmez (kompleksite erteleme).
- ~~COOP/COEP başlıkları baştan konur~~ **Güncelleme (ADR-002):** COOP/COEP konmayacak — MuPDF.js tek thread'li (SAB kullanmıyor, spike ile doğrulandı) ve Google GPT COEP'li sayfaları desteklemiyor. `_headers` yalnız cache + CSP içerir.

### 3.6 Hata taksonomisi (masaüstü edge-case matrisinin web karşılığı)

| Hata | Tespit | Davranış |
|---|---|---|
| PDF değil (uzantı/magic bytes) | validator, main thread | FileChip'te ret + neden |
| Şifreli PDF | engine.open | Dosya atlanır, mesaj: "password-protected" (Faz 3: şifre girişi) |
| Bozuk PDF | engine.open throw | file-error, sıradaki dosya |
| 0 sayfa | pageCount | file-error |
| Tek sayfa render hatası | renderPage throw | page-error, sayaç, devam |
| WASM OOM / fatal | worker onerror | fatal → worker restart, kısmi sonuç sunulur |
| WASM desteklenmiyor | feature detection, sayfa açılışında | Araç yerine bilgi kartı + masaüstü uygulama indirme linki |
| Kota/disk (Blob yazımı) | catch | Kullanıcıya "insufficient storage" mesajı |

Telemetri: Sentry'ye yalnız hata türü + yığın gider; **dosya adı, içerik veya sayfa verisi asla gönderilmez** (N1 sözünün telemetriye uzantısı — privacy policy'de açıkça yazılır).

### 3.7 Araç genişleme sözleşmesi (Faz 2+)

```ts
interface ToolDefinition<O> {
  id: ToolId;
  optionsSchema: O;                          // OptionsPanel'i üretir
  run(files: JobFile[], options: O, ctx: WorkerCtx): AsyncGenerator<ProgressData, ExportResult>;
}
```

Yeni araç = `tools/` altına bir dosya + bir Astro sayfası + i18n anahtarları. ToolShell, JobController, worker, motor **değişmez**. Bu sözleşme "araç başına ~1 hafta" tahmininin teknik dayanağı.

---

## 4. Ölçek ve Güvenilirlik

- **Yük modeli:** hesaplama kullanıcı cihazında → eşzamanlı kullanıcı sayısının sisteme etkisi yalnız CDN istekleri. Cloudflare free: sınırsız istek/bant genişliği → 10 da 10 milyon ziyaret de aynı mimari, $0. "Ölçekleme" problemi tanım gereği yok; tek ölçek riski build dakikası (500/ay — çok dilli statik sayfalar artınca izlenir, gerekirse incremental build).
- **Kullanılabilirlik:** statik site + CDN → SPOF yok; Cloudflare kesintisi tek bağımlılık (kabul edilir).
- **İzleme:** Cloudflare Analytics (trafik), Sentry (JS/WASM hataları), UptimeRobot free (uptime ping). Haftalık bakış yeterli.
- **Yayın güvenliği:** PR başına Cloudflare preview deploy; `main` = prod. Rollback = önceki deployment'ı tek tıkla geri alma (Pages yerleşik).
- **Test kapıları (CI):** birim (vitest: validators, pageRange parser, tip dönüşümleri) → golden-file render testleri (bilinen PDF'ler → masaüstü PyMuPDF çıktısıyla piksel karşılaştırma; motor eşdeğerliği kanıtı) → Playwright e2e (upload→convert→zip akışı + iptal + hatalı dosya senaryosu). Edge-case PDF koleksiyonu repo'da `test/fixtures/` altında tutulur.

---

## 5. Açık Trade-off Analizi

| Karar | Seçim | Bedeli | Neden kabul |
|---|---|---|---|
| İşleme yeri | Client-side | Eski/zayıf cihazlarda yavaş; 2 GB+ girdilerde sınır | $0 maliyet + gizlilik farkı; kitle modern tarayıcıda |
| Motor | MuPDF.js | AGPL (açık kaynak zorunlu), ~2-3 MB WASM | PyMuPDF ile birebir çıktı; adapter ile çıkış kapısı açık |
| Framework | Astro | React-SPA'ya göre daha az yaygın bilgi | Statik SEO sayfaları bu ürünün can damarı; JS diyeti |
| Worker sayısı | Tek worker, sıralı sayfa | Çok çekirdek atıl kalır | Bellek tahmin edilebilir; paralellik OOM riskini katlar. Faz 3'te ölçüp gerekirse 2-4 worker havuzu |
| ZIP | Streaming (fflate) | Kod biraz daha karmaşık | Bellek tavanı sabit; 1000+ sayfa şartının önkoşulu |
| Service Worker/offline | Faz 2'ye ertelendi | İlk sürümde offline yok | SW cache invalidation karmaşıklığı MVP'ye değmez |
| COOP/COEP baştan | AdSense iframe sürtüşmesi | Sonradan eklemek kırıcı olurdu; erken test edilecek |

## 6. Büyüdükçe yeniden ziyaret edilecekler
1. ~~AdSense × COEP uyumu~~ Çözüldü — bkz. ADR-002 (başlıklar konmayacak; kalan iş yalnız CSP'de AdSense domain allowlist'i + staging testi).
2. Worker havuzu ile paralel sayfa render — yalnız telemetri "dönüşüm çok yavaş" derse.
3. Compress/OCR gibi ağır araçlar gelirse: isteğe bağlı "yerel ağır mod" uyarıları veya WebGPU.
4. Trafik > 100K/ay olursa: reklam ağı alternatifleri (Carbon), belki Pro Cloudflare ($20 — o gün bütçe konuşması yeniden yapılır, gelir de vardır).
