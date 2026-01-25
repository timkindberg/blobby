import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface Props {
  onBack: () => void;
}

export function PlayerView({ onBack }: Props) {
  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState<Id<"players"> | null>(null);
  const [sessionId, setSessionId] = useState<Id<"sessions"> | null>(null);
  const [error, setError] = useState("");

  const getByCode = useQuery(
    api.sessions.getByCode,
    joinCode.length === 4 ? { code: joinCode.toUpperCase() } : "skip"
  );
  const joinSession = useMutation(api.players.join);

  const session = useQuery(
    api.sessions.get,
    sessionId ? { sessionId } : "skip"
  );
  const player = useQuery(
    api.players.get,
    playerId ? { playerId } : "skip"
  );
  const players = useQuery(
    api.players.listBySession,
    sessionId ? { sessionId } : "skip"
  );
  const currentQuestion = useQuery(
    api.questions.getCurrentQuestion,
    sessionId ? { sessionId } : "skip"
  );
  const hasAnswered = useQuery(
    api.answers.hasAnswered,
    currentQuestion && playerId
      ? { questionId: currentQuestion._id, playerId }
      : "skip"
  );
  const results = useQuery(
    api.answers.getResults,
    currentQuestion ? { questionId: currentQuestion._id } : "skip"
  );
  const leaderboard = useQuery(
    api.players.getLeaderboard,
    sessionId ? { sessionId } : "skip"
  );

  const submitAnswer = useMutation(api.answers.submit);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!getByCode) {
      setError("Session not found");
      return;
    }

    try {
      const id = await joinSession({
        sessionId: getByCode._id,
        name: playerName.trim(),
      });
      setPlayerId(id);
      setSessionId(getByCode._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join");
    }
  }

  async function handleAnswer(optionIndex: number) {
    if (!currentQuestion || !playerId) return;
    await submitAnswer({
      questionId: currentQuestion._id,
      playerId,
      optionIndex,
    });
  }

  // Not joined yet - show join form
  if (!playerId || !sessionId) {
    return (
      <div className="player-view">
        <button onClick={onBack}>← Back</button>
        <h2>Join a Session</h2>
        <form onSubmit={handleJoin}>
          <input
            type="text"
            placeholder="Join Code (e.g. ABCD)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={4}
          />
          <input
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={!getByCode || !playerName.trim()}>
            Join
          </button>
        </form>
      </div>
    );
  }

  // Game finished - show final results
  if (session?.status === "finished") {
    return (
      <div className="player-view">
        <h2>Game Over!</h2>
        <p>Your score: {player?.score ?? 0}</p>
        <h3>Leaderboard</h3>
        <ol>
          {leaderboard?.map((p) => (
            <li key={p._id} className={p._id === playerId ? "you" : ""}>
              {p.name}: {p.score} pts
            </li>
          ))}
        </ol>
        <button onClick={onBack}>Back to Home</button>
      </div>
    );
  }

  // In lobby - waiting for game to start
  if (session?.status === "lobby") {
    return (
      <div className="player-view">
        <h2>Waiting for host to start...</h2>
        <p>Session: {session.code}</p>
        <p>You: {player?.name}</p>
        <h3>Players ({players?.length ?? 0})</h3>
        <ul>
          {players?.map((p) => (
            <li key={p._id} className={p._id === playerId ? "you" : ""}>
              {p.name}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Game active - show current question
  return (
    <div className="player-view">
      <div className="score-bar">
        <span>{player?.name}</span>
        <span>{player?.score ?? 0} pts</span>
      </div>

      {currentQuestion ? (
        <div className="question">
          <h2>{currentQuestion.text}</h2>
          {hasAnswered ? (
            <p className="waiting">Waiting for results...</p>
          ) : (
            <div className="options">
              {currentQuestion.options.map((opt, i) => (
                <button key={i} onClick={() => handleAnswer(i)}>
                  {opt.text}
                </button>
              ))}
            </div>
          )}
          {results && (
            <div className="results">
              <p>Total answers: {results.totalAnswers}</p>
            </div>
          )}
        </div>
      ) : (
        <p>Waiting for question...</p>
      )}
    </div>
  );
}
