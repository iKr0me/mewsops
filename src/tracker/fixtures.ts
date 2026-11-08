import { repositories, type Db } from "../db/index.js";

const colonies = [
  ["Laundry Lane", 42, 49, 7, 5, "Behind the laundromat"],
  ["Buttonwood Row", 15, 25, 6, 4, "West park entrance"],
  ["Heron Steps", 35, 17, 5, 4, "Library steps"],
  ["Pelican Yard", 56, 26, 8, 7, "Bridge parking lot"],
  ["Cypress Court", 20, 55, 4, 3, "Community garden"],
  ["Biscuit Wharf", 60, 61, 9, 6, "Canal boat shed"],
  ["Palm Pocket", 30, 79, 3, 2, "Plant nursery"],
  ["Blue Lantern", 52, 85, 5, 3, "Market loading bay"],
  ["Shell Key", 84, 42, 4, 4, "Beach picnic area"],
] as const;

export const trackerLocations = colonies.map(([name, x, y, total, fixed, label], c) => ({
  id: `colony-${c + 1}`, c, name, x, y, total, fixed, label, demoLocationId: `demo-location-${c + 1}`,
}));

// Based on the two synthetic portraits in mobile/web/calico1.jpg and calico2.jpg.
export const trackerDescriptions = new Map([["marigold",
  "Short-haired calico. Seen face-on, a black patch surrounds the eye on the viewer's left, and ginger surrounds the eye on the right. A narrow white blaze runs down to a pink nose; muzzle, chest and front paws are white. Black and ginger patches cover the back.",
]]);

export function seedTracker(db: Db) {
  const r = repositories(db);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const earlier = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
  const seedCatNames = ["Marigold", "Pepper", "Clover", "Toast", "Pip", "Mango", "Juniper", "Basil", "Dune"];
  const users = [
    {id: "beatriz", name: "Beatriz", role: "staff"},
    {id: "luz", name: "Luz", role: "volunteer"},
    {id: "nico", name: "Nico", role: "volunteer"},
  ] as const;
  for (const user of users) r.users.insert({ ...user, available: 1 });
  for (const location of trackerLocations) {
    const {id, c, name, label, demoLocationId, total, fixed} = location;
    r.colonies.insert({id, name, location_label: label, exact_location: demoLocationId});
    for (const user of users) r.assignments.assign(user.id, id);
    for (let n = 0; n < total; n++) {
      r.cats.insert({
        id: c === 0 && n === 0 ? "marigold" : `tracker-cat-${c + 1}-${n + 1}`,
        colony_id: id,
        name: c === 0 ? seedCatNames[n]! : `${seedCatNames[(c + n) % seedCatNames.length]} of ${name}`,
        lifecycle: "active",
        sterilization: n < fixed ? "fixed" : c > 0 && n === total - 1 ? "unknown" : "not_fixed",
        identity_confirmed: 1, vet_review_status: "none", created_at: yesterday, version: 1,
      });
    }
    const feeder = users[c % users.length]!.id;
    const reportId = `tracker-visit-${c}`;
    const text = "Fed the colony and refilled the water bowls.";
    r.reports.insert({id: reportId, actor_id: feeder, client_request_id: reportId,
      text, selected_colony_id: id, demo_location_id: demoLocationId, observed_at: yesterday,
      received_at: yesterday, status: "completed"});
    r.feeding_visits.insert({id: `feeding-${c}`, colony_id: id, feeder_id: feeder, report_id: reportId,
      occurred_at: yesterday, recorded_at: yesterday, confirmed_by: feeder, client_request_id: reportId, evidence: text});
  }
  for (const [c, text] of [
    [2, "A cat appears pregnant. Please arrange a welfare check."],
    [5, "Spotted three new kittens beside the shed."],
    [7, "I can no longer feed the cats. A new feeder is needed at the market loading bay."],
  ] as const) {
    const location = trackerLocations[c]!;
    const id = `tracker-concern-${c}`;
    r.reports.insert({id, actor_id: users[c % users.length]!.id, client_request_id: id, text,
      selected_colony_id: location.id, demo_location_id: location.demoLocationId, observed_at: earlier,
      received_at: earlier, status: "completed"});
    r.alerts.insert({id: `tracker-alert-${c}`, report_id: id, colony_id: location.id,
      level: "same_day_review", reasons: JSON.stringify([text]), evidence_ids: JSON.stringify([id]),
      status: "open", created_at: earlier});
  }
}
