import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "../../convex/_generated/api";
import schema from "../../convex/schema";

const modules = import.meta.glob("../../convex/**/*.ts");

describe("sessions.setTheme", () => {
  test("new sessions have no theme (clients fall back to classic)", async () => {
    const t = convexTest(schema, modules);

    const { sessionId } = await t.mutation(api.sessions.create, { hostId: "host-1" });
    const session = await t.query(api.sessions.get, { sessionId });

    expect(session?.theme).toBeUndefined();
  });

  test("host can set a theme", async () => {
    const t = convexTest(schema, modules);

    const { sessionId } = await t.mutation(api.sessions.create, { hostId: "host-1" });
    await t.mutation(api.sessions.setTheme, {
      sessionId,
      hostId: "host-1",
      theme: "baby_shower",
    });

    const session = await t.query(api.sessions.get, { sessionId });
    expect(session?.theme).toBe("baby_shower");
  });

  test("host can switch back to classic", async () => {
    const t = convexTest(schema, modules);

    const { sessionId } = await t.mutation(api.sessions.create, { hostId: "host-1" });
    await t.mutation(api.sessions.setTheme, { sessionId, hostId: "host-1", theme: "baby_shower" });
    await t.mutation(api.sessions.setTheme, { sessionId, hostId: "host-1", theme: "classic" });

    const session = await t.query(api.sessions.get, { sessionId });
    expect(session?.theme).toBe("classic");
  });

  test("rejects a non-host", async () => {
    const t = convexTest(schema, modules);

    const { sessionId } = await t.mutation(api.sessions.create, { hostId: "host-1" });

    await expect(
      t.mutation(api.sessions.setTheme, {
        sessionId,
        hostId: "someone-else",
        theme: "baby_shower",
      })
    ).rejects.toThrow("Unauthorized");
  });

  test("theme can be changed mid-game (it is cosmetic only)", async () => {
    const t = convexTest(schema, modules);

    const { sessionId } = await t.mutation(api.sessions.create, { hostId: "host-1" });
    await t.mutation(api.questions.create, {
      sessionId,
      hostId: "host-1",
      text: "Test?",
      options: [{ text: "A" }, { text: "B" }],
      correctOptionIndex: 0,
      timeLimit: 30,
    });
    await t.mutation(api.sessions.start, { sessionId, hostId: "host-1" });

    await t.mutation(api.sessions.setTheme, {
      sessionId,
      hostId: "host-1",
      theme: "baby_shower",
    });

    const session = await t.query(api.sessions.get, { sessionId });
    expect(session?.theme).toBe("baby_shower");
    // Game state untouched
    expect(session?.status).toBe("active");
  });
});
