"use client";

import { useCallback, useId, useMemo, useRef, useState, type ReactNode } from "react";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const BG = "#f3efe6";
const BG_DARK = "#1a2332";
const TEXT = "#1a2332";
const MUTED = "#6b6560";
const ACCENT = "#c45c3e";
const GREEN = "#2d6a4f";
const GOLD = "#d4a853";
const US = "#3d5a80";
const MX = "#1b7a4a";
const CA = "#c1121f";

const SCROLL_VH = 3000;

type NationId = "all" | "usa" | "mexico" | "canada";

const STATS = [
  { label: "Nations qualified", value: 48, suffix: "" },
  { label: "Host cities", value: 16, suffix: "" },
  { label: "Matches", value: 104, suffix: "" },
  { label: "Days", value: 39, suffix: "" },
] as const;

const HOST_NATIONS = [
  { id: "usa" as const, label: "United States", cities: 11, color: US },
  { id: "mexico" as const, label: "Mexico", cities: 3, color: MX },
  { id: "canada" as const, label: "Canada", cities: 2, color: CA },
] as const;

const CITIES = [
  { id: "atlanta", name: "Atlanta", nation: "usa" as const, x: 0.72, y: 0.58, matches: 8 },
  { id: "boston", name: "Boston", nation: "usa" as const, x: 0.88, y: 0.38, matches: 7 },
  { id: "dallas", name: "Dallas", nation: "usa" as const, x: 0.58, y: 0.58, matches: 9, note: "96°F heat ceiling" },
  { id: "houston", name: "Houston", nation: "usa" as const, x: 0.55, y: 0.68, matches: 7 },
  { id: "kc", name: "Kansas City", nation: "usa" as const, x: 0.62, y: 0.48, matches: 6 },
  { id: "la", name: "Los Angeles", nation: "usa" as const, x: 0.22, y: 0.58, matches: 8 },
  { id: "miami", name: "Miami", nation: "usa" as const, x: 0.78, y: 0.78, matches: 7 },
  { id: "metlife", name: "MetLife · NJ", nation: "usa" as const, x: 0.86, y: 0.42, matches: 8, final: true },
  { id: "philly", name: "Philadelphia", nation: "usa" as const, x: 0.84, y: 0.45, matches: 6 },
  { id: "sf", name: "San Francisco", nation: "usa" as const, x: 0.18, y: 0.48, matches: 6 },
  { id: "seattle", name: "Seattle", nation: "usa" as const, x: 0.2, y: 0.32, matches: 6 },
  { id: "guadalajara", name: "Guadalajara", nation: "mexico" as const, x: 0.48, y: 0.72, matches: 4 },
  { id: "azteca", name: "Estadio Azteca", nation: "mexico" as const, x: 0.52, y: 0.76, matches: 5, opener: true },
  { id: "monterrey", name: "Monterrey", nation: "mexico" as const, x: 0.54, y: 0.68, matches: 4 },
  { id: "toronto", name: "Toronto", nation: "canada" as const, x: 0.78, y: 0.32, matches: 6 },
  { id: "vancouver", name: "Vancouver", nation: "canada" as const, x: 0.16, y: 0.22, matches: 7 },
] as const;

const LEGENDS = [
  { name: "Cristiano Ronaldo", nation: "Portugal", age: 41 },
  { name: "Lionel Messi", nation: "Argentina", age: 38 },
  { name: "Luka Modrić", nation: "Croatia", age: 40 },
  { name: "Sadio Mané", nation: "Senegal", age: 34 },
  { name: "Guillermo Ochoa", nation: "Mexico", age: 40 },
] as const;

const MASCOTS = [
  { name: "Maple", role: "Moose · Goalkeeper", nation: "Canada", color: CA },
  { name: "Zayu", role: "Jaguar · Forward", nation: "Mexico", color: MX },
  { name: "Clutch", role: "Bald eagle · Midfielder", nation: "United States", color: US },
] as const;

const DEBUTANTS = [
  { team: "Cabo Verde", group: "H" },
  { team: "Curaçao", group: "E" },
  { team: "Jordan", group: "J" },
  { team: "Uzbekistan", group: "K" },
] as const;

