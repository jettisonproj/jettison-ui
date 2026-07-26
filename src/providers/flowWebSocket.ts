/**
 * Provides an abstraction over WebSocket with typing
 */
class FlowWebSocket {
  #websocket: WebSocket;

  constructor() {
    const websocket = new WebSocket("/ws");
    this.#websocket = websocket;

    websocket.onopen = (): void => {
      console.log("Websocket opened");
    };

    websocket.onclose = (ev): void => {
      console.log("Websocket closed");
      console.log(`Code: ${ev.code.toString()}`);
      console.log(`Reason: ${ev.reason}`);
    };

    websocket.onerror = (err): void => {
      if (!(err instanceof Error)) {
        console.log("unknown error from websocket");
        console.log(err);
        throw new Error("unknown error from websocket", { cause: err });
      }
      console.log(`Websocket encountered error: ${err}`);
      console.log(err);
    };
  }

  setOnMessage(onMessage: (ev: MessageEvent<string>) => void): void {
    this.#websocket.onmessage = onMessage;
  }

  send(flowMessage: FlowMessage): void {
    this.#websocket.send(JSON.stringify(flowMessage));
  }
}

// SOT: https://github.com/jettisonproj/jettison-controller/blob/main/internal/webserver/webmessage.go
const FlowMessageTypes = {
  containerLog: "containerLog",
  resourceSubscription: "resourceSubscription",
} as const;

// SOT: https://github.com/jettisonproj/jettison-controller/blob/main/internal/webserver/webmessage.go
interface ContainerLogMessage {
  messageType: typeof FlowMessageTypes.containerLog;
  messageData: {
    namespace: string;
    podName: string;
    containerName: string;
  };
}

// SOT: https://github.com/jettisonproj/jettison-controller/blob/main/internal/webserver/webmessage.go
interface ResourceSubscriptionMessage {
  messageType: typeof FlowMessageTypes.resourceSubscription;
  messageData: {
    subscriptionType: string;
    namespace: string;
    name: string;
  };
}

type FlowMessage = ContainerLogMessage | ResourceSubscriptionMessage;

const flowWebSocket = new FlowWebSocket();

export { FlowMessageTypes, flowWebSocket };
