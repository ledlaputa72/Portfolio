# Lab 레퍼런스 감사 체크리스트

> **문서 버전:** v1.0  
> **작성일:** 2026년 6월  
> **위치:** Google Drive → `2027년 이직 프로젝트 (with AI)` → `레퍼런스 사이트` → `Three.js 참조`  
> **기준 데이터:** `src/data/lab-sites.ts` + Awwwards / Codrops / live site

---

## 사용 방법

각 Lab 항목을 아래 순서로 검증합니다.

1. **Live site** — URL 직접 방문 (30분)
2. **Awwwards** — SOTD/HM/Nominee 페이지 확인
3. **기획 문서** — `Lab-XX-[Name]-기획` 내용 대조
4. **lab-sites.ts** — slug/concept/signature/techniques 일치
5. **구현** — `/lab/[slug]` 데모가 기획과 맞는지 (구현 후)

**상태 기호:** ✅ 완료 · 🔄 수정됨(v1.1) · ⏳ 대기 · ⚠️ 재검토 필요

---

## P0 — 즉시 수정 완료 (2026-06-19)

실제 레퍼런스와 불일치가 확인되어 **기획 문서 + lab-sites.ts** 수정함.

| Lab | 사이트 | 이전 문제 | 수정 방향 | 상태 |
|-----|--------|-----------|-----------|------|
| **01** | Hiroto Sato | TRACK(러너) 컨셉 ↔ 메인 포트폴리오 혼동 | 미러·표지판·패럴럭스 3D 히어로 (hirotos.com) | 🔄 |
| **04** | Lesse Studio | 3D 카드 회전 (실제: SvelteKit, subtle CSS) | 타이포·layout·subtle motion | 🔄 |
| **05** | KVS Studio | 3D 드래그 회전 (실제: CLICK TO BREAK UI) | 게이미피케이션·인터랙티브 타이포 | 🔄 |
| **06** | Synapser Studio | 파티클 노드 (실제: scroll-driven 3D world) | GSAP Observer + cinematic scroll | 🔄 |
| **31** | South Cliff Dental | 치아 일러스트 (실제: 3D nav/locations) | 3D scroll + interactive navigation | 🔄 |

> **Lab-01 참고:** 기획은 메인 포트폴리오 기준. `/lab/hiroto-sato` 코드 데모는 TRACK 서브프로젝트 — **구현 재정렬 필요(P1).**

---

## P1 — 부분 수정 (2026-06-19)

| Lab | 사이트 | 조치 | 상태 |
|-----|--------|------|------|
| **03** | Tony Mak | 와이프 → loading/intro/page transition으로 완화 | 🔄 |
| **10** | digitalists | Three.js 중심 표현 제거, WordPress 실무 모션으로 | 🔄 |

---

## P2 — Live audit 대기 (`신뢰도: 추정`, 20개)

아래는 **번호·URL 매핑은 정상**이나, 컨셉/시그니처가 live 검증 전입니다.  
우선순위: **브랜드(B) → B2B(C) → 데이터(D) → 나머지(A)**

| 우선 | Lab | 사이트 | URL | 검증 포인트 |
|------|-----|--------|-----|-------------|
| 1 | 13 | Cartier W&W | cartier.com/.../watchesandwonders | 3D watch zoom 실존 여부 |
| 2 | 14 | PP Neue Montreal | neuemontreal.com | variable font WebGL |
| 3 | 16 | Hydroflow | hydroflowdrink.com | liquid shader |
| 4 | 19 | LOFT THIRTY ONE | loftthirtyone.com | 3D walkthrough |
| 5 | 20 | CryptOwl | cryptowl.io | 3D timeline |
| 6 | 22 | Armory | armory.in | radar scan |
| 7 | 07 | PRODUX | produx.design | SplitText scroll |
| 8 | 08 | Iris K | theirisk.com | audio reactive |
| 9 | 15 | KFC Loyalty | kfc.it/loyalty | gamification |
| 10 | 17 | La Revoltosa | larevoltosa.es | gradient scroll |
| 11 | 18 | NorthGarden | northgarden.com | particle field |
| 12 | 23 | Hashgraph Ventures | hashgraphvc.com | network graph |
| 13 | 24 | RSquad | rsquad.io | geometry morph |
| 14 | 25 | AIR business center | aircenter.space | floor transition |
| 15 | 26 | Reventador | reventador.global | carbon curve |
| 16 | 27 | Podium | podium.global | video scrub |
| 17 | 28 | Tower Doors | towerdoors.com.au | exploded view |
| 18 | 29 | Fabrics Protection | en.protection.gr | fabric shader |
| 19 | 30 | World Cup 2026 | sheets.works/... | D3 vs Three.js |
| 20 | 32 | ClimaNova | climanovaquebec.com | energy particles |

---

## P3 — 확인됨 (추가 live audit 권장)

| Lab | 사이트 | 신뢰도 | 비고 |
|-----|--------|--------|------|
| 02 | DANZAN | 확인(컨셉) | slash-to-reveal — OK |
| 09 | Glitch&Grit | 확인(노미니) | glitch burst — OK |
| 11 | Razorpay Sprint 26 | 확인됨 | SOTD, shoe+100 triggers — OK |
| 12 | Izanami | 확인됨 | fog reveal — OK |
| 21 | Cipher Digital | 확인됨 | datacenter abstract — OK |

---

## P4 — 개발기술문서 현황

| Lab | 기획 | 개발기술문서 | 비고 |
|-----|------|-------------|------|
| 01 | 🔄 | 로컬 only | Drive 업로드 필요 |
| 11 | ✅ | ✅ | runner 템플릿 잔재 → P1 정리 |
| 02–32 | ⏳ | — | 구현 후 작성 |

---

## 검증 체크박스 (Lab 1회 audit 시)

```
[ ] URL 접속 성공
[ ] Awwwards / Codrops / case study 링크 확보
[ ] 시그니처 인터랙션 1문장 — 실제 관찰 기반으로 작성
[ ] Three.js/WebGL 핵심 여부 명시 (아니면 CSS/GSAP only 표기)
[ ] lab-sites.ts concept/signature/techniques/confidence 갱신
[ ] Drive Lab-XX-기획 문서 갱신
[ ] Lab-00-전체개요 해당 줄 확인
[ ] (구현 후) Lab-XX-개발기술문서 작성
```

---

## 동기화 명령

```powershell
# lab-sites.ts 수정 후 Drive 기획 문서 일괄 업로드
node scripts/sync-lab-planning-to-drive.mjs --labs 1,4,5,6,31,3,10

# 전체 재동기화 (주의: 모든 기획 문서 덮어씀)
node scripts/sync-lab-planning-to-drive.mjs --all
```

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-06-19 | v1.0 — P0/P1 7개 Lab 수정, P2 audit queue 정의 |
