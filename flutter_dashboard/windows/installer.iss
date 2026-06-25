[Setup]
AppName=LaunchLeaf
AppVersion=1.0.1
AppPublisher=Thabang Teddy Morwasetla
DefaultDirName={autopf}\LaunchLeaf
DefaultGroupName=LaunchLeaf
OutputDir=C:\Users\Teddy\projects\launch-leaf\laravel\public\downloads
OutputBaseFilename=launch-leaf-v1.0.1-setup
Compression=lzma2
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64compatible
UninstallDisplayName=LaunchLeaf
UninstallDisplayIcon={app}\flutter_dashboard.exe

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop shortcut"; GroupDescription: "Additional icons:"

[Files]
Source: "C:\Users\Teddy\projects\launch-leaf\flutter_dashboard\build\windows\x64\runner\Release\flutter_dashboard.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\Users\Teddy\projects\launch-leaf\flutter_dashboard\build\windows\x64\runner\Release\flutter_windows.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\Users\Teddy\projects\launch-leaf\flutter_dashboard\build\windows\x64\runner\Release\sqlite3.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "C:\Users\Teddy\projects\launch-leaf\flutter_dashboard\build\windows\x64\runner\Release\data\*"; DestDir: "{app}\data"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\LaunchLeaf"; Filename: "{app}\flutter_dashboard.exe"
Name: "{group}\Uninstall LaunchLeaf"; Filename: "{uninstallexe}"
Name: "{commondesktop}\LaunchLeaf"; Filename: "{app}\flutter_dashboard.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\flutter_dashboard.exe"; Description: "Launch LaunchLeaf"; Flags: nowait postinstall skipifsilent
