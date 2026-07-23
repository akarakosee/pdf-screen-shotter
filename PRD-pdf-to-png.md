# PRD: PDF → PNG Dönüştürücü (Faz 1 amiral araç)

> Sürüm: 1.0 · Tarih: 2026-07-21 · Sahip: Ayberk
> Bağlam: WEB_PLANI.md (strateji), SISTEM_TASARIMI.md (mimari), ADR-001 (motor: MuPDF.js), ADR-002 (başlıklar)
> Kapsam: web sitesinin ilk canlıya çıkacak aracı; PDF→JPG varyantı aynı spec'in format parametresidir.

---

## 1. Problem Statement

İnsanlar PDF sayfalarını görüntü olarak kullanmak istiyor (sunuma ekleme, sosyal medya paylaşımı, baskı, OCR öncesi hazırlık) ve bunun için her gün yüz binlerce "pdf to png" araması yapıyor. Mevcut online araçlar dosyayı sunucuya yükletiyor (özel belgelerde gizlilik endişesi), dosya sayısı/boyut limiti koyuyor ve kayıt/ödeme duvarıyla kesiyor. Çözülmezse: kullanıcılar rakiplerde kalır; bizim doğrulanmış masaüstü motorumuz ve "dosya cihazdan çıkmaz" farkımız değere dönüşmez.

## 2. Goals

| # | Hedef | Ölçüt |
|---|---|---|
| G1 | Kullanıcı hiçbir kayıt/limit engeline takılmadan dönüşümü tamamlar | Task completion rate ≥ %85 (dosya bırakan → indiren) |
| G2 | Masaüstü uygulamayla birebir çıktı kalitesi | Golden-file testlerinde %0 piksel farkı (CI kapısı) |
| G3 | Hızlı algılanan deneyim | Dosya bırakma → önizleme < 3 sn (50 sayfalık tipik PDF, orta cihaz) |
| G4 | SEO ile organik trafik çekme | "/pdf-to-png" sayfası 3 ay içinde Google'da indexli + ilk organik tıklamalar |
| G5 | Genişleme temelini kurma | İkinci araç (JPG) sıfır motor/shell değişikliğiyle açılır |

G1-G3 kullanıcı hedefi, G4-G5 iş hedefi.

## 3. Non-Goals

