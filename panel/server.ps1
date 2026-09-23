# Portfolio edit panel: serves the site locally, saves edits and publishes them with git.
# Started by "Siteyi Duzenle.bat". Keep this file ASCII-only (Windows PowerShell 5.1 reads it as ANSI).

param([switch]$NoBrowser)

$ErrorActionPreference = 'Stop'
$Root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$StartPort = 8787
$WritableFiles = @('index.html', 'panel/content.json')
$UploadDir = 'assets/works'
$MimeTypes = @{
  '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'; '.css' = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'; '.svg' = 'image/svg+xml'; '.png' = 'image/png'; '.jpg' = 'image/jpeg'
  '.jpeg' = 'image/jpeg'; '.webp' = 'image/webp'; '.gif' = 'image/gif'; '.ico' = 'image/x-icon'
  '.woff2' = 'font/woff2'; '.mp4' = 'video/mp4'; '.pdf' = 'application/pdf'
}
$env:GIT_TERMINAL_PROMPT = '0'

function Invoke-Git([string[]]$GitArgs) {
  $psi = New-Object Diagnostics.ProcessStartInfo 'git'
  $psi.Arguments = ($GitArgs | ForEach-Object { if ($_ -match '[\s"]') { '"' + ($_ -replace '"', '\"') + '"' } else { $_ } }) -join ' '
  $psi.WorkingDirectory = $Root
  $psi.UseShellExecute = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.CreateNoWindow = $true
  $p = [Diagnostics.Process]::Start($psi)
  $stdout = $p.StandardOutput.ReadToEndAsync()
  $stderr = $p.StandardError.ReadToEnd()
  $p.WaitForExit()
  [pscustomobject]@{ Code = $p.ExitCode; Output = ($stdout.Result + $stderr).Trim() }
}

function Publish-Site {
  $log = New-Object Collections.Generic.List[string]
  $run = {
    param([string[]]$a)
    $r = Invoke-Git $a
    $log.Add("> git $($a -join ' ')`n$($r.Output)")
    $r
  }
  & $run @('add', '-A', '--', 'index.html', 'panel/content.json', $UploadDir) | Out-Null
  $staged = & $run @('diff', '--cached', '--quiet')
  if ($staged.Code -ne 0) {
    $identity = @()
    if (-not (Invoke-Git @('config', 'user.name')).Output) { $identity = @('-c', 'user.name=Site Panel', '-c', 'user.email=panel@localhost') }
    $msg = 'Site update from panel ' + (Get-Date -Format 'yyyy-MM-dd HH:mm')
    $c = & $run ($identity + @('commit', '-m', $msg))
    if ($c.Code -ne 0) { return @{ ok = $false; step = 'commit'; log = $log } }
  }
  $pull = & $run @('pull', '--rebase', '--autostash')
  if ($pull.Code -ne 0) {
    Invoke-Git @('rebase', '--abort') | Out-Null
    return @{ ok = $false; step = 'pull'; log = $log }
  }
  $push = & $run @('push')
  if ($push.Code -ne 0) { return @{ ok = $false; step = 'push'; log = $log } }
  @{ ok = $true; log = $log }
}

function Send-Response($ctx, [int]$status, [string]$type, [byte[]]$bytes) {
  $res = $ctx.Response
  $res.StatusCode = $status
  $res.ContentType = $type
  $res.Headers.Add('Cache-Control', 'no-store')
  $res.ContentLength64 = $bytes.Length
  $res.OutputStream.Write($bytes, 0, $bytes.Length)
  $res.OutputStream.Close()
}

function Send-Json($ctx, [int]$status, $obj) {
  Send-Response $ctx $status 'application/json; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes(($obj | ConvertTo-Json -Depth 5 -Compress)))
}

function Read-Body($req) {
  $ms = New-Object IO.MemoryStream
  $req.InputStream.CopyTo($ms)
  $ms.ToArray()
}

