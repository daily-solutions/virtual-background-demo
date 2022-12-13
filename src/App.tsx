import React from "react";
import Daily, {
  DailyEventObjectCameraError,
  DailyEventObjectInputSettingsUpdated,
  DailyEventObjectNonFatalError,
  DailyEventObjectParticipant,
  DailyEventObjectParticipants,
} from "@daily-co/daily-js";

import {
  useDaily,
  useDevices,
  useDailyEvent,
  useScreenShare,
  DailyVideo,
  useParticipantIds,
  useActiveSpeakerId,
  DailyAudio,
} from "@daily-co/daily-react";

import "./styles.css";

console.log("Daily version: %s", Daily.version());

export default function App() {
  const callObject = useDaily();
  const participantIds = useParticipantIds();
  const activeId = useActiveSpeakerId();

  const queryParams = new URLSearchParams(window.location.search);
  const room = queryParams.get("room");

  const {
    cameras,
    setCamera,
    microphones,
    setMicrophone,
    speakers,
    setSpeaker,
  } = useDevices();

  const { startScreenShare, stopScreenShare } = useScreenShare();

  const currentCamera = cameras.find((c) => c.selected);
  const currentMicrophone = microphones.find((m) => m.selected);
  const currentSpeaker = speakers.find((s) => s.selected);

  useDailyEvent("camera-error", (evt: DailyEventObjectCameraError) => {
    console.log(evt);
  });

  function enableBlur() {
    if (!callObject) {
      return;
    }

    callObject
      .updateInputSettings({
        video: {
          processor: {
            type: "background-blur",
            config: { strength: 0.5 },
          },
        },
      })
      .then((foo) => {
        console.log("Background blur settings:", foo);
      })
      .catch((err) => {
        console.error("Background blur error:", err);
      });
  }

  function enableBackground() {
    if (!callObject) {
      return;
    }

    callObject
      .updateInputSettings({
        video: {
          processor: {
            type: "background-image",
            config: {
              source:
                "https://docs.daily.co/assets/guides-large-meetings-hero.jpeg",
            },
          },
        },
      })
      .then((foo) => {
        console.log("Background image settings:", foo);
      })
      .catch((err) => {
        console.error("Background image error:", err);
      });
  }

  // Join the room with the generated token
  const joinRoom = () => {
    if (!callObject) {
      return;
    }

    console.log(room);

    callObject
      .join({
        // Replace with your own room url
        url: `https://${room}`,
      })
      .catch((err) => {
        console.error("Error joining room:", err);
      });
    console.log("joined!");
  };

  const startCamera = () => {
    if (!callObject) {
      return;
    }

    callObject.startCamera();
  };

  // handle events
  const startedCamera = () => {
    console.log("started camera");
  };

  const meetingJoined = (evt: DailyEventObjectParticipants) => {
    console.log("You joined the meeting: ", evt);
  };

  const participantJoined = (evt: DailyEventObjectParticipant) => {
    console.log("Participant joined meeting: ", evt);
  };

  const updateParticipant = (evt: DailyEventObjectParticipant) => {
    console.log("Participant updated: ", evt);
  };

  // Remove video elements and leave the room
  function leaveRoom() {
    if (!callObject) {
      return;
    }
    callObject.leave().catch((err) => {
      console.error("Error leaving room:", err);
    });
  }

  // change video device
  function handleChangeVideoDevice(ev: React.ChangeEvent<HTMLSelectElement>) {
    console.log("!!! changing video device");
    setCamera(ev.target.value);
  }

  // change mic device
  function handleChangeMicDevice(ev: React.ChangeEvent<HTMLSelectElement>) {
    console.log("!!! changing mic device");
    setMicrophone(ev.target.value);
  }

  // change speaker device
  function handleChangeSpeakerDevice(ev: React.ChangeEvent<HTMLSelectElement>) {
    console.log("!!! changing speaker device");
    setSpeaker(ev?.target?.value);
  }

  function getInputDevices() {
    if (!callObject) {
      return;
    }
    callObject.getInputDevices().then((inputDevices) => {
      console.log("List of devices:", inputDevices);
    });
  }

  useDailyEvent("joined-meeting", meetingJoined);

  useDailyEvent("participant-joined", participantJoined);

  useDailyEvent("participant-updated", updateParticipant);

  useDailyEvent("started-camera", startedCamera);

  // Error logging for background effects
  useDailyEvent(
    "input-settings-updated",
    (evt: DailyEventObjectInputSettingsUpdated) => {
      console.log("input-settings-updated", evt);
    }
  );

  useDailyEvent("nonfatal-error", (evt: DailyEventObjectNonFatalError) => {
    console.log("nonfatal-error", evt);
  });

  return (
    <>
      <div className="App">
        <br />
        1. Join the call
        <br />
        {room ? `room=https://${room}` : "Add ?room=<room-id> to the url."}
        <br />
        <button onClick={() => joinRoom()}>Join call</button>
        <br />
        <hr />
        <br />
        2. Select your device <br />
        <select
          id="video-devices"
          value={currentCamera?.device?.deviceId}
          onChange={handleChangeVideoDevice}
        >
          {cameras.map((cam) => (
            <option key={cam.device.deviceId} value={cam.device.deviceId}>
              {cam.device.label}
            </option>
          ))}
        </select>
        <br />
        <select
          id="mic-devices"
          value={currentMicrophone?.device?.deviceId}
          onChange={handleChangeMicDevice}
        >
          {microphones.map((microphone) => (
            <option
              key={microphone.device.deviceId}
              value={microphone.device.deviceId}
            >
              {microphone.device.label}
            </option>
          ))}
        </select>
        <br />
        <select
          id="speaker-devices"
          value={currentSpeaker?.device?.deviceId}
          onChange={handleChangeSpeakerDevice}
        >
          {speakers.map((speakers) => (
            <option
              key={speakers.device.deviceId}
              value={speakers.device.deviceId}
            >
              {speakers.device.label}
            </option>
          ))}
        </select>
        <br />
        <br />
        <button onClick={() => enableBlur()}>Enable Blur</button>
        <button onClick={() => enableBackground()}>Enable Background</button>
        <button onClick={() => startScreenShare()}>Start Screen Share</button>
        <button onClick={() => stopScreenShare()}>Stop Screen Share</button>
        <button onClick={() => leaveRoom()}>Leave call</button>
        <br />
        <br />
        <button onClick={() => getInputDevices()}>Input Devices</button> <br />
        <button onClick={() => startCamera()}>Start Camera</button> <br />
        <br />
      </div>
      {participantIds.map((id) => (
        <DailyVideo type="video" key={id} automirror sessionId={id} />
      ))}
      <DailyAudio />

      <div id="meetingState">Meeting State: {callObject?.meetingState()}</div>
    </>
  );
}
