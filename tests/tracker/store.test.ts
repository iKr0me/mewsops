import { afterEach, expect, it } from "vitest";
import { createDatabase, repositories, type Db } from "../../src/db/index.js";
import { actorFromVerifiedSession } from "../../src/api/session.js";
import { createTrackerStore, type TrackerInput } from "../../src/tracker/store.js";

const opened: Db[] = [];
afterEach(() => { for (const db of opened.splice(0)) db.close(); });
function scene() {
  const db = createDatabase(":memory:");
  opened.push(db);
  const store = createTrackerStore(db);
  const user = (userId: string) => actorFromVerifiedSession(db, {userId});
  const report = (overrides: Partial<TrackerInput> = {}): TrackerInput => ({
    c: 0, clientRequestId: "first", demoLocationId: "demo-location-1",
    time: new Date(Date.now() - 600_000).toISOString(), mediaIds: [], text: "Fed the colony. A calico is limping.", ...overrides,
  });
  return {db, store, user, report};
}

it("seeds the fictional canonical census once, including unknown TNR and three open background concerns", () => {
  const {db, store, user} = scene();
  const before = store.state(user("beatriz"));
  expect(before.colonies).toHaveLength(9);
  expect(before.colonies[0]).toMatchObject({name: "Laundry Lane", total: 7, fixed: 5, tnr: 2, unknown: 0});
  expect(before.colonies.some(c => c.unknown > 0)).toBe(true);
  expect(before.issues.map(i => i.title).sort()).toEqual(["Feeder needed","New kittens","Pregnancy reported"]);
  expect(createTrackerStore(db).state(user("beatriz"))).toEqual(before);
});

it("writes one feeding receipt tied to the reporter, visit time and original evidence, even when retried", () => {
  const {db, store, user, report} = scene();
  const input = report();
  const first = store.submit(user("luz"),input);
  const second = store.submit(user("luz"),input);
  expect(first.id).toBe(second.id);
  expect(db.prepare("SELECT feeder_id, occurred_at, evidence FROM feeding_visits WHERE report_id=?").all(first.id))
    .toEqual([{feeder_id:"luz", occurred_at:input.time, evidence:input.text}]);
  expect(store.state(user("nico")).colonies[0]).toMatchObject({lastFedAt:input.time, lastFeeder:"Luz"});
  expect(store.state(user("nico")).reports.some(r => r.id === first.id)).toBe(false);
  for (const [i,text] of ["I didn't feed the cats.", "Someone else fed the colony.", "I will feed tomorrow.", "No one fed them.", "Fed the cats?", "Fed the dog.", "Fed up with the noise."].entries())
    store.submit(user("nico"),report({clientRequestId:`negative-${i}`, text}));
  expect(store.state(user("beatriz")).colonies[0]!.lastFeeder).toBe("Luz");
  expect(() => store.submit(user("luz"),{...input,text:"Different text"})).toThrow(/different input/);
  expect(() => store.submit(user("luz"),report({demoLocationId:"demo-location-2"}))).toThrow(/does not match/);
});

it("shows scoped care summaries to colleagues, restricts private evidence, and verifies current membership",() => {
  const {db,store,user,report} = scene();
  const sender = user("luz");
  const peer = user("nico");
  const id = store.submit(sender,report()).id;
  const team = store.state(user("beatriz"));
  const alert = team.issues.find(i => i.source === id)!;
  expect(alert.title).toBe("Needs vet attention");
  expect(store.state(peer).issues.find(i => i.id === alert.id)?.source).toBeNull();
  expect(() => store.issue(peer,alert.id,"claim")).toThrow(/Staff/);
  store.issue(user("beatriz"),alert.id,"claim");
  expect(store.state(sender).issues.find(i => i.id === alert.id)?.status).toBe("Assigned to Beatriz");
  store.issue(user("beatriz"),alert.id,"resolve");
  expect(store.state(peer).issues.find(i => i.id === alert.id)?.status).toBe("Resolved");
  db.prepare("DELETE FROM colony_assignments WHERE user_id=? AND colony_id=?").run("nico","colony-1");
  expect(store.state(peer).issues.some(i => i.id === alert.id)).toBe(false);
  expect(() => store.submit(peer,report())).toThrow(/scope/);
});

it("links two volunteers' separate observations only after a staff photo comparison when analysis is unavailable",() => {
  const {db,store,user,report} = scene();
  const repo = repositories(db);
  const ids = ["luz","nico"].map(owner => {
    const mediaId = `image-${owner}`;
    repo.media.insert({id:mediaId, uploaded_by:owner, report_id:null, created_at:new Date().toISOString(),
      available:1, sha256:null, storage_ref:mediaId});
    return store.submit(user(owner),report({mediaIds:[mediaId],text:"A calico is limping."})).id;
  });
  expect(() => store.review(user("luz"),ids)).toThrow(/Staff review/);
  expect(() => store.review(user("beatriz"),[ids[0]!,"wrong"])).toThrow();
  expect(repo.observations.list()).toHaveLength(0);
  store.review(user("beatriz"),ids);
  store.review(user("beatriz"),ids);
  const final = store.state(user("beatriz"));
  expect(final.reports.filter(r => ids.includes(r.id)).map(r => r.catId)).toEqual(["marigold","marigold"]);
  expect(final.colonies[0]).toMatchObject({total:7, vet:1, recordedVetNeeds:0});
  expect(final.cats.find(c => c.id === "marigold")).toMatchObject({vet:true, reportedVetConcern:true, recordedVetNeed:false});
  expect(final.issues.filter(i => i.source && ids.includes(i.source)).every(i => i.status === "Open")).toBe(true);
  expect(repo.review_requests.list()).toHaveLength(2);
});
