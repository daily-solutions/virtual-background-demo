import React, { useState, useCallback, useEffect } from "react";
export const Stage = () => {
  const [participants, setParticipants] = useState<string[]>([]);

  const handleMessage = useCallback(
    (message, data, origin) => {
      console.log("in Stage message", { message, data, origin });
      const p = data.participant;
      setParticipants((prev) => [...prev, p]);
    },
    [setParticipants]
  );

  useEffect(() => {
    const handleEvent = (event) => {
      console.debug("in Stage event", { event });
      const { message, data, origin } = event;
      if (origin === "http://localhost:3000") {
        handleMessage(message, data, origin);
      }
    };

    window.addEventListener("message", handleEvent);
    return function cleanup() {
      window.removeEventListener("message", handleEvent);
    };
  });

  const onClick = () => {
    window.top.postMessage(
      { source: "integration", payload: { isStage: true } },
      "*"
    );
  };

  return (
    <ul>
      <li>
        <button onClick={onClick}>Send message</button>
      </li>
      {participants.map((p) => (
        <li key={p}>{p}</li>
      ))}
    </ul>
  );
};
