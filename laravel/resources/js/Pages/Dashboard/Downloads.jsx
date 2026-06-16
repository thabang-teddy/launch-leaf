import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';

// ── Icon set ──────────────────────────────────────────────────────────────────
function Ico({ name, size = 20, color = 'currentColor' }) {
    const paths = {
        android:  <><path d="M5 16H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h2"/><path d="M19 16h2a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-2"/><rect x="5" y="4" width="14" height="16" rx="2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/><path d="M8 4l-1.5-2.5"/><path d="M16 4l1.5-2.5"/></>,
        windows:  <><rect x="2" y="3" width="9" height="9"/><rect x="13" y="3" width="9" height="9"/><rect x="2" y="13" width="9" height="9"/><rect x="13" y="13" width="9" height="9"/></>,
        download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
        info:     <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
        check:    <><polyline points="20 6 9 17 4 12"/></>,
        clock:    <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    };
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
             stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
             style={{ display: 'block', flexShrink: 0 }}>
            {paths[name] ?? null}
        </svg>
    );
}

// ── Download card ─────────────────────────────────────────────────────────────
function DownloadCard({ icon, platform, filename, description, available, url, size, accentColor }) {
    const unavailableStyle = {
        background: '#f7f7f7',
        border: '1.5px dashed #ddd',
        borderRadius: 14,
        padding: '28px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    };

    const cardStyle = {
        background: 'white',
        border: '1.5px solid #ebebeb',
        borderRadius: 14,
        padding: '28px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    };

    return (
        <div style={available ? cardStyle : unavailableStyle}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: available ? `${accentColor}15` : '#f0f0f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <Ico name={icon} size={24} color={available ? accentColor : '#bbb'} />
                </div>
                <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: available ? '#1a1a2e' : '#aaa' }}>
                        {platform}
                    </p>
                    <p style={{ margin: 0, fontSize: 12.5, color: '#999', fontFamily: 'monospace' }}>
                        {filename}
                    </p>
                </div>
                {available && (
                    <span style={{
                        marginLeft: 'auto', background: '#E6F7F2', color: '#146645',
                        fontSize: 11.5, fontWeight: 600, padding: '3px 10px',
                        borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                        <Ico name="check" size={11} color="#146645" />
                        Ready
                    </span>
                )}
                {!available && (
                    <span style={{
                        marginLeft: 'auto', background: '#FEF9E7', color: '#92610a',
                        fontSize: 11.5, fontWeight: 600, padding: '3px 10px',
                        borderRadius: 20, display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                        <Ico name="clock" size={11} color="#92610a" />
                        Building…
                    </span>
                )}
            </div>

            {/* Description */}
            <p style={{ margin: 0, fontSize: 13.5, color: '#666', lineHeight: 1.6 }}>
                {description}
            </p>

            {/* Meta */}
            {available && size && (
                <div style={{ display: 'flex', gap: 20 }}>
                    <div>
                        <p style={{ margin: 0, fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Size</p>
                        <p style={{ margin: 0, fontSize: 14, color: '#1a1a2e', fontWeight: 600 }}>{size} MB</p>
                    </div>
                </div>
            )}

            {/* Button */}
            {available ? (
                <a
                    href={url}
                    download
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: accentColor, color: 'white',
                        padding: '10px 20px', borderRadius: 9,
                        fontSize: 13.5, fontWeight: 600, textDecoration: 'none',
                        alignSelf: 'flex-start', transition: 'opacity 150ms',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                    <Ico name="download" size={15} color="white" />
                    Download
                </a>
            ) : (
                <p style={{ margin: 0, fontSize: 13, color: '#aaa', fontStyle: 'italic' }}>
                    Run the build commands to generate this file, then refresh.
                </p>
            )}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Downloads({ version, apkAvailable, exeAvailable, apkUrl, exeUrl, apkSize, exeSize }) {
    const buildInstructions = [
        { label: 'Build Android APK', cmd: 'flutter build apk --release' },
        { label: 'Build Windows exe', cmd: 'flutter build windows --release' },
        { label: 'Copy APK', cmd: `copy build\\app\\outputs\\flutter-apk\\app-release.apk ..\\laravel\\public\\downloads\\launch-leaf-v${version}.apk` },
        { label: 'Build Windows installer', cmd: `& "$env:LOCALAPPDATA\\Programs\\Inno Setup 6\\ISCC.exe" windows\\installer.iss` },
        { label: 'Copy installer', cmd: `copy build\\windows\\installer\\launch-leaf-v${version}-setup.exe ..\\laravel\\public\\downloads\\` },
    ];

    return (
        <DashboardLayout header={`App Downloads — v${version}`}>
            <Head title="Downloads" />

            {/* Version badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <span style={{
                    background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                    color: 'white', fontWeight: 700, fontSize: 13,
                    padding: '5px 14px', borderRadius: 20,
                }}>
                    v{version}
                </span>
                <span style={{ color: '#999', fontSize: 13.5 }}>
                    LaunchLeaf Companion App — portfolio manager for Android &amp; Windows
                </span>
            </div>

            {/* Download cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
                <DownloadCard
                    icon="android"
                    platform="Android"
                    filename={`launch-leaf-v${version}.apk`}
                    description="Install directly on any Android device (API 21+). Enable 'Install from unknown sources' in Settings before installing."
                    available={apkAvailable}
                    url={apkUrl}
                    size={apkSize}
                    accentColor="#3ddc84"
                />
                <DownloadCard
                    icon="windows"
                    platform="Windows"
                    filename={`launch-leaf-v${version}-setup.exe`}
                    description="Standard Windows installer. Runs setup, creates a Start Menu shortcut and optional desktop icon, and can be uninstalled via Add/Remove Programs."
                    available={exeAvailable}
                    url={exeUrl}
                    size={exeSize}
                    accentColor="#0078d4"
                />
            </div>

            {/* Build instructions */}
            <div style={{ background: 'white', border: '1.5px solid #ebebeb', borderRadius: 14, padding: '24px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <Ico name="info" size={17} color="#e74c3c" />
                    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>
                        How to build &amp; publish new releases
                    </h2>
                </div>
                <p style={{ margin: '0 0 16px', fontSize: 13.5, color: '#666', lineHeight: 1.6 }}>
                    Run these commands from the <code style={{ background: '#f4f4f4', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 13 }}>flutter_dashboard/</code> directory.
                    After copying, refresh this page to see the download buttons activate.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {buildInstructions.map(({ label, cmd }) => (
                        <div key={label}>
                            <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {label}
                            </p>
                            <code style={{
                                display: 'block', background: '#1a1a2e', color: '#a8e6cf',
                                padding: '10px 16px', borderRadius: 8, fontFamily: 'monospace',
                                fontSize: 12.5, lineHeight: 1.6, wordBreak: 'break-all',
                            }}>
                                {cmd}
                            </code>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
