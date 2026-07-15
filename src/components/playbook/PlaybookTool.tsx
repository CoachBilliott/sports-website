"use client";

import { FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";

const LOGO_SRC = "/cypress-creek-logo.png";

export type PlaybookSide = "offense" | "defense" | "specialTeams";

type PlaybookToolProps = {
  side: PlaybookSide;
  canEdit?: boolean;
  /** When false (archive browse), do not load/save localStorage library. */
  persistLibrary?: boolean;
};

function storageKey(side: PlaybookSide) {
  return `team-os-playbook-library-${side}`;
}

function loadLibrary(side: PlaybookSide): LibraryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(side));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LibraryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLibrary(side: PlaybookSide, items: LibraryItem[]) {
  window.localStorage.setItem(storageKey(side), JSON.stringify(items));
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}


type TabId = "overview" | "formations" | "plays" | "misc";
type LibraryType = "formation" | "play" | "misc";

type LibraryItem = {
  id: string;
  type: LibraryType;
  title: string;
  category: string;
  subcategory: string;
  formation: string;
  description: string;
  coaching: string;
  fileKey: string | null;
  fileName: string | null;
  contentType: string | null;
  diagramData: string | null;
  createdAt: string;
};

const defensiveFrontOptions = ["ODD", "ODD STACK", "ODD STACK MONSTER", "EVEN STACK", "SPILT"];
const legacyDefensiveFrontOptions = ["4-2-5", "3-4", "4-3", "3-3-5", "Bear / 5-man"];
const playerColorOptions = [
  ["Black", "#2e2e2e"],
  ["Red", "#d62828"],
  ["Blue", "#1479d1"],
  ["Green", "#2e9d45"],
  ["Orange", "#ef6c00"],
  ["Purple", "#7040c4"],
] as const;
const playerShadeOptions = [
  ["Left half", "left", "linear-gradient(90deg, #8c8c8c 0 50%, #ffffff 50% 100%)"],
  ["Right half", "right", "linear-gradient(90deg, #ffffff 0 50%, #8c8c8c 50% 100%)"],
  ["Middle", "middle", "linear-gradient(90deg, #ffffff 0 34%, #8c8c8c 34% 66%, #ffffff 66% 100%)"],
  ["Full", "full", "#8c8c8c"],
] as const;

type MarkKind = "route" | "block";
type Point = { x: number; y: number };
type PlayerShape = "letter" | "circle" | "triangle" | "square";
type PlayerShade = "none" | "left" | "right" | "middle" | "full";
type LineStyle = "solid-arrow" | "solid-block" | "solid-none" | "squiggly-none" | "dashed-arrow" | "dashed-block" | "dashed-none";
type CanvasMark = {
  kind: MarkKind | "player" | "note" | "zone";
  points: Point[];
  label: string;
  shape?: PlayerShape;
  shade?: PlayerShade;
  color?: string;
  style?: LineStyle;
  zoneShape?: "rect" | "ellipse";
};
type FieldPosition = "midfield" | "redzone" | "goalline" | "backedup";
const CANVAS_WIDTH = 1100;
const CANVAS_HEIGHT = 560;

function defaultPlayerMarks(position: FieldPosition): CanvasMark[] {
  const lineY = getFieldConfig(position).lineOfScrimmageY;
  const playerY = lineY + 20;
  const quarterbackY = lineY + 100;
  const backY = lineY + 112;
  const lineX = [450, 500, 550, 600, 650];
  return [
    { kind: "player", points: [{ x: 32, y: playerY }], label: "X", shape: "letter", color: "#2e2e2e" },
    { kind: "player", points: [{ x: 205, y: lineY + 52 }], label: "A", shape: "letter", color: "#2e2e2e" },
    ...lineX.map((x, index) => ({ kind: "player" as const, points: [{ x, y: playerY }], label: "", shape: index === 2 ? "square" as const : "circle" as const, color: "#2e2e2e" })),
    { kind: "player", points: [{ x: 550, y: quarterbackY }], label: "Q", shape: "letter", color: "#2e2e2e" },
    { kind: "player", points: [{ x: 480, y: backY }], label: "B", shape: "letter", color: "#2e2e2e" },
    { kind: "player", points: [{ x: 870, y: playerY }], label: "Y", shape: "letter", color: "#2e2e2e" },
    { kind: "player", points: [{ x: 1048, y: lineY + 48 }], label: "Z", shape: "letter", color: "#2e2e2e" },
  ];
}

const defensiveFrontTemplates: Record<string, Array<[string, number, number]>> = {
  ODD: [["S", 300, -160], ["S", 795, -160], ["C", 140, -55], ["W", 350, -40], ["K", 486, -68], ["M", 590, -68], ["S", 726, -52], ["C", 978, -52], ["E", 463, -18], ["N", 550, -18], ["T", 636, -18]],
  "ODD STACK": [["S", 300, -160], ["R", 560, -154], ["S", 800, -160], ["C", 145, -55], ["W", 370, -45], ["M", 550, -75], ["S", 695, -60], ["C", 985, -48], ["E", 470, -18], ["N", 550, -18], ["T", 640, -18]],
  "ODD STACK MONSTER": [["S", 300, -150], ["S", 790, -155], ["C", 140, -56], ["W", 370, -45], ["K", 520, -120], ["M", 550, -75], ["S", 700, -55], ["C", 990, -50], ["E", 463, -20], ["N", 550, -20], ["T", 635, -20]],
  "EVEN STACK": [["S", 295, -160], ["S", 785, -160], ["C", 140, -55], ["W", 370, -50], ["M", 545, -78], ["S", 700, -60], ["C", 970, -50], ["E", 435, -20], ["N", 525, -20], ["T", 600, -20], ["E", 650, -20]],
  SPILT: [["S", 300, -155], ["S", 795, -155], ["C", 145, -55], ["W", 375, -55], ["M", 500, -75], ["S", 590, -75], ["C", 975, -45], ["E", 440, -20], ["N", 520, -20], ["T", 600, -20], ["E", 655, -20]],
};

function defaultDefensiveMarks(position: FieldPosition, front: string): CanvasMark[] {
  const lineY = getFieldConfig(position).lineOfScrimmageY;
  return (defensiveFrontTemplates[front] || []).map(([label, x, yOffset]) => ({ kind: "player" as const, points: [{ x, y: lineY + yOffset }], label, shape: "letter" as const, color: "#2e2e2e" }));
}

function defaultBlockingCards(position: FieldPosition = "midfield"): Record<string, CanvasMark[]> {
  return Object.fromEntries(defensiveFrontOptions.map((front) => [front, [...defaultPlayerMarks(position), ...defaultDefensiveMarks(position, front)]]));
}

function defaultMainPlayMarks(position: FieldPosition): CanvasMark[] {
  return [...defaultPlayerMarks(position), ...defaultDefensiveMarks(position, "SPILT")];
}

const tabs: Array<{ id: TabId; label: string; kicker: string }> = [
  { id: "overview", label: "Overview", kicker: "Staff room" },
  { id: "formations", label: "Formations", kicker: "Alignments" },
  { id: "plays", label: "Plays", kicker: "Concept library" },
  { id: "misc", label: "Misc", kicker: "Staff resources" },
];