function Resolve-SitePath([string]$rel) {
  $full = [IO.Path]::GetFullPath((Join-Path $Root $rel))
  if (-not $full.StartsWith($Root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { return $null }
  if ($full -match '\\\.git(\\|$)') { return $null }
  $full
}

function Handle-Request($ctx) {
  $req = $ctx.Request
  $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath)

  if ($path -eq '/__panel/status') { Send-Json $ctx 200 @{ panel = $true }; return }

  if ($req.HttpMethod -eq 'POST' -and $path -eq '/__panel/write') {
    $file = $req.QueryString['file']
    if ($WritableFiles -notcontains $file) { Send-Json $ctx 400 @{ ok = $false; error = 'File not allowed' }; return }
    $full = Resolve-SitePath $file
    [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($full)) | Out-Null
    [IO.File]::WriteAllBytes($full, (Read-Body $req))
    Send-Json $ctx 200 @{ ok = $true }
    return
  }

  if ($req.HttpMethod -eq 'POST' -and $path -eq '/__panel/upload') {
    $name = ([string]$req.QueryString['name']).ToLower() -replace '[^a-z0-9._-]', '-'
    if ($name -notmatch '^[a-z0-9][a-z0-9._-]*\.(jpg|jpeg|png|webp|gif)$') { Send-Json $ctx 400 @{ ok = $false; error = 'Bad file name' }; return }
    $full = Resolve-SitePath "$UploadDir/$name"
    [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($full)) | Out-Null
    [IO.File]::WriteAllBytes($full, (Read-Body $req))
    Write-Host "  Gorsel eklendi: $UploadDir/$name"
    Send-Json $ctx 200 @{ ok = $true; path = "$UploadDir/$name" }
    return
  }

  if ($req.HttpMethod -eq 'POST' -and $path -eq '/__panel/publish') {
    Write-Host '  Yayinlaniyor...'
    $result = Publish-Site
    if ($result.ok) { Write-Host '  Yayinlandi.' -ForegroundColor Green }
    else { Write-Host "  Yayinlama basarisiz ($($result.step)):`n$($result.log -join "`n")" -ForegroundColor Red }
    Send-Json $ctx 200 $result
    return
  }

  if ($req.HttpMethod -ne 'GET' -and $req.HttpMethod -ne 'HEAD') { Send-Json $ctx 405 @{ error = 'Method not allowed' }; return }

  if ($path -eq '/') {
    $ctx.Response.Redirect('/editor.html')
    $ctx.Response.Close()
    return
  }

  $full = Resolve-SitePath $path.TrimStart('/')
  if (-not $full -or -not [IO.File]::Exists($full)) {
    Send-Response $ctx 404 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('Not found'))
    return
  }
  $type = $MimeTypes[[IO.Path]::GetExtension($full).ToLower()]
  if (-not $type) { $type = 'application/octet-stream' }
  Send-Response $ctx 200 $type ([IO.File]::ReadAllBytes($full))
}

# --- startup ---
Write-Host ''
Write-Host '  PORTFOLYO DUZENLEME PANELI' -ForegroundColor Red
Write-Host '  -------------------------'

# If the panel is already running, just open it again.
try {
  $existing = Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 "http://localhost:$StartPort/__panel/status"
  if ($existing.Content -match 'panel') {
    Start-Process "http://localhost:$StartPort/editor.html"
    exit 0
  }
} catch {}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host '  Git bulunamadi. Lutfen https://git-scm.com adresinden Git kurun.' -ForegroundColor Red
  exit 1
}

Write-Host '  Son surum indiriliyor...'
$pull = Invoke-Git @('pull', '--rebase', '--autostash')
if ($pull.Code -ne 0) { Write-Host "  Uyari: guncelleme alinamadi (internet?).`n$($pull.Output)" -ForegroundColor Yellow }

$listener = $null
for ($port = $StartPort; $port -lt $StartPort + 10; $port++) {
  $candidate = New-Object Net.HttpListener
  $candidate.Prefixes.Add("http://localhost:$port/")
  try { $candidate.Start(); $listener = $candidate; break } catch { $candidate.Close() }
}
if (-not $listener) { Write-Host '  Bos port bulunamadi.' -ForegroundColor Red; exit 1 }

$url = "http://localhost:$port/editor.html"
Write-Host "  Panel acildi: $url" -ForegroundColor Green
Write-Host '  Duzenleme bitene kadar bu pencereyi KAPATMAYIN.'
Write-Host ''
if (-not $NoBrowser) { Start-Process $url }

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  try { Handle-Request $ctx }
  catch {
    Write-Host "  Hata: $($_.Exception.Message)" -ForegroundColor Red
    try { Send-Json $ctx 500 @{ ok = $false; error = $_.Exception.Message } } catch {}
  }
}
