import type { Flow, PushPrFlows } from "src/data/types/flowTypes.ts";
import type { Application } from "src/data/types/applicationTypes.ts";
import type { Rollout } from "src/data/types/rolloutTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import type { Resource, ResourceList } from "src/data/types/resourceTypes.ts";
import { ResourceKind } from "src/data/types/baseResourceTypes.ts";
import { appendGitSuffix, getRepoOrgName } from "src/utils/gitUtil.ts";
import {
  memoizeFlow,
  memoizeWorkflow,
} from "src/providers/resourceEventMemo.ts";

const DELETE_EVENT_ANNOTATION =
  "workflows.jettisonproj.io/v1alpha1/watcher-event-type";
const SENSOR_NAME_LABEL = "events.argoproj.io/sensor";

class ResourceEventHandler {
  #flowEvents: Flow[];
  #applicationEvents: Application[];
  #rolloutEvents: Rollout[];
  #workflowEvents: Workflow[];

  constructor(resourceList: ResourceList) {
    this.#flowEvents = [];
    this.#applicationEvents = [];
    this.#rolloutEvents = [];
    this.#workflowEvents = [];

    for (const resourceEvent of resourceList.items) {
      switch (resourceEvent.kind) {
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

  /**
   * Get the updated Map of flows.
   * Where Map is a mapping from "repoOrg/repoName" to PushPrFlows
   */
  getUpdatedFlows(
    flows: Map<string, PushPrFlows> | null,
  ): Map<string, PushPrFlows> {
    const newFlows = new Map(flows);
    const recreatedRepos = new Set();

    for (const flowEvent of this.#flowEvents) {
      const memoizedFlowEvent = memoizeFlow(flowEvent);
      const { trigger, isPrFlow } = memoizedFlowEvent.memo;
      const { repoUrl } = trigger;
      const repoOrgName = getRepoOrgName(repoUrl);
      const pushPrFlows = newFlows.get(repoOrgName);

      if (this.#isDeleteEvent(memoizedFlowEvent)) {
        if (pushPrFlows == null) {
          // The repoOrgName does not exist. Skip deletion
          continue;
        }

        if (isPrFlow) {
          if (pushPrFlows.prFlow == null) {
            continue;
          } else if (pushPrFlows.pushFlow == null) {
            newFlows.delete(repoOrgName);
          } else {
            // Get the updated namespace map. Ensures it is recreated if needed
            let newPushPrFlows;
            if (recreatedRepos.has(repoOrgName)) {
              newPushPrFlows = pushPrFlows;
            } else {
              newPushPrFlows = { ...pushPrFlows };
              newFlows.set(repoOrgName, newPushPrFlows);
              recreatedRepos.add(repoOrgName);
            }
            delete newPushPrFlows.prFlow;
          }
        } else {
          if (pushPrFlows.pushFlow == null) {
            continue;
          } else if (pushPrFlows.prFlow == null) {
            newFlows.delete(repoOrgName);
          } else {
            // Get the updated namespace map. Ensures it is recreated if needed
            let newPushPrFlows;
            if (recreatedRepos.has(repoOrgName)) {
              newPushPrFlows = pushPrFlows;
            } else {
              newPushPrFlows = { ...pushPrFlows };
              newFlows.set(repoOrgName, newPushPrFlows);
              recreatedRepos.add(repoOrgName);
            }
            delete newPushPrFlows.pushFlow;
          }
        }
      } else {
        // Get the updated namespace map. Ensures it is recreated if needed
        let newPushPrFlows;
        if (pushPrFlows != null && recreatedRepos.has(repoOrgName)) {
          newPushPrFlows = pushPrFlows;
        } else {
          newPushPrFlows = { ...pushPrFlows };
          newFlows.set(repoOrgName, newPushPrFlows);
          recreatedRepos.add(repoOrgName);
        }

        if (isPrFlow) {
          newPushPrFlows.prFlow = memoizedFlowEvent;
        } else {
          newPushPrFlows.pushFlow = memoizedFlowEvent;
        }
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
    // Map from namespaces to set of flow names to track updates
    const recreatedNamespaceFlows = new Map();

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
        let recreatedFlowNames;
        if (
          namespaceWorkflows != null &&
          recreatedNamespaceFlows.has(namespace)
        ) {
          newNamespaceWorkflows = namespaceWorkflows;
          recreatedFlowNames = recreatedNamespaceFlows.get(
            namespace,
          ) as Set<string>;
        } else {
          newNamespaceWorkflows = new Map(namespaceWorkflows);
          newWorkflows.set(namespace, newNamespaceWorkflows);
          recreatedFlowNames = new Set();
          recreatedNamespaceFlows.set(namespace, recreatedFlowNames);
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

        memoizeWorkflow(workflowEvent);
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