- **OCR / metin çıkarma** — ayrı araç, ağır bağımlılık; Faz 3'te değerlendirilir.
- **PDF düzenleme** (metin/sayfa edit) — farklı ürün kategorisi.
- **Hesap sistemi, geçmiş, bulut kaydetme** — "no signup" ürün sözünün tersi; asla değil (bu sürümde ve öngörülebilir gelecekte).
- **Şifreli PDF'i şifreyle açma** — Faz 3 (P2); v1'de net hata mesajı yeterli.
- **Sunucu tarafı fallback** — N1 gizlilik sözüyle çelişir; eski tarayıcıya masaüstü uygulama önerilir.
- **PNG optimizasyonu/sıkıştırma ayarları** — motor çıktısı yeterli (spike: PNG'ler zaten rakip motordan küçük); karmaşıklık eklemez, ihtiyaç kanıtlanırsa P2.

## 4. User Stories (öncelik sırasıyla)

Persona A — "Hızlı iş bitiren" (öğrenci/ofis çalışanı, tek dosya, mobil veya masaüstü):
1. Bir kullanıcı olarak, PDF'imi sürükleyip bırakıp tek tıkla PNG'lere çevirmek istiyorum ki işimi saniyeler içinde bitireyim.
2. Bir kullanıcı olarak, dönüştürmeden önce ilk sayfanın önizlemesini görmek istiyorum ki doğru dosyayı ve kaliteyi seçtiğimden emin olayım.
3. Bir kullanıcı olarak, sadece ihtiyacım olan sayfaları (örn. 3-7) seçebilmek istiyorum ki 200 sayfalık dosyadan 5 görüntü alayım.
4. Bir mobil kullanıcı olarak, telefonumdan dosya seçip aynı akışı yaşamak istiyorum ki bilgisayara geçmek zorunda kalmayayım.

Persona B — "Gizlilik hassas profesyonel" (hukuk/finans/İK, hassas belgeler):
5. Hassas belge sahibi olarak, dosyamın cihazımdan çıkmadığını açıkça görmek istiyorum ki aracı sözleşme/bordro gibi belgelerle güvenle kullanayım.
6. Hassas belge sahibi olarak, bu iddianın kanıtını (açık kaynak kod, ağ trafiği yokluğu) bulabilmek istiyorum ki pazarlama lafı olmadığına ikna olayım.

Persona C — "Toplu işleyen" (arşiv/veri hazırlığı, çok dosya):
7. Toplu kullanıcı olarak, 10+ PDF'i tek seferde bırakıp hepsinin tek akışta işlenmesini istiyorum ki dosya dosya uğraşmayayım.
8. Toplu kullanıcı olarak, uzun işlemde ilerlemeyi görmek ve gerekirse iptal etmek istiyorum ki kontrolü kaybetmeyeyim.
9. Toplu kullanıcı olarak, bir dosya bozuk çıksa bile diğerlerinin tamamlanmasını istiyorum ki bir hata bütün işi çöpe atmasın.

Kenar durumlar:
10. Bir kullanıcı olarak, şifreli/bozuk PDF bıraktığımda hangi dosyanın neden işlenmediğini anlamak istiyorum.
11. Eski tarayıcı kullanıcısı olarak, aracın neden çalışmadığını ve alternatifimi (masaüstü uygulama) görmek istiyorum.

## 5. Requirements

### P0 — Must-Have (bunlarsız çıkılmaz)

**R1. Dosya alımı:** drag-drop + dosya seçici, çoklu dosya, yalnız .pdf kabulü (magic bytes doğrulamalı).
- [ ] Given geçersiz dosya (uzantı sahte), when bırakılır, then FileChip'te ret + neden gösterilir; geçerli dosyalar etkilenmez.
- [ ] 10 dosyaya kadar sorunsuz; üst limit yok, 25+ dosyada UI performans testi yapılmış.

**R2. Seçenekler:** DPI (100/150/200/300; varsayılan 150 "Recommended"), sayfa aralığı ("1-5,8" sözdizimi), format (PNG; JPG aynı shell'de).
- [ ] Geçersiz aralık girişinde alan hata durumu + dönüştür butonu pasif.
- [ ] Aralık, sayfa sayısını aşarsa kırpılır ve kullanıcıya bildirilir.

**R3. Önizleme:** ilk seçili dosyanın ilk sayfası, DPI değişince güncellenir.
- [ ] Given 50 sayfalık tipik PDF, when dosya bırakılır, then önizleme < 3 sn (WASM soğuk başlangıç dahil; preload çalışmışsa < 1 sn).

**R4. Dönüşüm:** worker'da sayfa-sayfa render, ilerleme (dosya x/y, sayfa n/m), iptal.
- [ ] UI hiçbir anda donmaz (main thread block > 200 ms yok).
- [ ] Given 1000 sayfa @300 DPI, then sekme çökmez, bellek tavanı sabit seyreder (streaming ZIP).
- [ ] İptal ≤ 1 sn içinde etki eder; o ana dek üretilen sayfalar kısmi ZIP olarak indirilebilir.

**R5. Hata dayanıklılığı:** sayfa hatası atlanır ve sayılır; dosya hatası (şifreli/bozuk/0 sayfa) o dosyayı atlar, akış devam eder.
- [ ] Sonuç ekranında dosya bazlı durum: başarılı sayfa sayısı, atlanan sayfalar, neden.

**R6. Çıktı:** tek sayfa → doğrudan PNG; çoklu → ZIP (`<dosyaadı>_pages.zip`, içinde `<dosyaadı>_page_001.png`...). Türkçe/özel karakterli adlar güvenli sanitize edilir (masaüstü utils davranışı).
- [ ] ZIP, masaüstü uygulamanın klasör adlandırma kurallarıyla tutarlı.

**R7. Gizlilik kanıtı:** DropZone altında kalıcı "files never leave your device" satırı; Network sekmesinde dosya içeriği içeren hiçbir istek oluşmaz.
- [ ] E2E testte dönüşüm sırasında dosya verisi taşıyan sıfır ağ isteği assert edilir (bu bir pazarlama cümlesi değil, CI kapısıdır).

**R8. Zarif düşüş:** WASM/gerekli API yoksa araç yerine bilgi kartı + masaüstü uygulama indirme linki.

**R9. Sayfa temeli:** SEO meta + HowTo/FAQ schema, EN+TR, mobil responsive, reklam alanları rezerve yükseklikli (CLS ≈ 0), Lighthouse ≥ 95.

### P1 — Nice-to-Have (hızlı takip)

- **R10.** Sayfa küçük resimleri ızgarası (yalnız ilk sayfa değil) + tıklayarak sayfa seçimi (aralık yazmaya görsel alternatif).
- **R11.** JPG kalite kaydırıcısı (format=jpg seçilince).
- **R12.** "Convert more" akışı state sıfırlamadan yeni dosya ekleme.
- **R13.** Sürükleme sırasında tüm sayfanın drop-target'a dönüşmesi (dropzone'u ıskalamayı imkansızlaştırır).

### P2 — Future Considerations (mimariyi bağlayan)

- **R14.** Şifreli PDF için şifre girişi (engine.open zaten EncryptedError ayırt ediyor — kapı açık).
- **R15.** Service Worker ile tam çevrimdışı mod ("works offline" kancası).
- **R16.** Dosya-başına paralel worker havuzu (ADR-002'deki SAB'sız desen) — telemetri gerekçelendirirse.
- **R17.** Çıktıyı görüntü boyutuyla (px) seçme (DPI'a alternatif zihinsel model) — kullanıcı geri bildirimi beklenir.

## 6. Success Metrics

Leading (lansman + 2-4 hafta):
- Completion rate (dosya bırakan → indirme) ≥ %85; ölçüm: Cloudflare Analytics özel event'leri (yalnız adım sayaçları, dosya bilgisi yok).
- Hata oranı (fatal/worker restart) < %1 oturum; ölçüm: Sentry.
- Önizleme p75 süresi < 3 sn; ölçüm: performance mark → analytics.
- Lighthouse ≥ 95 (CI'da her deploy).

Lagging (3-6 ay):
- Organik trafik: 3. ayda indexlenme + ilk tıklamalar; 6. ayda 10K ziyaret/ay (stretch: 20K).
- Dönen kullanıcı oranı ≥ %20 (araç beğenildi göstergesi).
- AdSense onayı alınmış, RPM ölçülmeye başlanmış.

Değerlendirme anları: lansman+2 hafta (UX metrikleri), +3 ay (SEO), +6 ay (trafik/gelir).

## 7. Open Questions

| Soru | Kim | Bloklayıcı mı |
|---|---|---|
| Sayfa aralığı sözdiziminde alan yerine görsel seçim mi öne alınsın? (R10'un P0'a çekilmesi) | Tasarım (mockup aşaması) | Hayır — mockup'ta A/B eskizle karar |
| Analytics event şeması (hangi adımlar, hangi isimler) | Ayberk | Hayır — kodlama fazı başında |
| 300 DPI + dev sayfa uyarı eşiği (SISTEM_TASARIMI §3.4 formülünün son sabitleri) | Mühendislik | Hayır — implementasyonda ölçerek |
| JPG aracı ayrı URL mi (/pdf-to-jpg) aynı sayfada format seçimi mi? | SEO kararı | Evet, sayfa yapısını etkiler — öneri: ayrı URL (WEB_PLANI SEO stratejisiyle tutarlı), mockup öncesi kesinleştir |

## 8. Timeline Considerations

- Bağımlılık zinciri: mockup → Faz 0 (iskelet) → Faz 1 (motor) → bu PRD'nin implementasyonu (Faz 2, 1-2 hafta) → lansman hazırlığı.
- Hard deadline yok; kalite kapıları (G2 golden-file, R7 ağ-sızıntısı testi, Lighthouse) tarihten önce gelir.
- Bu PRD kapsamı bilinçli dar: her P0 şüphesi "masaüstü uygulama bunu yapıyor muydu?" testinden geçti. Genişletme talepleri P1/P2 park alanına.
