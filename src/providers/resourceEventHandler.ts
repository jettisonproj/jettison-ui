import type { Namespace } from "src/data/types/namespace.ts";
import type { Flow } from "src/data/types/flowTypes.ts";
import type { Application } from "src/data/types/applicationTypes.ts";
import type { Rollout } from "src/data/types/rolloutTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import type { Resource, ResourceList } from "src/data/types/resourceTypes.ts";
import { ResourceKind } from "src/data/types/baseResourceTypes.ts";
import { appendGitSuffix } from "src/utils/gitUtil.ts";

const DELETE_EVENT_ANNOTATION =
  "workflows.jettisonproj.io/v1alpha1/watcher-event-type";
const SENSOR_NAME_LABEL = "events.argoproj.io/sensor";

class ResourceEventHandler {
  #namespaceEvents: Namespace[];
  #flowEvents: Flow[];
  #applicationEvents: Application[];
  #rolloutEvents: Rollout[];
  #workflowEvents: Workflow[];

  constructor(resourceList: ResourceList) {
    this.#namespaceEvents = [];
    this.#flowEvents = [];
    this.#applicationEvents = [];
    this.#rolloutEvents = [];
    this.#workflowEvents = [];

    for (const resourceEvent of resourceList.items) {
      switch (resourceEvent.kind) {
        case ResourceKind.Namespace:
          this.#namespaceEvents.push(resourceEvent);
          continue;
        case ResourceKind.Flow:
          this.#flowEvents.push(resourceEvent);
          continue;
        case ResourceKind.Application:
          this.#applicationEvents.push(resourceEvent);
          continue;
        case ResourceKind.Rollout:
          this.#rolloutEvents.push(resourceEvent);
          continue;
        case ResourceKind.Workflow:
          this.#workflowEvents.push(resourceEvent);
          continue;
        default:
          resourceEvent satisfies never;
          console.log("unknown resource event");
          console.log(resourceEvent);
          continue;
      }
    }
  }

  hasNamespaceEvents(): boolean {
    return this.#namespaceEvents.length > 0;
  }

  hasFlowEvents(): boolean {
    return this.#flowEvents.length > 0;
  }

  hasApplicationEvents(): boolean {
    return this.#applicationEvents.length > 0;
  }

  hasRolloutEvents(): boolean {
    return this.#rolloutEvents.length > 0;
  }

  hasWorkflowEvents(): boolean {
    return this.#workflowEvents.length > 0;
  }

  /* Get the updated Set<string> of namespaces */
  getUpdatedNamespaces(namespaces: Set<string> | null): Set<string> {
    const newNamespaces = new Set(namespaces);
    for (const namespaceEvent of this.#namespaceEvents) {
      if (this.#isDeleteEvent(namespaceEvent)) {
        newNamespaces.delete(namespaceEvent.metadata.name);
      } else {
        newNamespaces.add(namespaceEvent.metadata.name);
      }
    }

    return newNamespaces;
  }

  /**
   * Get the updated Map of flows.
   * Where Map is a mapping from namespace to name to Flow
   */
  getUpdatedFlows(
    flows: Map<string, Map<string, Flow>> | null,
  ): Map<string, Map<string, Flow>> {
    const newFlows = new Map(flows);
    const recreatedNamespaces = new Set();

    for (const flowEvent of this.#flowEvents) {
      const { namespace, name } = flowEvent.metadata;
      const namespaceFlows = newFlows.get(namespace);

      if (this.#isDeleteEvent(flowEvent)) {
        if (namespaceFlows == null) {
          // The namespace does not exist. Skip deletion
          continue;
        }

        const namespaceFlow = namespaceFlows.get(name);
        if (namespaceFlow == null) {
          // The flow does not exist. Skip deletion
          continue;
        }

        if (namespaceFlows.size === 1) {
          // The namespace can be removed since it is the last entry
          newFlows.delete(namespace);
        } else {
          // Get the updated namespace map. Ensures it is recreated if needed
          let newNamespaceFlows;
          if (recreatedNamespaces.has(namespace)) {
            newNamespaceFlows = namespaceFlows;
          } else {
            newNamespaceFlows = new Map(namespaceFlows);
            newFlows.set(namespace, newNamespaceFlows);
            recreatedNamespaces.add(namespace);
          }

          newNamespaceFlows.delete(name);
        }
      } else {
        // Get the updated namespace map. Ensures it is recreated if needed
        let newNamespaceFlows;
        if (namespaceFlows != null && recreatedNamespaces.has(namespace)) {
          newNamespaceFlows = namespaceFlows;
        } else {
          newNamespaceFlows = new Map(namespaceFlows);
          newFlows.set(namespace, newNamespaceFlows);
          recreatedNamespaces.add(namespace);
        }

        newNamespaceFlows.set(name, flowEvent);
      }
    }

    return newFlows;
  }

