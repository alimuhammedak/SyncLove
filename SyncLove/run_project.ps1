# 1. Eski süreçleri temizle
Write-Host "Eski surecler temizleniyor..." -ForegroundColor Yellow
Stop-Process -Name dotnet, node -Force -ErrorAction SilentlyContinue

# 2. Veritabanını Başlat (Docker)
Write-Host "Veritabani baslatiliyor..." -ForegroundColor Cyan
docker-compose up -d

# 3. Bağımlılıkları tazele
Write-Host "Bagimliliklar kontrol ediliyor..." -ForegroundColor Cyan
dotnet restore

# 4. Backend'i Başlat (Yeni Pencere)
Write-Host "Backend (API) baslatiliyor..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location src/SyncLove.Api; dotnet watch run"

# 5. Frontend'i Başlat (Bu Pencere)
Write-Host "Frontend (Web) baslatiliyor..." -ForegroundColor Cyan
Set-Location src/SyncLove.Web
npm run dev
