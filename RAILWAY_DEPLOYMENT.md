# Plane Türkçe - Railway Deployment Rehberi

Bu rehber, Plane'in Türkçeleştirilmiş versiyonunu Railway'de deploy etmenizi sağlar.

## Gereksinimler

- Railway hesabı (https://railway.app)
- GitHub hesabı
- S3 uyumlu depolama (Cloudflare R2, AWS S3, veya MinIO)

## Mimari Genel Bakış

Plane aşağıdaki servislerden oluşur:

| Servis | Açıklama | Port |
|--------|----------|------|
| **web** | Ana frontend uygulaması | 3000 |
| **api** | Django backend API | 8000 |
| **admin** | Yönetim paneli | 3001 |
| **space** | Herkese açık paylaşım | 3002 |
| **live** | Gerçek zamanlı işbirliği | 3100 |
| **worker** | Arka plan işleri (Celery) | - |
| **beat** | Zamanlanmış görevler | - |

## Adım 1: Railway Projesini Oluşturun

1. Railway Dashboard'a gidin: https://railway.app/dashboard
2. "New Project" butonuna tıklayın
3. "Empty Project" seçin

## Adım 2: Veritabanı Servislerini Ekleyin

### PostgreSQL
1. Projenizde "+ New" butonuna tıklayın
2. "Database" → "PostgreSQL" seçin
3. Railway otomatik olarak DATABASE_URL oluşturacak

### Redis
1. "+ New" → "Database" → "Redis" seçin
2. Railway otomatik olarak REDIS_URL oluşturacak

## Adım 3: API Servisini Deploy Edin

1. "+ New" → "GitHub Repo" → Bu repoyu seçin
2. Servis ayarlarında:
   - **Root Directory**: `apps/api`
   - **Dockerfile Path**: `Dockerfile.api`
   - **Start Command**: `./bin/docker-entrypoint-api.sh`

3. Environment Variables ekleyin:
```env
# Database (Railway PostgreSQL'den otomatik)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (Railway Redis'ten otomatik)
REDIS_URL=${{Redis.REDIS_URL}}

# Temel Ayarlar
DEBUG=0
SECRET_KEY=<güçlü-rastgele-anahtar-oluşturun>
GUNICORN_WORKERS=2

# URL Ayarları (Railway domain'lerinizi kullanın)
WEB_URL=https://<web-servis>.railway.app
ADMIN_BASE_URL=https://<admin-servis>.railway.app
SPACE_BASE_URL=https://<space-servis>.railway.app
LIVE_BASE_URL=https://<live-servis>.railway.app

# CORS
CORS_ALLOWED_ORIGINS=https://<web-servis>.railway.app,https://<admin-servis>.railway.app,https://<space-servis>.railway.app

# S3 Depolama (Cloudflare R2 örneği)
USE_MINIO=0
AWS_REGION=auto
AWS_ACCESS_KEY_ID=<r2-access-key>
AWS_SECRET_ACCESS_KEY=<r2-secret-key>
AWS_S3_ENDPOINT_URL=https://<account-id>.r2.cloudflarestorage.com
AWS_S3_BUCKET_NAME=plane-uploads
FILE_SIZE_LIMIT=5242880
SIGNED_URL_EXPIRATION=3600

# Live Server
LIVE_SERVER_SECRET_KEY=<güçlü-rastgele-anahtar>

# API Rate Limit
API_KEY_RATE_LIMIT=60/minute
```

## Adım 4: Worker Servisini Deploy Edin

1. "+ New" → "GitHub Repo" → Aynı repo
2. Servis ayarlarında:
   - **Root Directory**: `apps/api`
   - **Dockerfile Path**: `Dockerfile.api`
   - **Start Command**: `./bin/docker-entrypoint-worker.sh`

3. API ile aynı environment variables kullanın (Variables → Share ile)

## Adım 5: Beat Worker Servisini Deploy Edin

1. "+ New" → "GitHub Repo" → Aynı repo
2. Servis ayarlarında:
   - **Root Directory**: `apps/api`
   - **Dockerfile Path**: `Dockerfile.api`
   - **Start Command**: `./bin/docker-entrypoint-beat.sh`

3. API ile aynı environment variables kullanın

## Adım 6: Web Frontend'i Deploy Edin

1. "+ New" → "GitHub Repo" → Aynı repo
2. Servis ayarlarında:
   - **Root Directory**: `.` (root)
   - **Dockerfile Path**: `apps/web/Dockerfile.web`

3. Environment Variables:
```env
VITE_API_BASE_URL=https://<api-servis>.railway.app
VITE_ADMIN_BASE_URL=https://<admin-servis>.railway.app
VITE_ADMIN_BASE_PATH=/god-mode
VITE_SPACE_BASE_URL=https://<space-servis>.railway.app
VITE_SPACE_BASE_PATH=/spaces
VITE_LIVE_BASE_URL=https://<live-servis>.railway.app
VITE_LIVE_BASE_PATH=/live
```

## Adım 7: Admin Panelini Deploy Edin

1. "+ New" → "GitHub Repo" → Aynı repo
2. Servis ayarlarında:
   - **Root Directory**: `.`
   - **Dockerfile Path**: `apps/admin/Dockerfile.admin`

3. Web ile aynı environment variables kullanın

## Adım 8: Space Servisini Deploy Edin

1. "+ New" → "GitHub Repo" → Aynı repo
2. Servis ayarlarında:
   - **Root Directory**: `.`
   - **Dockerfile Path**: `apps/space/Dockerfile.space`

3. Web ile aynı environment variables kullanın

## Adım 9: Live Servisini Deploy Edin

1. "+ New" → "GitHub Repo" → Aynı repo
2. Servis ayarlarında:
   - **Root Directory**: `.`
   - **Dockerfile Path**: `apps/live/Dockerfile.live`

3. Environment Variables:
```env
LIVE_SERVER_SECRET_KEY=<api-ile-aynı-secret-key>
REDIS_URL=${{Redis.REDIS_URL}}
```

## Adım 10: Migrator'ı Çalıştırın (Bir Kerelik)

API servisi deploy olduktan sonra, veritabanı migration'larını çalıştırın:

1. API servisine gidin
2. "Settings" → "Deploy" → "Start Command" bölümüne geçici olarak şunu yazın:
   ```
   ./bin/docker-entrypoint-migrator.sh
   ```
3. Deploy edin ve logları izleyin
4. Migration tamamlandıktan sonra start command'ı geri alın:
   ```
   ./bin/docker-entrypoint-api.sh
   ```

## Adım 11: Domain Ayarları

Her servis için Railway'de custom domain veya Railway subdomain kullanın:

1. Servis → Settings → Networking → Generate Domain
2. Veya custom domain ekleyin

## Cloudflare R2 Kurulumu

1. Cloudflare Dashboard → R2 → Create Bucket
2. Bucket adı: `plane-uploads`
3. R2 → Overview → Manage R2 API Tokens → Create API Token
4. Token'ı `AWS_ACCESS_KEY_ID` ve `AWS_SECRET_ACCESS_KEY` olarak kullanın
5. Account ID'yi endpoint URL'de kullanın

## CORS Ayarları (R2)

R2 bucket'ınız için CORS kuralları ekleyin:
```json
[
  {
    "AllowedOrigins": ["https://<web-servis>.railway.app"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## Sorun Giderme

### Logları Kontrol Edin
- Railway Dashboard → Servis → Deployments → View Logs

### Yaygın Hatalar

1. **Database bağlantı hatası**: DATABASE_URL'in doğru olduğundan emin olun
2. **Redis bağlantı hatası**: REDIS_URL'in doğru olduğundan emin olun
3. **CORS hatası**: CORS_ALLOWED_ORIGINS'i kontrol edin
4. **S3 hatası**: AWS credentials ve endpoint'i kontrol edin

### Health Check
- API: `https://<api-servis>.railway.app/api/v1/health/`
- Web: `https://<web-servis>.railway.app/`

## Maliyet Tahmini

Railway'de bu yapılandırma için tahmini aylık maliyet:
- PostgreSQL: ~$5-10
- Redis: ~$5-10
- 7 Servis (web, api, admin, space, live, worker, beat): ~$20-40
- **Toplam**: ~$30-60/ay (kullanıma göre değişir)

## Güvenlik Notları

1. `SECRET_KEY` ve `LIVE_SERVER_SECRET_KEY` için güçlü rastgele değerler kullanın
2. Production'da `DEBUG=0` olduğundan emin olun
3. CORS ayarlarını sadece gerekli domain'lerle sınırlayın
4. S3 credentials'ı güvenli tutun

## Destek

Sorularınız için:
- Plane Docs: https://docs.plane.so
- GitHub Issues: https://github.com/makeplane/plane/issues