  /**
   * Get the updated Map of applications.
   * Where Map is a mapping from repo url to path to Application
   */
  getUpdatedApplications(
    applications: Map<string, Map<string, Application>> | null,
  ): Map<string, Map<string, Application>> {
    const newApplications = new Map(applications);
    const recreatedCloneUrls = new Set();

    for (const applicationEvent of this.#applicationEvents) {
      const { repoURL: repoUrl, path } = applicationEvent.spec.source;
      const cloneUrl = appendGitSuffix(repoUrl);
      // todo standardize on clone url or repo url
      const cloneUrlPaths = newApplications.get(cloneUrl);

      if (this.#isDeleteEvent(applicationEvent)) {
        if (cloneUrlPaths == null) {
          // The cloneUrl does not exist. Skip deletion
          continue;
        }
        const application = cloneUrlPaths.get(path);
        if (application == null) {
          // The application does not exist. Skip deletion
          continue;
        }

        if (cloneUrlPaths.size === 1) {
          // the cloneUrl can be removed since it is the last entry
          newApplications.delete(cloneUrl);
        } else {
          // Get the updated cloneUrlPaths map. Ensures it is recreated if needed
          let newCloneUrlPaths;
          if (recreatedCloneUrls.has(cloneUrl)) {
            newCloneUrlPaths = cloneUrlPaths;
          } else {
            newCloneUrlPaths = new Map(cloneUrlPaths);
            newApplications.set(cloneUrl, newCloneUrlPaths);
            recreatedCloneUrls.add(cloneUrl);
          }

          newCloneUrlPaths.delete(path);
        }
      } else {
        // Get the updated cloneUrlPaths map. Ensures it is recreated if needed
        let newCloneUrlPaths;
        if (cloneUrlPaths != null && recreatedCloneUrls.has(cloneUrl)) {
          newCloneUrlPaths = cloneUrlPaths;
        } else {
          newCloneUrlPaths = new Map(cloneUrlPaths);
          newApplications.set(cloneUrl, newCloneUrlPaths);
          recreatedCloneUrls.add(cloneUrl);
        }

        newCloneUrlPaths.set(path, applicationEvent);
      }
    }

    return newApplications;
  }

  /**
   * Get the updated Map of rollouts.
   * Where Map is a mapping from namespace to name to Rollout
   */
  getUpdatedRollouts(
    rollouts: Map<string, Map<string, Rollout>> | null,
  ): Map<string, Map<string, Rollout>> {
    const newRollouts = new Map(rollouts);
    const recreatedNamespaces = new Set();

    for (const rolloutEvent of this.#rolloutEvents) {
      const { namespace, name } = rolloutEvent.metadata;
      const namespaceRollouts = newRollouts.get(namespace);

      if (this.#isDeleteEvent(rolloutEvent)) {
        if (namespaceRollouts == null) {
          // The namespace does not exist. Skip deletion
          continue;
        }

        const namespaceRollout = namespaceRollouts.get(name);
        if (namespaceRollout == null) {
          // The rollout does not exist. Skip deletion
          continue;
        }

        if (namespaceRollouts.size === 1) {
          // The namespace can be removed since it is the last entry
          newRollouts.delete(namespace);
        } else {
          // Get the updated namespace map. Ensures it is recreated if needed
          let newNamespaceRollouts;
          if (recreatedNamespaces.has(namespace)) {
            newNamespaceRollouts = namespaceRollouts;
          } else {
            newNamespaceRollouts = new Map(namespaceRollouts);
            newRollouts.set(namespace, newNamespaceRollouts);
            recreatedNamespaces.add(namespace);
          }

          newNamespaceRollouts.delete(name);
        }
      } else {
        // Get the updated namespace map. Ensures it is recreated if needed
        let newNamespaceRollouts;
        if (namespaceRollouts != null && recreatedNamespaces.has(namespace)) {
          newNamespaceRollouts = namespaceRollouts;
        } else {
          newNamespaceRollouts = new Map(namespaceRollouts);
          newRollouts.set(namespace, newNamespaceRollouts);
          recreatedNamespaces.add(namespace);
        }

        newNamespaceRollouts.set(name, rolloutEvent);
      }
    }

    return newRollouts;
  }

  /**
   * Get the updated Map of workflows.
   * Where Map is a mapping from namespace to flowName to workflowName to Workflow
   */
  getUpdatedWorkflows(
    workflows: Map<string, Map<string, Map<string, Workflow>>> | null,
  ): Map<string, Map<string, Map<string, Workflow>>> {
    const newWorkflows = new Map(workflows);
    const recreatedNamespaces = new Set();
    const recreatedFlowNames = new Set();

    for (const workflowEvent of this.#workflowEvents) {
      const { namespace, name: workflowName } = workflowEvent.metadata;
      const flowName = this.#getFlowName(workflowEvent);
      if (flowName == null) {
        console.log("unable to get flow name for workflow. Skipping...");
        console.log(workflowEvent);
        continue;
      }
      const namespaceWorkflows = newWorkflows.get(namespace);

      if (this.#isDeleteEvent(workflowEvent)) {
        // Workflows are not typically deleted. The implementation
        // is likely not needed
        console.log("unhandled workflow delete event");
        console.log(workflowEvent);
      } else {
        // Get the updated namespace map. Ensures it is recreated if needed
        let newNamespaceWorkflows;
        if (namespaceWorkflows != null && recreatedNamespaces.has(namespace)) {
          newNamespaceWorkflows = namespaceWorkflows;
        } else {
          newNamespaceWorkflows = new Map(namespaceWorkflows);
          newWorkflows.set(namespace, newNamespaceWorkflows);
          recreatedNamespaces.add(namespace);
        }

        const flowWorkflows = newNamespaceWorkflows.get(flowName);

        // Get the updated flowNames map. Ensures it is recreated if needed
        let newFlowWorkflows;
        if (flowWorkflows != null && recreatedFlowNames.has(flowName)) {
          newFlowWorkflows = flowWorkflows;
        } else {
          newFlowWorkflows = new Map(flowWorkflows);
          newNamespaceWorkflows.set(flowName, newFlowWorkflows);
          recreatedFlowNames.add(flowName);
        }

        newFlowWorkflows.set(workflowName, workflowEvent);
      }
    }

    return newWorkflows;
  }

  #isDeleteEvent(resourceEvent: Resource): boolean {
    const { annotations } = resourceEvent.metadata;
    return annotations?.[DELETE_EVENT_ANNOTATION] === "delete";
  }

  #getFlowName(workflow: Workflow): string | undefined {
    const { labels } = workflow.metadata;
    return labels?.[SENSOR_NAME_LABEL];
  }
}

export { ResourceEventHandler };
