const WS_SUCCESS_CODE = 1_000;

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

    websocket.onerror = (err): void => {
      this.close("WebSocket Error");

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

  setOnClose(onClose: (ev: CloseEvent) => void): void {
    this.#websocket.onclose = onClose;
  }

  send(flowMessage: FlowMessage): void {
    console.log("--> send flowWebSocket message");
    console.log(flowMessage);
    this.#websocket.send(JSON.stringify(flowMessage));
  }

  close(reason: string): void {
    console.log(`closing websocket with reason: ${reason}`);
    this.#websocket.close(WS_SUCCESS_CODE, reason);
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

// SOT: https://github.com/jettisonproj/jettison-controller/blob/main/internal/webserver/resource_subscription_message_handler.go
const ResourceSubscriptionTypes = {
  pod: "pod",
} as const;
type ResourceSubscriptionType =
  (typeof ResourceSubscriptionTypes)[keyof typeof ResourceSubscriptionTypes];

// SOT: https://github.com/jettisonproj/jettison-controller/blob/main/internal/webserver/webmessage.go
interface ResourceSubscriptionMessage {
  messageType: typeof FlowMessageTypes.resourceSubscription;
  messageData: {
    subscriptionType: ResourceSubscriptionType;
    namespace: string;
    name: string;
  };
}

type FlowMessage = ContainerLogMessage | ResourceSubscriptionMessage;

const flowWebSocket = new FlowWebSocket();

export { FlowMessageTypes, ResourceSubscriptionTypes, flowWebSocket };
