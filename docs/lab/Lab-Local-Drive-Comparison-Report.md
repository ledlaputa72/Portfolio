# Lab 로컬 · Google Drive 대조 보고서

> **문서 버전:** v1.0  
> **작성일:** 2026년 6월 18일  
> **대상 폴더:** Google Drive → `2027년 이직 프로젝트 (with AI)` → `레퍼런스 사이트` → `Three.js 참조`  
> **폴더 ID:** `1eex4tFIfL3cyA-Nu3IZJB6Hw8rcp9eNj`  
> **로컬 기준:** `src/data/lab-sites.ts`, `docs/lab/`, `src/components/lab/experiments/`  
> **관련 문서:** `Lab-Reference-Audit-Checklist` (감사 체크리스트)

---

## 문서 목적

Lab 01·11 업데이트 이후, Google Drive 기획 문서 35개와 로컬 Repo를 **전수 대조**한 결과를 기록합니다.  
향후 P2 live audit, Lab-00 수정, 개발기술문서 정리 시 이 보고서를 기준 스냅샷으로 사용합니다.

**상태 기호:** ✅ 일치 · ⚠️ 불일치/보완 필요 · ⏳ 미검증(추정)

---

## 1. 전체 구조 비교

| 구분 | Google Drive | 로컬 (Repo) |
|------|--------------|-------------|
| **Lab-00 전체개요** | ✅ | ❌ (체크리스트에만 요약) |
| **Lab-01~32 기획** | ✅ 32개 | ⚠️ **7개만** (`docs/lab/planning/`) |
| **개발기술문서** | Lab-**11**만 | Lab-**01**만 (구버전) |
| **감사 체크리스트** | ✅ | ✅ `docs/lab/Lab-Reference-Audit-Checklist.md` |
| **본 대조 보고서** | ✅ (동기화 대상) | ✅ 본 문서 |
| **코드 기준** | — | `lab-sites.ts` + `registry.tsx` |

**번호 매핑 (Lab 01–32):** Drive 파일명 ↔ `lab-sites.ts` ↔ Lab-00 목록 — **전부 일치**  
(초기 스크립트에서 26–30번 오류로 보였으나 파서 버그였음)

---

## 2. Lab 01 · 11 — 업데이트 확인

### Lab-01 Hiroto Sato ✅

| 항목 | Drive | lab-sites.ts | 코드 |
|------|-------|--------------|------|
| 컨셉 | 미러·표지판·패럴럭스 3D 히어로 | ✅ 동일 | `HirotoSatoSignage` |
| 시그니처 | 마우스 패럴럭스 부유 | ✅ 동일 | ✅ |
| 난이도 | **중** | **중** | — |
| 로컬 기획 txt | Drive와 **100% 동일** | — | — |

**커밋 기준:** `0b5197a` — Hiroto ↔ Razorpay 혼동 수정, Signage 데모로 재배치

### Lab-11 Razorpay Sprint 26 ✅

| 항목 | Drive 기획 | lab-sites.ts | 코드 |
|------|-----------|--------------|------|
| 컨셉 | 2색 WebGL, 100+ 트리거, 신발 여정 | ✅ 동일 | `RazorpaySprintTrack` |
| 시그니처 | 스크롤 scrub + 신발 여정 | ✅ 동일 | ✅ |
| 개발기술문서 | Drive에 있음 (Razorpay 기준) | — | ✅ `0b5197a` 반영 |

**결론:** Lab 01·11 수정은 Drive ↔ Repo ↔ 구현이 **정렬 완료**.

---

## 3. P0/P1 수정 Lab (03–06, 10, 31)

| Lab | 사이트 | Drive ↔ lab-sites.ts | Drive ↔ 로컬 planning |
|-----|--------|----------------------|------------------------|
| 03 | Tony Mak | ✅ | ✅ identical |
| 04 | Lesse Studio | ✅ | ✅ identical |
| 05 | KVS Studio | ✅ | ✅ identical |
| 06 | Synapser Studio | ✅ | ✅ identical |
| 10 | digitalists | ✅ | ✅ identical |
| 31 | South Cliff Dental | ✅ | ✅ identical |

이 7개는 **live audit 반영본(v1.1)** 이 Drive · 로컬 · `lab-sites.ts`에 동기화됨.  
레퍼런스 분석 **신뢰 가능**.

