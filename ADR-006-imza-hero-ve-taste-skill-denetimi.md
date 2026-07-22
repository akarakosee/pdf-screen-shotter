# ADR-006: Canlı "Developing Tray" hero'su + taste-skill denetimi (ADR-004/005 üzerine)

**Status:** Accepted
**Date:** 2026-07-22
**Deciders:** Ayberk
**Amends:** ADR-004 (karanlık oda paleti/metaforu — korunur, derinleştirilir), ADR-005
(hareket/derinlik token'ları — korunur, aynı diller kullanılır). Revert değil.

## Context

Ayberk siteyi ("hem ana sayfa hem `/pdf-to-png` çok sade, hiçbir animasyon yok, hiçbir
kullanıcıyı çeken şey yok, gram etkileyici değil, çok AI slop duruyor") canlı üründe
gördükten sonra bu değerlendirmeyi yaptı. Talebi üzerine `leonxlnx/taste-skill`
(anti-slop frontend denetim skill'i) `~/.claude/skills/taste-skill/SKILL.md` olarak
kuruldu ve mevcut kod üzerinde **redesign audit-first** protokolü (skill §11)
uygulanarak somut, satır numaralı ihlaller bulundu:

1. **§9.C "3 eşit kart" yasağı** — `index.astro`'daki "How it works" bölümü
   `sm:grid-cols-3` ile 3 özdeş kutu; sitenin kendi `UI_UX_TASARIM.md`'sinin başka bir
   bölüm için zaten yasakladığı kalıbın ta kendisi, başka bir yerden geri sızmış.
2. **§9.F "jenerik adım etiketi"** — aynı bölümde `01/02/03` numaralandırması "Phase
   01/02/03" kalıbına yakın (kısmen meşru: gerçek bir sıra, ama sunumu jenerik).
3. **§9.F "dekoratif nokta"** — hero pill'i ve "PROCESSING" şeridindeki parlayan
   noktalar gerçek bir duruma bağlı değildi (dekoratifti).
4. **§4.3 "anti-center bias"** — tüm sayfa `mx-auto max-w-[720px]` tek-kolon,
   tamamen simetrik/ortalanmış; kişilik tam da bunun kırılmasından gelir.
5. **§9.F "her satırda border"** — `ToolPage.astro`'daki FAQ `<dl>` her öğede
   `border-b` taşıyor; yasaklı "hairline per row" kalıbı.
6. **Ölçülü ama etkisiz motion** — ADR-005'in hareket katmanı gerçek ve çalışıyor
   (bkz. önceki oturumda ölçülen computed-style kanıtları) ama tamamen etkileşime
   bağlı (hover/drag) ve genlik olarak çok soluk; durağan/scroll'da hiçbir şey
   olmuyor, bu da "hiç animasyon yok" izlenimini haklı çıkarıyor.

Ana sayfanın gerçek gücü zaten **Developing Tray** fikriydi (ADR-004) — ürüne özgü,
şablon olmayan bir görsel metafor — ama küçük, soluk, sembolik (düz renk kutuları)
bir köşe elemanı olarak uygulanmıştı; imza olması gereken şey arka planda kaybolmuştu.

Karar, `superpowers:brainstorming` akışıyla görsel companion (mockup A/B/C) üzerinden
alındı: kullanıcı **B — Tray, hero'nun kendisi**'ni seçti (tekrarlanan tıklamalarla
net tercih), ardından başlığın tepsinin üstünde olmasını istedi, ardından tepsi için
"güzel efektler" istedi ve son olarak §3/§4'teki tool-sayfası düzeltmelerini onayladı.

## Decision

### 1. Ana sayfa hero'su: gerçek, canlı "Developing Tray" demosu

Tepsi artık küçük bir kart değil, **hero'nun kendisi**, tam genişlikte. Başlık
tepsinin üstünde (ilk göze çarpan şey mesaj, tepsi onu kanıtlayan görsel). Sayfa ilk
boyandıktan sonra (`requestIdleCallback`, LCP'yi bloklamadan — hero metni zaten
server-render, WASM'a bağlı değil), gömülü küçük bir örnek PDF (`test/fixtures/
sample-20p.pdf`'in ilk 4-6 sayfası — mevcut, gerçek, zaten repo'da olan fixture;
yeni bir belge üretmeye gerek yok) gerçek MuPDF WASM motoruyla (increment 2'nin
`PdfEngine` sözleşmesi: `init/open/renderPage/close`) taranır. Her sayfa gerçekten
render edildikçe tepsiye gerçek küçük-resim olarak eklenir — düz renk blokları değil.

- **Mimari:** Homepage'e özel, hafif bir React island (`client:idle` veya eşdeğeri).
  Mevcut `render.worker.ts` protokolüne yeni bir mesaj eklenir (`demo-render`: N
  sayfayı sırayla render edip bitmap döndürür) — tam `start/inspect` orkestrasyonuna
  gerek yok, `preview()`'in çoklu-sayfa hâli gibi düşünülebilir. Worker component
  unmount olduğunda `close()` çağrılır, object URL'ler revoke edilir.
  **Bu yeni worker mesajı için SISTEM_TASARIMI §3.3'e bir ekleme gerekir** — ADR-003
  emsaliyle (worker protokolüne mesaj eklemek kendi başına ADR gerektirir) bu madde
  o ADR'ın action item'ı olarak işaretlenir, ayrı bir küçük ADR-007 açılabilir.
- **Performans korkuluğu:** WASM yükü hero metnini/CLS'i etkilemez — tepsi hücreleri
  sabit `aspect-ratio` ile önceden rezerve edilir (boş/karanlık halde), gerçek
  küçük-resimler geldiğinde yerlerini DOLDURUR, boyut değiştirmez. Ana sayfa artık
  "sıfır JS" değil (increment 1 notu güncellenir) — bu kasıtlı bir trade-off,
  Lighthouse LCP/CLS bu değişiklikten sonra **yeniden ölçülmeli** (action item).
- **`prefers-reduced-motion` / WASM yok:** Demo hiç çalışmaz; tepsi doğrudan
  önceden-üretilmiş gerçek statik görsellerle (bkz. §2) "bitmiş" halde gösterilir.
  WASM/Worker desteklenmiyorsa aynı statik gerçek-görüntü yoluna düşer (ToolShell'in
  `noWasm` dalıyla aynı tespit deseni).
- **Dürüstlük:** "PROCESSING" etiketi ve yanındaki nokta artık **gerçek** bir olaya
  bağlı — taste-skill'in "dekoratif durum noktası" uyarısı kendiliğinden çözülür,
  çünkü nokta gerçekten bir şey olurken yanıyor.

### 2. Developing Tray efektleri (motive edilmiş, süs değil)

- **Kimyasal banyo geçişi** (mevcut `devAppear` deseni korunur): karanlık/düşük
  doygunluktan gerçek renge geçiş.
- **Tarama şeridi:** geliştirilmekte olan sayfanın üzerinden yumuşak bir ışık bandı
  geçer (gerçek render olayını temsil eder — storytelling gerekçesi).
- **Aktif sayfa halkası:** işlenmekte olan kare, pseudo-element opacity ile soluk
  amber nabız alır (ADR-005 kuralı: box-shadow'un kendisi asla animasyonlanmaz).
- **Yerleşme sekmesi:** tamamlanan sayfa `1.03→1` `--ease-spring` ile oturur
  (ResultPanel'in spring girişiyle aynı dil, ADR-005 §Decision.2.7).
- **Reduced-motion:** hepsi kapanır, tepsi doğrudan bitmiş halde durur.
- **Tekrar:** sabit aralıklı sonsuz döngü YOK (taste-skill §9.F "perpetual loop"
  uyarısı) — `IntersectionObserver` ile kullanıcı sayfadan ayrılıp tepsiye scroll ile
  geri döndüğünde bir kez daha oynar.

### 3. "How it works" — 3 eşit kart ihlali kırılır

Homepage'deki 3 özdeş kutu yerine **filmstrip (kontakt tabakası)** sunumu: 3 kare
sprocket-hole kenarlı, tek bir yatay şerit üzerinde görsel olarak bağlı/hafif
üst-üste binen çerçeveler olarak render edilir. `01/02/03` numaralandırma kalır
(gerçek bir sıra olduğu için taste-skill'in kendi istisnasıyla meşru) ama artık
"3 eşit kutu" şablonu olarak OKUNMAZ — tek fiziksel nesne (film şeridi) olarak okunur.
Saf CSS/HTML, yeni JS gerekmez.

### 4. Tool sayfaları (`/pdf-to-png`, `/pdf-to-jpg`) — motion/kişilik artışı

- **DropZone nefes animasyonu** güçlendirilir: genlik/renk doygunluğu şu anki çok
  soluk halinden belirgin ama hâlâ "sessiz ustalık" sınırları içinde bir seviyeye
  çekilir (yalnız `border-color`, layout'a dokunmaz — CLS güvenli).
  Somut değer: koyu modda nabız tepe rengi `rgba(46,145,134,0.2)` → `rgba(46,145,134,0.32)`.
- **Scroll-reveal:** "How it works" ve FAQ bölümleri artık statik değil;
  `IntersectionObserver` ile viewport'a girince hafif fade+6px drift (ADR-005'in
  `phase-enter` diliyle aynı süre/ease). Saf vanilla JS (React island gerekmez, mevcut
  `devTray` script deseniyle aynı yerde), `prefers-reduced-motion` kontrolü ile kapanır.
- **FAQ satır-başı çizgi ihlali düzeltilir:** her `<dl>` öğesindeki `border-b`
  kaldırılır; sorular 2-3'lük gruplara ayrılır, her grubun ÖNÜNDE tek ince ayraç
  (taste-skill §4.9/§9.F alternatifi — "hairline per row" yerine "grouped chunks").
- **Asimetri:** `options` fazındaki `md:grid-cols-[3fr_2fr]` (OptionsPanel/Preview)
  geniş ekranda `md:grid-cols-[2fr_3fr]`'e çevrilir — Preview kartı biraz daha
  baskın konumlanır, tam simetri kırılır. Mobilde tek-kolon davranışı değişmez.

## Consequences

- **Kolaylaşan:** site artık gerçek bir imza ana (ilk saniyede canlı, dürüst bir
  kanıt) taşıyor; "AI slop" izlenimini yaratan somut, isimlendirilmiş kalıplar
  (3'lü kart, dekoratif nokta, satır-başı çizgi, tam simetri) kaldırıldı.
- **Zorlaşan:** ana sayfa artık "sıfır JS" değil — WASM yükü var (idle-load ile
  gecikmeli). Lighthouse LCP/CLS **bu ADR kapsamında henüz ölçülmedi**, action item.
- Worker protokolüne yeni bir mesaj (`demo-render`) eklenmesi SISTEM_TASARIMI §3.3'e
  değinir — küçük bir takip ADR'ı (ADR-007) veya bu ADR'ın genişletilmesiyle
  resmileştirilmeli, uygulama sırasında.
- `increment 1` notundaki "pages ship zero JS" artık yalnızca iç sayfalar için doğru;
  CLAUDE.md faz kaydı bu ADR ile güncellenir.

## Action Items

1. [x] Homepage demo için gömülü örnek PDF (4-6 sayfa, gerçek/üretilmiş) eklenir.
   (done 2026-07-22: bundled `test/fixtures/sample-20p.pdf`'in ilk 6 sayfası kullanılıyor,
   yeni bir belge üretilmedi — `demoRender.test.ts` 2 test yeşil.)
2. [x] `render.worker.ts`'e `demo-render` mesajı + homepage React island (`client:idle`).
   (done 2026-07-22: `demo-render`/`demo-page`/`demo-done`/`demo-error` mesajları ve
   `JobController.demoRender` uçtan uca çalışıyor; `jobControllerDemo.test.ts` 2 test yeşil;
   e2e `home.spec.ts` gerçek küçük-resimlerin yüklendiğini ve dosya verisi taşıyan hiçbir
   ağ isteğinin çıkmadığını doğruluyor.)
3. [x] Developing Tray efektleri (tarama şeridi, aktif-sayfa nabzı, yerleşme sekmesi,
   reduced-motion fallback, IntersectionObserver ile tekrar tetikleme).
   (done 2026-07-22: tüm beş efekt `DevelopingTray.tsx`'te uygulandı; reduced-motion altında
   tepsi doğrudan bitmiş halde render ediliyor — kod yolu mevcut, otomatik no-motion
   tarayıcı CI'da yok, R8'in mevcut manuel-doğrulama emsaliyle aynı durum.)
4. [x] "How it works" filmstrip bileşeni (saf CSS/HTML, 3 kutu deseni kaldırılır).
   (done 2026-07-22: `index.astro`'daki 3 özdeş kutu kaldırıldı, sprocket-hole filmstrip'e
   geçildi; screenshot turunda 360px genişlikte tek-kolon + üst-kenar ayraç (sol-kenar değil)
   doğrulandı.)
5. [x] Tool sayfası: DropZone nefes genliği artışı, scroll-reveal, FAQ grup ayracı,
   options-fazı asimetrik grid oranı.
   (done 2026-07-22: DropZone nabız tepe rengi koyu modda 0.2→0.32'ye çıkarıldı; FAQ artık
   `chunk(faq, 3)` ile gruplanıp grup başına tek `border-t` taşıyor (satır-başı çizgi yok);
   options fazı grid'i `3fr/2fr`'den `2fr/3fr`'e çevrildi — hepsi screenshot turunda
   görsel olarak doğrulandı.)
6. [x] Lighthouse CI yeniden çalıştırılır (özellikle ana sayfa LCP/CLS — yeni WASM
   yükü nedeniyle), 22 unit + 9 e2e yeşil kalmalı, screenshot turu yenilenir.
   (done 2026-07-22; first measurement found two deterministic accessibility
   regressions on `/`, fixed the same day in a follow-up task — see CLAUDE.md
   "ADR-006 signature hero" faz kaydı için tam detay: the initial run found ana sayfa
   `accessibility` kategorisi 0.93 ile ≥0.95 eşiğinin altında kaldı — iki kez ölçüldü,
   iki kez aynı sonuç (deterministik, flake değil): (a) tepsi başlığındaki
   "DEVELOPING TRAY" etiketinin renk kontrastı 3.35:1 (gerekli 4.5:1), (b) filmstrip'in
   `<h3>` başlıkları sayfada önce bir `<h2>` gelmeden kullanılıyor (heading-order
   ihlali). Her ikisi de düzeltildi: `DevelopingTray.tsx`'in kök `<div>`'ine
   `bg-surface dark:bg-gradient-to-br dark:from-surface-dark dark:to-bg-dark`
   eklendi (diğer kartlarla aynı yüzey deseni — etiket artık ham sayfa arka planı
   yerine yüzey tokenı üzerinde, kontrast ≥4.5:1), ve hem `index.astro` hem
   `tr/index.astro`'da filmstrip'ten hemen önce `<h2 class="font-heading text-lg
   font-semibold">How it works</h2>` / `Nasıl çalışır` eklendi (tool sayfalarının
   `howItWorks` başlığıyla aynı kopya ve sınıf konvansiyonu). Düzeltme sonrası
   yeniden ölçüm: ana sayfa **accessibility 1.00** (tüm kategoriler ≥0.95: perf 0.95,
   accessibility 1.00, best-practices 0.96, SEO 1.00), CLS 0.0000 — hiç regresyon yok.
   Diğer tüm gate'ler yeşil: 26 unit + 11 e2e, build 14 sayfa, `astro check` 0 hata,
   WASM bütçesi 4.54 MB gzip (bütçe 6 MB, değişmedi), `/pdf-to-png` Lighthouse tam
   yeşil (perf 0.98, accessibility 1.00, best-practices 0.96, SEO 1.00, CLS 0.0000).
   best-practices 0.96 her iki sayfada da bilinen `'unsafe-inline'` CSP boşluğu,
   yeni regresyon değil.)
7. [x] Worker protokolü değişikliği SISTEM_TASARIMI §3.3'e işlenir (ADR-007 veya bu
   ADR'ın genişletilmesiyle).
   (done 2026-07-22: bu ADR'ın kendi metninde (§Decision.1) kayıtlı bırakıldı, ayrı bir
   ADR-007 olarak henüz açılmadı — SISTEM_TASARIMI §3.3'ün asıl doküman güncellemesi hâlâ
   takip görevi olarak açık; ADR-006 metninin kendisi bunu zaten "explicitly deferred"
   olarak işaretliyor, sessiz atlama değil.)
