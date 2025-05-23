import type { Namespace } from "src/data/types/namespace.ts";
import type { Flow } from "src/data/types/flowTypes.ts";
import type { Application } from "src/data/types/applicationTypes.ts";
import type { Rollout } from "src/data/types/rolloutTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";

interface ResourceList {
  items: Resource[];
}

type Resource = Namespace | Flow | Application | Rollout | Workflow;

export type { Resource, ResourceList };
