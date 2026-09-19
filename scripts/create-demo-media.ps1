param(
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)
$ErrorActionPreference = "Stop"
Set-Location $RepoRoot
$ffmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpeg) { throw "ffmpeg is required. Install ffmpeg and make sure 'ffmpeg' is available on PATH." }
$python = Join-Path $RepoRoot "backend\.venv\Scripts\python.exe"
if (-not (Test-Path $python)) { throw "Backend virtual environment not found at $python" }
$root = Join-Path $RepoRoot "private_media"
New-Item -ItemType Directory -Force -Path $root | Out-Null

$demo = @(
  @{ Id = 4; Title = "Maya V. - Demo Session"; Color = "0x18243a"; Key = "creators/4/c354f2fcebd241628fcae42b30bcbf77.mp4" },
  @{ Id = 5; Title = "Luna K. - Demo Session"; Color = "0x2b1835"; Key = "creators/5/57d4682690b74a6c93d540454ae6d79a.mp4" },
  @{ Id = 6; Title = "Aria R. - Demo Session"; Color = "0x16332e"; Key = "creators/6/8992044867704a29a92b52dfb79f191f.mp4" },
  @{ Id = 7; Title = "Nova S. - Demo Session"; Color = "0x342b16"; Key = "creators/7/07fac43d3e9f4062ad516f20f0a1035d.mp4" }
)
foreach ($item in $demo) {
  $relative = $item.Key -replace '/', [IO.Path]::DirectorySeparatorChar
  $target = Join-Path $root $relative
  New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
  ffmpeg -hide_banner -loglevel error -y -f lavfi -i "color=c=$($item.Color):s=1280x720:r=30" -f lavfi -i "sine=frequency=440:sample_rate=48000" -t 8 -vf "drawtext=text='$($item.Title)':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2,drawtext=text='LOLLIPOP DEVELOPMENT DEMO':fontcolor=white@0.65:fontsize=22:x=(w-text_w)/2:y=h-80" -c:v libx264 -pix_fmt yuv420p -preset veryfast -movflags +faststart -c:a aac -b:a 96k $target
  if ($LASTEXITCODE -ne 0) { throw "ffmpeg failed for $($item.Title)" }
  Write-Host "Created $target" -ForegroundColor Green
}
@'
from pathlib import Path
import hashlib
from backend.app.db import SessionLocal
from backend.app.entities import Media
db = SessionLocal()
try:
    for media in db.query(Media).filter(Media.id.in_([1, 2, 3, 4])).all():
        path = Path("private_media") / Path(media.storage_key)
        if not path.is_file(): raise FileNotFoundError(path)
        media.size_bytes = path.stat().st_size
        media.checksum_sha256 = hashlib.sha256(path.read_bytes()).hexdigest()
        media.status = "PUBLISHED"
        media.access_level = "PUBLIC"
    db.commit()
finally:
    db.close()
'@ | & $python
Write-Host "Demo media is now backed by real H.264/AAC MP4 files." -ForegroundColor Cyan
