import type { JSX } from "react";
import { useContext } from "react";

import styles from "src/components/weberrortoasts/WebErrorToasts.module.css";
import type { WebError } from "src/data/types/webErrorTypes.ts";
import { WebErrorsContext } from "src/providers/provider.tsx";

// todo make toasts dismissible
function WebErrorToasts(): JSX.Element | null {
  const webErrors = useContext(WebErrorsContext);

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
        <WebErrorToast webError={lastWebError} />
      </>
    );
  }
  if (webErrors.length > 1) {
    return (
      <>
        <div className={styles.webErrorSecondary} />
        <WebErrorToast webError={lastWebError} />
      </>
    );
  }
  return <WebErrorToast webError={lastWebError} />;
}

interface WebErrorToastProps {
  webError: WebError;
}
function WebErrorToast({ webError }: WebErrorToastProps): JSX.Element {
  const message = webError.spec.message;
  return (
    <div className={styles.webErrorMain}>
      <WebErrorHeader />
      <div className={styles.webErrorMessage} title={message}>
        {message}
      </div>
    </div>
  );
}
function WebErrorHeader(): JSX.Element {
  return (
    <div className={styles.webErrorHeader}>
      <i className={`nf nf-fa-circle_xmark ${styles.dangerIcon}`} />
      Error
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
