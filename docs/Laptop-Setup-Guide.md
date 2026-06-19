# Cursor 랩탑 설치·세팅 가이드 — AI Portfolio

> **문서 버전:** v1.0  
> **작성일:** 2026년 6월  
> **프로젝트:** 2027년 이직 프로젝트 — B2B Hardware Marketing Manager 포트폴리오 사이트  
> **관련 저장소:** https://github.com/ledlaputa72/Portfolio.git  
> **작업 브랜치:** `claude/gracious-wozniak-g7ld41`  
> **데스크탑 경로 (참고):** `D:\New Steve\AI Portfolio`

---

## 문서 목적

데스크탑에서 작업 중인 **Cursor + GitHub + Google Drive MCP** 환경을 **랩탑에서 빠르게 동일하게** 구성하기 위한 가이드입니다.

코드는 **GitHub**가 기준이고, 기획·콘텐츠는 **Google Drive**가 기준입니다.  
랩탑에서는 프로젝트 폴더를 USB로 복사할 필요 없이 **clone + 자동 설치 스크립트**만 실행하면 됩니다.

---

## 1. 한눈에 보기

| 항목 | 데스크탑 | 랩탑 |
|------|----------|------|
| 코드 동기화 | GitHub push | GitHub pull |
| 기획·콘텐츠 | Google Drive | Google Drive (동일) |
| `node_modules` | 로컬 설치 | 로컬 설치 (각 PC마다) |
| OAuth 토큰 | `%APPDATA%` | `%APPDATA%` (PC마다 `auth` 1회) |
| GCP OAuth 클라이언트 | 1회 생성 | **재사용** (JSON만 복사) |

---

## 2. 사전 준비 (랩탑, 약 10분)

### 2-1. 프로그램 설치

| 프로그램 | 다운로드 | 확인 명령 |
|----------|----------|-----------|
| **Git** | https://git-scm.com/download/win | `git --version` |
| **Node.js 20+** | https://nodejs.org | `node --version` |
| **Cursor** | https://cursor.com | 앱 실행 후 로그인 (데스크탑과 **같은 계정**) |

### 2-2. OAuth credentials 복사 (데스크탑 → 랩탑)

Google Cloud Console 설정은 **데스크탑에서 이미 완료**되었습니다.  
랩탑에서는 아래 파일 **하나만** 가져오면 됩니다.

**데스크탑 경로:**

```
C:\Users\Sales\AppData\Roaming\mcp-server-google-drive\oauth-credentials.json
```

**가져오는 방법 (택 1):**

- USB / 외장 SSD 복사
- Google Cloud Console → Credentials → `Cursor MCP Google Drive` → **Download JSON** (재다운로드)
- Google Drive `Cursor-랩탑-세팅-가이드` 폴더에 업로드해 두었다면 다운로드

> ⚠️ `tokens.json`은 PC마다 다릅니다. 복사하지 말고 랩탑에서 `auth`로 새로 발급하세요.

---

## 3. 자동 설치 (권장)

### 3-1. Repo 클론

PowerShell:

```powershell
# 원하는 경로 (OneDrive 밖 권장)
mkdir "D:\Projects" -Force
cd "D:\Projects"
git clone https://github.com/ledlaputa72/Portfolio.git "AI Portfolio"
cd "AI Portfolio"
git checkout claude/gracious-wozniak-g7ld41
```

### 3-2. 배치 파일 실행 (더블클릭)

탐색기에서 아래 파일을 **더블클릭**:

```
AI Portfolio\scripts\setup-laptop.bat
```

또는 PowerShell:

```powershell
cd "D:\Projects\AI Portfolio"
.\scripts\setup-laptop.bat
```

### 3-3. OAuth JSON 경로 지정 (처음 1회)

credentials 파일을 Downloads에 두었다면:

```powershell
.\scripts\setup-laptop.ps1 -CredentialsPath "$HOME\Downloads\client_secret_XXXXX.json"
```

### 3-4. 스크립트가 자동으로 하는 일

1. Git / Node.js / npm 설치 확인  
2. `git pull` + 올바른 브랜치 checkout  
3. `npm install`  
4. `%APPDATA%\mcp-server-google-drive\` 폴더 생성  
5. OAuth JSON 복사 (경로 지정 시)  
6. `.cursor/mcp.json` — **현재 Windows 사용자 경로**로 자동 생성  
7. Google OAuth `auth` 실행 (토큰 없을 때, 브라우저 열림)  
8. 완료 후 Cursor에서 할 일 안내  

### 3-5. 스크립트 옵션

```powershell
.\scripts\setup-laptop.ps1 -Help

