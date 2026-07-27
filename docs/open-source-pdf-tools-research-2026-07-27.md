# Açık Kaynak PDF Araçları Araştırması — 2026-07-27

**Kapsamı:** Localpdf (browser-first, 100% yerel, gizlilik odaklı) projesine entegre edilebilecek
açık kaynak PDF işleme araçlarının detaylı araştırması. **Sadece tarayıcıda çalışabilen** ve
mevcut pdf-lib + mupdf-wasm stack ile uyumlu seçeneklere odaklanılmıştır.

---

## A. Mevcut Teknoloji Stack (Referans)

Proje şu an üç açık kaynak kütüphanesi kullanıyor:

- **pdf-lib** (Hopding, ~8.5K stars) — TypeScript/JavaScript, PDF oluşturma ve düzenleme
- **mupdf-wasm** (Artifex, WASM) — C kütüphanesi port, yüksek kalite rendering
- **fflate** (SheetJS, ~3.7K stars) — JavaScript, ZIP/streaming compression

---

## B. Browser-Uyumlu Açık Kaynak Alternatifler

### 1. **OCR & Seçilebilir Metin Extraction**

**tesseract.js** (~88K GitHub stars)
- **Teknoloji:** Pure JavaScript, Tesseract OCR portlanması
- **Platform:** Tarayıcı + Node.js
- **Özellikler:**
  - Multilingual support (50+ dil)
  - Web Worker compatibility
  - Seçilebilir metin katmanı oluşturma
- **Localpdf Use Case:** Taranmış PDF'lerdeki metnin searchable hale getirilmesi
- **Risk:** Büyük WASM dosyası (~10-15 MB), ilk load zamanı
- **Entegrasyon:** JobController'a yeni `ocrPage()` mesajı, OCR worker

**Mozilla's PDF.js** (~45K stars on mozilla/pdf.js)
- **Teknoloji:** JavaScript, Mozilla'nın resmi PDF renderer'ı
- **Özellikler:**
  - Native text layer extraction
  - Rendering + structure analysis
  - Viewer UI (opsiyonel)
- **Localpdf Use Case:** Gelişmiş text extraction, preview enhancement
- **Risk:** MuPDF'nin rendering kalitesiyle çakışabilir (seçim gerekli)
- **Entegrasyon:** Renderer olarak mupdf yerine ya da text-layer-only mod

### 2. **PDF Oluşturma & Layout**

**jsPDF** (~9K stars, parallax/jsPDF)
- **Teknoloji:** JavaScript, client-side PDF generation
- **Özellikler:**
  - HTML to PDF (html2canvas kullanarak)
  - Table, form, image support
  - Multi-page layouts
- **Localpdf Use Case:** Dinamik PDF oluşturma (template-based reports)
- **Başkırt Comparison:** pdf-lib ile overlap var, ama jsPDF daha high-level API
- **Risk:** Gereksiz kütüphane yığını (zaten pdf-lib var)

**pdfmake** (~10K stars)
- **Teknoloji:** JavaScript, declarative PDF definition
- **Özellikler:**
  - JSON schema-based layout
  - Table/list/image/chart support
  - Client + Server side
- **Localpdf Use Case:** Raporlama, formatted document generation
- **Risk:** Kütüphane tasarımı pdf-lib'den ayrı, kod bakımı karmaşık
- **Üstünlük:** Konular/style system çok güçlü, pdf-lib daha primitive

### 3. **İmage Processing (Canvas API Tabanlı)**

**image-js** (~2.5K stars, Pure JavaScript)
- **Teknoloji:** JavaScript, no native deps
- **Özellikler:**
  - Histogram, filtering, color space conversion
  - Grayscale, blur, sharpen
  - TIFF/PNG/JPEG I/O
- **Localpdf Use Case:** Grayscale dönüşüm, compression
- **Risk:** Minimal, lightweight
- **Entegrasyon:** PageCard/Preview rendering sonrası filter

**sharp** (~28K stars, primary: Node.js/WASM)
- **Teknoloji:** libvips binding, çok hızlı
- **Özellikler:** Resim işleme, format conversion, resize
- **Localpdf Use Case:** Img-to-PDF flow'da image preprocessing
- **Risk:** Node.js-first, browser'da canvas polyfill gerekli
- **Değerlendir:** Project'de çoktan img2pdf worker var, sharp'ın gerekliliği tartışılmaz

---

## C. Tarayıcı-Uyumlu Olmayan (Referans Olarak)

Bu projeler localpdf'e uygun değil (backend/CLI gerekli), ama mimari karşılaştırma için
faydalı:

