import { randomUUID } from "node:crypto";
import { migrate, repositories, type Db } from "../db/index.js";
import { createServices, fail, scope, staff, type Actor, type Review } from "../domain/index.js";
import { actorFromVerifiedSession } from "../api/session.js";
import { seedTracker, trackerLocations, trackerDescriptions } from "./fixtures.js";

export { trackerDescriptions };
type AnalysisMode = "live" | "fixture" | "failed" | "unavailable";
export interface TrackerInput {
  clientRequestId: string;
  c?: number;
  text: string;
  time: string;
  mediaIds: string[];
  demoLocationId?: string;
}

// Only a completed, first-person feeding statement can establish who fed the colony.
function explicitFeeding(text: string) {
  const sentences = text.toLowerCase().replace(/’/g, "'").match(/[^.!?;\n]+[.!?;]?/g) ?? [];
  return sentences.some(sentence => {
    if (sentence.endsWith("?")) return false;
    if (/\b(not|never|no one|nobody|maybe|might|if|unsure|someone|didn't|couldn't|wasn't|haven't|hadn't|was not|was told|not sure)\b/.test(sentence)) return false;
    const fedColony = /\b(?:cats?|colony|kittens?|them|everyone|food)\b/.test(sentence) ||
      trackerLocations.some(location => sentence.includes(location.name.toLowerCase()));
    return fedColony && /^\s*(?:(?:i|we)\s+(?:just\s+|already\s+)?|(?:i've|we've|i have|we have)\s+)?(?:fed\b|put (?:out|down) (?:the |some )?food\b)/.test(sentence);
  });
}
function concernTitle(text: string) {
  if (/\b(?:injur\w*|bleed\w*|wound\w*|limp\w*|hurt|hit by|struggling)\b/i.test(text)) return "Needs vet attention";
  if (/\bpregnan\w*\b/i.test(text)) return "Pregnancy reported";
  if (/\bkitten\w*\b/i.test(text)) return "New kittens";
  if (/feeder.*(?:unavailable|needed|away|quit|left)|(?:no|lost|need|without).*feeder|no longer.*feed|can(?:not|'t|’t).*feed/i.test(text)) return "Feeder needed";
  return undefined;
}
function candidateIds(review: Review) {
  const list = review.proposedChange.candidates;
  if (Array.isArray(list)) return list.map((c: {catId: string}) => c.catId);
  return typeof review.proposedChange.catId === "string" ? [review.proposedChange.catId] : [];
}
function bootstrap(db: Db) {
  migrate(db);
  db.transaction(() => {
    const marked = db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='tracker_version'").get();
    if (marked) {
      if (!db.prepare("SELECT 1 FROM tracker_version WHERE version=1").get()) throw new Error("Unsupported tracker dataset");
      return;
    }
    if (db.prepare("SELECT 1 FROM colonies UNION ALL SELECT 1 FROM users LIMIT 1").get())
      throw new Error("Use a dedicated empty database for the tracker");
    db.exec(`
      CREATE TABLE tracker_version(version INTEGER PRIMARY KEY);
      CREATE TABLE tracker_analysis(report_id TEXT PRIMARY KEY REFERENCES reports(id), mode TEXT NOT NULL);
      CREATE TABLE tracker_claims(alert_id TEXT PRIMARY KEY REFERENCES alerts(id), user_id TEXT NOT NULL REFERENCES users(id));
    `);
    seedTracker(db);
    db.prepare("INSERT INTO tracker_version VALUES (1)").run();
  }).immediate();
}

export function createTrackerStore(db: Db) {
  bootstrap(db);
  const r = repositories(db);
  const services = createServices(db);
  const current = (a: Actor) => actorFromVerifiedSession(db, {userId: a.id});

  function submit(actor: Actor, input: TrackerInput) {
    const a = current(actor);
    // Phones can attach a known synthetic pin without selecting the colony a second time.
    const location = input.demoLocationId !== undefined
      ? trackerLocations.find(item => item.demoLocationId === input.demoLocationId)
      : input.c === undefined ? undefined : trackerLocations[input.c];
    if (!location) fail("VALIDATION", "Choose a fictional colony or share a recognized demo location.");
    scope(a, location.id);
    if (input.c !== undefined && input.c !== location.c)
      fail("VALIDATION", "The shared location does not match the selected colony.");
    return db.transaction(() => {
      const report = services.submitReport(a, {
        text: input.text, selectedColonyId: location.id, clientRequestId: input.clientRequestId,
        observedAt: input.time, mediaIds: input.mediaIds, demoLocationId: input.demoLocationId,
      });
      if (explicitFeeding(report.text)) {
        const visit = services.recordFeedingVisit(a, {colonyId: location.id, clientRequestId: report.id,
          occurredAt: report.observedAt!, evidence: report.text});
        db.prepare("UPDATE feeding_visits SET report_id=? WHERE id=? AND report_id IS NULL").run(report.id, visit.id);
      }
      if (concernTitle(report.text)) {
        db.prepare("UPDATE alerts SET level='same_day_review' WHERE report_id=? AND status='open'").run(report.id);
      }
      return report;
    }).immediate();
  }

  function setAnalysis(reportId: string, mode: AnalysisMode) {
    db.prepare(`INSERT INTO tracker_analysis(report_id,mode) VALUES (?,?)
      ON CONFLICT(report_id) DO UPDATE SET mode=excluded.mode WHERE tracker_analysis.mode IN ('failed','unavailable')`).run(reportId, mode);
  }

  function state(actor: Actor) {
    const a = current(actor);
    const visibleIds = new Set(r.colonies.list().filter(c => a.role === "staff" || a.assignedColonyIds.includes(c.id)).map(c => c.id));
    const locations = trackerLocations.filter(l => visibleIds.has(l.id));
    const members = new Map(r.users.list().map(u => [u.id, u.name]));
    const visits = r.feeding_visits.list().filter(v => visibleIds.has(v.colony_id)).sort((x, y) => y.occurred_at.localeCompare(x.occurred_at));
    const allAlerts = r.alerts.list().filter(alert => alert.colony_id && visibleIds.has(alert.colony_id) && alert.level === "same_day_review");
    const claims = new Map((db.prepare("SELECT * FROM tracker_claims").all() as {alert_id:string;user_id:string}[]).map(row => [row.alert_id, members.get(row.user_id)]));
    const modes = new Map((db.prepare("SELECT * FROM tracker_analysis").all() as {report_id:string;mode:AnalysisMode}[]).map(row => [row.report_id, row.mode]));
    const allReports = r.reports.list().filter(report => report.selected_colony_id && visibleIds.has(report.selected_colony_id));
    const visibleReports = allReports.filter(report => a.role === "staff" || report.actor_id === a.id);
    const reportsById = new Map(allReports.map(report => [report.id, report]));
    const aliases = new Map(r.merge_aliases.list().filter(alias => !alias.reversed_at).map(alias => [alias.alias_cat_id, alias.canonical_cat_id]));
    function canonical(id: string): string {
      const seen = new Set<string>();
      while (aliases.has(id)) {
        if (seen.has(id)) throw new Error("Invalid cat alias cycle");
        seen.add(id);
        id = aliases.get(id)!;
      }
      return id;
    }
    const eligibleCats = r.cats.list().filter(cat => visibleIds.has(cat.colony_id));
    const allCats = eligibleCats.filter(cat => cat.identity_confirmed && cat.lifecycle === "active" && canonical(cat.id) === cat.id);
    const recordedVet = new Set(eligibleCats.filter(cat => cat.vet_review_status === "needed").map(cat => canonical(cat.id)));
    const openInjuryReports = new Set(allAlerts.filter(alert => alert.status === "open" && concernTitle(alert.reasons) === "Needs vet attention").map(alert => alert.report_id));
    const observations = r.observations.list();
    const media = r.media.list();
    const reviews = a.role === "staff" ? r.review_requests.list() : [];
    const reportedVet = new Set(observations.filter(obs => obs.cat_id && openInjuryReports.has(obs.report_id)).map(obs => canonical(obs.cat_id!)));
    const cats = allCats.map(cat => ({
      id: cat.id, c: trackerLocations.find(l => l.id === cat.colony_id)!.c,
      name: cat.name, sterilization: cat.sterilization, vet: recordedVet.has(cat.id) || reportedVet.has(cat.id),
      recordedVetNeed: recordedVet.has(cat.id), reportedVetConcern: reportedVet.has(cat.id),
      ...(cat.id === "marigold" && {photo:"/api/tracker/reference/marigold", description:trackerDescriptions.get(cat.id)}),
    }));
    const colonies = locations.map(location => {
      const colonyCats = allCats.filter(cat => cat.colony_id === location.id);
      const lastVisit = visits.find(v => v.colony_id === location.id);
      return {...location, total:colonyCats.length, fixed:colonyCats.filter(cat => cat.sterilization === "fixed").length,
        tnr:colonyCats.filter(cat => cat.sterilization === "not_fixed").length,
        unknown:colonyCats.filter(cat => cat.sterilization === "unknown").length, vet:cats.filter(cat => cat.c === location.c && cat.vet).length,
        recordedVetNeeds:colonyCats.filter(cat => recordedVet.has(cat.id)).length, lastFedAt:lastVisit?.occurred_at ?? null,
        lastFeeder:lastVisit ? members.get(lastVisit.feeder_id) ?? null : null};
    });
    const reports = visibleReports.map(record => {
      const c = trackerLocations.find(l => l.id === record.selected_colony_id)!.c;
      const linked = observations.find(o => o.report_id === record.id && o.cat_id);
      const catId = linked?.cat_id ? canonical(linked.cat_id) : undefined;
      const pending = reviews.filter(review => review.report_id === record.id && review.status === "pending" && review.action === "link_observation");
      const suggestions = [...new Set(pending.flatMap(review => candidateIds({ proposedChange: JSON.parse(review.proposed_change) } as Review)))];
      const mediaIds = media.filter(item => item.report_id === record.id).map(item => item.id).sort();
      const photo = mediaIds[0];
      const mode = modes.get(record.id);
      return {
        id:record.id, c, text:record.text, by:members.get(record.actor_id)!, time:record.observed_at ?? record.received_at,
        submitted:record.received_at, fed:visits.some(v => v.report_id === record.id),
        vet:allAlerts.some(alert => alert.report_id === record.id && concernTitle(alert.reasons) === "Needs vet attention"),
        calico:c === 0 && Boolean(photo) && (/\bcalico\b/i.test(record.text) || catId === "marigold" || suggestions.includes("marigold")),
        ...(catId && {catId, cat:eligibleCats.find(cat => cat.id === catId)?.name}),
        ...(photo && {photo:`/api/media/${encodeURIComponent(photo)}`}), mediaIds,
        status:record.status, mode:mode ?? (record.client_request_id.startsWith("tracker-") && record.id.startsWith("tracker-") ? "seed" : "pending"),
        reviewable:a.role === "staff" && mediaIds.length === 1 && !catId && c === 0, candidateIds:suggestions,
        demoLocationId:record.demo_location_id ?? undefined,
      };
    }).sort((x,y) => y.submitted.localeCompare(x.submitted) || y.id.localeCompare(x.id));
    const issues = allAlerts.map(alert => {
      const source = reportsById.get(alert.report_id)!;
      const canRead = a.role === "staff" || source.actor_id === a.id;
      const claimedBy = claims.get(alert.id);
      return {id:alert.id, c:trackerLocations.find(l => l.id === alert.colony_id)!.c,
        title:concernTitle(alert.reasons) ?? "Care review needed", source:canRead ? alert.report_id : null,
        status:alert.status === "resolved" ? "Resolved" : claimedBy ? `Assigned to ${claimedBy}` : "Open"};
    });
    return {colonies, cats, reports, issues};
  }

  function review(actor: Actor, reportIds: string[], catId = "marigold") {
    const a = current(actor); staff(a);
    if (!Array.isArray(reportIds) || !reportIds.length || reportIds.length > 2 || new Set(reportIds).size !== reportIds.length)
      fail("VALIDATION", "Choose one or two distinct reports.");
    if (catId !== "marigold") fail("VALIDATION", "Select the reference cat shown in this comparison.");
    return db.transaction(() => {
      for (const id of reportIds) {
        const report = services.getReport(a, id);
        if (report.colonyId !== trackerLocations[0]!.id || report.mediaIds.length !== 1)
          fail("VALIDATION", "This comparison needs one photograph per Laundry Lane report.");
        const linked = report.observations.filter(o => o.catId);
        if (linked.some(o => o.catId !== catId)) fail("CONFLICT", "The report already has a different identity.", 409);
        if (linked.length && !report.observations.some(o => !o.catId)) continue;
        let reviews = report.reviews.filter(v => v.action === "link_observation" && v.status === "pending");
        if (reviews.some(v => !candidateIds(v).includes(catId)))
          fail("CONFLICT", "The proposed match changed. Refresh the comparison.", 409);
        if (!reviews.length) {
          let observationIds = report.observations.filter(o => !o.catId).map(o => o.id);
          if (!observationIds.length) {
            const observationId = randomUUID();
            r.observations.insert({id:observationId, report_id:id, cat_id:null, kind:"identity_review",
              statement:"Photo submitted for manual identity review.", source:"reporter",
              evidence_ids:JSON.stringify(report.mediaIds), observed_at:report.observedAt ?? null, created_at:new Date().toISOString()});
            observationIds = [observationId];
          }
          reviews = [services.createReview(a, {action:"link_observation", reportId:id,
            evidenceIds:report.mediaIds, proposedChange:{catId, observationIds}})];
        }
        for (const item of reviews) services.decideReview(a, item.id, {decision:"approve", expectedVersion:item.version,
          reason:"Rescue member compared the submitted photo with the canonical Marigold portrait.", selectedCatId:catId});
      }
      return {catId, reportIds};
    }).immediate();
  }

  function issue(actor: Actor, id: string, action: "claim" | "resolve") {
    const a = current(actor); staff(a);
    return db.transaction(() => {
      const alert = r.alerts.get(id);
      if (!alert || alert.level !== "same_day_review") fail("NOT_FOUND", "Care alert not found.",404);
      if (action === "resolve") {
        if (alert.status !== "resolved") services.resolveAlert(a,id,"Rescue member marked the care concern resolved.");
      } else if (action === "claim") {
        if (alert.status === "resolved") fail("CONFLICT","This care alert was already resolved.",409);
        const previous = db.prepare("SELECT user_id FROM tracker_claims WHERE alert_id=?").get(id) as {user_id:string}|undefined;
        if (previous && previous.user_id !== a.id) fail("CONFLICT","Another rescue member already claimed this concern.",409);
        if (!previous) {
          db.prepare("INSERT INTO tracker_claims VALUES (?,?)").run(id,a.id);
          r.audit_events.insert({id:randomUUID(), actor_id:a.id, action:"claim_alert", entity_type:"alert", entity_id:id,
            before_json:null, after_json:null, reason:"Rescue member took responsibility for the concern.", created_at:new Date().toISOString()});
        }
      } else fail("VALIDATION","Unsupported care action.");
      return {id, action};
    }).immediate();
  }
  return {state, submit, review, issue, setAnalysis};
}
