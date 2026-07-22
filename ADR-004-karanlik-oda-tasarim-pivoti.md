# ADR-004: "Karanlık oda" (darkroom) tasarım pivotu — Sora display fontu ve kontrollü glow/gradient istisnası

**Status:** Accepted
**Date:** 2026-07-22
**Deciders:** Ayberk

## Context

UI_UX_TASARIM.md §2, "sessiz ustalık" felsefesiyle gradyan arkaplan, glow/neon ve 3D
dekoratif efektleri açıkça yasaklamıştı. Ayberk bağımsız bir brainstorm oturumunda
("karanlık oda" konsepti — PDF dönüşümünü fotoğraf karanlık odasında baskı yapmaya
benzeten bir marka dili) bu yasakların kasıtlı olarak ihlal edildiği bir yön geliştirdi,
`localhost:62268` üzerinde defalarca test etti ve bu yönü asıl proje estetiği olarak
onayladı. Ancak bu yön hiçbir zaman gerçek Astro koduna (`web/src/`) işlenmedi — sadece
`.superpowers/brainstorm/.../content/homepage-darkroom-v8-spacing.html` altında statik
bir mockup olarak kaldı ve konuşma geçmişi kaybolunca "eski tasarıma dönmüş" gibi
göründü, halbuki yeni tasarım gerçek projeye hiç girmemişti.

Bu ADR, o mockup'ı bağlayıcı tasarım kararı haline getirir.

## Decision

1. **Renk paleti değişti**: nötr gri temelli sistem yerine sıcak "karanlık oda" paleti —
   amber (#E8B65F / light: #B5822F), teal (#2E9186, artık `--color-accent`'in koyu-mod
   karşılığı), russet (#B04B36) üçlüsü + parşömen/is rengi zemin (`--color-bg-dark:
   #120E0B`, `--color-surface-dark: #1D1512`). Açık mod, aynı vurgu renkleriyle sıcak
   kağıt tonuna (`--color-bg: #F5F0E6`) çekildi; koyu/açık mod anahtarı (increment 1)
   korunur.
2. **Tipografi**: h1 için `Sora Variable` (yeni `--font-display`), bölüm başlıkları /
   logo için `Space Grotesk Variable` (yeni `--font-heading`). Newsreader kaldırıldı.
   Fontlar Google Fonts CDN üzerinden değil, **self-hosted** (`@fontsource-variable/*`)
   yüklenir — bu, mevcut CSP/CLS kararını (increment 1 gerekçesi: "no font CDN; keeps
   CSP strict") değiştirmeden korur.
3. **Kontrollü istisna**: anti-slop yasakları genel kural olarak geçerliliğini
   sürdürür (gradyan arkaplan, glow, 3D blob hâlâ varsayılan olarak yasak) — **tek
   istisna**, ana sayfa h1'indeki iki-üç kelimelik vurgu öbeği (`.hero-develop` —
   `global.css`): Sora fontuyla, amber→russet→teal geçişli shimmer + hafif 3D tilt
   animasyonu, sadece koyu modda `text-shadow` glow eklenir. Bu, markanın imza anı
   olarak kasıtlı tutulur; başka hiçbir yerde glow/3D tekrar kullanılmaz.
4. Ana sayfaya (`index.astro` + `tr/index.astro`) "developing tray" görsel metaforu
   (sayfa küçük resimlerinin sırayla "banyodan çıkması" animasyonu) eklendi.

## Consequences

- **Kolaylaşan:** marka artık ayırt edici bir görsel imza taşıyor; kullanıcının
  onayladığı tasarım artık gerçek kodda yaşıyor, bir daha "kaybolamaz".
- **Zorlaşan:** anti-slop sözleşmesi artık mutlak değil, "genel kural + tek imzalı
  istisna" biçiminde — gelecekte yeni glow/gradient eklemek isteyen biri bu ADR'ı
  gerekçe gösteremez; her yeni istisna kendi ADR'ını gerektirir.
- Lighthouse/CLS gate'leri (increment 6) yeniden ölçülmeli — yeni font dosyaları
  preload edildi (font-swap CLS riskine karşı, mevcut desenle aynı), ama gerçek ölçüm
  bu ADR kapsamında yapılmadı; bir sonraki quality-gate turunda doğrulanmalı.
- `UI_UX_TASARIM.md` §2 token tablosu ve §1 "yasaklar" paragrafı bu ADR'a atıfla
  güncellenmelidir (silent drift yasağı — bu ADR o güncellemenin gerekçesidir).

## Action Items

1. [x] `global.css` @theme token'ları karanlık oda paletine güncellendi.
2. [x] `@fontsource-variable/sora` ve `@fontsource-variable/space-grotesk` eklendi,
   Base.astro preload listesine girdi.
3. [x] Header/Footer/index sayfaları yeni marka diline göre güncellendi (EN + TR).
4. [x] Lighthouse CI yeniden çalıştırıldı (2026-07-22, ADR-005 gate koşusunda):
   assertion'lar geçiyor; 5 koşunun 1'inde ana sayfada CLS 0.10 flake'i (font-
   zamanlama varyansı — fontlar preload'lu, kalıcı regresyon yok; ayrıntı ADR-005).
5. [x] Tool + içerik sayfaları gözden geçirildi (2026-07-22 ADR-005 görsel turu):
   token'lardan otomatik faydalanıyorlar; bespoke dokunuş olarak ADR-005'in
   elevation/hareket katmanı eklendi (kart üst-highlight, kağıt-deste preview,
   ResultPanel elevasyonu). Ek bir şey gerekmedi.