- **PyPDF** (py-pdf, ~10K stars) — Python, server-side PDF manipulation
- **Ghostscript** (~250 stars mirror) — C, command-line PDF processor
- **Poppler** (GitLab, C++) — High-level PDF render engine
- **WeasyPrint** (~9.4K stars) — Python, HTML to PDF converter
- **Stirling-PDF** (~88K stars) — Java, full-featured desktop/server PDF app
- **Sejda** (~550 stars) — Java library, PDF manipulation

**Neden uyumlu değil:**
- Localpdf 100% tarayıcı-tabanlı (server yok)
- Backend dependency yok (gizlilik+offline)
- WASM/JavaScript ecosystem sınırlı

---

## D. Yeni Araçlar: Mimari Uyumluluk & Sıralama

### **Tier 1: Hemen Eklenebilir (pdf-lib/mupdf-wasm Native Compat)**

#### ✅ **Crop PDF** — CropBox/MediaBox Manipulation
- **Komplekslik:** ⭐ (Minimal)
- **Kod Etkilenme:** `ToolShell.tsx` pattern (options phase + processing)
- **Teknik:** pdf-lib `.cropPage()` API
- **Zaman:** ~4-6 saat (spec + implement + test)
- **ROI:** ⭐⭐⭐⭐ (Pratik, yaygın use case)
- **Mimari Değişiklik:** Hiç

#### ✅ **Reverse Pages** — Sayfa Sırasını Tersine Çevir
- **Komplekslik:** ⭐ (Temel)
- **Kod:** OrganizeShell pattern reuse (page array manipulation)
- **Teknik:** Array reversal + re-export
- **Zaman:** ~2-3 saat
- **ROI:** ⭐⭐⭐ (Sık yanlışlık, 1-click çözüm)
- **Mimari Değişiklik:** Hiç

#### ✅ **Grayscale / Monochrome** — Renk Dönüşümü
- **Komplekslik:** ⭐⭐ (Canvas Rendering Layer)
- **Kod:** mupdf render → canvas filter → PNG export
- **Teknik:** Canvas `globalCompositeOperation`, CSS `filter: grayscale()`
- **Zaman:** ~6-8 saat
- **ROI:** ⭐⭐⭐ (Mürekkep tasarrufu, kurumsal use case)
- **Mimari Değişiklik:** Hiç (render pipeline lokal şekilde kalır)

#### ✅ **N-up Imposition** — Çoklu Sayfa Baskı Düzeni
- **Komplekslik:** ⭐⭐ (Grid Layout + embedPage)
- **Kod:** ToolShell + mupdf preview → pdf-lib embedPage
- **Teknik:** Page scaling + positioning, pdf-lib `embedPage()`
- **Zaman:** ~8-10 saat
- **ROI:** ⭐⭐⭐ (Özel ama güçlü kullanıcılar için)
- **Mimari Değişiklik:** Hiç

#### ✅ **Header & Footer** — Başlık/Bilgilendirme Satırı
- **Komplekslik:** ⭐⭐ (Text/Image Injection)
- **Kod:** Add Page Numbers pattern genişletmesi
- **Teknik:** pdf-lib `drawText()` + options (font, position, margin)
- **Zaman:** ~6-8 saat
- **ROI:** ⭐⭐ (Niche, kurumsal belgeleme)
- **Mimari Değişiklik:** Hiç

---

### **Tier 2: Orta Komplekslik (Dış Kütüphane Entegrasyonu)**

#### 🟡 **PDF Compare / Diff** — İki PDF Görsel Karşılaştırması
- **Komplekslik:** ⭐⭐⭐ (Canvas Overlay Logic)
- **Kod:** MergeShell pattern + dual rendering
- **Teknik:** 
  - Sayfa 1 mupdf render → canvas 1 (50% red/green tint)
  - Sayfa 2 mupdf render → canvas 2 (50% green/red tint)
  - Canvas overlay (blend mode: screen/multiply)
  - Fark alan renklenir
- **Zaman:** ~12-16 saat
- **ROI:** ⭐⭐⭐ (Contract review, version control)
- **Mimari Değişiklik:** Yeni message type (compare-start/compare-done)

#### 🟡 **Redact PDF / Sansürleme** — Hassas İçeriği Kalıcı Gizleme
- **Komplekslik:** ⭐⭐ (SignShell Pattern Reuse)
- **Kod:** SignShell sürükle-bırak + flatten logic
- **Teknik:**
  - Sürükle-bırak siyah dikdörtgen (box coordinates)
  - Üzerine beyaz metin opsiyonel (T.C. kimlik numarası vb.)
  - Flatten (mupdf render → canvas → PNG siyah döner)
  - PDF export (pdf-lib + siyah raster overlay)
