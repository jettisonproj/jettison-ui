import type { NamespacedResource } from "src/data/types/baseResourceTypes.ts";
import { ResourceKinds } from "src/data/types/baseResourceTypes.ts";

interface WebError extends NamespacedResource {
  kind: typeof ResourceKinds.WebError;
  spec: WebErrorSpec;
}

interface WebErrorSpec {
  // toastId is NOT returned by the api
  // It is a field used by the UI to help track dismissed toasts
  toastId: number;
  message: string;
}

export type { WebError };
