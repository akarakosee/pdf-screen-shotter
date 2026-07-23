# ADR-002: COOP/COEP başlıkları kullanılmayacak — tek thread'li WASM + AdSense uyumu

**Status:** Accepted
**Date:** 2026-07-21
**Deciders:** Ayberk
**Dayanak:** Sandbox spike ölçümü (aşağıda), Google GPT resmi dokümantasyonu, ADR-001, SISTEM_TASARIMI.md §3.5/§6

## Context

SISTEM_TASARIMI.md, ileride WASM thread'leri (SharedArrayBuffer) gerekebilir diye `COOP/COEP` başlıklarının baştan konmasını öngörmüş, AdSense iframe'leriyle olası sürtüşmeyi açık risk olarak işaretlemişti. İki taraf da artık ölçüldü/doğrulandı:

**Spike bulgusu 1 (ölçüldü):** `mupdf` npm paketinin dağıtımında (`mupdf-wasm.js`) sıfır `SharedArrayBuffer` ve sıfır pthread referansı var; `SharedArrayBuffer` global'i silinmiş ortamda render başarıyla çalıştı. Motor **tamamen tek thread'li** — SAB'a, dolayısıyla COOP/COEP'e ihtiyacı yok.

**Spike bulgusu 2 (Google resmi docs):** Google Publisher Tag "currently doesn't support pages using COEP" — reklam iframe'leri cross-origin gömme kısıtları nedeniyle COEP'li sayfalarda kırılıyor. `credentialless` modu ve iframe `credentialless` attribute'u kısmi çözümler ama GPT resmi olarak desteklemiyor; Google desteği "ileride" vaadi durumunda.

Yani önceki "erken tedbir" (COEP'i baştan koy) tam ters etki yapardı: hiç ihtiyacımız olmayan bir başlık, tek gelir kanalımızı kırardı.

## Decision

`COOP`/`COEP` başlıkları **konmayacak**. WASM tek thread'li modda, tek Web Worker içinde çalışacak (ADR-001'deki mimari zaten böyle). SISTEM_TASARIMI.md §3.5'teki "COOP/COEP baştan konur" maddesi bu ADR ile geçersizdir.

## Options Considered

### Option A: Başlık yok (tek thread WASM) — SEÇİLDİ
| Dimension | Assessment |
|-----------|------------|
| Complexity | En düşük — hiçbir ek konfigürasyon |
| AdSense uyumu | Tam (çatışma tanım gereği yok) |
| Performans | Yeterli — 52.8 ms/sayfa zaten tek thread ölçümü (ADR-001) |
| Gelecek kısıtı | WASM thread'leri kullanılamaz |

**Pros:** Gelir kanalı risksiz; sıfır konfigürasyon; spike hız ölçümleri zaten bu modda alındı, bilinen performans budur.
**Cons:** Çok çekirdekli paralel render kapısı kapalı kalır (SISTEM_TASARIMI §5'te zaten "tek worker, sıralı" seçilmişti — fiili kayıp yok).

### Option B: COEP: credentialless + iframe credentialless
**Pros:** SAB kapısı açık kalır; modern tarayıcılarda üçüncü parti iframe'ler kısmen çalışır.
**Cons:** GPT resmi desteklemiyor → reklam gelirlerinde tarayıcıya göre değişen, ayıklaması zor kırılmalar; Safari'de credentialless desteği eksik/gecikmeli; hiç ihtiyaç duyulmayan bir yetenek için gelir riski.

### Option C: COEP: require-corp (önceki plan)
**Cons:** AdSense kesin kırılır (Google resmi); reddedildi.

## Trade-off Analysis

Takas "gelecekteki paralel render olasılığı vs. bugünkü gelir kanalının kesinliği"dir. Paralellik ihtiyacı spekülatif (telemetri tetikleyicisine bağlanmıştı), AdSense ihtiyacı kesin. Ayrıca paralellik istenirse SAB'sız alternatif de var: **çoklu bağımsız Worker + her birinde ayrı WASM instance'ı** (dosya-başına paralellik; bellek maliyeti karşılığında SAB'sız ölçeklenir). Yani Option A gelecekteki kapıyı tamamen kapatmıyor, sadece en ucuz varyantını kapatıyor.

## Consequences

- Kolaylaşan: AdSense entegrasyonu risksizleşti; `_headers` dosyası sadeleşti (yalnız cache + CSP); mockup gizlilik/reklam yerleşimi varsayımları serbestçe kurgulanabilir.
- Zorlaşan: sayfa-içi paralel render (SAB tabanlı) yapılamaz; ileride istenirse Worker-havuzu deseni kullanılır.
- Yeniden ziyaret tetikleyicileri: (1) Google GPT resmi COEP desteği duyurursa, (2) mupdf npm paketi thread'li build'e geçerse, (3) reklam modeli AdSense'ten çıkarsa (ör. Carbon Ads).

## Action Items
1. [ ] SISTEM_TASARIMI.md §3.5 ve §6.1 bu ADR'a göre güncellendi (bu oturumda yapıldı)
2. [ ] Kodlama fazında `_headers` şablonu: cache-control + CSP, COOP/COEP yok
3. [ ] CSP yazılırken AdSense domain'leri (googlesyndication, doubleclick) allowlist'e — lansman öncesi gerçek AdSense tag'iyle staging testi
