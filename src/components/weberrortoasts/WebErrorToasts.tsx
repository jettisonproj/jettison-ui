import type { JSX } from "react";
import { useCallback, useContext, useMemo, useState } from "react";

import styles from "src/components/weberrortoasts/WebErrorToasts.module.css";
import type { WebError } from "src/data/types/webErrorTypes.ts";
import { WebErrorsContext } from "src/providers/provider.tsx";

function WebErrorToasts(): JSX.Element | null {
  const allWebErrors = useContext(WebErrorsContext);
  const [dismissedToastIds, setDismissedToastIds] = useState(
    null as Set<number> | null,
  );

  const webErrors = useMemo(() => {
    if (allWebErrors == null) {
      return null;
    }
    if (dismissedToastIds == null) {
      return allWebErrors;
    }
    return allWebErrors.filter(
      (webError) => !dismissedToastIds.has(webError.spec.toastId),
    );
  }, [allWebErrors, dismissedToastIds]);

  const onDismiss = useCallback(() => {
    if (webErrors == null) {
      console.log("error dismissing toast: web errors unexpectedly empty");
      return;
    }
    const lastWebError = webErrors.at(-1);
    if (lastWebError == null) {
      throw new WebErrorToastsError("web error was unexpectedly empty");
    }

    setDismissedToastIds((toastIds) =>
      new Set(toastIds).add(lastWebError.spec.toastId),
    );
  }, [webErrors]);

  if (webErrors == null || webErrors.length === 0) {
    return null;
  }

  const lastWebError = webErrors.at(-1);
  if (lastWebError == null) {
    throw new WebErrorToastsError("web error was unexpectedly empty");
  }

  if (webErrors.length > 2) {
    return (
      <>
        <div className={styles.webErrorTertiary} />
        <div className={styles.webErrorSecondary} />
        <WebErrorToast webError={lastWebError} onDismiss={onDismiss} />
      </>
    );
  }
  if (webErrors.length > 1) {
    return (
      <>
        <div className={styles.webErrorSecondary} />
        <WebErrorToast webError={lastWebError} onDismiss={onDismiss} />
      </>
    );
  }
  return <WebErrorToast webError={lastWebError} onDismiss={onDismiss} />;
}

interface WebErrorToastProps {
  webError: WebError;
  onDismiss: () => void;
}
function WebErrorToast({
  webError,
  onDismiss,
}: WebErrorToastProps): JSX.Element {
  const message = webError.spec.message;
  return (
    <div className={styles.webErrorMain}>
      <div className={styles.webErrorHeader}>
        <div>
          <i className={`nf nf-fa-circle_xmark ${styles.dangerIcon}`} />
          Error
        </div>
        <i
          className={`nf nf-fa-close ${styles.closeIcon}`}
          onClick={onDismiss}
        />
      </div>
      <div className={styles.webErrorMessage} title={message}>
        {message}
      </div>
    </div>
  );
}

class WebErrorToastsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { WebErrorToasts };
