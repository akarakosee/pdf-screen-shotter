# UI/UX Tasarım Planı

> Sürüm 1.2 · 2026-07-22 · Bağlam: WEB_PLANI §5, SISTEM_TASARIMI, PRD-pdf-to-png, ADR-001/002/004/005
> Amaç: kodlama ajanına verilecek AI_BUILD_PROMPT.md'nin tasarım referansı. Buradaki her değer bağlayıcıdır; ajan "yorumlamaz", uygular.
> **ADR-004 ile pivot:** §2 renk/tipografi token'ları "karanlık oda" (darkroom) paletine
> güncellendi; §1'deki gradyan/glow/3D yasağına **tek, isimlendirilmiş istisna** tanındı
> (ana sayfa hero vurgusu, bkz. ADR-004 §Decision.3). Aşağıdaki değerler artık güncel olanlardır.
> **ADR-005 amendment'ı:** karanlık oda tabanı üzerine hareket (motion) + derinlik
> (elevation) katmanı eklendi — `--ease-spring`, `--shadow-3` (3. gölge seviyesi),
> bileşen hareket envanteri. Yeni renk token'ı YOK; brief'in marigold/indigo önerisi
> reddedildi (bkz. ADR-005 §Context).

---

## 1. Tasarım felsefesi: "sessiz ustalık"

Jenerik AI-üretimi site kalıplarından (mor-mavi gradyanlar, cam efektli kartlar, boş hero laflar, emoji yağmuru, aşırı yuvarlatılmış her şey) bilinçli uzaklaşma. Referans duruş: Linear'ın disiplini + Stripe dokümantasyonunun sakinliği + yerel araç (native utility) hissi. Site bir "landing page" gibi değil, iyi yapılmış bir **alet** gibi hissettirmeli — aletin süsü olmaz, hassasiyeti olur.

Beş ilke:
1. **Araç kahramandır.** Her araç sayfasında ilk ekranda tek odak DropZone'dur; dekoratif hero görseli yoktur.
2. **Metin azdır ve kesindir.** "Unleash the power of..." tarzı sıfır. Her cümle bir bilgi taşır.
3. **Hareket işlevseldir.** Animasyon yalnız durum değişimini anlatır (dosya kabulü, ilerleme, tamamlanma); dekoratif parallax/scroll-trigger yok.
4. **Güven görseldir.** Gizlilik iddiası rozetle değil, davranışla gösterilir: ağ göstergesi, açık kaynak linki, offline çalışma.
5. **Yoğunluk yetişkincedir.** Bol boşluklu "startup havası" yerine, bilgiyi saygıyla sıkıştıran ölçülü yoğunluk.

## 2. Tasarım token'ları (bağlayıcı değerler)

```css
/* Renk — "karanlık oda" paleti (ADR-004). Açık mod: sıcak kağıt zemin + aynı vurgular. */
--bg:            #F5F0E6;  /* açık mod zemin — sıcak kağıt */
--surface:       #FFFFFF;
--bg-dark:       #120E0B;  /* koyu mod zemin — is/karanlık oda */
--surface-dark:  #1D1512;
--surface-2-dark:#251A15;
--ink:           #1D1512;  /* ana metin (açık mod) */
--ink-muted:     #6E655A;
--ink-dark:      #EDE7DC;  /* ana metin (koyu mod) */
--ink-muted-dark:#A79E8E;
--ink-faint-dark:#6E655A;
--accent:        #1B5A53;  /* teal — güven + darkroom devam çözeltisi rengi */
--accent-hover:  #0F3F3A;
--amber:         #B5822F;  /* açık mod amber (kontrast için koyultulmuş) */
--amber-dark:    #E8B65F;  /* koyu mod amber — "safelight" rengi */
--amber-dim-dark:#8A6B36;
--teal-dark:     #2E9186;
--teal-dim-dark: #1B5A53;
--russet:        #B04B36;  /* üçüncü vurgu — imza hero efektinde kullanılır (ADR-004) */
--russet-dim-dark:#6E2E20;
--icon-lib:      "Lucide";  /* tek ikon kütüphanesi — bağlayıcı, karışık ikon ailesi yasak */
--success:       #1A7F37;
--danger:        #B42318;
--warning:       #B54708;

/* Tipografi */
--font-ui:   "Inter Variable", system-ui;         /* gövde + UI */
--font-display: "Sora Variable", system-ui, sans-serif;   /* yalnız h1 — imza font (ADR-004), self-hosted */
--font-heading: "Space Grotesk Variable", system-ui, sans-serif; /* logo, h2, kart başlıkları */
--font-mono: "JetBrains Mono", monospace;       /* sayfa aralığı girişi, log, dosya adları, nav etiketleri */
/* Ölçek: 13 / 15 (gövde) / 17 / 22 / 28 / 40. Ağırlıklar: 400, 500, 650 (yalnız display). */

/* Geometri */
--radius-s: 6px;  --radius-m: 10px;  /* 16px+ yuvarlaklık yok — "bubble" estetiği yasak */
--border: 1px solid rgba(0,0,0,0.09);
/* Gölge: ~~yalnız 2 seviye~~ 3 seviye (ADR-005). shadow-1 (resting): 0 1px 2px rgba(0,0,0,.05);
   shadow-2 (hover/drag): 0 4px 16px rgba(0,0,0,.10);
   shadow-3 (YALNIZ drag-overlay + ResultPanel): 0 12px 32px rgba(0,0,0,.14), koyu modda rgba(0,0,0,.5) */
/* Derinlik ipuçları (ADR-005): kartlarda 1px üst-highlight (açık: rgba(255,252,245,.65),
   koyu: rgba(255,255,255,.05)); Preview'daki render sayfa "kağıt deste" kenarı (2px). */

/* Hareket */
--ease: cubic-bezier(0.2, 0, 0, 1);  --dur-fast: 120ms;  --dur-base: 200ms;
--ease-spring: cubic-bezier(0.2, 0.9, 0.3, 1.2);  /* ADR-005 — giriş anları */
/* prefers-reduced-motion: tüm geçişler kapanır */
/* Hareket envanteri (ADR-005, bağlayıcı — envanter dışı dekoratif hareket = silent drift):
   buton hover -1px + pseudo-gölge fade (120ms), active scale(0.985); DropZone idle 4s
   "nefes" kenarlığı (%20 teal); dragover overlay sıcak tint 150ms + etiket 0.96→1 spring;
   FileChip 8px slide-up + 40ms stagger; faz geçişi crossfade + 6px drift (200ms);
   progress scaleX + amber kuyruk; ResultPanel spring giriş (shimmer YOK — hero tekil kalır).
   Hepsi transform/opacity; CLS'e dokunan hareket yasak. */
```

