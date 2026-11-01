import type { NamespacedResource } from "src/data/types/baseResourceTypes.ts";
import { ResourceKinds } from "src/data/types/baseResourceTypes.ts";

interface WebError extends NamespacedResource {
  kind: typeof ResourceKinds.WebError;
  spec: WebErrorSpec;
}

interface WebErrorSpec {
  message: string;
}

export type { WebError };
