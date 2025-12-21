import type { Flow } from "src/data/types/flowTypes.ts";
import type { Application } from "src/data/types/applicationTypes.ts";
import type { Rollout } from "src/data/types/rolloutTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import type { Pod } from "src/data/types/podTypes.ts";
import type { ContainerLog } from "src/data/types/containerLogTypes.ts";

interface ResourceList {
  items: Resource[];
}

type Resource = Flow | Application | Rollout | Workflow | Pod | ContainerLog;

export type { Resource, ResourceList };
