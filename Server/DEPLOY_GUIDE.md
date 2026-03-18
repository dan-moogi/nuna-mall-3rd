# Nuna Mall 3rd — 배포 가이드

## 배포 순서 요약

```
1. MongoDB Atlas 마이그레이션
2. Railway 배포 (백엔드)
3. Vercel 배포 (프론트엔드)
4. Railway CLIENT_URL 업데이트 → Redeploy
5. Vercel VITE_API_URL 업데이트 → Redeploy
6. 관리자 계정 생성
```

---

## 1. MongoDB Atlas 마이그레이션

### Atlas 클러스터 생성
1. [MongoDB Atlas](https://cloud.mongodb.com) 접속 → 무료 클러스터 생성
2. Database Access → 사용자 추가 (`nuna_admin` / 비밀번호 설정)
3. Network Access → `0.0.0.0/0` (Any IP) 허용
4. Connect → "Connect your application" → Connection String 복사

### Server/.env에 임시 추가
```
MONGODB_ATLAS_URI=mongodb+srv://nuna_admin:비밀번호@nuna-mall.xxxxx.mongodb.net/nuna_mall
```

### 마이그레이션 실행
```bash
cd Server
npm run migrate
```
완료 출력 예시:
```
✅ products: 595개 완료 / 0개 스킵
✅ users: 1개 완료 / 0개 스킵
🎉 Atlas 마이그레이션 완료!
```

---

## 2. Railway 배포 (백엔드)

### 프로젝트 설정
- **Root Directory**: `Server`
- **Start Command**: `npm start`
- **Node Version**: 18 이상

### 환경변수 (Railway → Variables)

| 변수명 | 값 |
|--------|-----|
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas Connection String |
| `JWT_SECRET` | 로컬과 동일한 값 |
| `JWT_REFRESH_SECRET` | 로컬과 동일한 값 |
| `JWT_EXPIRES_IN` | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |
| `CLIENT_URL` | Vercel 배포 후 입력 (예: `https://nuna-mall.vercel.app`) |
| `INICIS_MID` | 이니시스 운영 MID |
| `INICIS_SIGNKEY` | 이니시스 운영 사인키 |
| `INICIS_API_URL` | `https://iniapi.inicis.com/api/v1/refund` |
| `ADMIN_EMAIL` | 관리자 이메일 |
| `ADMIN_PASSWORD` | 관리자 비밀번호 |
| `ADMIN_NAME` | 관리자 이름 |
| `SENTRY_DSN` | (선택) Sentry DSN |
| `EMAIL_USER` | (선택) Gmail 주소 |
| `EMAIL_PASS` | (선택) Gmail 앱 비밀번호 |

### Railway 배포 후
Railway에서 발급된 URL 복사 (예: `https://nuna-mall-server.railway.app`)

---

## 3. Vercel 배포 (프론트엔드)

### 프로젝트 설정
- **Root Directory**: `Client`
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 환경변수 (Vercel → Settings → Environment Variables)

| 변수명 | 값 |
|--------|-----|
| `VITE_API_URL` | `https://nuna-mall-server.railway.app/api` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name |

### Vercel 배포 후
Vercel에서 발급된 URL 복사 (예: `https://nuna-mall.vercel.app`)

---

## 4. 크로스 URL 업데이트

### Railway CLIENT_URL 업데이트
Railway Variables → `CLIENT_URL` = `https://nuna-mall.vercel.app` → **Redeploy**

### Vercel VITE_API_URL 확인
이미 Railway URL로 설정했으면 재배포 불필요.

---

## 5. 관리자 계정 생성

Railway 배포 완료 후 Railway Shell에서 실행:
```bash
npm run create-admin
```

---

## 6. 이니시스 결제 연동

### 테스트 → 운영 전환
1. 이니시스 가맹점 심사 완료 후 운영 MID/사인키 발급
2. `Client/src/hooks/usePayment.js` 내 `inicisUrl` 운영 URL로 변경:
   ```js
   // 테스트
   const inicisUrl = 'https://stgstdpay.inicis.com/stdjs/INIStdPay.js'
   // 운영
   const inicisUrl = 'https://stdpay.inicis.com/stdjs/INIStdPay.js'
   ```
3. Railway `INICIS_MID`, `INICIS_SIGNKEY` 운영값으로 업데이트

---

## 7. 로컬 개발 환경 재시작

```bash
# 터미널 1 — 서버
cd Server && npm run dev

# 터미널 2 — 클라이언트
cd Client && npm run dev
```

---

## 8. 트러블슈팅

| 증상 | 원인 | 해결 |
|------|------|------|
| API 401 Unauthorized | JWT_SECRET 불일치 | Railway 환경변수 확인 |
| CORS 오류 | CLIENT_URL 미설정 | Railway CLIENT_URL 업데이트 후 Redeploy |
| 이미지 안 보임 | Cloudinary 미연결 | CLOUDINARY_* 변수 확인 |
| 결제 실패 | 이니시스 MID 오류 | 테스트/운영 MID 구분 확인 |
| 상품 0개 | Atlas 마이그레이션 미완료 | `npm run migrate` 재실행 |
