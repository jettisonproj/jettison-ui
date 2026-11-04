import type { NamespacedResource } from "src/data/types/baseResourceTypes.ts";
import { ResourceKinds } from "src/data/types/baseResourceTypes.ts";

const POD_NOT_FOUND_WEB_ERROR = "PodNotFound";

// SOT: https://github.com/jettisonproj/jettison-controller/blob/main/internal/webserver/weberror.go
interface WebError extends NamespacedResource {
  kind: typeof ResourceKinds.WebError;
  spec: WebErrorSpec;
}

interface WebErrorSpec {
  // toastId is NOT returned by the api
  // It is a field used by the UI to help track dismissed toasts
  toastId: number;

  reason: string;
  message: string;
}

export { POD_NOT_FOUND_WEB_ERROR };
export type { WebError };
