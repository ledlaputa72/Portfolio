# Google Drive MCP 설정 가이드 — Cursor (로컬)

> **목적:** Google Drive Desktop 없이 Cursor에서 Google Drive · Docs · Sheets · Slides를 **읽기/쓰기/생성/삭제**  
> **프로젝트:** `D:\New Steve\AI Portfolio`  
> **MCP 서버:** [`@ibarcarty/mcp-server-google-drive`](https://github.com/ibarcarty/mcp-server-google-drive) v1.1.1  
> **설정 파일:** `.cursor/mcp.json`

---

## 1. 선택한 MCP 서버와 기능 범위

Claude Code(웹)의 Drive 연동보다 **기능이 넓습니다.** Cursor에서 아래 작업이 모두 가능합니다.

### Google Drive (파일/폴더)

| 기능 | MCP 도구 | 지원 |
|------|----------|------|
| 목록/검색 | `drive_list_files`, `drive_search` | ✅ |
| 읽기 | `drive_read_file` | ✅ |
| 생성 | `drive_create_file`, `drive_create_folder` | ✅ |
| 수정/이름 변경 | `drive_update_file` | ✅ |
| 삭제 | `drive_delete_file` | ✅ |
| 이동/복사 | `drive_move_file`, `drive_copy_file` | ✅ |
| 공유/권한 | `drive_share`, `drive_list_permissions`, `drive_remove_permission` | ✅ |

### Google Sheets

| 기능 | MCP 도구 | 지원 |
|------|----------|------|
| 읽기 | `sheets_read_range` | ✅ |
| 쓰기 | `sheets_write_range` | ✅ |
| 행 추가 | `sheets_append_rows` | ✅ |
| 범위 삭제(값) | `sheets_clear_range` | ✅ |

> **참고:** 시트 **탭(워크시트) 생성/삭제**는 Sheets API `batchUpdate`로 가능하지만, 이 MCP에는 전용 도구가 없습니다. Drive에서 스프레드시트 파일 자체는 생성·삭제 가능합니다.

### Google Docs

| 기능 | MCP 도구 | 지원 |
|------|----------|------|
| 읽기 | `docs_read` | ✅ |
| 텍스트 추가/삽입/치환 | `docs_append_text`, `docs_insert_text`, `docs_replace_text` | ✅ |
| Markdown → Docs | `docs_write_markdown` | ✅ |
| 테마/템플릿 | `docs_apply_theme`, `docs_apply_corporate_template` | ✅ |

### Google Slides

| 기능 | MCP 도구 | 지원 |
|------|----------|------|
| 읽기 | `slides_read` | ✅ |
| 슬라이드 추가 | `slides_add_slide` | ✅ |
| 텍스트 추가/치환 | `slides_add_text`, `slides_replace_text` | ✅ |

### Claude Code(웹)와 비교

| | Claude Code (웹) | Cursor + 이 MCP |
|---|-----------------|-----------------|
| 파일 읽기 | ✅ | ✅ |
| 새 파일 생성 | ✅ | ✅ |
| 파일 복사 | ✅ | ✅ |
| **기존 파일 수정** | ❌ (새 파일로 대체) | ✅ |
| **파일/폴더 삭제** | ❌ | ✅ |
| **폴더 생성** | ❌ | ✅ |
| **Sheets 쓰기** | 제한적 | ✅ |

---

## 2. 사전 요건

- **Node.js 20+** (현재: v24.x 확인됨)
- **Google 계정** (Drive에 접근할 계정)
- **Google Cloud Console** 접근 권한
- **Cursor** 최신 버전

---

## 3. Google Cloud Console 설정 (1회, 약 15분)

### 3-1. 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 상단 프로젝트 선택 → **새 프로젝트**
3. 이름 예: `MCP Google Drive Portfolio`

### 3-2. API 4개 활성화

**APIs & Services → Library**에서 각각 검색 후 **Enable**:

1. **Google Drive API**
2. **Google Docs API**
3. **Google Sheets API**
4. **Google Slides API**

### 3-3. OAuth 동의 화면

**APIs & Services → OAuth consent screen**

1. User Type: **External** (개인 Gmail) 또는 **Internal** (Workspace 조직 내부만)
2. 앱 이름: `MCP Google Drive Portfolio`
3. User support email / Developer contact: 본인 이메일
4. **Scopes** → Add or Remove Scopes:
   - `https://www.googleapis.com/auth/drive` (전체 Drive 접근 — Docs/Sheets/Slides 포함)
5. **Test users** → 본인 Google 이메일 추가
6. 저장

> **Testing mode:** 테스트 사용자 100명까지, 토큰 7일 만료 가능. 개인 사용에는 충분합니다. 만료 시 `auth` 명령 재실행.

### 3-4. OAuth 클라이언트 ID 생성

**APIs & Services → Credentials → Create Credentials → OAuth client ID**

1. Application type: **Desktop app**
2. Name: `Cursor MCP Google Drive`
3. **Create** → **Download JSON**

### 3-5. credentials 파일 배치

PowerShell에서 실행:

```powershell
# 폴더 생성
New-Item -ItemType Directory -Force -Path "$env:APPDATA\mcp-server-google-drive"

# 다운로드한 JSON 이동 (파일명은 실제 다운로드명에 맞게 수정)
Move-Item "$HOME\Downloads\client_secret_*.json" `
  "$env:APPDATA\mcp-server-google-drive\oauth-credentials.json"
```

또는 프로젝트 스크립트 사용:

```powershell
cd "D:\New Steve\AI Portfolio"
.\scripts\setup-google-drive-mcp.ps1 -CredentialsPath "$HOME\Downloads\client_secret_XXXXX.json"
```

---

## 4. OAuth 인증 (1회)

터미널에서:

```powershell
cd "D:\New Steve\AI Portfolio"
npx @ibarcarty/mcp-server-google-drive auth
```

또는:

```powershell
.\scripts\setup-google-drive-mcp.ps1 -Auth
```

**진행 순서:**

1. 브라우저가 열리며 Google 로그인
2. "This app hasn't been verified" → **Advanced** → **Go to ... (unsafe)** (Testing mode 정상)
3. 권한 허용
4. 토큰이 `%APPDATA%\mcp-server-google-drive\tokens.json`에 저장됨

---

## 5. Cursor MCP 연결

이 프로젝트에는 이미 `.cursor/mcp.json`이 설정되어 있습니다.

```json
{
  "mcpServers": {
    "google-drive": {
      "command": "npx",
      "args": ["-y", "@ibarcarty/mcp-server-google-drive"],
      "env": {
        "GDRIVE_MCP_OAUTH_PATH": "C:\\Users\\Sales\\AppData\\Roaming\\mcp-server-google-drive\\oauth-credentials.json",
        "GDRIVE_MCP_TOKEN_PATH": "C:\\Users\\Sales\\AppData\\Roaming\\mcp-server-google-drive\\tokens.json"
      }
    }
  }
}
```

### Cursor에서 활성화

1. **Cursor Settings → Tools & MCP** (또는 **Features → MCP**)
2. `google-drive` 서버가 목록에 표시되는지 확인
3. 상태가 **Connected** 인지 확인
4. 연결 안 되면 **Cursor 재시작** (Reload Window)

> MCP는 **프로젝트 `.cursor/mcp.json`** 과 **전역 `%USERPROFILE%\.cursor\mcp.json`** 모두 지원합니다. 프로젝트 설정이 우선합니다.

---

## 6. 동작 확인

Cursor Agent 채팅에서 아래를 시도해 보세요.

```
Google Drive에서 "2027년 이직 프로젝트" 폴더를 검색하고 파일 목록을 보여줘.
```

```
Drive의 Portfolio_Site_PlanBook 문서 내용을 읽어줘.
```

```
스프레드시트 [ID]의 Sheet1!A1:D10 범위를 읽어줘.
```

### 프로젝트 Drive 폴더

| 항목 | 값 |
|------|-----|
| 폴더명 | 2027년 이직 프로젝트 (with AI) |
| URL | https://drive.google.com/drive/folders/1xno61id18Gvg8t87okwmF9JOAsTVbSH3 |

---

## 7. 보안 주의사항

| 파일 | 위치 | Git |
|------|------|-----|
| OAuth credentials | `%APPDATA%\mcp-server-google-drive\oauth-credentials.json` | ❌ 커밋 금지 |
| Access tokens | `%APPDATA%\mcp-server-google-drive\tokens.json` | ❌ 커밋 금지 |
| MCP 설정 | `.cursor/mcp.json` | ✅ 커밋 가능 (경로만 포함) |

- credentials/tokens는 **프로젝트 폴더 밖**(APPDATA)에 보관합니다.
- `.cursor/mcp.json`은 Windows 사용자명 경로만 포함하므로 Repo에 포함해도 됩니다.

---

## 8. 문제 해결

### "No saved tokens found"

```powershell
npx @ibarcarty/mcp-server-google-drive auth
```

### "OAuth credentials not found"

`oauth-credentials.json` 경로 확인:

```powershell
Test-Path "$env:APPDATA\mcp-server-google-drive\oauth-credentials.json"
```

### "Access blocked: Authorization Error"

OAuth consent screen → **Test users**에 본인 이메일이 추가되어 있는지 확인.

### "Google Docs API has not been used..."

Cloud Console에서 Docs/Sheets/Slides API 4개 모두 Enable 확인.

### MCP Connected지만 도구 실패

1. Cursor **Reload Window**
2. `npx @ibarcarty/mcp-server-google-drive auth` 재실행
3. Settings → MCP에서 `google-drive` 토글 off/on

### 토큰 만료 (Testing mode, 7일)

```powershell
npx @ibarcarty/mcp-server-google-drive auth
```

---

## 9. Claude Code(웹)와 협업 시

| 작업 | 권장 도구 |
|------|----------|
| Drive 기획서·케이스 스터디 **읽고 페이지 생성** | Claude Code |
| Drive 파일 **직접 수정·삭제·폴더 생성** | **Cursor + MCP** |
| Sheets **데이터 입력·수정** | **Cursor + MCP** |
| 코드·UI·3D 디버깅 | Cursor |
| Git push/pull | 양쪽 모두 |

**Cursor 세션 시작 프롬프트 예시:**

> `git pull origin claude/gracious-wozniak-g7ld41` 하고, Google Drive MCP로 `Portfolio_Site_PlanBook_v1.0` 기획서를 읽은 뒤 [작업] 진행해줘.

---

## 10. 랩탑에서 동일 환경 구성

데스크탑과 랩탑을 GitHub로 동기화할 때는 **`docs/Laptop-Setup-Guide.md`** 와 **`scripts/setup-laptop.bat`** 를 사용하세요.

```powershell
git clone https://github.com/ledlaputa72/Portfolio.git "AI Portfolio"
cd "AI Portfolio"
.\scripts\setup-laptop.bat
```

Google Drive에도 `Cursor-랩탑-세팅-가이드` 폴더에 동일 문서가 보관됩니다.

---

## 11. 빠른 설정 체크리스트

- [ ] GCP 프로젝트 생성
- [ ] Drive / Docs / Sheets / Slides API 4개 Enable
- [ ] OAuth consent screen + scope `drive` + test user 추가
- [ ] Desktop OAuth client JSON 다운로드
- [ ] `%APPDATA%\mcp-server-google-drive\oauth-credentials.json` 배치
- [ ] `npx @ibarcarty/mcp-server-google-drive auth` 실행
- [ ] Cursor Reload → MCP `google-drive` Connected 확인
- [ ] Drive 검색 테스트 성공
