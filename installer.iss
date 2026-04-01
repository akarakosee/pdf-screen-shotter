#define MyAppName "PDF Screen Shotter"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "PDF Screen Shotter"
#define MyAppExeName "PDF Screen Shotter.exe"
#define MyAppDescription "PDF dosyalarini sayfa sayfa PNG goruntusune donusturur"

[Setup]
; Uygulama bilgileri
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL=https://github.com
AppSupportURL=https://github.com
AppUpdatesURL=https://github.com

; Kurulum hedefi
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

; Cikti
OutputDir=Output
OutputBaseFilename=PDF_Screen_Shotter_Kurulum
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
WizardSizePercent=120

; Gereksinimler
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0.17763

; Kurulum ilerlemesi
ShowLanguageDialog=no
LanguageDetectionMethod=none

[Languages]
Name: "turkish"; MessagesFile: "compiler:Languages\Turkish.isl"

[CustomMessages]
turkish.AppIsRunning=Uygulama calisiyor. Lutfen kapatip tekrar deneyin.

[Tasks]
Name: "desktopicon"; Description: "Masaustu kisayolu olustur"; GroupDescription: "Ek gorevler:"
Name: "startmenuicon"; Description: "Baslat menusu kisayolu olustur"; GroupDescription: "Ek gorevler:"

[Files]
Source: "dist\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; Baslat menusu
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Comment: "{#MyAppDescription}"
Name: "{group}\{#MyAppName}'i Kaldır"; Filename: "{uninstallexe}"

; Masaustu kisayolu
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Comment: "{#MyAppDescription}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
function InitializeSetup(): Boolean;
begin
  Result := True;
end;