**로컬 planning 파일 목록:**
- `docs/lab/planning/Lab-01-Hiroto-Sato-기획.txt`
- `docs/lab/planning/Lab-03-Tony-Mak-기획.txt`
- `docs/lab/planning/Lab-04-Lesse-Studio-기획.txt`
- `docs/lab/planning/Lab-05-Kvs-Studio-기획.txt`
- `docs/lab/planning/Lab-06-Synapser-Studio-기획.txt`
- `docs/lab/planning/Lab-10-Digitalists-기획.txt`
- `docs/lab/planning/Lab-31-South-Cliff-Dental-기획.txt`

---

## 4. 나머지 Lab (02, 07–09, 12–32) — 레퍼런스 분석 품질

### 4.1 문서 형식 2종

| 형식 | Lab 번호 | 특징 |
|------|----------|------|
| **신규 (v1.1)** | 01, 03–06, 10, 31 | `Three.js 핵심`, `검증 출처` 섹션 포함 |
| **구형 (v1.0)** | 02, 07–09, **11 기획**, 12–32 | 템플릿 5단, generic Cursor 참고, `신뢰도: 추정` 다수 |

### 4.2 내용 vs 레퍼런스

| 등급 | Lab | 평가 |
|------|-----|------|
| **✅ 신뢰 가능** | 02 DANZAN, 09 Glitch&Grit, 12 Izanami, 21 Cipher | `lab-sites.ts`와 Drive 일치, Awwwards/컨셉 근거 있음 |
| **⚠️ 추정 (live 미검증)** | 07–08, 13–20, 22–30, 32 (20개) | URL·제목은 맞으나 컨셉/시그니처는 **추론** — live deep dive 없음 |
| **✅ P0/P1 수정됨** | 03–06, 10, 31 | §3 참조 |

### 4.3 구형 문서(약 22개) 공통 한계

- `lab-sites.ts`에서 **자동 생성된 텍스트**와 동일한 경우가 많음
- 섹션 5가 항상 `@react-three/drei Float, Trail...` 등 **사이트별 분석이 아닌 공통 템플릿**
- `신뢰도: 추정`인데도 확정 톤으로 작성된 항목 존재

**예시 — Lab-07 PRODUX (구형, 미검증):**
- 기록: "GSAP SplitText로 헤드라인 분해/재조합"
- 실제 live 확인: **미완** → 구현 전 audit 필요

**예시 — Lab-26 Reventador (구형, 미검증):**
- 기록: "탄소 배출 그래프 곡선 하강"
- `lab-sites.ts`와 일치하나 **live 확인 없음**

---

## 5. 불일치 · 보완 필요 항목

| # | 문제 | 위치 | 권장 조치 | 우선순위 |
|---|------|------|-----------|----------|
| 1 | **Hiroto 난이도** Lab-00=`상` vs Lab-01=`중` | Drive `Lab-00-전체개요` | Lab-00을 **중**으로 수정 | P1 |
| 2 | **Lab-01 개발기술문서** 구버전 (TRACK/runner 기준) | 로컬 only (`docs/lab/Lab-01-Hiroto-Sato-개발기술문서.md`) | Signage 기준으로 **재작성** + Drive 업로드 | P1 |
| 3 | Lab-11 **기획**은 구형 템플릿 | Drive | v1.1 형식으로 **형식 통일** (내용은 OK) | P2 |
| 4 | Lab **02, 07–32** (31·P0 제외) 구형 | Drive | P2 live audit 후 순차 v1.1 업데이트 | P2 |
| 5 | 로컬 planning **25개缺失** | Repo | Drive 기준 export 또는 sync 스크립트 역방향 | P2 |

---

## 6. 3-way 동기화 요약

```
                    Drive    lab-sites.ts    코드(registry)
Lab-01 기획          ✅           ✅              ✅ Signage
Lab-01 개발기술      ❌           —               ⚠️ 로컬만(구버전 TRACK)
Lab-11 기획          ✅           ✅              ✅ RazorpayTrack
Lab-11 개발기술      ✅           —               ✅
Lab-03~06,10,31     ✅           ✅              ❌ 미구현
Lab-02,07~32(구형)  ✅=ts        ✅              ❌ 미구현
```

---

## 7. Lab별 상태 요약 (32개)