const playTypeOptions = ["Run", "RPO", "Screen", "Play Action", "Pass", "Other"];
const runSubcategoryOptions = ["1/0 Man Scheme/Traps", "3/2 Tight Zone", "5/4 Mid Zone", "7/6 Gap Scheme", "9/8 Outside Zone"];
const systemPillars = [
  ["01", "Simple schemes", "Teach the details deeply so the offense can play fast and execute at a high level."],
  ["02", "Multiple formations", "Use formation structure to dictate defensive alignments and create leverage."],
  ["03", "Attack the whole field", "Run with physical intent, throw when we choose, and maximize every skill player."],
  ["04", "Protect the drive", "Avoid mental mistakes, turnovers, penalties, and long-yardage situations."],
];
const teachingTenets = ["Whole - Part - Whole", "Rule of 5", "Principle of Progression", "Why < How", "Intentional Purpose"];
const teachingMethods = ["Show It", "Draw It", "Walk It", "Do It"];
const offensiveGoals = ["One touchdown per quarter", "No more than one turnover per game", "6% or less sack ratio", "One pre-snap penalty per game", "Six explosive plays: pass 16+ yards, run 12+ yards"];
const gradingMarkers = ["Critical Error", "Lack of Effort", "Missed Assignment", "Technique Error"];

function tabFromHash(hash: string): TabId {
  const candidate = hash.replace("#", "") as TabId;
  return tabs.some((tab) => tab.id === candidate) ? candidate : "overview";
}

