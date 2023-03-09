/// <reference types="react-scripts" />

interface Window {
  rtcpeers: {
    getCurrentType(): unknown;
    sfu: {
      consumers: any;
      producers: any[];
    };
    peerToPeer: {
      rtcPeerConnections: any;
    };
  };
}
