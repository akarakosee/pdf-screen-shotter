# ADR-003: Worker protokolüne hafif `inspect` mesajı eklenmesi

**Status:** Accepted
**Date:** 2026-07-21
**Deciders:** Ayberk
**Dayanak:** SISTEM_TASARIMI.md §3.1/§3.3, UI_UX_TASARIM.md §3 (FileChip), PRD-pdf-to-png.md R2

## Context

§3.3 protokolünde UI'ın bir dosyanın sayfa sayısını dönüşümden ÖNCE öğrenme yolu yok:
`start` ancak render başlatır, `preview` yalnız bir blob döndürür. Oysa iki bağlayıcı
gereksinim bunu istiyor: FileChip "boyut + sayfa sayısı" gösterir (UI_UX_TASARIM §3) ve
R2 "aralık sayfa sayısını aşarsa kırpılır ve kullanıcıya bildirilir" der — bildirim
client-side, dönüşüm başlamadan verilmeli. `JobFile.pageCount` alanı da (§3.1) UI
tarafında hiç doldurulamıyordu. Uygulama fazında (increment 3) tespit edildi.

## Decision

UI → Worker protokolüne tek mesaj eklenir:

```
UI → Worker:  { type:'inspect', fileId, file: ArrayBuffer }
Worker → UI:  { type:'inspect-done', fileId, pageCount }
              { type:'file-error', fileId, message }   // mevcut mesaj yeniden kullanılır
                                                       // (encrypted | corrupt | zero-pages)
```

Worker dosyayı motorla açar, `pageCount` okur, kapatır — hiçbir sayfa render edilmez.
ArrayBuffer transferable olarak gider (mevcut kuralla aynı). Şifreli/bozuk dosya
mevcut `file-error` mesajıyla, aynı hata taksonomisiyle raporlanır — yeni hata mesajı
tipi eklenmez.

Değişmeyenler (bilinçli sınır): PdfEngine adapter sözleşmesi (§3.2) aynen kalır —
`inspect` mevcut `open`/`pageCount`/`close` çağrılarının bileşimidir; JobController
mimarisi (tek worker, fatal→respawn) aynen kalır; `start`/`progress`/`done` akışına
dokunulmaz.

## Options Considered

### Option A: Hafif `inspect` mesajı — SEÇİLDİ
| Dimension | Assessment |
|-----------|------------|
| Complexity | En düşük — worker'da ~10 satır, motor sözleşmesi değişmez |
| Performans | Sayfa render yok; open+count milisaniyeler mertebesinde |
| Yan etki | Şifreli/bozuk dosya dönüşümden önce yakalanır (UX iyileşmesi) |

### Option B: `preview-done`'a pageCount eklemek
**Cons:** Yalnız ilk dosya inceleniyor (preview tek dosya için çalışır); çoklu dosyada
FileChip'ler doldurulamaz; preview DPI değişiminde gereksiz tekrar açılır. Reddedildi.

### Option C: Main thread'de ikinci motor instance'ı ile sayım
**Cons:** "Motor yalnız worker'da yaşar" kuralını (§3.2) ihlal eder; WASM main thread'e
iner, Lighthouse/bellek bütçesi bozulur. Reddedildi.

## Trade-off Analysis

Bedel, dosya başına bir ekstra open/close turu ve ArrayBuffer'ın inspect için
transfer edilmesidir (buffer worker'a taşındığı için UI kopyasını `slice()` ile
üretir ya da dönüşümde dosyayı yeniden okur — File handle'ı zaten UI'da duruyor,
yeniden `arrayBuffer()` okumak ucuz ve bellek açısından nötr). Kazanç: iki bağlayıcı
gereksinimin (FileChip sayfa sayısı, R2 kırpma bildirimi) protokole uygun, motor
sözleşmesine dokunmayan en küçük yüzeyle karşılanması.

## Consequences

- Kolaylaşan: FileChip "N pages"; R2 clamp uyarısı dönüşüm öncesi; şifreli/bozuk
  dosyanın erken tespiti (kullanıcı Convert'e basmadan chip'te görür).
- Zorlaşan: protokolde bir mesaj çifti daha test edilmeli (birim + e2e kapsamına eklendi).
- SISTEM_TASARIMI.md §3.3 bu ADR ile güncellendi (işaretli).
