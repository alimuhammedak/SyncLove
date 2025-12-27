# 1. Eski süreçleri temizle
Write-Host "Eski süreçler temizleniyor..." -ForegroundColor Yellow
Stop-Process -Name dotnet, node -Force -ErrorAction SilentlyContinue

# 2. Veritabanını Başlat (Docker)
Write-Host "Veritabanı başlatılıyor..." -ForegroundColor Cyan
docker-compose up -d

# 3. Bağımlılıkları tazele
Write-Host "Bağımlılıklar kontrol ediliyor..." -ForegroundColor Cyan
dotnet restore

# 4. Backend'i Başlat (Yeni Pencere)
Write-Host "Backend (API) başlatılıyor..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location src/SyncLove.Api; dotnet watch run"

# 5. Frontend'i Başlat (Bu Pencere)
Write-Host "Frontend (Web) başlatılıyor..." -ForegroundColor Cyan
Set-Location src/SyncLove.Web
npm run dev
