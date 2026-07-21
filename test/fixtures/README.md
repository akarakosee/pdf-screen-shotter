# Test fixtures

- `sample-20p.pdf` — 20 sayfalık sentetik test PDF'i (metin + Türkçe karakter + vektör çizim). Spike'ta üretildi.
- `golden-sample-20p-p1-150dpi.png` — PyMuPDF (masaüstü uygulamanın motoru) ile üretilen referans render, sayfa 1, 150 DPI. MuPDF.js çıktısı bununla piksel piksel karşılaştırılır (ADR-001: %0.000 fark ölçüldü).
- `mupdf-sample-20p-p1-300dpi.png` — MuPDF.js ile 300 DPI referans render (yüksek DPI regresyon testi için).

Golden-file testi: motor bu PDF'i render ettiğinde çıktı, ilgili golden PNG ile piksel piksel (veya ADR-001'deki toleransla) eşleşmeli.
