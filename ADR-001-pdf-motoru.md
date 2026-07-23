# ADR-001: Tarayıcı içi PDF render motoru olarak MuPDF.js seçimi

**Status:** Accepted
**Date:** 2026-07-21
**Deciders:** Ayberk
**Dayanak:** SPIKE_SONUCLARI.md (ölçülmüş veri), SISTEM_TASARIMI.md §4.2, WEB_PLANI.md N1/N2 gereksinimleri

## Context

PDF araç seti web ürünü %100 client-side işleme yapacak (ADR öncesi verilmiş temel mimari karar: sunucusuz, $10/ay bütçe, "dosyalar cihazdan çıkmaz" ürün sözü). Tüm araçların paylaşacağı tek bir render/işleme motoru gerekiyor. Kısıtlar: masaüstü uygulama (PyMuPDF) ile çıktı tutarlılığı beklentisi, 1000+ sayfa bellek güvenliği, tek geliştirici sürdürülebilirliği, Lighthouse ≥95 performans hedefi.

## Decision

Ana motor **MuPDF.js (WASM)** olacak; `PdfEngine` adapter arayüzü arkasında, yalnız Web Worker içinde çalışacak. PDF.js resmi B planı olarak adapter sözleşmesinde tutulacak (implementasyonu yazılmayacak, gerektiğinde yazılacak).

## Options Considered

### Option A: MuPDF.js (WASM)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Low — düz API, PNG encode yerleşik, font sorunsuz |
| Cost | $0 (AGPL şartıyla: repo açık kaynak kalmalı) |
| Performans | 52.8 ms/sayfa @150 DPI, 167 ms @300 (ölçüldü) |
| Kalite | PyMuPDF ile **%0.000 piksel farkı** (ölçüldü) |
| Paket boyutu | ~10 MB WASM, gzip ~4.5 MB (ölçüldü) |
| Team familiarity | Yüksek — masaüstünde aynı motorun Python bağı kullanılıyor |

**Pros:** Masaüstüyle kanıtlanmış birebir çıktı; %35-45 daha hızlı; daha küçük PNG'ler; golden-file testleri doğrudan PyMuPDF referansıyla otomatize edilebilir; merge/split/rotate gibi Faz 2 araçlarının API'ları aynı kütüphanede hazır.
**Cons:** 4.5 MB (gzip) indirme — preload stratejisi şart; AGPL → kapalı kaynak seçeneği kapanır; npm paketi Artifex'e bağımlı.

### Option B: PDF.js (Mozilla)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium — standardFontDataUrl konfigürasyonu, PNG encode için ayrı canvas adımı |
| Cost | $0, Apache 2.0 (kısıtsız) |
| Performans | 81.6 ms/sayfa @150, 295 ms @300 (ölçüldü) |
| Kalite | İyi ama birebir değil (aynı DPI'da 1 px boyut sapması ölçüldü) |
| Paket boyutu | ~1.6 MB JS — 3× küçük |
| Team familiarity | Orta |

**Pros:** Küçük paket; en yaygın/battle-tested; lisans özgürlüğü.
**Cons:** Daha yavaş; masaüstü çıktıyla piksel eşitliği yok → "aynı kalite" iddiası ve golden-file test stratejisi zayıflar; merge/split için ek kütüphane (pdf-lib) gerekir → iki bağımlılık.

### Option C: Hibrit (önizleme PDF.js, dönüşüm MuPDF.js)
Reddedildi: iki motoru birden taşıma/teste etme yükü tek geliştirici kısıtıyla çelişir; önizleme-çıktı tutarsızlığı riski doğurur; kazanç yalnız ilk yüklemede birkaç MB.

## Trade-off Analysis

Karar esasen **4.5 MB indirme vs. kanıtlanmış kalite+hız+tek bağımlılık** takasıdır. İndirme bedeli, kullanım akışının doğası gereği yumuşuyor: kullanıcı dosya seçip seçenek ayarlarken WASM arka planda iner (hover/dragenter preload) ve immutable cache ile tek seferliktir; dönüşüm CPU süresindeki kazanç ise her kullanımda tekrarlanır (1000 sayfa @300 DPI'da ~2 dk fark). AGPL şartı, ürünün zaten açık kaynak + gizlilik şeffaflığı stratejisiyle örtüştüğü için pratikte bedel değil. Lighthouse hedefi etkilenmez çünkü WASM ilk boyamaya girmiyor.

## Consequences

- Kolaylaşan: masaüstü↔web çıktı eşitliği garantisi ve golden-file CI testleri; Faz 2 araçlarının tek kütüphaneyle gelmesi; worker içi basit API.
- Zorlaşan: repo lisans disiplini (AGPL uyumlu LICENSE eklenmeli); paket boyutu bütçesinin izlenmesi (mupdf sürüm yükseltmelerinde WASM boyutu diff'lenmeli); Artifex paketleme değişikliklerine bağımlılık.
- Yeniden ziyaret tetikleyicileri: (1) WASM boyutu >8 MB gzip'e çıkarsa, (2) Artifex lisans/paket politikası değişirse, (3) telemetri "ilk dönüşüm öncesi bekleme" şikayeti gösterirse → PdfJsEngine implementasyonu devreye alınır (adapter sayesinde tek modül).

## Action Items
1. [ ] Repo'ya AGPL-3.0 LICENSE dosyası ekle (kodlama fazı başlangıcında)
2. [ ] CI'a "WASM boyut bütçesi" kontrolü ekle (gzip >6 MB'da uyarı)
3. [ ] Preload stratejisini (hover/dragenter) Faz 1 görev listesine kesinleştirilmiş olarak işle
4. [ ] Golden-file test fikstürlerini spike'taki test.pdf + PyMuPDF referans PNG'leriyle başlat
5. [ ] AdSense × COOP/COEP uyum spike'ı (SISTEM_TASARIMI §6.1) — ayrı mini deneme, lansman öncesi