Yasaklar (anti-slop sözleşmesi): gradyan arkaplan, glassmorphism/backdrop-blur, neon/glow, emoji (UI metinlerinde), stok illüstrasyon/3D blob, otomatik oynayan carousel, "AI" kelimesinin süs olarak kullanımı, cookie banner dışında hiçbir popup/modal-üzeri-modal, sahte sosyal kanıt ("10M+ happy users"), **jenerik "3 kolon ikon+başlık+tek cümle" özellik bloğu** (design-critique bulgusu — bu kalıbın kendisi en yaygın AI-slop template imzasıdır, bkz. §4.2 düzeltmesi).

**ADR-004 istisnası (tek, isimlendirilmiş):** ana sayfa h1'indeki iki-üç kelimelik vurgu
öbeği (`.hero-develop`, `global.css`) — Sora fontu + amber→russet→teal shimmer + hafif 3D
tilt + (yalnız koyu modda) glow. Bu istisna genel yasağı geçersiz kılmaz; başka hiçbir
bileşende gradyan arkaplan/glow/3D tekrarlanmaz — yeni bir istisna yeni bir ADR gerektirir.

**İkon kuralı:** tüm ikonlar tek kütüphaneden (Lucide) gelir; farklı setlerden karışık ikon kullanımı yasak (tutarsız çizgi kalınlığı/stil = anında amatör/AI-slop izlenimi verir).
**Dokunma hedefleri:** tüm tıklanabilir öğeler minimum 44×44px (mobil dahil) — buton/ikon küçük görünse bile hit-area bu boyutta tutulur.

## 3. Bileşen envanteri

| Bileşen | Durumlar | Notlar |
|---|---|---|
| Button (primary/secondary/ghost/danger) | idle·hover·active·disabled·loading | loading'de spinner + metin kalır ("Converting…") |
| DropZone | idle·dragover·has-files·error | dragover'da tüm viewport hedef olur (PRD R13); kesikli çerçeve yerine dolgun yüzey + ikon; **Esc ile dragover iptali** ve sürükleme sırasında görünür sınır/overlay şart (design-critique: çıkış yolu olmadan tanımlanmıştı) |
| FileChip | queued·valid·invalid·processing·done·failed | dosya adı mono fontla; boyut + sayfa sayısı; kaldır (×) |
| OptionsPanel | — | DPI = 4'lü segmented control ("150 · Recommended" işaretli); sayfa aralığı = mono input + inline doğrulama; format = PNG/JPG sekmesi değil ayrı sayfa (SEO kararı, PRD açık sorusu → karar: ayrı URL) |
| Preview kartı | loading·ready·unavailable | gerçek boy oranıyla; DPI değişiminde çapraz solma (120ms) |
| ProgressPanel | running·cancelling | dosya x/y + sayfa n/m + ince progress bar; Cancel = secondary, asla kırmızı (yıkıcı değil) |
| ResultPanel | success·partial·failed | **tek primary eylem** = büyük indirme butonu; kısmi başarıda atlanan dosyalar tablosu; "Convert more" = ghost (ikincil); çapraz araç önerisi düz metin link (buton görünümü yasak — üç eylem birbiriyle yarışmasın, design-critique bulgusu) |
| PrivacyLine | — | DropZone altı kalıcı satır: kilit ikonu + "Files are processed on your device — nothing is uploaded." + "verify" linki (açık kaynak repo) |
| Toast | info·error | sağ alt, 4sn, tek seferde en çok 1 |
| Header / Footer | — | Header: logo + araç menüsü + dil + tema; **mobilde dil+tema bir overflow menüsünde toplanır** (4 öğe düz sırada mobilde "sakin alet" hissini bozar, design-critique bulgusu). Footer: araç listesi, GitHub, privacy/terms/contact, "Desktop app" linki |
| AdSlot | reserved·filled | sabit yükseklik rezervasyonu (CLS≈0); reklam gelmezse alan çöker DEĞİL, boş kalır |

