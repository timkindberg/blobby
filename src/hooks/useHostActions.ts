import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * The game's host-driven state machine, shared by the admin view and the
 * spectator view so both screens can drive a session with identical semantics.
 *
 * Forward:  lobby -> pre_game -> question_shown -> answers_shown -> revealed -> results -> (next question | finished)
 * Backward: previousPhase() walks the same chain in reverse.
 */

export type SessionStatus = "lobby" | "active" | "finished";
export type QuestionPhase =
  | "pre_game"
  | "question_shown"
  | "answers_shown"
  | "revealed"
  | "results"
  | undefined;

export interface HostActionConfig {
  label: string;
  action: () => Promise<void>;
  disabled: boolean;
  isDestructive?: boolean;
  /** If set, requires confirmation before the action runs */
  confirmMessage?: string;
}

/** Derive the phase the host state machine cares about from a session document. */
export function getHostPhase(session: {
  status: string;
  currentQuestionIndex: number;
  questionPhase?: string;
}): QuestionPhase {
  if (session.status !== "active") return undefined;
  // Active but no question yet = the pre-game hype moment
  if (session.currentQuestionIndex === -1) return "pre_game";
  // Sessions started before questionPhase existed default to answers_shown,
  // same backward-compatible fallback the Convex queries use.
  return (session.questionPhase ?? "answers_shown") as QuestionPhase;
}

/** The next forward step for the current session state. */
export function useHostAction(
  sessionId: Id<"sessions"> | null,
  hostId: string,
  sessionStatus: SessionStatus | undefined,
  questionPhase: QuestionPhase,
  enabledQuestionCount: number,
  currentQuestionIndex: number,
  onBeforeStart?: () => Promise<void>
): HostActionConfig | null {
  const startSession = useMutation(api.sessions.start);
  const showAnswers = useMutation(api.sessions.showAnswers);
  const revealAnswer = useMutation(api.sessions.revealAnswer);
  const showResults = useMutation(api.sessions.showResults);
  const nextQuestion = useMutation(api.sessions.nextQuestion);
  const backToLobby = useMutation(api.sessions.backToLobby);

  if (!sessionId || !sessionStatus) return null;

  const isLastQuestion = currentQuestionIndex >= enabledQuestionCount - 1;

  switch (sessionStatus) {
    case "lobby":
      return {
        label: `Start Game (${enabledQuestionCount} questions)`,
        action: async () => {
          if (onBeforeStart) {
            await onBeforeStart();
          }
          await startSession({ sessionId, hostId });
        },
        disabled: enabledQuestionCount === 0,
      };

    case "active":
      switch (questionPhase) {
        case "pre_game":
          return {
            label: "First Question",
            action: async () => { await nextQuestion({ sessionId, hostId }); },
            disabled: false,
          };
        case "question_shown":
          return {
            label: "Show Answers",
            action: async () => { await showAnswers({ sessionId, hostId }); },
            disabled: false,
          };
        case "answers_shown":
          return {
            label: "Reveal Answer",
            action: async () => { await revealAnswer({ sessionId, hostId }); },
            disabled: false,
          };
        case "revealed":
          return {
            label: "Show Leaderboard",
            action: async () => { await showResults({ sessionId, hostId }); },
            disabled: false,
          };
        case "results":
          return {
            label: isLastQuestion ? "End Game" : "Next Question",
            action: async () => { await nextQuestion({ sessionId, hostId }); },
            disabled: false,
            isDestructive: isLastQuestion,
          };
        default:
          return null;
      }

    case "finished":
      return {
        label: "New Game (Same Players)",
        action: async () => {
          await backToLobby({ sessionId, hostId });
        },
        disabled: false,
        confirmMessage: "This will reset all player scores and start a new game with the same players. Continue?",
      };

    default:
      return null;
  }
}

/** The rewind step for the current session state (null when there's nothing to undo). */
export function useBackAction(
  sessionId: Id<"sessions"> | null,
  hostId: string,
  sessionStatus: SessionStatus | undefined,
  questionPhase: QuestionPhase,
  currentQuestionIndex: number
): HostActionConfig | null {
  const previousPhase = useMutation(api.sessions.previousPhase);

  if (!sessionId || !sessionStatus) return null;

  // No back action in lobby or finished state
  if (sessionStatus !== "active") return null;

  // Determine the back action based on current phase
  switch (questionPhase) {
    case "pre_game":
      // Pre-game -> Lobby
      return {
        label: "<- Lobby",
        action: async () => { await previousPhase({ sessionId, hostId }); },
        disabled: false,
        isDestructive: false, // No answers or progress to lose yet
      };
    case "results":
      return {
        label: "<- Revealed",
        action: async () => { await previousPhase({ sessionId, hostId }); },
        disabled: false,
        isDestructive: false,
      };
    case "revealed":
      return {
        label: "<- Hide Answer",
        action: async () => { await previousPhase({ sessionId, hostId }); },
        disabled: false,
        isDestructive: false,
      };
    case "answers_shown":
      return {
        label: "<- Clear Answers",
        action: async () => {
          await previousPhase({ sessionId, hostId });
        },
        disabled: false,
        isDestructive: true,
        confirmMessage: "This will delete all answers for this question. Continue?",
      };
    case "question_shown":
      if (currentQuestionIndex > 0) {
        return {
          label: `<- Q${currentQuestionIndex} Results`,
          action: async () => { await previousPhase({ sessionId, hostId }); },
          disabled: false,
          isDestructive: false,
        };
      } else {
        // Q1 -> Pre-game (safe: no progress lost, just going back to hype phase)
        return {
          label: "<- Pre-Game",
          action: async () => { await previousPhase({ sessionId, hostId }); },
          disabled: false,
          isDestructive: false,
        };
      }
    default:
      return null;
  }
}

/**
 * Global keyboard driving for the host: Space / Enter / Right arrow advance,
 * Left arrow / Backspace rewind.
 *
 * Typing targets (including <select>, where arrows change the value) are
 * ignored, and preventDefault stops a focused button from also firing its
 * own click - otherwise Space would advance twice.
 */
export function useHostKeyboard({
  onForward,
  onBack,
  enabled = true,
}: {
  onForward: () => void;
  onBack: () => void;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.code === "Space" || event.code === "Enter" || event.code === "ArrowRight") {
        event.preventDefault();
        onForward();
        return;
      }

      if (event.code === "ArrowLeft" || event.code === "Backspace") {
        event.preventDefault();
        onBack();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onForward, onBack, enabled]);
}