- **Zaman:** ~10-12 saat
- **ROI:** ⭐⭐⭐⭐ (Yasal gereksinim, gizlilik-hassas)
- **Mimari Değişiklik:** Hiç (render -> flatten -> export, mevcut pattern)

#### 🟡 **OCR Integration (tesseract.js)** — Taranmış PDF'ler Seçilebilir Hale
- **Komplekslik:** ⭐⭐⭐ (New Worker Message + Large WASM)
- **Kod:** JobController.ocrPage() → Worker message OCR-start/OCR-done
- **Teknik:**
  - tesseract.js WASM load (cold start ~3-5s, ilk kez)
  - Sayfa image → worker → text layer
  - PDF + text layer export (pdf-lib + PDF/A-2b)
- **Zaman:** ~16-20 saat (WASM debugging + tunning dahil)
- **ROI:** ⭐⭐⭐⭐ (Major feature, Scan→Search flow)
- **Mimari Değişiklik:** JobController protocol genişletme (yeni message type)
- **Uyarı:** WASM bundle boyut +10-15 MB (budget kontrol)

---

### **Tier 3: Yüksek Komplekslik (Mimari Değişiklikler Gerekli)**

#### 🔴 **Booklet Imposition** — Kitapçık Sayfa Sıralaması
- **Komplekslik:** ⭐⭐⭐⭐ (State Machine, Page Algebra)
- **Teknik:**
  - N sayfalı belgeyi 4'e katlanabilir formata sıralamak
  - Çift taraflı yazıcı için otomatik back-side sayfa pairing
  - Örn: 8 sayfa → [4,1], [2,7], [6,3], [5,8] sırası
- **Zaman:** ~20-24 saat
- **ROI:** ⭐⭐ (Niche, baskı-oriented, DIY kitapçık yapanlar)
- **Mimari Değişiklik:** Sayfa reordering orchestration

---

## E. Teknik Karar Matrisi

| Araç | Browser Compat | WASM Needs | Protocol Change | Pain Level | Time | Recommendation |
|------|---------|-----|-------|---|---|---|
| Crop PDF | ✅ | ❌ | ❌ | Green | 4-6h | 🟢 **P0: Hemen** |
| Reverse Pages | ✅ | ❌ | ❌ | Green | 2-3h | 🟢 **P1: Sonrası** |
| Grayscale | ✅ | ❌ | ❌ | Green | 6-8h | 🟡 **P2: Q3** |
| Redact PDF | ✅ | ❌ | ❌ | Green | 10-12h | 🟡 **P1: Yüksek priorite** |
| N-up | ✅ | ❌ | ❌ | Green | 8-10h | 🟡 **P2: Q3** |
| Header/Footer | ✅ | ❌ | ❌ | Green | 6-8h | 🟡 **P2: Q3** |
| PDF Compare | ✅ | ❌ | 🟨 | Yellow | 12-16h | 🔵 **P3: Q4** |
| OCR (tesseract.js) | ✅ | 🟨 (+10MB) | 🟨 | Yellow | 16-20h | 🔵 **P3: Q4** |
| Booklet | ✅ | ❌ | 🔴 | Red | 20-24h | 🔴 **P4: Sonrası** |

---

## F. Önerilen Yol Haritası

### **Immediate (This Week)**
1. ✅ Bug Fix: File upload regression (Organize/ImgToPdf dnd-kit) — **DONE**
2. ⏳ **Crop PDF** — P0, hızlı, high-value

### **Short Term (Next 2 Weeks)**
3. **Redact PDF** — Yasal/privacy use case, SignShell pattern
4. **Reverse Pages** — Quick win, util feature

### **Medium Term (Q3)**
5. **Grayscale/Monochrome** — Utilities consolidation
6. **N-up Imposition** — Baskı-oriented users
7. **Header/Footer** — Kurumsal belgelendirme

### **Long Term (Q4+)**
8. **PDF Compare** — Advanced collaboration feature
9. **OCR Integration (tesseract.js)** — Major feature, scan→search
10. **Booklet Imposition** — Specialized, defer unless user demand

---

## G. Kaynaklar & Linkler

- **tesseract.js:** https://github.com/naptha/tesseract.js
- **image-js:** https://github.com/image-js/image-js
- **PDF.js:** https://github.com/mozilla/pdf.js
- **pdfmake:** https://github.com/bpampuch/pdfmake
- **jsPDF:** https://github.com/parallax/jsPDF
- **Proje Reposu:** https://github.com/Stirling-Tools/Stirling-PDF (mimari referans)

---

**Rapor Tarihi:** 2026-07-27
**Araştıran:** Claude (Sonnet 5)
**Araştırma Metodu:** GitHub API + NPM Registry + Browser Compatibility Analysis
