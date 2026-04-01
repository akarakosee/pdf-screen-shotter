@echo off
color 0b
echo ========================================================
echo        PDF Screen Shotter EXE Olusturucu (Windows)
echo ========================================================
echo.
echo Bu islem bilgisayarinizda sisteminizde "python" ve "pip"
echo kurulu olmasini gerektirir. Kurulum yapilacak ve ardindan
echo uygulama tek ve temiz bir .exe dosyasina donusturulecektir.
echo (Klavyeden bir tusa basarak baslayabilirsiniz)
pause >nul

echo.
echo [1/3] Gerekli eklentiler yukleniyor...
pip install -r requirements.txt
pip install pyinstaller

echo.
echo [2/3] Windows icin EXE derleniyor lutfen bekleyin...
pyinstaller --onefile --windowed --name "PDF Screen Shotter" --add-data "core;core" --add-data "models;models" --add-data "services;services" --add-data "ui;ui" main.py -y

echo.
echo [3/3] Derleme Tamamlandi!
echo ========================================================
echo "dist" adinda yeni bir klasor olusturuldu. 
echo Icine girip "PDF Screen Shotter.exe" dosyasini 
echo masaustunuze puruzsuzca tasiyabilir veya calistirabilirsiniz.
echo ========================================================
pause
