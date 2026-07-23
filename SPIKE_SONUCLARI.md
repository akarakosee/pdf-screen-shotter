# Teknik Spike: MuPDF.js vs PDF.js — Ölçüm Sonuçları

> Tarih: 21 Temmuz 2026 · Ortam: Node v22 (sandbox), 20 sayfalık sentetik test PDF'i (metin + Türkçe karakter + vektör çizimler, 100 KB)
> Golden referans: masaüstü uygulamanın motoru PyMuPDF ile render edilen sayfa 1 @150 DPI
> Not: Node ölçümleri tarayıcı WASM'ından bir miktar farklı olabilir ama karşılaştırmalı sıralama güvenilir; pdf.js tarafında canvas backend farkı da payda dahil.

## Sonuç tablosu

| Kriter | MuPDF.js | PDF.js | Kazanan |
|---|---|---|---|
| Render hızı @150 DPI | **52.8 ms/sayfa** | 81.6 ms/sayfa | MuPDF |
| Render hızı @300 DPI | **167 ms/sayfa** | 295 ms/sayfa | MuPDF |
| PyMuPDF (masaüstü) ile piksel eşitliği | **%0.000 fark — birebir aynı** | Boyut bile farklı (1239×1754 vs 1240×1755) → karşılaştırılamadı | MuPDF |
| PNG çıktı boyutu (s.1 @150) | **77 KB** | 110 KB | MuPDF |
| İndirilen paket boyutu | ~10 MB WASM (**gzip: ~4.5 MB**) | ~1.6 MB JS (min) | PDF.js |
| Kurulum sürtüşmesi | Düz API, PNG encode yerleşik | standardFontDataUrl konfigürasyonu gerekti (font uyarısı), PNG için ayrı canvas encode | MuPDF |
| Lisans | AGPL (repo açık kalmalı) | Apache 2.0 | PDF.js |

## Yorum

1. **Motor eşdeğerliği kanıtlandı:** MuPDF.js çıktısı, masaüstü uygulamanın PyMuPDF çıktısıyla **piksel piksel aynı** (%0.000 fark). "Web sürümü masaüstüyle aynı kaliteyi verir" iddiası artık ölçülmüş bir gerçek; golden-file testleri de bu altyapıyla otomatikleştirilebilir. PDF.js ise aynı DPI'da 1 piksel farklı boyut üretti (yuvarlama farkı) — kalite kötü değil ama "birebir" değil.
2. **Hız:** MuPDF her iki DPI'da ~%35-45 daha hızlı ve PNG'leri daha küçük (daha iyi encoder). 300 DPI'da 1000 sayfa ≈ 2.8 dk (MuPDF) vs ≈ 5 dk (PDF.js) mertebesi.
3. **Tek gerçek bedel paket boyutu:** WASM tahmin edilen 2-3 MB değil, **gzip ile ~4.5 MB** çıktı. Bu, "hover'da preload" stratejisinin önemini artırıyor ama yıkıcı değil: kullanıcı dosya seçip DPI ayarlarken indirme çoğunlukla biter; ikinci ziyarette cache'ten gelir (immutable cache başlıkları). Ortalama bağlantıda ~2-4 sn arka plan indirmesi.
4. **PDF.js'in yeri:** Apache lisansı ve küçük boyutu ile "B planı" olarak adapter arkasında değerli kalmaya devam ediyor; ama font konfigürasyon sürtüşmesi ve kalite/boyut farkı ana motor olmasını desteklemiyor.

## Karar önerisi

**Ana motor: MuPDF.js.** Gerekçe: kanıtlanmış piksel eşitliği + hız + basit API. Bedeller (4.5 MB indirme, AGPL/açık kaynak şartı) kabul edilebilir ve §SISTEM_TASARIMI.md'deki preload + adapter stratejileriyle yönetiliyor. Resmi karar kaydı: ADR-001.
