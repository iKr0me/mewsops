import { actorFromVerifiedSession } from "./session.js";
import type { Db } from "../db/index.js";
import {
  createServices,
  staff,
  fail,
  type Actor,
  type AgentProposal,
} from "../domain/index.js";
import { AgentProposalSchema } from "../contracts/index.js";

import type { AnalyzeReportInput } from "../contracts/agent.js";
import { prepareAnalysis, proposalGuard } from "./agent-context.js";
type Services = ReturnType<typeof createServices>;
export type AnalyzeReport = (
  report: AnalyzeReportInput,
  dependencies: { signal: AbortSignal },
) => Promise<unknown>;

export const syntheticFixture: AnalyzeReport = async (
  report,
): Promise<AgentProposal> => ({
  reportId: report.reportId,
  colonyCandidates: [],
  catCandidates: [],
  observations: [
    {
      kind: "statement",
      statement: report.text,
      source: "reporter",
      evidenceIds: [report.reportId],
    },
  ],
  urgency: { level: "routine", reasons: [], evidenceIds: [report.reportId] },
  uncertainties: ["Synthetic fixture. Identity requires staff review."],
});

export function processor(
  db: Db,
  services: Services,
  analyze: AnalyzeReport | undefined,
  timeout: number,
  uploadDir: string,
  descriptions?: ReadonlyMap<string, string>,
) {
  const active = new Set<string>();
  return async (actor: Actor, id: string) => {
    staff(actor);
    const report = services.getReport(actor, id);
    if (report.status === "completed" || report.status === "needs_review")
      return report;
    if (active.has(id)) fail("CONFLICT", "Report is being processed", 409);
    if (!analyze)
      return fail(
        "UNAVAILABLE",
        "Analyzer unavailable. Report remains pending.",
        503,
      );
    active.add(id);
    let stage = "prepare";
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const input = await prepareAnalysis(
        db,
        uploadDir,
        actor,
        report,
        descriptions,
      );
      const validate = proposalGuard(input);
      stage = "model";
      const deadline = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error("timeout"));
        }, timeout);
      });

      const output = AgentProposalSchema.parse(
        await Promise.race([
          deadline,
          analyze(input, { signal: controller.signal }),
        ]),
      );
      validate(output);
      stage = "apply";
      const currentActor = actorFromVerifiedSession(db, { userId: actor.id });
      services.applyAgentProposal(currentActor, output);
      return services.getReport(actor, id);
    } catch (error) {
      // Record only a stage and safe error type; never log report text or images.
      const kind = error instanceof Error && /^[A-Za-z][A-Za-z0-9]{0,60}$/.test(error.name) ? error.name : "Error";
      console.error("Tracker analysis failed", { stage, kind });
      db.prepare(
        "UPDATE reports SET status='failed' WHERE id=? AND status IN ('received','failed')",
      ).run(id);
      return fail(
        "UNAVAILABLE",
        "Analysis failed. Report is saved for staff review or retry.",
        503,
      );
    } finally {
      clearTimeout(timer);
      active.delete(id);
    }
  };
}