const GROUPS = [
  { id: "A", teams: ["Mexico", "South Africa", "South Korea", "UEFA D"] },
  { id: "B", teams: ["Canada", "UEFA A", "Qatar", "Switzerland"] },
  { id: "C", teams: ["Brazil", "Morocco", "Haiti", "Scotland"] },
  { id: "D", teams: ["USA", "Paraguay", "Australia", "UEFA C"] },
  { id: "E", teams: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"] },
  { id: "F", teams: ["Netherlands", "Japan", "UEFA B", "Tunisia"] },
  { id: "G", teams: ["Belgium", "Egypt", "Iran", "New Zealand"] },
  { id: "H", teams: ["Spain", "Cabo Verde", "Saudi Arabia", "Uruguay"] },
  { id: "I", teams: ["France", "Senegal", "IC 2", "Norway"] },
  { id: "J", teams: ["Argentina", "Algeria", "Austria", "Jordan"] },
  { id: "K", teams: ["Portugal", "IC 1", "Uzbekistan", "Colombia"] },
  { id: "L", teams: ["England", "Croatia", "Ghana", "Panama"] },
] as const;

const FIXTURES = [
  { id: "f1", home: "Mexico", away: "South Africa", city: "azteca", date: "Jun 11" },
  { id: "f2", home: "Canada", away: "UEFA A", city: "toronto", date: "Jun 12" },
  { id: "f3", home: "USA", away: "Paraguay", city: "la", date: "Jun 13" },
  { id: "f4", home: "Brazil", away: "Morocco", city: "miami", date: "Jun 14" },
  { id: "f5", home: "Argentina", away: "Algeria", city: "atlanta", date: "Jun 16" },
  { id: "f6", home: "Germany", away: "Curaçao", city: "houston", date: "Jun 17" },
  { id: "f7", home: "France", away: "Senegal", city: "dallas", date: "Jun 18" },
  { id: "f8", home: "England", away: "Croatia", city: "boston", date: "Jun 19" },
  { id: "f9", home: "Iran", away: "New Zealand", city: "seattle", date: "Jun 21" },
  { id: "f10", home: "Portugal", away: "Colombia", city: "metlife", date: "Jun 22" },
  { id: "f11", home: "Spain", away: "Cabo Verde", city: "sf", date: "Jun 24" },
  { id: "f12", home: "TBD", away: "TBD", city: "metlife", date: "Jul 19", final: true },
] as const;

const NATION_COLOR: Record<Exclude<NationId, "all">, string> = { usa: US, mexico: MX, canada: CA };

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function panelRise(p: number, start: number, end: number) {
  return easeInOutCubic(smoothstep(start, end, p));
}

function countUp(target: number, t: number) {
  return Math.round(lerp(0, target, easeInOutCubic(t)));
}

function ChapterSlide({
  rise,
  zIndex,
  children,
  dark = false,
}: {
  rise: number;
  zIndex: number;
  children: ReactNode;
  dark?: boolean;
}) {
  if (rise < 0.001) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        zIndex,
        transform: `translateY(${lerp(108, 0, rise)}%)`,
        background: dark ? BG_DARK : BG,
        color: dark ? "#f3efe6" : TEXT,
      }}
    >
      <div className="pointer-events-auto h-full">{children}</div>
    </div>
  );
}

