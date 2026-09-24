# Fixing `npm run build:win` (winCodeSign symbolic link error)

## The error

```
ERROR: Cannot create symbolic link : A required privilege is not held by the client.
...winCodeSign\...\darwin\10.12\lib\libcrypto.dylib
```

## Why it happens

`electron-builder` downloads a helper package called `winCodeSign` (used to set the
`.exe` icon and to sign it). The package contains two macOS files that are stored as
symbolic links. Windows only lets a program create symbolic links if Developer Mode is
on or the terminal runs as Administrator. Without that, unpacking fails, and
electron-builder keeps retrying.

This only affects the machine that **builds** the installer. Users who install the
finished `.exe` don't need to do anything.

---

## Option 1: Unpack the tools manually (keeps the app icon)

Use **PowerShell** (a normal window is fine). The two red
`Cannot create symbolic link ... libcrypto.dylib / libssl.dylib` errors in step 2 are
expected. Those macOS files are not needed on Windows.

### Step 1: Clean up and download

```powershell
cd $env:LOCALAPPDATA\electron-builder\Cache
Remove-Item winCodeSign -Recurse -Force -ErrorAction SilentlyContinue
mkdir winCodeSign
cd winCodeSign
Invoke-WebRequest "https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z" -OutFile w.7z
```

PowerShell prints nothing when the download succeeds. If it fails, open the link in a
browser, save the file, and put it in
`C:\Users\akash\AppData\Local\electron-builder\Cache\winCodeSign\` as `w.7z`.

### Step 2: Unpack

```powershell
& "C:\Users\akash\Downloads\gathalok-desktop\node_modules\7zip-bin\win\x64\7za.exe" x -y w.7z -o"winCodeSign-2.6.0"
Remove-Item w.7z
```

### Step 3: Check

```powershell
dir winCodeSign-2.6.0
```

You should see `rcedit-x64.exe` and the `windows-10` folder.

### Step 4: Build

```powershell
cd C:\Users\akash\Downloads\gathalok-desktop
npm run build:win
```

The output should go straight from `packaging` to `building target=nsis` with no
`winCodeSign` download. The installer appears in the `dist` folder:

```
dist\GathaLok Setup 1.0.0.exe
```

---

## Option 2: Turn on Developer Mode (permanent fix)

1. Delete `C:\Users\akash\AppData\Local\electron-builder\Cache\winCodeSign`
2. Open Windows Settings, go to **Privacy & security > For developers**, and switch
   **Developer Mode** to **On** (on Windows 10: **Update & Security > For developers**).
3. Close the old terminal and open a new one.
4. Run:

```powershell
cd C:\Users\akash\Downloads\gathalok-desktop
npm run build:win
```

Alternative: right-click PowerShell, choose **Run as administrator**, and run the same
commands for that session.

---

## Option 3: Skip the signing tools

In `package.json`, inside `build` > `win`, add `"signAndEditExecutable": false`:

```json
"win": {
  "target": [{ "target": "nsis", "arch": ["x64"] }],
  "icon": "build/icon.ico",
  "signAndEditExecutable": false
},
```

Then run `npm run build:win`. The build works with no extra setup. The downside is that
the installed `GathaLok.exe` may show the default Electron icon instead of yours.

---

## Notes

- The "Some chunks are larger than 500 kB" message during the Vite build is only a
  warning. It does not stop the build.
- The app is not code-signed, so Windows may show "Windows protected your PC" when a
  user opens the installer. They can click **More info > Run anyway**.
- If the build fails with a different error, copy the full output and check the first
  line that starts with `⨯`.