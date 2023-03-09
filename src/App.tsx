import React, { useCallback, useEffect, useRef, useState } from "react";
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
  DailyAudio,
  useInputSettings,
  useNetwork,
} from "@daily-co/daily-react";

import "./styles.css";

console.log("Daily version: %s", Daily.version());

export default function App() {
  const callObject = useDaily();
  //@ts-expect-error
  window.callObject = callObject;

  const participantIds = useParticipantIds();
  const [counter, setCounter] = useState(0);

  const queryParams = new URLSearchParams(window.location.search);
  const room = queryParams.get("room");

  const [inputSettingsUpdated, setInputSettingsUpdated] = useState(false);
  const [enableBlurClicked, setEnableBlurClicked] = useState(false);
  const [enableBackgroundClicked, setEnableBackgroundClicked] = useState(false);

  const network = useNetwork();

  const {
    cameras,
    setCamera,
    microphones,
    setMicrophone,
    speakers,
    setSpeaker,
  } = useDevices();

  const { errorMsg, updateInputSettings } = useInputSettings({
    onError(ev) {
      console.log("Input settings error (daily-react)", ev);
    },
    onInputSettingsUpdated(ev) {
      setInputSettingsUpdated(true);
      console.log("Input settings updated (daily-react)", ev);
    },
  });

  const { startScreenShare, stopScreenShare, screens } = useScreenShare();

  const currentCamera = cameras.find((c) => c.selected);
  const currentMicrophone = microphones.find((m) => m.selected);
  const currentSpeaker = speakers.find((s) => s.selected);

  useDailyEvent("camera-error", (evt: DailyEventObjectCameraError) => {
    console.log(evt);
  });

  const timer = useRef(undefined); // we can save timer in useRef and pass it to child

  useEffect(() => {
    // useRef value stored in .current property
    // @ts-expect-error
    timer.current = setInterval(() => setCounter((v) => v + 1), 1 * 1000);

    // clear on component unmount
    return () => {
      clearInterval(timer.current);
    };
  }, []);

  function enableBlur() {
    if (!callObject || enableBlurClicked) {
      return;
    }

    setEnableBlurClicked(true);
    setEnableBackgroundClicked(false);

    updateInputSettings({
      video: {
        processor: {
          type: "background-blur",
          config: { strength: 0.5 },
        },
      },
    });
  }

  function enableBackground() {
    if (!callObject || enableBackgroundClicked) {
      return;
    }

    setEnableBackgroundClicked(true);
    setEnableBlurClicked(false);

    updateInputSettings({
      video: {
        processor: {
          type: "background-image",
          config: {
            source:
              "https://docs.daily.co/assets/guides-large-meetings-hero.jpeg",
          },
        },
      },
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

  const preAuth = () => {
    if (!callObject) {
      return;
    }
    callObject.preAuth({
      url: `https://${room}`,
    });
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

  function stopCamera() {
    if (!callObject) {
      return;
    }
    callObject.updateParticipant("local", {
      setAudio: false,
      setVideo: false,
    });
  }

  function updateCameraOn() {
    if (!callObject) {
      return;
    }
    callObject.updateParticipant("local", {
      setAudio: true,
      setVideo: true,
    });
  }

  function logEvent(evt: any) {
    console.log("logEvent: ", evt);
  }

  useDailyEvent("joining-meeting", logEvent);

  useDailyEvent("joined-meeting", meetingJoined);

  useDailyEvent("participant-joined", participantJoined);

  useDailyEvent("participant-updated", updateParticipant);

  useDailyEvent("track-started", logEvent);

  useDailyEvent("track-stopped", logEvent);

  useDailyEvent("started-camera", startedCamera);

  useDailyEvent("input-settings-updated", logEvent);

  useDailyEvent("loading", logEvent);

  useDailyEvent("loaded", logEvent);

  useDailyEvent("load-attempt-failed", logEvent);

  useDailyEvent("receive-settings-updated", logEvent);

  useDailyEvent("left-meeting", logEvent);

  useDailyEvent("participant-left", logEvent);

  useDailyEvent("network-connection", logEvent);

  useDailyEvent("network-quality-change", logEvent);

  useDailyEvent("camera-error", (evt) => {
    console.log("camera-error", evt);
  });

  useDailyEvent("error", (evt) => {
    console.log("error event", evt);
  });

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

  const hiddenParticipantCount = callObject?.participantCounts().hidden ?? 0;
  const presentParticipantCount = callObject?.participantCounts().present ?? 0;

  const participantCounts = hiddenParticipantCount + presentParticipantCount;

  return (
    <>
      <div className="App">
        <Child
          counter={counter}
          currentTimer={timer.current}
          participantId={participantIds[0]}
        />
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
        <button disabled={enableBlurClicked} onClick={() => enableBlur()}>
          Enable Blur
        </button>
        <button
          disabled={enableBackgroundClicked}
          onClick={() => enableBackground()}
        >
          Enable Background
        </button>
        <button onClick={() => startScreenShare()}>Start Screen Share</button>
        <button onClick={() => stopScreenShare()}>Stop Screen Share</button>
        <button onClick={() => leaveRoom()}>Leave call</button>
        <br />
        <br />
        <button onClick={() => getInputDevices()}>Input Devices</button> <br />
        <button onClick={() => preAuth()}>Preauth</button> <br />
        <button onClick={() => startCamera()}>Start Camera</button> <br />
        <button onClick={() => stopCamera()}>Publish Camera Off</button> <br />
        <button onClick={() => updateCameraOn()}>Publish Camera On</button>{" "}
        <br />
        <br />
      </div>
      {participantIds.map((id) => (
        <DailyVideo type="video" key={id} automirror sessionId={id} />
      ))}
      {/* {screens.map((screen) => (
        <>
          <br />
          <DailyVideo
            type="screen"
            key={screen.screenId}
            automirror
            sessionId={screen.session_id}
          />
        </>
      ))} */}
      <DailyAudio />

      <div id="meetingState">Meeting State: {callObject?.meetingState()}</div>
      {inputSettingsUpdated && <div>Input settings updated</div>}
      {errorMsg && <div id="errorMsg">{errorMsg}</div>}
      <div id="participantCount">Participant Counts: {participantCounts}</div>
      <div>Network quality: {network.quality}</div>
    </>
  );
}

interface ChildProps {
  counter: number;
  currentTimer?: number;
  participantId: string;
}
function Child({ counter, currentTimer, participantId }: ChildProps) {
  function getParticipantAudioLevel(id: string) {
    console.log("getParticipantAudioLevel id", id);
    try {
      if (!window.rtcpeers) return;

      const isSFU = window.rtcpeers.getCurrentType() === "sfu";

      let consumer = isSFU
        ? window.rtcpeers.sfu.consumers[id + "/cam-audio"]
        : window.rtcpeers.peerToPeer.rtcPeerConnections[id];

      // local audio
      if (id === "local") {
        consumer = window.rtcpeers.sfu.producers.find(
          (p) => p._kind === "audio"
        );
      }

      const receiver = isSFU
        ? consumer._rtpReceiver
        : consumer
            .getReceivers()
            .find((r: { track: { kind: string } }) => r.track.kind === "audio");

      if (!receiver || !receiver.getSynchronizationSources) return;

      return receiver.getSynchronizationSources()[0]?.audioLevel;
    } catch (e) {
      console.error(e);
    }
  }

  const audioLevel = getParticipantAudioLevel(participantId);

  // this will clearInterval in parent component after counter gets to 5
  useEffect(() => {
    if (counter < 1000) return;

    clearInterval(currentTimer);
  }, [counter, currentTimer]);

  return (
    <h1>
      {counter} {audioLevel}
    </h1>
  );
}