function HostMap({
  filterNation,
  selectedCity,
  onSelectCity,
  onSelectNation,
  highlight,
}: {
  filterNation: NationId;
  selectedCity: string | null;
  onSelectCity: (id: string) => void;
  onSelectNation: (id: NationId) => void;
  highlight: number;
}) {
  const gradId = useId().replace(/:/g, "");

  const visibleCities = useMemo(
    () => (filterNation === "all" ? CITIES : CITIES.filter((c) => c.nation === filterNation)),
    [filterNation],
  );

  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 400 280" className="h-full w-full" aria-label="Host cities map">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8e2d6" />
            <stop offset="100%" stopColor="#d9d2c4" />
          </linearGradient>
        </defs>
        <path
          d="M 40 90 Q 80 60 130 70 L 180 55 Q 240 40 290 50 L 340 65 Q 370 80 360 110 L 350 150 Q 340 190 300 210 L 250 230 Q 200 250 150 240 L 90 220 Q 50 200 45 160 Z"
          fill={`url(#${gradId})`}
          stroke="rgba(26,35,50,0.12)"
          strokeWidth={1.5}
          opacity={0.85 + highlight * 0.15}
        />
        <path
          d="M 55 100 Q 100 75 150 85 L 200 70 Q 250 55 300 65"
          fill="none"
          stroke="rgba(45,106,79,0.2)"
          strokeWidth={8}
          strokeLinecap="round"
        />
        {visibleCities.map((city) => {
          const cx = 40 + city.x * 320;
          const cy = 55 + city.y * 200;
          const active = selectedCity === city.id;
          const dim = selectedCity && !active;
          const color = NATION_COLOR[city.nation];
          return (
            <g
              key={city.id}
              className="cursor-pointer"
              onClick={() => onSelectCity(city.id)}
              opacity={dim ? 0.35 : 1}
            >
              <circle
                cx={cx}
                cy={cy}
                r={active ? 14 : 9}
                fill={color}
                fillOpacity={active ? 0.95 : 0.75}
                stroke={active ? GOLD : "white"}
                strokeWidth={active ? 2.5 : 1.5}
              />
              {active && (
                <circle cx={cx} cy={cy} r={20} fill="none" stroke={GOLD} strokeWidth={1} strokeOpacity={0.5} />
              )}
              <text
                x={cx}
                y={cy - 16}
                textAnchor="middle"
                fontSize={9}
                fill={TEXT}
                fontFamily="ui-monospace, monospace"
                opacity={active ? 1 : 0.7}
              >
                {city.name}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-2 left-2 flex flex-wrap gap-2">
        {(["all", "usa", "mexico", "canada"] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onSelectNation(n)}
            className="rounded-full px-2.5 py-1 font-mono text-[8px] uppercase tracking-wider transition-opacity"
            style={{
              background: filterNation === n ? (n === "all" ? TEXT : NATION_COLOR[n]) : "rgba(26,35,50,0.08)",
              color: filterNation === n ? "#fff" : MUTED,
            }}
          >
            {n === "all" ? "All hosts" : n}
          </button>
        ))}
      </div>
    </div>
  );
}

function GroupGrid({
  selectedTeam,
  onSelectTeam,
  filterNation,
}: {
  selectedTeam: string | null;
  onSelectTeam: (team: string) => void;
  filterNation: NationId;
}) {
  const nationTeams: Record<Exclude<NationId, "all">, string[]> = {
    usa: ["USA"],
    mexico: ["Mexico"],
    canada: ["Canada"],
  };

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {GROUPS.map((g) => (
        <div
          key={g.id}
          className="rounded-lg border p-2"
          style={{
            borderColor: "rgba(26,35,50,0.1)",
            background: "rgba(255,255,255,0.5)",
          }}
        >
          <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: MUTED }}>
            Group {g.id}
          </p>
          <ul className="mt-1 space-y-0.5">
            {g.teams.map((team) => {
              const active = selectedTeam === team;
              const nationMatch =
                filterNation === "all" ? true : nationTeams[filterNation].includes(team);
              return (
                <li key={team}>
                  <button
                    type="button"
                    onClick={() => onSelectTeam(team)}
                    className="w-full text-left text-[10px] leading-tight transition-opacity hover:opacity-100"
                    style={{
                      opacity: nationMatch ? (active ? 1 : 0.75) : 0.25,
                      color: active ? ACCENT : TEXT,
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {team}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function FixtureList({
  selectedCity,
  selectedTeam,
  filterNation,
}: {
  selectedCity: string | null;
  selectedTeam: string | null;
  filterNation: NationId;
}) {
  const filtered = useMemo(() => {
    return FIXTURES.filter((m) => {
      const city = CITIES.find((c) => c.id === m.city);
      if (filterNation !== "all" && city && city.nation !== filterNation) return false;
      if (selectedCity && m.city !== selectedCity) return false;
      if (selectedTeam && m.home !== selectedTeam && m.away !== selectedTeam) return false;
      return true;
    });
  }, [filterNation, selectedCity, selectedTeam]);

  return (
    <div className="space-y-2">
      {filtered.length === 0 ? (
        <p className="text-xs" style={{ color: MUTED }}>
          No fixtures match this filter — try another city or team.
        </p>
      ) : (
        filtered.map((m) => {
          const city = CITIES.find((c) => c.id === m.city);
          const isFinal = "final" in m && m.final;
          return (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
              style={{
                borderColor: isFinal ? GOLD : "rgba(26,35,50,0.1)",
                background: isFinal ? "rgba(212,168,83,0.12)" : "rgba(255,255,255,0.45)",
              }}
            >
              <div>
                <p className="text-xs font-medium">
                  {m.home} <span style={{ color: MUTED }}>v</span> {m.away}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: MUTED }}>
                  {city?.name} · {m.date}
                </p>
              </div>
              {isFinal && (
                <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: GOLD }}>
                  Final
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default function WorldCup2026DataViz() {
  const { locale } = useLocale();
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [filterNation, setFilterNation] = useState<NationId>("all");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const handleProgress = useCallback((p: number) => {
    progressRef.current = p;
    setProgress(p);
  }, []);

  const handleSelectCity = useCallback((id: string) => {
    setSelectedCity((prev) => (prev === id ? null : id));
    setSelectedTeam(null);
  }, []);

  const handleSelectNation = useCallback((n: NationId) => {
    setFilterNation(n);
    setSelectedCity(null);
    setSelectedTeam(null);
  }, []);

  const handleSelectTeam = useCallback((team: string) => {
    setSelectedTeam((prev) => (prev === team ? null : team));
    setSelectedCity(null);
  }, []);

  const statsReveal = smoothstep(0.08, 0.18, progress);
  const heroFade = 1 - smoothstep(0.12, 0.22, progress);
  const mapHighlight = smoothstep(0.28, 0.42, progress);

  const riseChampions = panelRise(progress, 0.18, 0.3);
  const riseHosts = panelRise(progress, 0.28, 0.4);
  const riseLegends = panelRise(progress, 0.38, 0.5);
  const riseHeat = panelRise(progress, 0.48, 0.58);
  const riseMascots = panelRise(progress, 0.56, 0.66);
  const riseFormat = panelRise(progress, 0.64, 0.74);
  const riseFinal = panelRise(progress, 0.72, 0.82);
  const riseFixtures = panelRise(progress, 0.8, 0.92);

  const selectedCityData = selectedCity ? CITIES.find((c) => c.id === selectedCity) : null;

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={SCROLL_VH}
      stickyClassName="text-[#1a2332]"
      hint={locale === "ko" ? "↓ 스크롤 — 팀·경기장 클릭 필터" : "↓ Scroll — team · stadium click filter"}
      showProgress={false}
    >
      <div className="relative h-full w-full overflow-hidden" style={{ background: BG, color: TEXT }}>
        {/* Hero — opener match */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-6 py-14 sm:px-12 sm:py-16"
          style={{ opacity: heroFade }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: MUTED }}>
            World Cup
          </p>
          <div className="max-w-2xl">
            <h1 className="text-5xl font-light tracking-tight sm:text-7xl md:text-8xl">WORLD CUP</h1>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.25em]" style={{ color: ACCENT }}>
              Jun 11 · Mexico v South Africa
            </p>
            <h2 className="mt-4 text-2xl font-light sm:text-4xl">The Cup begins at Azteca.</h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed" style={{ color: MUTED }}>
              Mexico open the tournament at Estadio Azteca, 7,382 feet up — the only stadium to host three World Cups.
              They face South Africa in front of 83,000.
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.45em]" style={{ color: MUTED }}>
            Scroll
          </p>
        </div>

        {/* Stats strip — always visible mid-scroll */}
        <div
          className="pointer-events-none absolute inset-x-0 top-8 z-[15] px-6 sm:px-12"
          style={{ opacity: statsReveal * (1 - smoothstep(0.75, 0.88, progress)) }}
        >
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-light tabular-nums sm:text-4xl" style={{ color: GREEN }}>
                  {countUp(s.value, statsReveal)}
                  {s.suffix}
                </p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-widest" style={{ color: MUTED }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Persistent map layer (behind chapters, interactive) */}
        <div
          className="absolute inset-0 z-[5] px-6 py-20 sm:px-12"
          style={{
            opacity: lerp(0.15, 0.55, mapHighlight) * (1 - smoothstep(0.78, 0.9, progress)),
            pointerEvents: mapHighlight > 0.2 && progress < 0.88 ? "auto" : "none",
          }}
        >
          <HostMap
            filterNation={filterNation}
            selectedCity={selectedCity}
            onSelectCity={handleSelectCity}
            onSelectNation={handleSelectNation}
            highlight={mapHighlight}
          />
        </div>

        <ChapterSlide rise={riseChampions} zIndex={30}>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: GOLD }}>
              Defending champions ★★★
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-light sm:text-5xl">Argentina, for the fourth.</h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed" style={{ color: MUTED }}>
              Three cups already, last won in Qatar 2022. Messi at 38 plays his sixth and almost certainly final World
              Cup, with Lionel Scaloni still in the dugout.
            </p>
            <button
              type="button"
              onClick={() => handleSelectTeam("Argentina")}
              className="mt-8 w-fit border-b pb-1 font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{
                borderColor: selectedTeam === "Argentina" ? ACCENT : "rgba(26,35,50,0.25)",
                color: selectedTeam === "Argentina" ? ACCENT : TEXT,
              }}
            >
              Filter Argentina fixtures →
            </button>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseHosts} zIndex={35}>
          <div className="flex h-full flex-col justify-center gap-8 px-6 sm:flex-row sm:items-center sm:px-12">
            <div className="sm:w-1/2">
              <h2 className="text-3xl font-light sm:text-4xl">Three nations, sixteen cities.</h2>
              <div className="mt-8 space-y-4">
                {HOST_NATIONS.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => handleSelectNation(h.id)}
                    className="flex w-full items-center justify-between border-b pb-3 text-left transition-opacity"
                    style={{
                      borderColor: filterNation === h.id ? h.color : "rgba(26,35,50,0.12)",
                      opacity: filterNation === "all" || filterNation === h.id ? 1 : 0.4,
                    }}
                  >
                    <span className="text-lg">{h.label}</span>
                    <span className="font-mono text-sm tabular-nums" style={{ color: h.color }}>
                      {h.cities} cities
                    </span>
                  </button>
                ))}
              </div>
              {selectedCityData && (
                <p className="mt-6 text-xs" style={{ color: MUTED }}>
                  Selected: <strong>{selectedCityData.name}</strong>
                  {"matches" in selectedCityData && ` · ${selectedCityData.matches} matches`}
                  {"note" in selectedCityData && ` · ${selectedCityData.note}`}
                </p>
              )}
            </div>
            <div className="h-[40vh] sm:h-[50vh] sm:w-1/2">
              <HostMap
                filterNation={filterNation}
                selectedCity={selectedCity}
                onSelectCity={handleSelectCity}
                onSelectNation={handleSelectNation}
                highlight={1}
              />
            </div>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseLegends} zIndex={40} dark>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <h2 className="text-3xl font-light sm:text-5xl">The goodbye tour.</h2>
            <p className="mt-4 max-w-lg text-sm text-white/50">
              Five icons of a generation, almost certainly playing their last World Cup.
            </p>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {LEGENDS.map((leg) => (
                <li key={leg.name}>
                  <button
                    type="button"
                    onClick={() => handleSelectTeam(leg.nation)}
                    className="w-full rounded-lg border border-white/10 px-4 py-3 text-left transition-colors hover:border-white/25"
                    style={{
                      background: selectedTeam === leg.nation ? "rgba(196,92,62,0.2)" : "rgba(255,255,255,0.04)",
                    }}
                  >
                    <p className="text-sm font-medium">{leg.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                      {leg.nation} · {leg.age}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseHeat} zIndex={45}>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: ACCENT }}>
              96°F · Dallas
            </p>
            <h2 className="mt-4 max-w-xl text-3xl font-light sm:text-5xl">Retractable roof.</h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed" style={{ color: MUTED }}>
              Mid-afternoon kickoffs in Texas push 96°F — the cup&apos;s heat ceiling. AT&amp;T&apos;s retractable roof
              will close more than once. Four U.S. stadiums have roofs for exactly this reason.
            </p>
            <button
              type="button"
              onClick={() => handleSelectCity("dallas")}
              className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: selectedCity === "dallas" ? ACCENT : GREEN }}
            >
              Show Dallas fixtures →
            </button>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseMascots} zIndex={50}>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <h2 className="text-3xl font-light sm:text-5xl">Three mascots, one cup.</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {MASCOTS.map((m) => (
                <div
                  key={m.name}
                  className="rounded-2xl border p-5"
                  style={{
                    borderColor: "rgba(26,35,50,0.1)",
                    background: `linear-gradient(145deg, rgba(255,255,255,0.7), rgba(232,226,214,0.9))`,
                    boxShadow: "0 8px 24px rgba(26,35,50,0.08)",
                  }}
                >
                  <div
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl"
                    style={{ background: `${m.color}22`, color: m.color }}
                  >
                    {m.name[0]}
                  </div>
                  <p className="text-lg font-medium">{m.name}</p>
                  <p className="font-mono text-[9px] uppercase tracking-wider" style={{ color: MUTED }}>
                    {m.role}
                  </p>
                  <p className="mt-2 text-xs" style={{ color: MUTED }}>
                    {m.nation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseFormat} zIndex={55} dark>
          <div className="flex h-full flex-col justify-center overflow-y-auto px-6 py-12 sm:px-12">
            <h2 className="text-3xl font-light sm:text-4xl">12 groups. 48 teams. One new round.</h2>
            <p className="mt-4 max-w-2xl text-sm text-white/50">
              Twelve groups of four — top two plus eight best third-placed teams reach a new Round of 32. Expanded from
              32 teams and 64 matches in 2022 to 48 and 104.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {DEBUTANTS.map((d) => (
                <button
                  key={d.team}
                  type="button"
                  onClick={() => handleSelectTeam(d.team)}
                  className="rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-wider"
                  style={{
                    borderColor: selectedTeam === d.team ? GOLD : "rgba(255,255,255,0.2)",
                    background: selectedTeam === d.team ? "rgba(212,168,83,0.2)" : "transparent",
                    color: selectedTeam === d.team ? GOLD : "rgba(255,255,255,0.6)",
                  }}
                >
                  {d.team} · Group {d.group}
                </button>
              ))}
            </div>
            <div className="mt-8 max-h-[38vh] overflow-y-auto pr-2">
              <GroupGrid selectedTeam={selectedTeam} onSelectTeam={handleSelectTeam} filterNation={filterNation} />
            </div>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseFinal} zIndex={60}>
          <div className="flex h-full flex-col justify-center px-6 sm:px-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: GOLD }}>
              Jul 19 · East Rutherford, NJ
            </p>
            <h2 className="mt-4 text-3xl font-light sm:text-5xl">The Cup ends at MetLife.</h2>
            <p className="mt-6 max-w-lg text-sm leading-relaxed" style={{ color: MUTED }}>
              The 2026 final at MetLife Stadium — 82,500 seats. The winning nation lifts the trophy in front of the New
              York skyline.
            </p>
            <button
              type="button"
              onClick={() => handleSelectCity("metlife")}
              className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: selectedCity === "metlife" ? GOLD : GREEN }}
            >
              Filter MetLife matches →
            </button>
          </div>
        </ChapterSlide>

        <ChapterSlide rise={riseFixtures} zIndex={65}>
          <div className="flex h-full flex-col justify-center gap-6 px-6 sm:flex-row sm:px-12">
            <div className="sm:w-1/2">
              <h2 className="text-2xl font-light sm:text-4xl">What&apos;s next.</h2>
              <p className="mt-3 text-sm" style={{ color: MUTED }}>
                Click any team, nation or stadium — fixtures reconfigure dynamically.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {filterNation !== "all" && (
                  <span className="rounded-full px-2 py-0.5 font-mono text-[8px] uppercase" style={{ background: `${NATION_COLOR[filterNation]}22`, color: NATION_COLOR[filterNation] }}>
                    {filterNation}
                  </span>
                )}
                {selectedCity && (
                  <span className="rounded-full bg-black/8 px-2 py-0.5 font-mono text-[8px] uppercase">
                    {selectedCityData?.name}
                  </span>
                )}
                {selectedTeam && (
                  <span className="rounded-full px-2 py-0.5 font-mono text-[8px] uppercase" style={{ background: `${ACCENT}22`, color: ACCENT }}>
                    {selectedTeam}
                  </span>
                )}
              </div>
              <div className="mt-6 max-h-[45vh] overflow-y-auto">
                <FixtureList
                  selectedCity={selectedCity}
                  selectedTeam={selectedTeam}
                  filterNation={filterNation}
                />
              </div>
            </div>
            <div className="h-[35vh] sm:h-[50vh] sm:w-1/2">
              <HostMap
                filterNation={filterNation}
                selectedCity={selectedCity}
                onSelectCity={handleSelectCity}
                onSelectNation={handleSelectNation}
                highlight={1}
              />
            </div>
          </div>
        </ChapterSlide>

        <div className="pointer-events-none absolute bottom-6 left-6 z-[100] font-mono text-[9px] uppercase tracking-widest" style={{ color: MUTED }}>
          {selectedTeam || selectedCity || filterNation !== "all" ? "Filtered view" : "All 104 fixtures →"}
        </div>
      </div>
    </LabStickyScroll>
  );
}
