# PDF Screen Shotter

PDF dosyalarının her sayfasını ayrı bir PNG görüntü dosyasına dönüştüren masaüstü uygulaması.

A local desktop utility that converts every page of a PDF into a separate PNG image file.

---

## Features

- **PDF Selection** — browse and select any `.pdf` file.
- **Output Folder** — auto-creates a uniquely-named folder for each export.
- **Quality Presets** — 100 / 150 / 200 / 300 DPI.
- **Progress Tracking** — live progress bar, status label, and scrolling log.
- **Completion Summary** — total pages, successes, failures, duration.
- **Open Folder** — one-click button to open the output directory.
- **Cancellation** — cancel mid-export without losing already-saved pages.
- **Error Resilience** — individual page failures don't abort the entire run.

---

## Requirements

- Python 3.11 or newer
- macOS, Windows, or Linux

## Installation

```bash
# 1. Clone or copy this project
cd PDF_Screen_Shotter

# 2. Create a virtual environment (recommended)
python3 -m venv .venv
source .venv/bin/activate   # macOS / Linux
# .venv\Scripts\activate    # Windows

# 3. Install dependencies
pip install -r requirements.txt
```

## Running

```bash
python main.py
```

The application window will open. Then:

1. Click **PDF Seç** to choose a PDF file.
2. Optionally change the **Çıktı Klasörü** (output directory).
3. Select the desired **Kalite** (quality / DPI).
4. Click **Dönüştür** to start the conversion.
5. Watch progress in the log and progress bar.
6. When finished, click **Çıktı Klasörünü Aç** to view your images.

---

## Project Structure

```
PDF_Screen_Shotter/
├── main.py                  # Entry point
├── requirements.txt
├── README.md
├── core/
│   ├── __init__.py
│   ├── config.py            # Constants and quality presets
│   ├── logger.py            # Logging configuration
│   └── utils.py             # Folder/filename helpers
├── models/
│   ├── __init__.py
│   ├── export_options.py    # ExportOptions dataclass
│   ├── export_result.py     # ExportResult dataclass
│   └── progress_data.py     # ProgressData dataclass
├── services/
│   ├── __init__.py
│   ├── pdf_service.py       # PDF open/validate/render (PyMuPDF)
│   └── export_service.py    # Export pipeline orchestration
└── ui/
    ├── __init__.py
    ├── main_window.py        # QMainWindow
    ├── widgets.py            # Widget factory helpers
    └── export_worker.py      # QThread-based worker
```

---

## How It Works

1. **Validation** — the selected PDF is checked for existence, valid extension, readability, and encryption status.
2. **Folder Creation** — a folder named `<pdf_stem>_pages` is created (with `_1`, `_2` suffixes if a collision is found).
3. **Page-by-page Rendering** — each page is rendered to a PNG at the selected DPI using PyMuPDF, saved, and immediately released from memory.
4. **Progress Reporting** — a `QThread` worker emits Qt signals after each page, keeping the GUI responsive.
5. **Summary** — upon completion (or cancellation), a summary reports successes, failures, duration, and output path.

---

## Packaging with PyInstaller

```bash
pip install pyinstaller

pyinstaller --onefile --windowed \
    --name "PDF Screen Shotter" \
    --add-data "core:core" \
    --add-data "models:models" \
    --add-data "services:services" \
    --add-data "ui:ui" \
    main.py
```

On macOS, replace `:` with `;` on Windows for the `--add-data` separator.

The resulting executable will be in `dist/`.

---

## Edge Cases Handled

| Scenario | Handling |
|----------|----------|
| No PDF selected | Warning dialog |
| Invalid file extension | Validation error |
| Corrupt / unreadable PDF | Error dialog with message |
| Password-protected PDF | Specific error message |
| PDF with 0 pages | Validation error |
| Output folder doesn't exist | Error dialog |
| Folder name collision | Auto-suffix `_1`, `_2`, … |
| Permission denied on write | Error per page, continues |
| Single page render failure | Logged, skipped, counted |
| Turkish / special chars in filename | Unicode-safe sanitization |
| Very long filenames | Sanitized and truncated |
| Large PDFs (1000+ pages) | Sequential, memory-safe |
| UI freeze during export | Worker thread pattern |
| User cancels mid-export | Graceful stop, partial results kept |

---

## License

Personal use utility — no license restrictions.
