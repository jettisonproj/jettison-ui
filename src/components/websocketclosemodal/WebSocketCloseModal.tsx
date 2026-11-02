import type { JSX } from "react";
import { useContext, useEffect, useRef } from "react";

import styles from "src/components/websocketclosemodal/WebSocketCloseModal.module.css";
import {
  WebErrorsContext,
  WebSocketCloseEventContext,
} from "src/providers/provider.tsx";

function WebSocketCloseModal(): JSX.Element | null {
  const webErrors = useContext(WebErrorsContext);
  const webSocketCloseEvent = useContext(WebSocketCloseEventContext);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (webSocketCloseEvent != null) {
      if (dialogRef.current == null) {
        console.log(
          "error: null dialog ref while rendering websocket close modal",
        );
        return;
      }
      dialogRef.current.showModal();
    }
  }, [webSocketCloseEvent]);

  if (webSocketCloseEvent == null) {
    return null;
  }

  const { code, reason, wasClean } = webSocketCloseEvent;

  let closeDetails = `code: ${code.toString()}`;

  if (reason) {
    closeDetails += `\nreason: ${reason}`;
  }

  if (!wasClean) {
    closeDetails += `\nclean: ${wasClean.toString()}`;
  }

  return (
    <dialog ref={dialogRef}>
      <h1 className={styles.wsCloseModalTitle}>
        <i
          className={`nf nf-cod-debug_disconnect ${styles.wsCloseModalIcon}`}
        />
        Connection Lost
      </h1>
      <p className={styles.wsCloseModalText}>
        The connection was closed. Refresh to reconnect.
      </p>
      <p className={styles.wsCloseModalPreTitle}>Close Details</p>
      <pre className={styles.wsCloseModalPre}>{closeDetails}</pre>
      {webErrors && (
        <>
          <p className={styles.wsCloseModalPreTitle}>Error Details</p>
          <pre className={styles.wsCloseModalPre}>
            {webErrors.map((webError) => webError.spec.message).join("\n")}
          </pre>
        </>
      )}
    </dialog>
  );
}

export { WebSocketCloseModal };
