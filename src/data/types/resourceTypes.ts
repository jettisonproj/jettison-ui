import type { Namespace } from "src/data/types/namespace.ts";
import type { Flow } from "src/data/types/flowTypes.ts";

interface ResourceList {
  items: Resource[];
}

type Resource = Namespace | Flow;

export type { Resource, ResourceList };