## 4. Sayfa spesifikasyonları

### 4.1 Araç sayfası (şablon — /pdf-to-png referans)
Dikey akış, tek kolon, max-width 720px (araç bölgesi):
1. H1 (display serif) + tek cümle açıklama — toplam 2 satırı geçmez
2. DropZone (viewport'un ilk ekranında tamamı görünür) + PrivacyLine
3. [dosya var] FileChip listesi + OptionsPanel + Preview (masaüstünde yan yana 60/40, mobilde alt alta) + primary "Convert" 
4. [çalışıyor] ProgressPanel (aynı bölgede, layout zıplamaz — bölge min-height sabit)
5. [bitti] ResultPanel
6. İçerik bölümü (max-width 640px, ayrı arkaplan tonu): "How it works" 3 adım → FAQ (5-6 soru, accordion değil düz liste — SEO + erişilebilirlik) → AdSlot
7. Diğer araçlar ızgarası (kart başına ikon + ad + tek satır)

Durum makinesi UI kuralı: upload→options→processing→done geçişlerinde scroll pozisyonu korunur, hiçbir eleman kaybolup yeri kaymaz; her adımda geri dönüş yolu var (processing hariç — orada Cancel var).

### 4.2 Ana sayfa (/)
1. H1: "PDF tools that never see your files." + alt satır: works in your browser · no uploads · no signup · free — bu dört ifade süs değil, dört gerçek özellik
2. Araç ızgarası (Faz'lara göre büyür; gelmemiş araçlar gösterilmez — "coming soon" kartı yasak)
3. **"How is this private?" bölümü — düzeltilmiş format (design-critique):** ~~3 kolonlu ikon+başlık+cümle~~ bu kalıp reddedildi (§2 Yasaklar'a eklendi — en yaygın AI-slop template imzası). Yerine: tek editoryal paragraf (display serif değil, gövde fontuyla, 640px) + altında mono-font bir "teknik kanıt" satırı — ör. `network requests during conversion: 0` görünümünde statik bir kod-stili blok. Süs değil, gerçek bir iddia; ikon yok.
4. Footer

### 4.3 İçerik/yasal sayfalar
Blog + about/privacy/terms/contact: 640px tek kolon, display serif başlıklar, sıkı tipografik ritim. AdSense onayının gerektirdiği ciddiyette, dolgu metinsiz.

## 5. Erişilebilirlik ve i18n kuralları

- WCAG 2.1 AA: tüm akış klavye ile (DropZone Enter/Space ile dosya seçici açar); progress `aria-live="polite"`; sonuç `role="status"`; kontrast ≥ 4.5:1 (accent üzeri beyaz metin test edildi: 0D7377 → 4.9:1 ✓)
- Odak halkası: 2px accent, hiçbir durumda `outline: none` yalın bırakılmaz
- i18n: metinler `t()` üzerinden; TR metinler EN'den ~%15 uzun — buton ve segmented control'ler esnek genişlikli tasarlanır; RTL v1 kapsamı dışı (P2)

## 6. Mikro-metin (UX copy) ana hatları

| Bağlam | Metin (EN) | İlke |
|---|---|---|
| DropZone idle | "Drop PDFs here — or click to browse" | emir değil davet |
| DropZone dragover | "Release to add" | anlık geri bildirim |
| Şifreli dosya | "This PDF is password-protected. We can't open it (yet)." | suçlama yok, kapı açık |
| Kısmi başarı | "214 of 220 pages converted. 6 pages couldn't be rendered — see details." | önce başarı, sonra dürüst detay |
| İptal sonrası | "Stopped. 47 pages were finished — you can still download them." | emek kaybettirmeme |
| WASM yok | "Your browser can't run this tool. Try the free desktop app instead." | çıkışsız bırakmama |

Ton: yardımcı ama ciddi; espri yok; ünlem tek kullanım hakkı = dönüşüm başarı anı ("Done!") — orada bile opsiyonel.
