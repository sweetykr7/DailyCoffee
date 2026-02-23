# 배포 런북

## 사전 요구사항

- Docker 24.x 이상
- Docker Compose v2
- Git
- 도메인 (선택)
- Ubuntu 22.04 LTS 권장 (VPS)

---

## 1. 서버 초기 세팅

```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Docker Compose v2 확인
docker compose version
```

---

## 2. 프로젝트 클론

```bash
git clone https://github.com/sweetykr7/DailyCoffee.git
cd DailyCoffee
```

---

## 3. 환경 변수 설정

```bash
cp .env.example .env
vi .env
```

`.env` 필수 설정값:

```env
# DB
POSTGRES_DB=dailycoffee
POSTGRES_USER=dailycoffee
POSTGRES_PASSWORD=<강력한_비밀번호>

# JWT
JWT_SECRET=<랜덤_64자_문자열>
JWT_REFRESH_SECRET=<랜덤_64자_문자열>

# API URL (실제 도메인으로 변경)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

JWT 시크릿 생성:
```bash
openssl rand -base64 64
```

---

## 4. docker-compose.yml 프로덕션 설정 확인

```bash
cat docker-compose.yml
```

포트 변경 필요 시 (기본값):
- 프론트엔드: `5001:3000`
- 백엔드: `5002:4000`
- PostgreSQL: `5433:5432` (외부 노출 비권장, 내부 통신만 사용)

---

## 5. 첫 배포

```bash
# 빌드 및 시작 (백그라운드)
docker compose up --build -d

# 로그 확인
docker compose logs -f

# 모든 컨테이너 상태 확인
docker compose ps
```

---

## 6. DB 마이그레이션 및 시드

```bash
# 스키마 적용
docker compose exec backend npx prisma db push

# 시드 데이터 투입 (초기 1회)
docker compose exec backend npx ts-node prisma/seed.ts
```

---

## 7. Nginx 리버스 프록시 (도메인 사용 시)

```bash
sudo apt install nginx -y
```

`/etc/nginx/sites-available/dailycoffee`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 프론트엔드
    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.yourdomain.com;

    # 백엔드 API
    location / {
        proxy_pass http://localhost:5002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/dailycoffee /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. SSL 인증서 (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

자동 갱신 확인:
```bash
sudo certbot renew --dry-run
```

---

## 9. 업데이트 배포

```bash
cd /path/to/DailyCoffee
git pull origin main
docker compose up --build -d
```

---

## 10. 운영 명령어

```bash
# 전체 재시작
docker compose restart

# 특정 서비스만 재시작
docker compose restart backend
docker compose restart frontend

# 로그 실시간 조회
docker compose logs -f
docker compose logs -f backend

# DB 백업
docker compose exec db pg_dump -U dailycoffee dailycoffee > backup_$(date +%Y%m%d).sql

# DB 복구
cat backup_20260223.sql | docker compose exec -T db psql -U dailycoffee dailycoffee

# 전체 종료
docker compose down

# 볼륨 포함 전체 삭제 (주의: DB 데이터 삭제됨)
docker compose down -v
```

---

## 11. 헬스체크

```bash
# API 상태 확인
curl https://api.yourdomain.com/api/health

# 기대 응답
# {"success":true,"data":{"status":"ok","timestamp":"..."}}
```

---

## 12. 트러블슈팅

### 백엔드 시작 실패
```bash
docker compose logs backend
# Prisma OpenSSL 오류 → Dockerfile에 apk add openssl libc6-compat 확인
```

### 프론트엔드 이미지 빌드 실패
```bash
# NEXT_PUBLIC_API_URL이 빌드 시 ARG로 전달되는지 확인
# docker-compose.yml의 build.args 섹션 확인
```

### DB 연결 실패
```bash
docker compose exec backend npx prisma db pull
# DATABASE_URL 환경 변수 확인
```