| Lab | 사이트 | Drive 기획 | lab-sites | 로컬 planning | 문서 형식 | 레퍼런스 신뢰도 |
|-----|--------|-----------|-----------|---------------|-----------|----------------|
| 01 | Hiroto Sato | ✅ | ✅ | ✅ | v1.1 | ✅ 검증됨 |
| 02 | DANZAN | ✅ | ✅ | ❌ | v1.0 | ✅ 확인됨 |
| 03 | Tony Mak | ✅ | ✅ | ✅ | v1.1 | ✅ 검증됨 |
| 04 | Lesse Studio | ✅ | ✅ | ✅ | v1.1 | ✅ 검증됨 |
| 05 | KVS Studio | ✅ | ✅ | ✅ | v1.1 | ✅ 검증됨 |
| 06 | Synapser Studio | ✅ | ✅ | ✅ | v1.1 | ✅ 검증됨 |
| 07 | PRODUX | ✅ | ✅ | ❌ | v1.0 | ⏳ 추정 |
| 08 | Iris K | ✅ | ✅ | ❌ | v1.0 | ⏳ 추정 |
| 09 | Glitch&Grit | ✅ | ✅ | ❌ | v1.0 | ✅ 확인됨 |
| 10 | digitalists | ✅ | ✅ | ✅ | v1.1 | ✅ 검증됨 |
| 11 | Razorpay Sprint 26 | ✅ | ✅ | ❌ | v1.0* | ✅ 확인됨 |
| 12 | Izanami | ✅ | ✅ | ❌ | v1.0 | ✅ 확인됨 |
| 13–20 | (브랜드/B2B) | ✅ | ✅ | ❌ | v1.0 | ⏳ 추정 |
| 21 | Cipher | ✅ | ✅ | ❌ | v1.0 | ✅ 확인됨 |
| 22–30 | (데이터/기타) | ✅ | ✅ | ❌ | v1.0 | ⏳ 추정 |
| 31 | South Cliff Dental | ✅ | ✅ | ✅ | v1.1 | ✅ 검증됨 |
| 32 | ClimaNova | ✅ | ✅ | ❌ | v1.0 | ⏳ 추정 |

\* Lab-11 기획: **내용**은 Razorpay로 수정됨. **형식**만 v1.0 구형.

---

## 8. 결론

1. **Lab 01·11 수정 성공** — Drive, `lab-sites.ts`, 코드(`HirotoSatoSignage`, `RazorpaySprintTrack`) 일치.
2. **P0/P1 (03–06, 10, 31)** — Drive = 로컬 planning = `lab-sites.ts` 동기화 완료. 레퍼런스 분석 **신뢰 가능**.
3. **나머지 약 22개 기획** — 번호·URL·slug는 맞으나, 대부분 `lab-sites.ts` 템플릿 복사본. live audit **미완** → "제대로 분석됨"으로 보기 어려움.
4. **로컬 Lab-01 개발기술문서** — TRACK/runner 기준으로 **outdated**. Drive에는 Lab-01 개발기술문서 없음 (Lab-11만 존재).
5. **Lab-00 전체개요** — Hiroto 난이도 불일치 등 소규모 정리 필요.

---

## 9. 다음 작업 (권장 순서)

| 순서 | 작업 | 담당/도구 |
|------|------|-----------|
| 1 | Lab-00 Hiroto 난이도 `상` → `中` | Drive 수동 또는 sync |
| 2 | Lab-01 개발기술문서 Signage 기준 재작성 | 로컬 + `upload-lab-dev-doc-to-drive.mjs` |
| 3 | P2 live audit (Lab 13 Cartier부터) | 체크리스트 §P2 순서 |
| 4 | 구형 22개 → v1.1 (`Three.js 핵심` + `검증 출처`) | `sync-lab-planning-to-drive.mjs --all` |
| 5 | 로컬 planning 25개 Drive에서 export | 역방향 sync 스크립트 (미구현) |

---

## 10. 관련 링크 · 파일

| 항목 | 경로 / URL |
|------|------------|
| Drive Three.js 참조 폴더 | https://drive.google.com/drive/folders/1eex4tFIfL3cyA-Nu3IZJB6Hw8rcp9eNj |
| 감사 체크리스트 (로컬) | `docs/lab/Lab-Reference-Audit-Checklist.md` |
| 본 보고서 (로컬) | `docs/lab/Lab-Local-Drive-Comparison-Report.md` |
| Lab 메타데이터 | `src/data/lab-sites.ts` |
| 실험 레지스트리 | `src/components/lab/experiments/registry.tsx` |
| Drive 업로드 | `node scripts/sync-lab-planning-to-drive.mjs --file docs/lab/Lab-Local-Drive-Comparison-Report.md --title Lab-Local-Drive-Comparison-Report` |

---

## 변경 이력

| 날짜 | 버전 | 내용 |
|------|------|------|
| 2026-06-18 | v1.0 | Lab 01·11 업데이트 후 Drive ↔ 로컬 전수 대조 결과 최초 작성 |
