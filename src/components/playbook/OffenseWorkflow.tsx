"use client";

import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  POSITIONS, LIBRARY_KEY, WORKFLOW_KEY, parseLibrary, parseWorkflow, emptyWeek,
  weekKey, installPlay, removeInstalledPlay, updateAssignments, practiceTotals,
  addRep, addCall, newId, samplePlay, replaceStored,
  type Assignments, type LibraryItem, type WeekPlan,
} from "@/lib/offense-workflow";
import "./offense-workflow.css";

const CHANGE = "team-os-offense-storage";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(CHANGE, callback); };
}
function read(key: string) {
  try { return window.localStorage.getItem(key); }
  catch { return "STORAGE_UNAVAILABLE"; }
}
const serverSnapshot = () => null;
type Tab = "assignments" | "install" | "practice" | "calls";
const TABS: { id: Tab; title: string }[] = [{ id: "assignments", title: "1 · Play assignments" }, { id: "install", title: "2 · Weekly install" }, { id: "practice", title: "3 · Practice script" }, { id: "calls", title: "4 · Call sheet" }];

function AssignmentEditor({ play, save, disabled }: { play: LibraryItem; save: (a: Assignments, f: Record<string, string>) => void; disabled: boolean }) {
  const [assignments, setAssignments] = useState<Assignments>(play.assignments ?? {});
  const [fronts, setFronts] = useState<Record<string, string>>(play.frontAdjustments ?? {});
  const [newFront, setNewFront] = useState("");
  return <form onSubmit={e => { e.preventDefault(); save(assignments, fronts); }} className="ow-editor">
    <h3>{play.title} <small>Library revision {play.revision ?? 1}</small></h3>
    <p>{play.formation || "Formation not set"} · {play.category}</p>
    {play.coaching && <p className="ow-note">{play.coaching}</p>}
    <fieldset disabled={disabled}>
      <legend>Position assignments</legend>
      <div className="ow-assignment-grid">{POSITIONS.map(position => <label key={position}>{position}<textarea rows={2} value={assignments[position] ?? ""} onChange={e => setAssignments({ ...assignments, [position]: e.target.value })} /></label>)}</div>
      <legend>Front adjustments</legend>
      {Object.entries(fronts).map(([front, notes]) => <label key={front}>{front}<textarea value={notes} rows={2} onChange={e => setFronts({ ...fronts, [front]: e.target.value })} /></label>)}
      <div className="ow-inline"><label>New front<input value={newFront} onChange={e => setNewFront(e.target.value)} placeholder="ODD, EVEN, pressure…" /></label><button type="button" disabled={!newFront.trim() || Object.hasOwn(fronts, newFront.trim().toUpperCase())} onClick={() => { setFronts({ ...fronts, [newFront.trim().toUpperCase()]: "" }); setNewFront(""); }}>Add front</button></div>
      <button className="ow-primary" type="submit">Save assignments as next revision</button>
    </fieldset>
    <p className="ow-note">Existing installs keep their saved revision. To adopt changes, remove and reinstall the play; this also clears its scheduled calls.</p>
  </form>;
}

function Snapshot({ play }: { play: LibraryItem }) {
  return <details className="ow-snapshot"><summary>Assignments and coaching points</summary>
    <p>{play.coaching || "No coaching points."}</p>
    <dl>{POSITIONS.filter(p => play.assignments?.[p]).map(p => <div key={p}><dt>{p}</dt><dd>{play.assignments?.[p]}</dd></div>)}</dl>
    {Object.entries(play.frontAdjustments ?? {}).map(([front, text]) => <p key={front}><strong>{front}:</strong> {text || "No adjustment entered."}</p>)}
    {play.fileKey && <a href={play.fileKey} target="_blank" rel="noreferrer">Open attached {play.fileName || "play file"}</a>}
  </details>;
}

function MoveButtons({ index, length, move, label }: { index: number; length: number; move: (direction: -1 | 1) => void; label: string }) {
  return <><button type="button" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => move(-1)}>↑</button><button type="button" aria-label={`Move ${label} down`} disabled={index === length - 1} onClick={() => move(1)}>↓</button></>;
}
function reordered<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const result = [...items];
  [result[index], result[target]] = [result[target], result[index]];
  return result;
}

