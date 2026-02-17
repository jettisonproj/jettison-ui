/**
 * Provides an abstraction over WebSocket with typing
 */
class FlowWebSocket {
  #websocket: WebSocket;

  constructor() {
    const websocket = new WebSocket("wss://jettison.osoriano.com/ws");
    this.#websocket = websocket;

    websocket.onopen = () => {
      console.log("Websocket opened");
    };

    websocket.onclose = (ev) => {
      console.log("Websocket closed");
      console.log(`Code: ${ev.code}`);
      console.log(`Reason: ${ev.reason}`);
    };

    websocket.onerror = (err) => {
      if (!(err instanceof Error)) {
        console.log("unknown error from websocket");
        console.log(err);
        throw new Error("unknown error from websocket", { cause: err });
      }
      console.log(`Websocket encountered error: ${err}`);
      console.log(err);
    };
  }

  setOnMessage(onMessage: (ev: MessageEvent<string>) => void) {
    this.#websocket.onmessage = onMessage;
  }

  send(flowMessage: FlowMessage) {
    this.#websocket.send(JSON.stringify(flowMessage));
  }
}

// SOT: https://github.com/jettisonproj/jettison-controller/blob/main/internal/webserver/webmessage.go
enum FlowMessageType {
  containerLog = "containerLog",
}

// SOT: https://github.com/jettisonproj/jettison-controller/blob/main/internal/webserver/webmessage.go
interface ContainerLogMessage {
  messageType: FlowMessageType.containerLog;
  messageData: {
    namespace: string;
    podName: string;
    containerName: string;
  };
}

type FlowMessage = ContainerLogMessage;

const flowWebSocket = new FlowWebSocket();

export { flowWebSocket, FlowMessageType };
