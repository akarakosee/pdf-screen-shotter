# ADR-005: Hareket (motion) ve derinlik (elevation) sistemi — ADR-004 üzerine amendment

**Status:** Accepted
**Date:** 2026-07-22
**Deciders:** Ayberk
**Amends:** ADR-004 (karanlık oda pivotu) — revert DEĞİL, üzerine ekleme.

## Context

2026-07-22'de "v2: quiet mastery, with depth" başlıklı ikinci bir tasarım brief'i
yazıldı. Bu brief, dokümanların **eski (karanlık-oda-öncesi) bir anlık görüntüsüne**
karşı yazılmıştı: v1 nötr gri + `#0D7377` teal sistemini varsayıyor, Sanzo Wada
kaynaklı marigold `#D89000` / indigo `#242448` ikinci vurgu ailesi öneriyor ve
"gradyan/glow/tilt hâlâ yasak" diyordu — halbuki ADR-004 o gün paleti karanlık odaya
çevirmiş ve hero'ya tek imzalı istisnayı tanımıştı. Çelişki fark edilip Ayberk'e
soruldu; karar: **karanlık oda taban kalır, marigold/indigo tamamen düşer** (amber/
russet "sıcak editoryal vurgu" rolünü zaten taşıyor; ikinci bir rakip vurgu ailesi
ADR-004'ün kurmaya çalıştığı şeyi bulandırırdı). Brief'in palete bağlı olmayan
kısımları — hareket envanteri (§2) ve derinlik/elevation sistemi (§3) — karanlık oda
token'larına uyarlanarak alınır. Ana sayfa "dot-wave" arkaplanı da düşer: ADR-004
hero'nun imza muamelesini zaten kurdu, ikinci bir ambient efekt onunla yarışır.

## Decision

Yeni renk token'ı YOK. Aşağıdaki hareket + derinlik katmanı mevcut karanlık oda
paleti/fontları üzerine eklenir.

### 1. Yeni motion/elevation token'ları (global.css @theme)

```css
--ease-spring: cubic-bezier(0.2, 0.9, 0.3, 1.2);  /* "yaylı" giriş eğrisi */
--shadow-3: 0 12px 32px rgba(0, 0, 0, 0.14);       /* açık mod */
/* koyu modda shadow-3, #120E0B zemin üzerinde çamurlaşmaması için koyulaştırılır:
   0 12px 32px rgba(0, 0, 0, 0.5) — bileşen katmanında .dark override. */
```

`--shadow-3` YALNIZ iki yerde kullanılır: sürükleme overlay çerçevesi ve ResultPanel.
Gölge ölçeği artık 3 seviyedir (1 resting, 2 hover/drag, 3 tepe an).

### 2. Hareket envanteri (bağlayıcı)

Tüm hareketler compositor-dostu özelliklerde koşar (transform/opacity; gölge geçişi
pseudo-element opacity ile taklit edilir), `prefers-reduced-motion`'da mevcut global
kuralla kapanır, CLS'e etki etmez (layout özelliği animasyonu yok — progress bar
dahil: `scaleX`, `width` değil).

1. **Button** (ghost hariç): hover `translateY(-1px)` + shadow-2'nin pseudo-element
   opacity ile 120ms fade-in'i; active `translateY(0) scale(0.985)`.
2. **DropZone idle**: 4s ease-in-out sonsuz "nefes alan" kenarlık — varsayılan
   hairline ile %20 teal (açık: `--color-accent`, koyu: `--color-teal-dark`) tonu
   arasında salınım. Reduced-motion'da kapalı (global kural).
3. **DropZone dragover**: tam-viewport overlay'e karanlık oda paletinden sıcak
   tint (koyu mod: amber tintli, açık mod: parşömen tintli) + 150ms fade;
   "Release to add" etiketi 0.96'dan `--ease-spring` ile 200ms'de ölçeklenir.
   Overlay paneli shadow-3 taşır.
4. **FileChip girişi**: 8px yukarı kayma + fade, 200ms; çoklu dosyada chip başına
   40ms stagger.
5. **Faz geçişleri** (upload→options→processing→done): crossfade + 6px dikey
   drift, 200ms; bölge min-height kuralı korunur (zıplama yok).
