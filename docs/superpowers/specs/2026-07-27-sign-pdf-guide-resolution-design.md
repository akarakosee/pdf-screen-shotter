# Sign PDF — Guide Layer Resolution Fix

## Problem

`SignShell.tsx`'teki imza yerleştirme kutucuğu, kullanıcının hizalama yapabilmesi için altındaki
sayfa içeriğini (örn. "ÖĞRENCİNİN İMZASI" etiketi) soluk bir rehber katman olarak gösteriyor. Bu
katman, `JobController.previewPage()`'in sabit 200 DPI'da render ettiği tek sayfa görüntüsünü CSS
`background-size`/`background-position` kırpma hilesiyle `customBox.heightFrac`'e göre büyütüyor.

`heightFrac` küçüldükçe büyütme oranı katlanarak artıyor (örn. `heightFrac=0.06` → ~%1666
büyütme). 200 DPI'lık kaynağı bu oranda upscale etmek ciddi piksel bozulmasına/bulanıklığa yol
açıyor — kullanıcı bunu "rezalet" olarak tanımladı.

## Kapsam dışı bırakılanlar (ve neden)

- **Gerçek bölgesel (crop) yüksek-DPI render** (worker'a "şu dikdörtgeni 700 DPI'da render et"
  mesajı): `MuPdfEngine.renderPage` şu an sadece tüm sayfayı rasterize ediyor, clip/rect
  parametresi yok. mupdf.js'in bunu destekleyip desteklemediği doğrulanmadı; doğrulanmamış bir API
  varsayımı üzerine worker protokolü genişletmek riskli. Kullanıcı bu riski almamayı tercih etti.
- **Debounce'lu ikinci render isteği** (sürükleme/boyutlandırma durduktan 200-300ms sonra yüksek
  çözünürlüklü render): Tek seferlik DPI artışı sıfır ek gecikmeyle yeterli netliği sağladığı için
  gereksiz karmaşıklık; kullanıcı bu yaklaşımı elemedi.

## Çözüm

İki küçük, birbirini tamamlayan değişiklik, tek dosyada (`web/src/components/SignShell.tsx`):

1. **DPI artışı:** `getController().previewPage(file, previewPageNum, 200)` çağrısındaki DPI
   değeri `400` olarak değiştirilir. Bu tek görüntü hem ana canlı sayfa önizlemesini
   (`<img src={previewUrl}>`) hem de rehber katmanını (`guideBackgroundStyle`) besliyor — ikisi de
   aynı `previewUrl`'i paylaştığı için tek değişiklik her ikisini de iyileştirir.
   - `JobController.previewPage(file, page, dpi)` zaten opsiyonel bir `dpi` parametresi kabul
     ediyor (bu konuşmada önceki bir turda eklendi); varsayılan değer `PREVIEW_DPI` (72) olarak
     kalıyor, bu yüzden `PageCard`/`ToolShell`'in filmstrip/thumbnail çağrıları etkilenmiyor.
2. **Zoom tavanı clamp'i:** `guideBackgroundStyle` hesaplamasındaki mevcut
   `Math.max(0.02, customBox.heightFrac)` clamp değeri `0.04`'e çıkarılır. Bu, kutucuk aşırı
   küçültüldüğünde büyütme oranının (~%5000'den ~%2500'e) sınırlanmasını sağlar — A4 sayfasında
   %4 yükseklik zaten gerçekçi bir minimum imza satırı boyutu.

## Veri akışı

Değişiklik yok — mevcut akış aynen korunuyor: `file`/`previewPageNum` değiştiğinde
`useEffect` tetiklenir → `previewPage(file, previewPageNum, 400)` çağrılır → worker tek bir PNG
blob döner → `previewUrl` state'ine yazılır → hem `<img>` hem `guideBackgroundStyle` bu URL'i
kullanır. Sürükleme/boyutlandırma sırasında **yeni bir render isteği tetiklenmez** — sadece CSS
`background-position`/`background-size` değerleri güncellenir (60fps'e yakın, WASM/worker
maliyeti yok).

## Performans

400 DPI'da bir A4 sayfası ~3300×4700px (200 DPI'nin 4 katı piksel sayısı). Bu maliyet, sayfa
gezinmesi başına **bir kez** ödeniyor (mevcut davranışla aynı zamanlama), sürükleme sırasında
tekrarlanmıyor. Filmstrip/thumbnail render'ları (`PageCard`, `ToolShell`) varsayılan 72 DPI'de
kaldığı için bu değişiklikten etkilenmiyor.

## Test / doğrulama

- `tsc --noEmit`: parametre değişikliği tip-güvenli, ek doğrulama gerekmiyor.
- Görsel doğrulama: proje kuralı gereği (`CLAUDE.md`) manuel olarak kullanıcı tarafından yapılacak
  — Playwright/browser otomasyonu ile görsel test yapılmıyor.

## Geriye dönük uyumluluk

`previewPage`'in üç çağrı sitesinden (`PageCard`, `ToolShell`, `SignShell`) sadece `SignShell`
DPI parametresini açıkça geçiyor; diğer ikisi varsayılanı (72) kullanmaya devam ediyor. Hiçbir
worker mesaj protokolü veya `JobController` public API şekli değişmiyor.