# 예시
.\scripts\setup-laptop.ps1 -CredentialsPath "$HOME\Downloads\client_secret_XXX.json"
.\scripts\setup-laptop.ps1 -SkipAuth          # auth 건너뛰기
.\scripts\setup-laptop.ps1 -StartDev          # 설치 후 dev server 실행
.\scripts\setup-laptop.ps1 -ProjectPath "E:\Work\AI Portfolio"
```

---

## 4. Cursor에서 마무리 (2분)

1. **File → Open Folder** → 랩탑의 `AI Portfolio` 폴더  
2. **Settings → Tools & MCP**  
3. `google-drive` 토글 **On**  
4. **Connected** + **27 tools enabled** 확인  
5. Agent 채팅 테스트:

```
Google Drive에서 "2027년 이직 프로젝트" 폴더를 검색하고 파일 목록을 보여줘.
```

6. 개발 서버:

```powershell
npm run dev
```

브라우저: http://localhost:3000

---

## 5. 매일 작업 루틴 (데스크탑·랩탑 공통)

### 시작 전

```powershell
git pull origin claude/gracious-wozniak-g7ld41
npm install   # package.json 변경 시에만
npm run dev
```

### 작업 후

```powershell
git add -A
git commit -m "작업 내용 설명"
git push origin claude/gracious-wozniak-g7ld41
```

### PC를 바꿀 때

다른 PC 또는 Claude Code(웹)에:

> "○○에서 작업했으니 pull하고 이어서 진행해줘"

---

## 6. 수동 설치 (스크립트 없이)

자동 스크립트가 실패할 때만 참고하세요.

```powershell
cd "D:\Projects\AI Portfolio"
git pull origin claude/gracious-wozniak-g7ld41
npm install

# Google Drive MCP
New-Item -ItemType Directory -Force -Path "$env:APPDATA\mcp-server-google-drive"
Copy-Item "$HOME\Downloads\client_secret_XXX.json" "$env:APPDATA\mcp-server-google-drive\oauth-credentials.json"
.\scripts\setup-google-drive-mcp.ps1 -Auth
.\scripts\setup-laptop.ps1 -SkipClone -SkipInstall -SkipAuth   # mcp.json 경로만 갱신
```

상세 MCP 설정: `docs/Google-Drive-MCP-Setup.md`  
AI 도구 역할·협업 규칙: `docs/AI-Tools-Workflow.md`

---

## 7. 문제 해결

| 증상 | 해결 |
|------|------|
| `git` / `node` 명령 없음 | Git, Node.js 설치 후 **터미널 재시작** |
| `google-drive` MCP 없음 | 올바른 프로젝트 폴더를 Cursor에서 열었는지 확인 → Reload Window |
| OAuth credentials not found | `-CredentialsPath`로 JSON 경로 지정 후 스크립트 재실행 |
| Access blocked | GCP → OAuth consent screen → Test users에 본인 이메일 추가 |
| push 충돌 | `git pull` 후 충돌 해결 → 다시 push |
| dev server 느림 (첫 실행) | `.next` 삭제 후 `npm run dev` 재실행 |
| 토큰 만료 (Testing mode) | `npx @ibarcarty/mcp-server-google-drive auth` |

---

## 8. 체크리스트

- [ ] Git, Node.js 20+, Cursor 설치
- [ ] Repo clone + 브랜치 `claude/gracious-wozniak-g7ld41`
- [ ] `setup-laptop.bat` 또는 `setup-laptop.ps1` 실행
- [ ] OAuth JSON 복사 + `auth` 완료
- [ ] Cursor에서 `google-drive` MCP Connected
- [ ] `npm run dev` → localhost:3000 확인
- [ ] `git pull` / `git push` 테스트

---

## 9. 관련 링크

| 항목 | URL |
|------|-----|
| GitHub Repo | https://github.com/ledlaputa72/Portfolio.git |
| Google Drive 프로젝트 폴더 | https://drive.google.com/drive/folders/1xno61id18Gvg8t87okwmF9JOAsTVbSH3 |
| Google Drive 세팅 가이드 폴더 | Drive → `2027년 이직 프로젝트 (with AI)` → `Cursor-랩탑-세팅-가이드` |
