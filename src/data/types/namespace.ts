import type {
  ResourceKind,
  BaseResource,
} from "src/data/types/baseResourceTypes.ts";

interface Namespace extends BaseResource {
  kind: ResourceKind.Namespace;
}

export type { Namespace };
