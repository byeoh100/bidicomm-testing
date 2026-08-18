import { useState, useCallback } from "react";
import './App.css'

const STEPS = [
  { key: "connecting", label: "Connecting to server" },
  { key: "sent", label: "Ping sent" },
  { key: "received", label: "Ping received" },
];

function stepIndex(status) {
  return STEPS.findIndex((s) => s.key === status);
}

function PingButton({ status, onPing }) {
  const busy = status === "connecting" || status === "sent";

  const labels = {
    idle: "Send ping",
    connecting: "Connecting...",
    sent: "Waiting for reply...",
    received: "Ping again",
  };

  return (
    <button
      onClick={onPing}
      disabled={busy}
      style={{
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 14,
        padding: "10px 18px",
        borderRadius: 6,
        border: "1px solid #3a3a3a",
        background: busy ? "#1c1c1c" : "#111",
        color: busy ? "#888" : "#eee",
        cursor: busy ? "default" : "pointer",
        minWidth: 160,
      }}
    >
      {labels[status]}
    </button>
  );
}

function StatusDisplay({ status, latencyMs }) {
  const currentIndex = stepIndex(status);

  return (
    <div
      style={{
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 13,
        lineHeight: 1.9,
        background: "#0b0b0b",
        border: "1px solid #2a2a2a",
        borderRadius: 6,
        padding: "12px 16px",
        minWidth: 220,
      }}
    >
      {STEPS.map((step, i) => {
        const reached = currentIndex >= i;
        const isReceived = step.key === "received";
        return (
          <div key={step.key} style={{ color: reached ? "#5fd68a" : "transparent" }}>
            {reached
              ? `${step.label}${isReceived && latencyMs != null ? ` (${latencyMs}ms)` : ""}`
              : "placeholder"}
          </div>
        );
      })}
    </div>
  );
}

function App() {
  const [status, setStatus] = useState("idle");
  const [latencyMs, setLatencyMs] = useState(null);

  const handlePing = useCallback(() => {
    setLatencyMs(null);
    setStatus("connecting");

    const socket = new WebSocket("ws://localhost:8080");
    let sentAt = null;

    socket.onopen = () => {
      setStatus("sent");
      sentAt = performance.now();
      socket.send(JSON.stringify({ type: "ping" }));
    };

    socket.onmessage = (event) => {
      const { type } = JSON.parse(event.data);
      if (type !== "pong") return;
      setStatus("received");
      setLatencyMs(Math.round(performance.now() - sentAt));
      socket.close();
    };

    socket.onerror = () => {
      setStatus("idle");
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <PingButton status={status} onPing={handlePing} />
      <StatusDisplay status={status} latencyMs={latencyMs} />
    </div>
  )
}

export default App