function CustomItemCard({ item, onOpen, onDelete }: { item: LibraryItem; onOpen?: () => void; onDelete?: () => void }) {
  const assetUrl = item.fileKey || null;
  const isPdf = item.contentType === "application/pdf";
  const isImage = item.contentType?.startsWith("image/") || false;
  const interactive = Boolean(onOpen);
  let clipName = "";
  try {
    const metadata = item.diagramData ? JSON.parse(item.diagramData) as { clipName?: string } : null;
    clipName = metadata?.clipName || "";
  } catch {
    clipName = "";
  }

  return (
    <article
      className={`custom-card${interactive ? " clickable-card" : ""}`}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Open ${item.title}` : undefined}
      onClick={(event) => {
        if (!onOpen || (event.target as HTMLElement).closest("a")) return;
        onOpen();
      }}
      onKeyDown={(event) => {
        if (onOpen && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      {assetUrl && isImage ? (
        <img src={assetUrl} alt={`${item.title} uploaded play card`} />
      ) : assetUrl ? (
        <a className="pdf-preview" href={assetUrl} target="_blank" rel="noreferrer">
          {isPdf ? "PDF" : "FILE"}
          <small>Open {item.fileName || "playbook file"}</small>
        </a>
      ) : (
        <div className="no-asset">NOTE</div>
      )}
      <div className="custom-card-body">
        <span>{item.subcategory ? `${item.category} · ${item.subcategory}` : item.category}</span>
        <h3>{item.title}</h3>
        {item.formation ? <p className="custom-formation">Formation: {item.formation}</p> : null}
        {item.description ? <p>{item.description}</p> : null}
        {item.coaching ? <small>{item.coaching}</small> : null}
        {clipName ? <span className="clip-link">Clip: {clipName}</span> : null}
        {item.fileName ? <em>{item.fileName}</em> : null}
        {onDelete ? <button type="button" className="delete-play-button" onClick={(event) => { event.stopPropagation(); onDelete(); }}>Delete item</button> : null}
      </div>
    </article>
  );
}

function PlayDetailModal({ item, onClose }: { item: LibraryItem; onClose: () => void }) {
  let metadata: { marks?: CanvasMark[]; blockingCards?: Record<string, CanvasMark[]>; fieldPosition?: FieldPosition; verticalFlip?: boolean } = {};
  try {
    const parsed = item.diagramData ? JSON.parse(item.diagramData) as { marks?: CanvasMark[]; blockingCards?: Record<string, CanvasMark[]>; fieldPosition?: FieldPosition; verticalFlip?: boolean } : {};
    metadata = parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    metadata = {};
  }
  const assetUrl = item.fileKey || null;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="play-detail-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="play-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="play-detail-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="play-detail-heading">
          <div><p className="eyebrow">Play cards</p><h2 id="play-detail-title">{item.title}</h2></div>
          <button type="button" className="play-detail-close" onClick={onClose} aria-label="Close play details">X</button>
        </div>
        <div className="play-detail-meta play-detail-meta-single"><div><span>Play type</span><strong>{item.category}{item.subcategory ? ` · ${item.subcategory}` : ""}</strong></div></div>
        <section className="front-play-card-section" aria-labelledby="front-play-card-title">
          <div className="front-play-card-heading">
            <div><p className="eyebrow">Defensive fronts</p><h3 id="front-play-card-title">Play cards</h3></div>
          </div>
          <div className="front-play-card-grid">
            {defensiveFrontOptions.map((front) => <article className="front-play-card" key={front}>
              <div className="front-play-card-label"><span>Blocking card</span><strong>{item.title} vs {front}</strong></div>
              {(() => {
                const frontIndex = defensiveFrontOptions.indexOf(front);
                const legacyFront = legacyDefensiveFrontOptions[frontIndex];
                const cardMarks = metadata.blockingCards?.[front] || metadata.blockingCards?.[legacyFront];
                return cardMarks?.length ? <PlayCardCanvas marks={cardMarks} fieldPosition={metadata.fieldPosition} verticalFlip={metadata.verticalFlip} alt={`${item.title} blocking card vs ${front}`} /> : assetUrl ? <img src={assetUrl} alt={`${item.title} play card vs ${front}`} /> : <div className="front-play-card-empty">No play diagram saved</div>;
              })()}
            </article>)}
          </div>
        </section>
      </section>
    </div>
  );
}

function PlayCardCanvas({ marks, alt, fieldPosition = "midfield", verticalFlip = false }: { marks: CanvasMark[]; alt: string; fieldPosition?: FieldPosition; verticalFlip?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (context) drawDesignerField(context, marks, [], "route", "solid-arrow", fieldPosition, null, verticalFlip);
  }, [fieldPosition, marks, verticalFlip]);

  return <canvas ref={canvasRef} className="front-play-card-canvas" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} aria-label={alt} />;
}

type FieldConfig = {
  length: number;
  goalAt: "top" | "bottom" | null;
  fieldTop: number;
  fieldBottom: number;
  lineOfScrimmageY: number;
  yardAt: (line: number) => number;
};

function getFieldConfig(position: FieldPosition): FieldConfig {
  if (position === "midfield") {
    return { length: 20, goalAt: null, fieldTop: 0, fieldBottom: CANVAS_HEIGHT, lineOfScrimmageY: CANVAS_HEIGHT * 0.64, yardAt: (line) => line <= 10 ? 40 + line : 50 - (line - 10) };
  }
  if (position === "redzone") return { length: 25, goalAt: "top", fieldTop: CANVAS_HEIGHT * 0.35, fieldBottom: CANVAS_HEIGHT, lineOfScrimmageY: CANVAS_HEIGHT * 0.69, yardAt: (line) => line };
  if (position === "goalline") return { length: 10, goalAt: "top", fieldTop: CANVAS_HEIGHT * 0.35, fieldBottom: CANVAS_HEIGHT, lineOfScrimmageY: CANVAS_HEIGHT * 0.35 + (CANVAS_HEIGHT * 0.65 * 0.2), yardAt: (line) => line };
  return { length: 20, goalAt: "bottom", fieldTop: 0, fieldBottom: CANVAS_HEIGHT * 0.69, lineOfScrimmageY: CANVAS_HEIGHT * 0.62, yardAt: (line) => 20 - line };
}

function drawDesignerField(
  context: CanvasRenderingContext2D,
  marks: CanvasMark[],
  draftPoints: Point[],
  draftKind: MarkKind,
  draftStyle: LineStyle,
  fieldPosition: FieldPosition,
  selectedIndex: number | null,
  verticalFlip = false
) {
  const width = CANVAS_WIDTH;
  const height = CANVAS_HEIGHT;
  const config = getFieldConfig(fieldPosition);

  context.clearRect(0, 0, width, height);
  context.save();
  if (verticalFlip) {
    context.translate(0, height);
    context.scale(1, -1);
  }
  context.fillStyle = "#f3f4f5";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "#e1e1e1";
  if (config.goalAt === "top") context.fillRect(0, 0, width, config.fieldTop);
  if (config.goalAt === "bottom") context.fillRect(0, config.fieldBottom, width, height - config.fieldBottom);

  for (let yard = 0; yard <= config.length; yard += 1) {
    const y = config.fieldTop + (yard / config.length) * (config.fieldBottom - config.fieldTop);
    const major = yard % 5 === 0;

    if (major) {
      context.strokeStyle = "#b4b4b4";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();

      if (yard > 0 && yard < config.length && yard % 10 === 0) {
        const label = String(config.yardAt(yard));
        context.fillStyle = "#d0d0d0";
        context.font = "800 27px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.save();
        context.translate(165, y);
        context.rotate(Math.PI / 2);
        context.fillText(label, 0, 0);
        context.restore();
        context.save();
        context.translate(width - 165, y);
        context.rotate(Math.PI / 2);
        context.fillText(label, 0, 0);
        context.restore();
        context.textAlign = "start";
        context.textBaseline = "alphabetic";
      }
    }

    context.strokeStyle = major ? "#bdbdbd" : "#d4d4d4";
    context.lineWidth = 1;
    [8, width / 3, (width / 3) * 2, width - 8].forEach((hashX) => {
      context.beginPath();
      context.moveTo(hashX - 9, y);
      context.lineTo(hashX + 9, y);
      context.stroke();
    });
  }

  context.strokeStyle = "#9f9f9f";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(0, height);
  context.moveTo(width, 0);
  context.lineTo(width, height);
  context.stroke();

  const goalY = config.goalAt === "top" ? config.fieldTop : config.goalAt === "bottom" ? config.fieldBottom : null;
  if (goalY !== null) {
    context.strokeStyle = "#777777";
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(0, goalY);
    context.lineTo(width, goalY);
    context.stroke();
  }

  context.strokeStyle = "#7777ff";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(0, config.lineOfScrimmageY);
  context.lineTo(width, config.lineOfScrimmageY);
  context.stroke();
  context.restore();

  function playerColorAtPoint(point: Point) {
    let nearestColor = "";
    let nearestDistance = 48;
    marks.forEach((mark) => {
      if (mark.kind !== "player") return;
      const distance = Math.hypot(mark.points[0].x - point.x, mark.points[0].y - point.y);
      if (distance <= nearestDistance) {
        nearestDistance = distance;
        nearestColor = mark.color || "#2e2e2e";
      }
    });
    return nearestColor;
  }

  function drawPath(points: Point[], kind: MarkKind, style: LineStyle, draft = false) {
    if (points.length < 2) return;
    const color = playerColorAtPoint(points[0]) || (kind === "route" ? "#202020" : "#8c4b25");
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
    context.strokeStyle = color;
    context.lineWidth = draft ? 4 : 5;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.setLineDash(style.startsWith("dashed") ? [12, 8] : style === "squiggly-none" ? [2, 6] : []);
    context.stroke();
    context.setLineDash([]);

    const last = points[points.length - 1];
    const previous = points[Math.max(0, points.length - 2)];
    const angle = Math.atan2(last.y - previous.y, last.x - previous.x);
    context.strokeStyle = color;
    context.fillStyle = color;
    if (style.endsWith("arrow")) {
      context.beginPath();
      context.moveTo(last.x, last.y);
      context.lineTo(last.x - 16 * Math.cos(angle - Math.PI / 6), last.y - 16 * Math.sin(angle - Math.PI / 6));
      context.lineTo(last.x - 16 * Math.cos(angle + Math.PI / 6), last.y - 16 * Math.sin(angle + Math.PI / 6));
      context.closePath();
      context.fill();
    } else if (style.endsWith("block")) {
      const perpX = Math.cos(angle + Math.PI / 2) * 10;
      const perpY = Math.sin(angle + Math.PI / 2) * 10;
      context.lineWidth = 4;
      context.beginPath();
      context.moveTo(last.x - perpX, last.y - perpY);
      context.lineTo(last.x + perpX, last.y + perpY);
      context.stroke();
    }
  }

  function playerPath(point: Point, shape: PlayerShape) {
    context.beginPath();
    if (shape === "circle") {
      context.arc(point.x, point.y, 12, 0, Math.PI * 2);
    } else if (shape === "triangle") {
      context.moveTo(point.x, point.y - 14);
      context.lineTo(point.x - 13, point.y + 11);
      context.lineTo(point.x + 13, point.y + 11);
      context.closePath();
    } else {
      context.rect(point.x - 12, point.y - 12, 24, 24);
    }
  }

  function drawPlayer(mark: CanvasMark) {
    const point = mark.points[0];
    const shape = mark.shape || "letter";
    const playerColor = mark.color || "#2e2e2e";
    const shade = mark.shade || "none";
    if (shape === "letter") {
      context.fillStyle = playerColor;
      context.font = "900 30px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(mark.label || "X", point.x, point.y);
      context.textAlign = "start";
      context.textBaseline = "alphabetic";
      return;
    }

    playerPath(point, shape);
    context.fillStyle = "#ffffff";
    context.fill();
    if (shade !== "none") {
      context.save();
      playerPath(point, shape);
      context.clip();
      context.fillStyle = playerColor;
      if (shade === "left") context.fillRect(point.x - 18, point.y - 18, 18, 36);
      if (shade === "right") context.fillRect(point.x, point.y - 18, 18, 36);
      if (shade === "middle") context.fillRect(point.x - 5, point.y - 18, 10, 36);
      if (shade === "full") context.fillRect(point.x - 18, point.y - 18, 36, 36);
      context.restore();
    }
    playerPath(point, shape);
    context.strokeStyle = "#4c4c4c";
    context.lineWidth = 2;
    context.stroke();
  }

  function drawSelection(mark: CanvasMark) {
    const points = mark.points;
    const minX = Math.min(...points.map((point) => point.x)) - 14;
    const maxX = Math.max(...points.map((point) => point.x)) + 14;
    const minY = Math.min(...points.map((point) => point.y)) - 14;
    const maxY = Math.max(...points.map((point) => point.y)) + 14;
    context.strokeStyle = "#00539f";
    context.lineWidth = 2;
    context.setLineDash([5, 4]);
    context.strokeRect(minX, minY, Math.max(28, maxX - minX), Math.max(28, maxY - minY));
    context.setLineDash([]);
  }

  marks.forEach((mark, index) => {
    if (mark.kind === "player") {
      drawPlayer(mark);
    } else if (mark.kind === "note") {
      const point = mark.points[0];
      const text = mark.label || "NOTE";
      context.font = "700 15px Arial";
      const noteWidth = Math.max(64, context.measureText(text).width + 18);
      context.fillStyle = "#f7e6a5";
      context.strokeStyle = "#9d842d";
      context.lineWidth = 1;
      context.fillRect(point.x - 8, point.y - 17, noteWidth, 28);
      context.strokeRect(point.x - 8, point.y - 17, noteWidth, 28);
      context.fillStyle = "#4c411a";
      context.fillText(text, point.x, point.y + 3);
    } else if (mark.kind === "zone") {
      const start = mark.points[0];
      const end = mark.points[1] || { x: start.x + 100, y: start.y + 60 };
      const left = Math.min(start.x, end.x);
      const top = Math.min(start.y, end.y);
      const zoneWidth = Math.abs(end.x - start.x);
      const zoneHeight = Math.abs(end.y - start.y);
      const zoneColor = mark.color || "#00539f";
      context.fillStyle = zoneColor;
      context.globalAlpha = 0.12;
      context.strokeStyle = zoneColor;
      context.lineWidth = 3;
      if (mark.zoneShape === "ellipse") {
        context.beginPath();
        context.ellipse(left + zoneWidth / 2, top + zoneHeight / 2, Math.max(16, zoneWidth / 2), Math.max(16, zoneHeight / 2), 0, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
        context.stroke();
      } else {
        context.fillRect(left, top, zoneWidth, zoneHeight);
        context.globalAlpha = 1;
        context.strokeRect(left, top, zoneWidth, zoneHeight);
      }
    } else {
      drawPath(mark.points, mark.kind, mark.style || (mark.kind === "route" ? "solid-arrow" : "solid-block"));
    }
    if (selectedIndex === index) drawSelection(mark);
  });

  if (draftKind && draftPoints.length > 1) drawPath(draftPoints, draftKind, draftStyle, true);
}

function PlayDesigner({ initialKind, onSaved, side }: { initialKind: "formation" | "play"; onSaved: () => void; side: PlaybookSide }) {
  type DesignerTool = "select" | "player" | "route" | "block" | "note" | "zone-rect" | "zone-ellipse" | "erase";
  const [kind, setKind] = useState<"formation" | "play">(initialKind);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<DesignerTool>("select");
  const [playerShape, setPlayerShape] = useState<PlayerShape>("letter");
  const [routeStyle, setRouteStyle] = useState<LineStyle>("solid-arrow");
  const [fieldPosition, setFieldPosition] = useState<FieldPosition>("midfield");
  const [verticalFlip, setVerticalFlip] = useState(false);
  const [boardZoom, setBoardZoom] = useState(1);
  const [editingMark, setEditingMark] = useState<{ index: number; x: number; y: number; value: string; kind: "player" | "note" } | null>(null);
  const [playerColorEditor, setPlayerColorEditor] = useState<{ index: number; x: number; y: number; color: string; shade: PlayerShade } | null>(null);
  const [zoneEditor, setZoneEditor] = useState<{ index: number; x: number; y: number; color: string; width: number; height: number; directionX: number; directionY: number } | null>(null);
  const [zoneResizeState, setZoneResizeState] = useState<{ index: number; start: Point; directionX: number; directionY: number } | null>(null);
  const [marks, setMarks] = useState<CanvasMark[]>(() => initialKind === "play" ? defaultMainPlayMarks("midfield") : defaultPlayerMarks("midfield"));
  const [mainMarks, setMainMarks] = useState<CanvasMark[]>([]);
  const [blockingCards, setBlockingCards] = useState<Record<string, CanvasMark[]>>(() => defaultBlockingCards());
  const [editingFront, setEditingFront] = useState<string | null>(null);
  const [draftPoints, setDraftPoints] = useState<Point[]>([]);
  const [linePointerState, setLinePointerState] = useState<{ kind: MarkKind; last: Point; moved: boolean } | null>(null);
  const [draftKind, setDraftKind] = useState<MarkKind>("route");
  const [redoMarks, setRedoMarks] = useState<CanvasMark[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dragState, setDragState] = useState<{ index: number; start: Point; original: Point[] } | null>(null);
  const [title, setTitle] = useState("");
  const [formation, setFormation] = useState("");
  const [category, setCategory] = useState(kind === "play" ? "Run" : "Base set");
  const [subcategory, setSubcategory] = useState(kind === "play" ? runSubcategoryOptions[0] : "");
  const [status, setStatus] = useState("");
  const label = kind === "play" ? "play" : "formation";
  const fieldMode = fieldPosition === "midfield" ? "40-to-40" : fieldPosition === "redzone" ? "25-to-goal" : fieldPosition === "goalline" ? "goal-to-10" : "goal-to-20";

  useEffect(() => {
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (context) drawDesignerField(context, marks, draftPoints, draftKind, routeStyle, fieldPosition, selectedIndex, verticalFlip);
  }, [canvas, marks, draftPoints, draftKind, routeStyle, fieldPosition, selectedIndex, verticalFlip]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setEditingMark(null);
        setPlayerColorEditor(null);
        setZoneEditor(null);
        setZoneResizeState(null);
        setDragState(null);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undoLast();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redoLast();
      }
      if (event.key.toLowerCase() === "v") selectTool("select");
      if (event.key.toLowerCase() === "l") { setPlayerShape("letter"); selectTool("player"); }
      if (event.key.toLowerCase() === "e") selectTool("erase");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function pointFromClient(clientX: number, clientY: number) {
    if (!canvas) return { x: 0, y: 0 };
    const bounds = canvas.getBoundingClientRect();
    return { x: ((clientX - bounds.left) / bounds.width) * canvas.width, y: ((clientY - bounds.top) / bounds.height) * canvas.height };
  }

  function pointFromEvent(event: React.PointerEvent<HTMLCanvasElement>) {
    return pointFromClient(event.clientX, event.clientY);
  }

  function distanceToSegment(point: Point, start: Point, end: Point) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = dx * dx + dy * dy;
    if (!length) return Math.hypot(point.x - start.x, point.y - start.y);
    const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / length));
    return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
  }

  function markHit(mark: CanvasMark, point: Point) {
    if (mark.kind === "player" || mark.kind === "note") return Math.hypot(mark.points[0].x - point.x, mark.points[0].y - point.y) < (mark.kind === "note" ? 90 : 38);
    if (mark.kind === "zone") {
      const start = mark.points[0];
      const end = mark.points[1] || { x: start.x + 100, y: start.y + 60 };
      return point.x >= Math.min(start.x, end.x) - 20 && point.x <= Math.max(start.x, end.x) + 20 && point.y >= Math.min(start.y, end.y) - 20 && point.y <= Math.max(start.y, end.y) + 20;
    }
    return mark.points.some((item, index) => Math.hypot(item.x - point.x, item.y - point.y) < 32 || (index > 0 && distanceToSegment(point, mark.points[index - 1], item) < 24));
  }

  function nearestMarkIndex(point: Point) {
    for (let index = marks.length - 1; index >= 0; index -= 1) if (markHit(marks[index], point)) return index;
    return -1;
  }

  function snapToPoint(point: Point) {
    let snapped = point;
    let nearestDistance = 26;
    marks.forEach((mark) => mark.points.forEach((candidate) => {
      const distance = Math.hypot(candidate.x - point.x, candidate.y - point.y);
      if (distance <= nearestDistance) {
        nearestDistance = distance;
        snapped = candidate;
      }
    }));
    return snapped;
  }

  function flipPoints(points: Point[], axis: "vertical" | "horizontal") {
    return points.map((point) => axis === "vertical" ? { ...point, y: CANVAS_HEIGHT - point.y } : { ...point, x: CANVAS_WIDTH - point.x });
  }

  function flipBoard(axis: "vertical" | "horizontal") {
    setMarks((current) => current.map((mark) => ({ ...mark, points: flipPoints(mark.points, axis) })));
    setDraftPoints((current) => flipPoints(current, axis));
    if (axis === "vertical") setVerticalFlip((current) => !current);
    setRedoMarks([]);
    setEditingMark(null);
    setPlayerColorEditor(null);
    setZoneEditor(null);
    setZoneResizeState(null);
    setLinePointerState(null);
    setStatus(`Play flipped ${axis}.`);
  }

  function beginMarkEdit(index: number) {
    const mark = marks[index];
    if (!mark || (mark.kind !== "player" && mark.kind !== "note")) return;
    setEditingMark({ index, x: mark.points[0].x, y: mark.points[0].y, value: mark.label || (mark.kind === "player" ? "X" : "NOTE"), kind: mark.kind });
  }

  function beginZoneEdit(index: number) {
    const mark = marks[index];
    if (!mark || mark.kind !== "zone") return;
    const start = mark.points[0];
    const end = mark.points[1] || { x: start.x + 130, y: start.y + 75 };
    setZoneEditor({ index, x: start.x, y: start.y, color: mark.color || "#00539f", width: Math.max(20, Math.round(Math.abs(end.x - start.x))), height: Math.max(20, Math.round(Math.abs(end.y - start.y))), directionX: end.x >= start.x ? 1 : -1, directionY: end.y >= start.y ? 1 : -1 });
    setSelectedIndex(index);
  }

  function updateZoneEditor(change: Partial<{ color: string; width: number; height: number }>) {
    if (!zoneEditor) return;
    const next = { ...zoneEditor, ...change, width: Math.max(20, Math.min(CANVAS_WIDTH, change.width ?? zoneEditor.width)), height: Math.max(20, Math.min(CANVAS_HEIGHT, change.height ?? zoneEditor.height)) };
    setZoneEditor(next);
    setMarks((current) => current.map((mark, index) => {
      if (index !== next.index || mark.kind !== "zone") return mark;
      const start = mark.points[0];
      const end = mark.points[1] || { x: start.x + next.width, y: start.y + next.height };
      return { ...mark, color: next.color, points: [start, { x: start.x + (end.x >= start.x ? next.width : -next.width), y: start.y + (end.y >= start.y ? next.height : -next.height) }] };
    }));
    setRedoMarks([]);
  }

  function beginZoneResize(event: React.PointerEvent<HTMLButtonElement>) {
    if (!zoneEditor) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setZoneResizeState({ index: zoneEditor.index, start: { x: zoneEditor.x, y: zoneEditor.y }, directionX: zoneEditor.directionX, directionY: zoneEditor.directionY });
  }

  function handleZoneResizeMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!zoneResizeState) return;
    const point = pointFromClient(event.clientX, event.clientY);
    const width = Math.max(20, Math.min(CANVAS_WIDTH, Math.round(Math.abs(point.x - zoneResizeState.start.x))));
    const height = Math.max(20, Math.min(CANVAS_HEIGHT, Math.round(Math.abs(point.y - zoneResizeState.start.y))));
    updateZoneEditor({ width, height });
  }

  function finishZoneResize(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setZoneResizeState(null);
  }

  function beginPlayerColorEdit(index: number) {
    const mark = marks[index];
    if (!mark || mark.kind !== "player") return;
    setSelectedIndex(index);
    setPlayerColorEditor({ index, x: mark.points[0].x, y: mark.points[0].y, color: mark.color || "#2e2e2e", shade: mark.shade || "none" });
    if ((mark.shape || "letter") === "letter") beginMarkEdit(index);
  }

  function updatePlayerColor(color: string) {
    if (!playerColorEditor) return;
    setMarks((current) => current.map((mark, index) => index === playerColorEditor.index ? { ...mark, color } : mark));
    setPlayerColorEditor((current) => current ? { ...current, color } : current);
    setRedoMarks([]);
  }

  function updatePlayerShade(shade: PlayerShade) {
    if (!playerColorEditor) return;
    setMarks((current) => current.map((mark, index) => index === playerColorEditor.index ? { ...mark, shade } : mark));
    setPlayerColorEditor((current) => current ? { ...current, shade } : current);
    setRedoMarks([]);
  }

  function changeDesignerKind(nextKind: "formation" | "play") {
    setKind(nextKind);
    setCategory(nextKind === "play" ? "Run" : "Base set");
    setSubcategory(nextKind === "play" ? runSubcategoryOptions[0] : "");
    setEditingFront(null);
    setMainMarks([]);
    setBlockingCards(defaultBlockingCards(fieldPosition));
    setMarks(nextKind === "play" ? defaultMainPlayMarks(fieldPosition) : defaultPlayerMarks(fieldPosition));
    setVerticalFlip(false);
    setStatus("");
  }

  function changePlayType(nextCategory: string) {
    setCategory(nextCategory);
    setSubcategory(nextCategory === "Run" ? runSubcategoryOptions[0] : "");
  }

  function changeFieldPosition(nextPosition: FieldPosition) {
    if (nextPosition === fieldPosition) return;
    const verticalShift = (getFieldConfig(nextPosition).lineOfScrimmageY - getFieldConfig(fieldPosition).lineOfScrimmageY) * (verticalFlip ? -1 : 1);
    const shiftMarks = (current: CanvasMark[]) => current.map((mark) => ({ ...mark, points: mark.points.map((point) => ({ ...point, y: point.y + verticalShift })) }));
    setFieldPosition(nextPosition);
    setMarks(shiftMarks);
    setMainMarks(shiftMarks);
    setBlockingCards((current) => Object.fromEntries(Object.entries(current).map(([front, cardMarks]) => [front, shiftMarks(cardMarks)])));
    setDraftPoints((current) => current.map((point) => ({ ...point, y: point.y + verticalShift })));
    setZoneEditor((current) => current ? { ...current, y: current.y + verticalShift } : current);
  }

  function selectBlockingCard(nextFront: string | null) {
    if (nextFront === editingFront) return;
    if (editingFront === null) setMainMarks(marks);
    else setBlockingCards((current) => ({ ...current, [editingFront]: marks }));
    setMarks(nextFront === null ? mainMarks : blockingCards[nextFront] || []);
    setEditingFront(nextFront);
    setDraftPoints([]);
    setRedoMarks([]);
    setSelectedIndex(null);
    setEditingMark(null);
    setPlayerColorEditor(null);
    setDragState(null);
  }

  function selectTool(nextTool: DesignerTool) {
    setTool(nextTool);
    setDraftPoints([]);
    setLinePointerState(null);
    setDragState(null);
    if (nextTool === "route" || nextTool === "block") setDraftKind(nextTool);
  }

  function chooseLineStyle(style: LineStyle, kindForStyle: MarkKind) {
    setRouteStyle(style);
    setDraftKind(kindForStyle);
    setTool(kindForStyle);
    setDraftPoints([]);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    setPlayerColorEditor(null);
    setZoneEditor(null);
    setZoneResizeState(null);
    const existingIndex = nearestMarkIndex(point);
    const existingMark = existingIndex >= 0 ? marks[existingIndex] : null;
    const moveExisting = existingMark && (
      tool === "select" ||
      (tool === "player" && existingMark.kind === "player") ||
      (tool === "note" && existingMark.kind === "note") ||
      ((tool === "zone-rect" || tool === "zone-ellipse") && existingMark.kind === "zone")
    );
    if (moveExisting && existingMark) {
      setSelectedIndex(existingIndex);
      setDragState({ index: existingIndex, start: point, original: existingMark.points });
      return;
    }
    if (tool === "select") {
      setSelectedIndex(null);
      return;
    }
    if (tool === "player") {
      const newIndex = marks.length;
      const newMark: CanvasMark = { kind: "player", points: [point], label: "X", shape: playerShape };
      setMarks((current) => [...current, newMark]);
      setRedoMarks([]);
      setSelectedIndex(newIndex);
      if (playerShape === "letter") setEditingMark({ index: newIndex, x: point.x, y: point.y, value: "X", kind: "player" });
      return;
    }
    if (tool === "note") {
      const newIndex = marks.length;
      setMarks((current) => [...current, { kind: "note", points: [point], label: "NOTE" }]);
      setRedoMarks([]);
      setSelectedIndex(newIndex);
      setEditingMark({ index: newIndex, x: point.x, y: point.y, value: "NOTE", kind: "note" });
      return;
    }
    if (tool === "erase") {
      const index = nearestMarkIndex(point);
      if (index >= 0) {
        setMarks((current) => current.filter((_, itemIndex) => itemIndex !== index));
        setRedoMarks([]);
        setSelectedIndex(null);
      }
      return;
    }
    if (tool === "zone-rect" || tool === "zone-ellipse") {
      setDraftPoints([point]);
      setSelectedIndex(null);
      return;
    }
    if (tool === "route" || tool === "block") {
      const lineKind = tool;
      const snappedPoint = snapToPoint(point);
      setDraftPoints((current) => current.length && draftKind === lineKind ? [...current, snappedPoint] : [snappedPoint]);
      setLinePointerState({ kind: lineKind, last: snappedPoint, moved: false });
      setSelectedIndex(null);
      return;
    }
    setDraftPoints((current) => current.length && draftKind === tool ? [...current, point] : [point]);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    const point = pointFromEvent(event);
    if (dragState) {
      const dx = point.x - dragState.start.x;
      const dy = point.y - dragState.start.y;
      setMarks((current) => current.map((mark, index) => index === dragState.index ? { ...mark, points: dragState.original.map((item) => ({ x: item.x + dx, y: item.y + dy })) } : mark));
      return;
    }
    if (linePointerState) {
      setDraftPoints((current) => {
        const last = current[current.length - 1];
        return last && Math.hypot(point.x - last.x, point.y - last.y) < 8 ? current : [...current, point];
      });
      setLinePointerState((current) => current ? { ...current, last: point, moved: true } : current);
      return;
    }
    if ((tool === "zone-rect" || tool === "zone-ellipse") && draftPoints.length === 1) setDraftPoints([draftPoints[0], point]);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    const point = pointFromEvent(event);
    if (dragState) {
      setDragState(null);
      setRedoMarks([]);
      return;
    }
    if (linePointerState) {
      setLinePointerState(null);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      return;
    }
    if (tool === "zone-rect" || tool === "zone-ellipse") {
      const start = draftPoints[0];
      if (start) {
        const end = draftPoints[1] || { x: start.x + 130, y: start.y + 75 };
        setMarks((current) => [...current, { kind: "zone", points: [start, end], label: "", color: "#00539f", zoneShape: tool === "zone-ellipse" ? "ellipse" : "rect" }]);
        setRedoMarks([]);
        setDraftPoints([]);
        setStatus("Zone added.");
      }
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    void point;
  }

  function handleDoubleClick(event: React.MouseEvent<HTMLCanvasElement>) {
    const point = pointFromClient(event.clientX, event.clientY);
    const index = nearestMarkIndex(point);
    if (index < 0) return;
    if (marks[index].kind === "player") beginPlayerColorEdit(index);
    if (marks[index].kind === "note") beginMarkEdit(index);
    if (marks[index].kind === "zone") beginZoneEdit(index);
  }

  function finishLine() {
    if (draftPoints.length < 2) { setStatus("Click at least two points on the field, then finish the line."); return; }
    setMarks((current) => [...current, { kind: draftKind, points: draftPoints, label: "", style: routeStyle }]);
    setDraftPoints([]);
    setLinePointerState(null);
    setRedoMarks([]);
    setStatus("Line added.");
  }

  function undoLast() {
    if (!marks.length) return;
    setRedoMarks((current) => [...current, marks[marks.length - 1]]);
    setMarks((current) => current.slice(0, -1));
    setSelectedIndex(null);
    setEditingMark(null);
    setPlayerColorEditor(null);
  }

  function redoLast() {
    const next = redoMarks[redoMarks.length - 1];
    if (!next) return;
    setMarks((current) => [...current, next]);
    setRedoMarks((current) => current.slice(0, -1));
  }

  function deleteSelected() {
    if (selectedIndex === null) { setStatus("Select a mark before deleting it."); return; }
    setMarks((current) => current.filter((_, index) => index !== selectedIndex));
    setSelectedIndex(null);
    setEditingMark(null);
    setPlayerColorEditor(null);
    setRedoMarks([]);
  }

  function clearBoard() {
    const preset = kind === "play" ? [...defaultPlayerMarks(fieldPosition), ...defaultDefensiveMarks(fieldPosition, editingFront || "SPILT")] : defaultPlayerMarks(fieldPosition);
    setMarks(preset);
    if (editingFront === null) setMainMarks(preset);
    else setBlockingCards((current) => ({ ...current, [editingFront]: preset }));
    setDraftPoints([]);
    setRedoMarks([]);
    setSelectedIndex(null);
    setEditingMark(null);
    setPlayerColorEditor(null);
    setVerticalFlip(false);
    setStatus("");
  }

  function commitMarkEdit() {
    if (!editingMark) return;
    const currentMark = marks[editingMark.index];
    const maxLength = editingMark.kind === "player" ? 1 : 40;
    const value = editingMark.value.trim().slice(0, maxLength).toUpperCase() || (currentMark?.kind === "player" ? "X" : "NOTE");
    setMarks((current) => current.map((mark, index) => index === editingMark.index ? { ...mark, label: value } : mark));
    setRedoMarks([]);
    setEditingMark(null);
  }

  async function saveDesigner() {
    const saveTitle = kind === "formation" ? formation.trim() : title.trim();
    if (!saveTitle) { setStatus(`Give this ${label} a name first.`); return; }
    const finalMarks = draftPoints.length >= 2 ? [...marks, { kind: draftKind, points: draftPoints, label: "", style: routeStyle }] : marks;
    const savedMainMarks = editingFront === null ? finalMarks : mainMarks;
    const savedBlockingCards = kind === "play" ? (editingFront === null ? blockingCards : { ...blockingCards, [editingFront]: finalMarks }) : {};
    const hasSavedMarks = savedMainMarks.length > 0 || Object.values(savedBlockingCards).some((card) => card.length > 0);
    if (!hasSavedMarks) { setStatus("Add at least one player, route, zone, or note before saving."); return; }
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (context) drawDesignerField(context, savedMainMarks, [], draftKind, routeStyle, fieldPosition, null, verticalFlip);
    setStatus("Adding to the playbook...");
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) { setStatus("The diagram could not be rendered. Try again."); return; }
    const payload = new FormData();
    payload.set("type", kind);
    payload.set("title", saveTitle);
    payload.set("formation", kind === "formation" ? saveTitle : formation.trim());
    payload.set("category", category.trim() || "General");
    payload.set("subcategory", kind === "play" && category === "Run" ? subcategory.trim() : "");
    payload.set("diagramData", JSON.stringify({ version: 5, fieldMode, fieldPosition, verticalFlip, marks: savedMainMarks, blockingCards: savedBlockingCards }));
    payload.append("file", blob, `cy-creek-${kind}-${Date.now()}.png`);

    try {
      const dataUrl = await blobToDataUrl(blob);
      const items = loadLibrary(side);
      const item: LibraryItem = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: kind,
        title: saveTitle,
        category: category.trim() || "General",
        subcategory: kind === "play" && category === "Run" ? subcategory.trim() : "",
        formation: kind === "formation" ? saveTitle : formation.trim(),
        description: "",
        coaching: "",
        fileKey: dataUrl,
        fileName: `${kind}-${Date.now()}.png`,
        contentType: "image/png",
        diagramData: JSON.stringify({ version: 5, fieldMode, fieldPosition, verticalFlip, marks: savedMainMarks, blockingCards: savedBlockingCards }),
        createdAt: new Date().toISOString(),
      };
      saveLibrary(side, [item, ...items]);
      setTitle(""); setFormation(""); setMarks(kind === "play" ? defaultMainPlayMarks(fieldPosition) : defaultPlayerMarks(fieldPosition)); setMainMarks([]); setBlockingCards(defaultBlockingCards(fieldPosition)); setEditingFront(null); setDraftPoints([]); setRedoMarks([]); setSelectedIndex(null); setEditingMark(null); setPlayerColorEditor(null); setZoneEditor(null); setZoneResizeState(null); setDragState(null); setVerticalFlip(false);
      setStatus(`Saved to the ${kind === "play" ? "Plays" : "Formations"} sheet.`);
      onSaved();
    } catch { setStatus("The diagram could not be saved. Try again."); }
  }

  const toolButton = (content: ReactNode, active: boolean, onClick: () => void, titleText: string, className = "") => <button type="button" className={`${active ? "active " : ""}${className}`.trim()} onClick={onClick} title={titleText} aria-label={titleText}>{content}</button>;
  const lineStyles: Array<[LineStyle, string, MarkKind]> = [["solid-arrow", "Arrow", "route"], ["solid-block", "Block", "block"], ["solid-none", "None", "route"], ["squiggly-none", "Squiggle", "route"], ["dashed-arrow", "Dash arrow", "route"], ["dashed-block", "Dash block", "block"], ["dashed-none", "Dash", "route"]];

  return (
    <section className="designer-panel" aria-labelledby={`${kind}-designer-title`}>
      <div className="designer-heading"><p className="eyebrow">Playbook Builder</p><h3 id={`${kind}-designer-title`}>Create a {label}</h3></div>
      <div className="designer-kind-picker" role="group" aria-label="Choose where to save this design">
        <span>Save as</span>
        <button type="button" className={kind === "formation" ? "active" : ""} onClick={() => changeDesignerKind("formation")}>Formation</button>
        <button type="button" className={kind === "play" ? "active" : ""} onClick={() => changeDesignerKind("play")}>Play</button>
      </div>
      <div className="play-meta-row">
        <label>Formation<input value={formation} onChange={(event) => setFormation(event.target.value)} placeholder="Formation" /></label>
        {kind === "play" ? <label>Play name<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Play name" /></label> : null}
        <label>{kind === "play" ? "Play type" : "Formation type"}{kind === "play" ? <select value={category} onChange={(event) => changePlayType(event.target.value)}>{playTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Formation type" />}</label>
        {kind === "play" && category === "Run" ? <label>Run scheme<select value={subcategory} onChange={(event) => setSubcategory(event.target.value)}>{runSubcategoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label> : null}
      </div>
      {kind === "play" ? <section className="blocking-card-picker" aria-label="Choose a blocking card to edit">
        <div><p className="eyebrow">Defensive front cards</p><strong>{editingFront ? `Editing ${editingFront}` : "Editing main play"}</strong></div>
        <div className="blocking-card-tabs">
          <button type="button" className={editingFront === null ? "active" : ""} onClick={() => selectBlockingCard(null)}>Main play</button>
          {defensiveFrontOptions.map((front) => <button type="button" className={editingFront === front ? "active" : ""} key={front} onClick={() => selectBlockingCard(front)}>{front}</button>)}
        </div>
      </section> : null}
      <div className="designer-workspace">
        <aside className="field-settings">
          <h4>Field Settings</h4>
          <fieldset><legend>Position</legend>
            {([["midfield", "Midfield"], ["redzone", "Redzone"], ["goalline", "Goalline"], ["backedup", "Backed Up"]] as Array<[FieldPosition, string]>).map(([value, labelText]) => (
              <label key={value}><input type="radio" name={`${kind}-field-position`} checked={fieldPosition === value} onChange={() => changeFieldPosition(value)} />{labelText}</label>
            ))}
          </fieldset>
          <button type="button" className="settings-button" onClick={() => flipBoard("vertical")}>Flip Play Vertical</button>
          <button type="button" className="settings-button" onClick={() => flipBoard("horizontal")}>Flip Play Horizontal</button>
          <button type="button" className="designer-save" onClick={saveDesigner}>Create this {kind === "play" ? "Play" : "Formation"}</button>
          <button type="button" className="designer-cancel" onClick={clearBoard}>Cancel</button>
          {status ? <span className="designer-status" role="status">{status}</span> : null}
        </aside>
        <div className="designer-board-wrap">
          <div className="designer-board-scroll">
            <div className="designer-board-shell" style={{ transform: `scale(${boardZoom})` }}>
              <canvas ref={setCanvas} className="designer-board" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} aria-label={`Draw ${label} diagram`} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onDoubleClick={handleDoubleClick} />
              {editingMark ? <input className={editingMark.kind === "note" ? "letter-editor annotation-editor" : "letter-editor"} autoFocus maxLength={editingMark.kind === "player" ? 1 : 40} value={editingMark.value} onFocus={(event) => event.currentTarget.select()} onChange={(event) => setEditingMark((current) => current ? { ...current, value: event.target.value } : current)} onBlur={commitMarkEdit} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); commitMarkEdit(); } if (event.key === "Escape") setEditingMark(null); }} style={{ left: `${(editingMark.x / CANVAS_WIDTH) * 100}%`, top: `${(editingMark.y / CANVAS_HEIGHT) * 100}%` }} aria-label={editingMark.kind === "player" ? "Edit player letter" : "Edit note text"} /> : null}
              {playerColorEditor ? <div className="player-color-editor" style={{ left: `${(playerColorEditor.x / CANVAS_WIDTH) * 100}%`, top: `calc(${(playerColorEditor.y / CANVAS_HEIGHT) * 100}% + 28px)` }}>
                <div className="player-palette" aria-label="Preset player colors">
                  {playerColorOptions.map(([name, color]) => <button type="button" className={`color-swatch${playerColorEditor.color === color ? " active" : ""}`} key={color} style={{ background: color }} onClick={() => updatePlayerColor(color)} aria-label={name} aria-pressed={playerColorEditor.color === color} title={name} />)}
                </div>
                <div className="player-shades" aria-label="Player shades">
                  {playerShadeOptions.map(([name, shade, background]) => <button type="button" className={`shade-swatch${playerColorEditor.shade === shade ? " active" : ""}`} key={shade} style={{ background }} onClick={() => updatePlayerShade(shade)} aria-label={name} aria-pressed={playerColorEditor.shade === shade} title={name} />)}
                </div>
                <button type="button" onClick={() => setPlayerColorEditor(null)}>Done</button>
              </div> : null}
              {zoneEditor ? <div className="zone-editor" style={{ left: `${(zoneEditor.x / CANVAS_WIDTH) * 100}%`, top: `calc(${(zoneEditor.y / CANVAS_HEIGHT) * 100}% + 28px)` }}>
                <label>Color<input type="color" value={zoneEditor.color} onChange={(event) => updateZoneEditor({ color: event.target.value })} aria-label="Choose zone color" title="Choose zone color" /></label>
                <button type="button" onClick={() => setZoneEditor(null)}>Done</button>
              </div> : null}
              {zoneEditor ? <button type="button" className="zone-resize-handle" style={{ left: `${((zoneEditor.x + zoneEditor.width * zoneEditor.directionX) / CANVAS_WIDTH) * 100}%`, top: `${((zoneEditor.y + zoneEditor.height * zoneEditor.directionY) / CANVAS_HEIGHT) * 100}%` }} onPointerDown={beginZoneResize} onPointerMove={handleZoneResizeMove} onPointerUp={finishZoneResize} onPointerCancel={finishZoneResize} aria-label="Drag to resize zone" title="Drag to resize zone"><span /></button> : null}
              <div className="zoom-controls"><button type="button" className="zoom-button" onClick={() => setBoardZoom((current) => Math.min(1.35, current + 0.15))}>Zoom In</button><button type="button" className="zoom-button" onClick={() => setBoardZoom((current) => Math.max(1, current - 0.15))}>Zoom Out</button></div>
            </div>
          </div>
          <div className="designer-toolbar" role="toolbar" aria-label="Drawing tools">
            <div className="designer-tool-group designer-shape-group" aria-label="Player tools">
              {toolButton(<span className="tool-glyph tool-glyph-select">↖</span>, tool === "select", () => selectTool("select"), "Select and move a mark")}
              {toolButton(<span className="tool-glyph tool-glyph-circle" />, tool === "player" && playerShape === "circle", () => { setPlayerShape("circle"); selectTool("player"); }, "Add a circle player")}
              {toolButton(<span className="tool-glyph tool-glyph-triangle" />, tool === "player" && playerShape === "triangle", () => { setPlayerShape("triangle"); selectTool("player"); }, "Add a triangle player")}
              {toolButton(<span className="tool-glyph tool-glyph-letter">Ab</span>, tool === "player" && playerShape === "letter", () => { setPlayerShape("letter"); selectTool("player"); }, "Add an editable player letter")}
            </div>
            <div className="designer-tool-group designer-route-group" aria-label="Route and block tools">
              {lineStyles.map(([style, textValue, kindForStyle]) => toolButton(<span className={`line-swatch line-swatch-${style}`} />, (tool === kindForStyle && routeStyle === style), () => chooseLineStyle(style, kindForStyle), `${textValue} ${kindForStyle}`))}
              <button className="finish-tool" type="button" disabled={draftPoints.length < 2} onClick={finishLine} title="Finish the current line">Finish</button>
            </div>
            <div className="designer-tool-group designer-mark-group" aria-label="Annotation tools">
              {toolButton(<span className="tool-glyph tool-glyph-note" />, tool === "note", () => selectTool("note"), "Add an editable note")}
              {toolButton(<span className="tool-glyph tool-glyph-rect" />, tool === "zone-rect", () => selectTool("zone-rect"), "Draw a rectangular zone")}
              {toolButton(<span className="tool-glyph tool-glyph-oval" />, tool === "zone-ellipse", () => selectTool("zone-ellipse"), "Draw an oval zone")}
              {toolButton(<span className="tool-glyph tool-glyph-erase">⌫</span>, tool === "erase", () => selectTool("erase"), "Erase a mark")}
            </div>
            <div className="designer-tool-group designer-action-group" aria-label="Editing actions">
              <button className="action-tool" type="button" disabled={selectedIndex === null} onClick={deleteSelected} title="Delete selected mark" aria-label="Delete selected mark">Delete</button>
              <button className="action-tool" type="button" disabled={!marks.length} onClick={undoLast} title="Undo last change" aria-label="Undo last change">Undo</button>
              <button className="action-tool" type="button" disabled={!redoMarks.length} onClick={redoLast} title="Redo last change" aria-label="Redo last change">Redo</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResourceUploadPanel({ onUploaded, side }: { onUploaded: () => void; side: PlaybookSide }) {
  const [status, setStatus] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Uploading...");
    const form = event.currentTarget;
    const payload = new FormData(form);
    payload.set("type", "misc");

    try {
      const title = String(payload.get("title") || "").trim() || "Untitled resource";
      const category = String(payload.get("category") || "General").trim() || "General";
      const description = String(payload.get("description") || "").trim();
      const coaching = String(payload.get("coaching") || "").trim();
      const file = payload.get("file");
      let fileKey: string | null = null;
      let fileName: string | null = null;
      let contentType: string | null = null;
      if (file instanceof File && file.size > 0) {
        fileKey = await blobToDataUrl(file);
        fileName = file.name;
        contentType = file.type || "application/octet-stream";
      }
      const items = loadLibrary(side);
      const item: LibraryItem = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "misc",
        title,
        category,
        subcategory: "",
        formation: "",
        description,
        coaching,
        fileKey,
        fileName,
        contentType,
        diagramData: null,
        createdAt: new Date().toISOString(),
      };
      saveLibrary(side, [item, ...items]);
      form.reset();
      setStatus("Added to the Misc sheet.");
      onUploaded();
    } catch {
      setStatus("Upload failed. Try again.");
    }
  }

  return (
    <section className="upload-panel" aria-labelledby="misc-upload-title">
      <div>
        <p className="eyebrow">Staff Resource</p>
        <h3 id="misc-upload-title">Add a misc resource</h3>
        <p>Keep install notes, PDFs, and other staff material with the rest of the playbook.</p>
      </div>
      <form className="upload-form" onSubmit={submit}>
        <label>
          Name
          <input name="title" required placeholder="Resource name" />
        </label>
        <label className="wide-field">
          Description
          <textarea name="description" required rows={3} placeholder="What this resource is for" />
        </label>
        <label className="wide-field file-field">
          File
          <input name="file" type="file" required accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.rtf,.txt,.csv" />
        </label>
        <div className="upload-actions">
          <button type="submit">Upload to playbook</button>
          {status ? <span role="status">{status}</span> : null}
        </div>
      </form>
    </section>
  );
}

export function PlaybookTool({
  side,
  canEdit = true,
  persistLibrary = true,
}: PlaybookToolProps) {
  const editAllowed = canEdit && persistLibrary;
  const sideLabel =
    side === "defense"
      ? "Defense"
      : side === "specialTeams"
        ? "Special Teams"
        : "Offense";
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [selectedPlay, setSelectedPlay] = useState<LibraryItem | null>(null);
  const [builderKind, setBuilderKind] = useState<"formation" | "play">("play");

  useEffect(() => {
    setLibrary(persistLibrary ? loadLibrary(side) : []);
    setSelectedPlay(null);
  }, [side, persistLibrary]);

  function refreshLibrary() {
    setLibrary(persistLibrary ? loadLibrary(side) : []);
  }

  function deletePlay(item: LibraryItem) {
    if (!editAllowed) return;
    if (!window.confirm(`Delete ${item.type} "${item.title}" from the playbook?`)) return;
    const next = loadLibrary(side).filter((x) => x.id !== item.id);
    saveLibrary(side, next);
    if (selectedPlay?.id === item.id) setSelectedPlay(null);
    refreshLibrary();
  }

  const plays = library.filter(
    (item) => item.type === "play" || item.type === "formation",
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-steel)]">
            {sideLabel} Playbook
          </p>
          <h1 className="text-2xl font-bold text-[var(--cc-navy)]">
            Playbook builder
          </h1>
          <p className="mt-1 text-sm text-[var(--cc-steel)]">
            Draw formations and plays. Saved designs stay with this{" "}
            {sideLabel.toLowerCase()} library.
          </p>
        </div>
        {editAllowed ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setBuilderKind("play")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                builderKind === "play"
                  ? "bg-[var(--cc-blue)] text-white"
                  : "border border-[var(--cc-line)] bg-white text-[var(--cc-navy)]"
              }`}
            >
              Play
            </button>
            <button
              type="button"
              onClick={() => setBuilderKind("formation")}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                builderKind === "formation"
                  ? "bg-[var(--cc-blue)] text-white"
                  : "border border-[var(--cc-line)] bg-white text-[var(--cc-navy)]"
              }`}
            >
              Formation
            </button>
          </div>
        ) : null}
      </div>

      {plays.length > 0 ? (
        <div className="playbook-root overflow-hidden rounded-xl border border-[var(--cc-line)] bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Saved ({plays.length})
          </p>
          <div className="custom-grid">
            {plays.map((item) => (
              <CustomItemCard
                key={item.id}
                item={item}
                onOpen={
                  item.type === "play" ? () => setSelectedPlay(item) : undefined
                }
                onDelete={editAllowed ? () => deletePlay(item) : undefined}
              />
            ))}
          </div>
        </div>
      ) : null}

      {editAllowed ? (
        <div className="playbook-root overflow-hidden rounded-xl border border-[var(--cc-line)]">
          <PlayDesigner
            key={`${side}-${builderKind}`}
            initialKind={builderKind}
            onSaved={refreshLibrary}
            side={side}
          />
        </div>
      ) : (
        <p className="rounded-xl border border-[var(--cc-line)] bg-white p-4 text-sm text-[var(--cc-steel)]">
          {persistLibrary
            ? "View only — coaches and above can use the builder."
            : "Playbook uploads are not stored in archived seasons."}
        </p>
      )}

      {selectedPlay ? (
        <PlayDetailModal
          key={selectedPlay.id}
          item={selectedPlay}
          onClose={() => setSelectedPlay(null)}
        />
      ) : null}
    </div>
  );
}