6. **ProgressPanel**: dolum `transform: scaleX` (transform-origin left) ile;
   dolu kısmın ucunda soluk amber "kuyruk" vurgusu (teal→amber'e yumuşayan
   element-içi dolum rengi). Not: bu bir arkaplan gradyanı değildir — karanlık
   oda dili element-düzeyi amber gradyanları primary butonda ve DropZone
   ikonunda zaten kullanıyor; yasak sayfa-arkaplanı gradyanlarına ve glow'a dair.
7. **ResultPanel başarı girişi**: panel faz-geçişiyle gelir, shadow-3'lü kart
   yüzeyine oturur; indirme butonu 0.97→1 `--ease-spring` ölçek girişi yapar.
   **Shimmer-yeniden-kullanım kararı:** brief'teki "hero'nun teal→amber shimmer'ını
   panelin üst kenarında bir kez süpür" seçeneği REDDEDİLDİ. ADR-004'ün kendi
   consequence maddesi shimmer/glow/3D'yi "markanın imza anı, başka hiçbir yerde
   tekrarlanmaz" diye tekilleştirir; ikinci bir kullanım o maddeyi delerdi ve
   kazanç marjinaldi. Bunun yerine daha sade, shimmer'sız giriş seçildi — spring
   ölçek + elevation zaten başarı anına ağırlık veriyor. İmza tekil kalır.
8. **Ana sayfa dot-wave arkaplanı**: kapsam dışı (yukarıdaki Context'te gerekçesi).

### 3. Derinlik sistemi

- Kartlar 1px "üstten aydınlatma" çizgisi alır (inset üst highlight): açık mod
  parşömen zemine uygun sıcak-beyaz `rgba(255, 252, 245, 0.65)`; koyu modda
  `#1D1512` üzerinde `rgba(255, 255, 255, 0.05)`. Perspektif/tilt YOK — derinlik
  ışık ipucuyla verilir.
- Preview kartındaki render edilmiş PDF sayfası "kağıt" muamelesi alır: 1px kenarlık
  + shadow-1 + altında 2px "deste" kenarı (fiziksel sayfa yığını ipucu). Bu,
  karanlık oda / baskı metaforunun doğal uzantısıdır: banyodan çıkan baskı,
  tepsideki kağıt destesinin üstünde durur.
- Koyu mod kart yüzeyi `--color-surface-dark` (#1D1512) olarak KALIR — brief'in
  önerdiği indigo-tintli `#1F1F2E` yüzeyi palete girmez (Context'teki karar).

### 4. Guardrail mutabakatı

ADR-004 anti-slop sözleşmesini "genel kural + tek imzalı istisna"ya çevirmişti; bu
ADR o çerçeveyi olduğu gibi korur. Bu geçişte YENİ istisna tanınmaz: yeni gradyan
arkaplan yok, yeni glow yok, tilt/parallax/perspective hiçbir yerde yok (hero'nun
mevcut istisnası hariç). Lighthouse ≥95 (tüm kategoriler; best-practices 96
`'unsafe-inline'` CSP bilinen istisnası saklı) + CLS ≤0.02 + 22 unit + 8 e2e test
gate'leri aynen bağlayıcı — bir animasyon bir Lighthouse puanına mal olursa
animasyon kaybeder.

## Consequences

- UI_UX_TASARIM.md §2'ye motion/elevation token'ları, §3 tablosuna hareket notları
  eklendi (bu ADR'a atıfla).
- ADR-004'ün açık kalan action item'ları (Lighthouse yeniden ölçümü, tool-sayfası
  görsel turu) bu geçişin gate koşusunda birlikte kapatılır.
- Gelecekte hareket eklemek isteyen biri bu ADR'ın envanterine ekleme yapmalı;
  envanter dışı dekoratif hareket "silent drift" sayılır.

## Action Items

1. [ ] global.css: `--ease-spring`, `--shadow-3`, breathing/pop/chip/phase
   keyframe'leri, kart üst-highlight ve kağıt-deste sınıfları.
2. [ ] Bileşen hareketi: Button, DropZone (idle + dragover overlay), FileChip
   stagger, ToolShell faz geçişleri, ProgressPanel scaleX + amber kuyruk,
   ResultPanel kart + spring giriş.
3. [ ] Gate koşusu: unit + e2e + build + wasm bütçesi + Lighthouse (ADR-004 item 4
   burada kapanır) + screenshot turu (360/768/1280 × açık/koyu, hover/drag dahil).