export function OffenseWorkflow({ season: initialSeason, initialWeek, initialTab, canEdit, onDesigner, attachments }: {
  season: string; initialWeek: number; initialTab: Tab; canEdit: boolean; onDesigner: () => void; attachments?: ReactNode;
}) {
  const rawLibrary = useSyncExternalStore(subscribe, () => read(LIBRARY_KEY), serverSnapshot);
  const rawWorkflow = useSyncExternalStore(subscribe, () => read(WORKFLOW_KEY), serverSnapshot);
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const data = useMemo(() => {
    try { return { library: parseLibrary(rawLibrary), workflow: parseWorkflow(rawWorkflow), error: "" }; }
    catch (e) { return { library: [], workflow: null, error: e instanceof Error ? e.message : "Saved data could not be read." }; }
  }, [rawLibrary, rawWorkflow]);
  const [season, setSeason] = useState(initialSeason);
  const [week, setWeek] = useState(initialWeek >= 0 && initialWeek <= 30 ? initialWeek : 1);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  const [undo, setUndo] = useState<{ key: string; before: string | null; after: string; label: string } | null>(null);
  const [periodTitle, setPeriodTitle] = useState("Team");
  const [minutes, setMinutes] = useState(10);
  const [sectionTitle, setSectionTitle] = useState("Openers");
  const key = weekKey(season, week);
  const plan = data.workflow?.weeks[key] ?? emptyWeek();
  const plays = data.library.filter(p => p.type === "play");
  const selectedPlay = plays.find(p => p.id === selected) ?? plays[0];
  const editable = canEdit && hydrated && !data.error;
  const totals = practiceTotals(plan);

  function persist(storageKey: string, next: unknown, label: string) {
    if (!editable) return;
    const before = storageKey === LIBRARY_KEY ? rawLibrary : rawWorkflow;
    try {
      // Refuse stale writes instead of silently overwriting another tab's work.
      const after = JSON.stringify(next);
      replaceStored(window.localStorage, storageKey, before, after);
      setUndo({ key: storageKey, before, after, label });
      setMessage(`${label}. Saved in this browser.`);
      window.dispatchEvent(new Event(CHANGE));
    } catch (e) { setMessage(`Save failed: ${e instanceof Error ? e.message : "browser storage unavailable"}. Nothing was replaced.`); }
  }
  function changePlan(next: WeekPlan, label: string) {
    if (data.workflow) persist(WORKFLOW_KEY, { ...data.workflow, weeks: { ...data.workflow.weeks, [key]: next } }, label);
  }
  function undoLast() {
    if (!undo || !editable) return;
    try {
      replaceStored(window.localStorage, undo.key, undo.after, undo.before);
      setMessage(`Undid ${undo.label.toLowerCase()}.`); setUndo(null); window.dispatchEvent(new Event(CHANGE));
    } catch (e) { setMessage(e instanceof Error ? e.message : "Undo failed."); }
  }
  const playFor = (id: string) => plan.plays.find(p => p.id === id)!;

  return <section className="offense-workflow" aria-label="Offense weekly workflow">
    <div className="ow-controls">
      <div className="ow-heading"><div><p className="ow-eyebrow">Offense · Coach workspace</p><h1>Build the week from your playbook</h1><p>Assignments → install → practice → game-day calls</p></div><button type="button" onClick={onDesigner}>Open play designer</button></div>
      <p className="ow-demo">Browser-local demo · Saves stay on this device and site. No team sync or athlete tracking. Keep a backup of important coaching work.</p>
      <div className="ow-inline ow-context"><label>Season<select value={season} onChange={e => { setSeason(e.target.value); setUndo(null); setMessage(""); }}>{[-1, 0, 1].map(offset => String(Number(initialSeason) + offset)).map(s => <option key={s}>{s}</option>)}</select></label><label>Week<select value={week} onChange={e => { setWeek(Number(e.target.value)); setUndo(null); setMessage(""); }}>{Array.from({ length: 31 }, (_, n) => <option key={n} value={n}>{n === 0 ? "0 · Preseason" : n}</option>)}</select></label><span>{plan.plays.length} installed · {totals.reps} practice reps · {totals.minutes} minutes</span></div>
      <nav className="ow-tabs" aria-label="Weekly workflow steps">{TABS.map(t => <button type="button" aria-current={tab === t.id ? "step" : undefined} key={t.id} onClick={() => setTab(t.id)}>{t.title}</button>)}</nav>
      {!canEdit && <p className="ow-demo">View only for this role or archived season.</p>}
      {data.error && <p role="alert">{data.error} Editing is disabled to protect saved data.</p>}
      {!hydrated && <p role="status">Loading local coaching work…</p>}
      <div className="ow-inline"><p role="status" aria-live="polite">{message}</p>{undo && <button type="button" disabled={!editable} onClick={undoLast}>Undo last change</button>}</div>
    </div>

    {hydrated && !data.error && tab === "assignments" && <div className="ow-controls ow-panel">
      <div className="ow-inline"><label>Library play<select value={selectedPlay?.id ?? ""} onChange={e => setSelected(e.target.value)}><option value="" disabled>Choose a saved play</option>{plays.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></label><button disabled={!editable || plays.some(p => p.id === samplePlay().id)} type="button" onClick={() => { const sample = samplePlay(); persist(LIBRARY_KEY, [...data.library, sample], "Added sample play"); setSelected(sample.id); }}>Add sample play</button></div>
      {!plays.length && <p className="ow-empty">No saved plays yet. Draw and save a play in the existing designer, or add the sample to try the workflow. Existing formations and uploads stay in the designer.</p>}
      {selectedPlay && <AssignmentEditor key={`${selectedPlay.id}:${selectedPlay.revision ?? 1}`} play={selectedPlay} disabled={!editable} save={(a, f) => persist(LIBRARY_KEY, data.library.map(p => p.id === selectedPlay.id ? updateAssignments(p, a, f) : p), "Saved play revision")} />}
    </div>}

    {hydrated && !data.error && tab === "install" && <div className="ow-panel">
      <h2>Season {season} · Week {week} install</h2><p className="ow-controls ow-note">Each selection freezes its assignments, diagram and attachment reference for this week. Library edits and deletions do not change saved installs.</p>
      <div className="ow-controls ow-library-list">{plays.map(p => <div key={p.id} className="ow-inline"><span><strong>{p.title}</strong> · {p.formation || "No formation"} · r{p.revision ?? 1}</span><button type="button" disabled={!editable || plan.plays.some(i => i.sourceId === p.id)} onClick={() => changePlan(installPlay(plan, p), "Installed play")}>{plan.plays.some(i => i.sourceId === p.id) ? "Installed" : "Install play"}</button></div>)}{!plays.length && <p className="ow-empty">Create or add a sample play in Play assignments first.</p>}</div>
      {!plan.plays.length && <p className="ow-empty">This week has no installed plays. Other weeks are kept separately.</p>}
      {plan.plays.map((p, index) => {
        const live = plays.find(l => l.id === p.sourceId);
        const changed = live && JSON.stringify(live) !== JSON.stringify(p.snapshot);
        return <article className="ow-installed" key={p.id}>
          <div className="ow-inline"><h3>{p.snapshot.title} <small>r{p.revision}</small></h3><span className="ow-controls">{changed ? "New library revision available" : !live ? "Library source removed · snapshot retained" : "Saved snapshot"}</span><div className="ow-controls">{editable && <><MoveButtons index={index} length={plan.plays.length} label={p.snapshot.title} move={direction => changePlan({ ...plan, plays: reordered(plan.plays, index, direction) }, "Reordered install")} /><button type="button" onClick={() => setPendingRemoval(p.id)}>Remove from install</button></>}</div></div>
          {editable && pendingRemoval === p.id && <div className="ow-controls ow-demo"><p>Remove this play and its practice/call-sheet slots? Undo restores them together.</p><div className="ow-inline"><button type="button" onClick={() => { changePlan(removeInstalledPlay(plan, p.id), "Removed installed play and its calls"); setPendingRemoval(null); }}>Confirm removal</button><button type="button" onClick={() => setPendingRemoval(null)}>Keep play</button></div></div>}
          <p>{p.snapshot.formation} · {p.snapshot.category}</p><Snapshot play={p.snapshot} />
        </article>;
      })}
    </div>}

    {hydrated && !data.error && tab === "practice" && <div className="ow-panel">
      <h2>Season {season} · Week {week} practice script</h2><p>{totals.minutes} minutes · {totals.reps} repetitions</p>
      <form className="ow-inline ow-controls" onSubmit={e => { e.preventDefault(); changePlan({ ...plan, periods: [...plan.periods, { id: newId(), title: periodTitle.trim(), minutes, calls: [] }] }, "Added practice period"); }}><label>Period name<input required maxLength={80} value={periodTitle} onChange={e => setPeriodTitle(e.target.value)} /></label><label>Minutes<input type="number" min={1} max={120} required value={minutes} onChange={e => setMinutes(Number(e.target.value))} /></label><button disabled={!editable || !periodTitle.trim()} type="submit">Add period</button></form>
      {!plan.periods.length && <p className="ow-empty">No periods yet. Add Indy, Inside Run, Team or any period you need.</p>}
      {!plan.plays.length && <p className="ow-controls ow-note">Install a play in this week before adding repetitions.</p>}
      {plan.periods.map((period, index) => <article className="ow-period" key={period.id}><div className="ow-inline"><h3>{index + 1}. {period.title} · {period.minutes} min</h3>{editable && <div className="ow-controls"><MoveButtons index={index} length={plan.periods.length} label={`period ${period.title}`} move={direction => changePlan({ ...plan, periods: reordered(plan.periods, index, direction) }, "Reordered periods")} /><button type="button" onClick={() => changePlan({ ...plan, periods: [...plan.periods, { ...structuredClone(period), id: newId(), title: `${period.title} (copy)`, calls: period.calls.map(c => ({ ...c, id: newId() })) }] }, "Duplicated period")}>Duplicate period</button><button type="button" onClick={() => changePlan({ ...plan, periods: plan.periods.filter(p => p.id !== period.id) }, "Removed period")}>Remove period</button></div>}</div>
        <table><thead><tr><th>#</th><th>Play / formation / revision</th><th>Reps</th><th>Scout look</th><th className="ow-controls">Order / remove</th></tr></thead><tbody>{period.calls.map((rep, repIndex) => <tr key={rep.id}><td>{repIndex + 1}</td><td>{playFor(rep.installId).snapshot.title}<small>{playFor(rep.installId).snapshot.formation} · r{playFor(rep.installId).revision}</small></td><td>{rep.reps}</td><td>{rep.scoutLook || "—"}</td><td className="ow-controls">{editable && <><MoveButtons index={repIndex} length={period.calls.length} label={`rep ${repIndex + 1}`} move={direction => changePlan({ ...plan, periods: plan.periods.map(p => p.id === period.id ? { ...p, calls: reordered(p.calls, repIndex, direction) } : p) }, "Reordered reps")} /><button type="button" aria-label={`Remove rep ${repIndex + 1}`} onClick={() => changePlan({ ...plan, periods: plan.periods.map(p => p.id === period.id ? { ...p, calls: p.calls.filter(c => c.id !== rep.id) } : p) }, "Removed repetitions")}>Remove</button></>}</td></tr>)}</tbody></table>
        {!period.calls.length && <p className="ow-empty">No plays assigned to this period.</p>}
        {editable && <RepForm plan={plan} add={(id, reps, look) => changePlan(addRep(plan, period.id, id, reps, look), "Added repetitions")} />}
      </article>)}
    </div>}

    {hydrated && !data.error && tab === "calls" && <div className="ow-panel">
      <h2>Season {season} · Week {week} call sheet</h2>
      <form className="ow-inline ow-controls" onSubmit={e => { e.preventDefault(); changePlan({ ...plan, sections: [...plan.sections, { id: newId(), title: sectionTitle.trim(), calls: [] }] }, "Added call-sheet section"); }}><label>Situation<input required maxLength={80} value={sectionTitle} onChange={e => setSectionTitle(e.target.value)} placeholder="Openers, Red Zone, Third Down…" /></label><button type="submit" disabled={!editable || !sectionTitle.trim()}>Add section</button></form>
      {!plan.sections.length && <p className="ow-empty">No situations yet. Add Openers, Red Zone, Backed Up or your own section.</p>}
      {!plan.plays.length && <p className="ow-controls ow-note">Only plays installed in the selected week are available for the call sheet.</p>}
      <div className="ow-call-grid">{plan.sections.map((section, index) => <article className="ow-period" key={section.id}><div className="ow-inline"><h3>{section.title}</h3>{editable && <div className="ow-controls"><MoveButtons index={index} length={plan.sections.length} label={`section ${section.title}`} move={direction => changePlan({ ...plan, sections: reordered(plan.sections, index, direction) }, "Reordered sections")} /><button type="button" onClick={() => changePlan({ ...plan, sections: plan.sections.filter(s => s.id !== section.id) }, "Removed call-sheet section")}>Remove section</button></div>}</div>
        <ol>{section.calls.map((call, callIndex) => <li key={call.id}><strong>{playFor(call.installId).snapshot.title}</strong><small>{playFor(call.installId).snapshot.formation} · r{playFor(call.installId).revision}</small>{call.note && <p>{call.note}</p>}{editable && <div className="ow-controls"><MoveButtons index={callIndex} length={section.calls.length} label={`call ${callIndex + 1}`} move={direction => changePlan({ ...plan, sections: plan.sections.map(s => s.id === section.id ? { ...s, calls: reordered(s.calls, callIndex, direction) } : s) }, "Reordered calls")} /><button type="button" aria-label={`Remove call ${callIndex + 1}`} onClick={() => changePlan({ ...plan, sections: plan.sections.map(s => s.id === section.id ? { ...s, calls: s.calls.filter(c => c.id !== call.id) } : s) }, "Removed call")}>Remove</button></div>}</li>)}</ol>
        {!section.calls.length && <p className="ow-empty">No calls in this situation.</p>}
        {editable && <CallForm plan={plan} add={(id, note) => changePlan(addCall(plan, section.id, id, note), "Added call")} />}
      </article>)}</div>
    </div>}

    <div className="ow-controls ow-inline"><button type="button" disabled={!hydrated || !!data.error || tab === "assignments"} onClick={() => window.print()}>Print {tab === "calls" ? "call sheet" : tab === "practice" ? "practice script" : "install"}</button><span className="ow-note">Print uses saved snapshots from the selected week.</span></div>
    <p className="ow-print-footer">Offense · Season {season} · Week {week} · Browser-local coaching demo</p>
    {attachments && <details className="ow-controls ow-attachments"><summary>Existing weekly attachments</summary>{attachments}</details>}
  </section>;
}

function InstalledSelect({ plan, value, onChange }: { plan: WeekPlan; value: string; onChange: (id: string) => void }) {
  return <select required value={value} onChange={e => onChange(e.target.value)}><option value="">Choose installed play</option>{plan.plays.map(p => <option key={p.id} value={p.id}>{p.snapshot.title} · r{p.revision}</option>)}</select>;
}
function RepForm({ plan, add }: { plan: WeekPlan; add: (id: string, reps: number, look: string) => void }) {
  const [id, setId] = useState(""); const [reps, setReps] = useState(4); const [look, setLook] = useState("");
  const valid = plan.plays.some(p => p.id === id);
  return <form className="ow-inline ow-controls" onSubmit={e => { e.preventDefault(); if (valid) add(id, reps, look); }}><label>Installed play<InstalledSelect plan={plan} value={valid ? id : ""} onChange={setId} /></label><label>Reps<input type="number" min={1} max={100} step={1} required value={reps} onChange={e => setReps(Number(e.target.value))} /></label><label>Scout look<input value={look} maxLength={160} onChange={e => setLook(e.target.value)} placeholder="ODD · boundary pressure" /></label><button type="submit" disabled={!valid}>Add reps</button></form>;
}
function CallForm({ plan, add }: { plan: WeekPlan; add: (id: string, note: string) => void }) {
  const [id, setId] = useState(""); const [note, setNote] = useState("");
  const valid = plan.plays.some(p => p.id === id);
  return <form className="ow-inline ow-controls" onSubmit={e => { e.preventDefault(); if (valid) add(id, note); }}><label>Installed play<InstalledSelect plan={plan} value={valid ? id : ""} onChange={setId} /></label><label>Call note / wristband<input maxLength={160} value={note} onChange={e => setNote(e.target.value)} /></label><button type="submit" disabled={!valid}>Add call</button></form>;
}
