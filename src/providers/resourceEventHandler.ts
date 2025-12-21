import type { Flow, PushPrFlows } from "src/data/types/flowTypes.ts";
import type { Application } from "src/data/types/applicationTypes.ts";
import type { Rollout } from "src/data/types/rolloutTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import type { Pod } from "src/data/types/podTypes.ts";
import type { ContainerLog } from "src/data/types/containerLogTypes.ts";
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
  #podEvents: Pod[];
  #containerLogEvents: ContainerLog[];

  constructor(resourceList: ResourceList) {
    this.#flowEvents = [];
    this.#applicationEvents = [];
    this.#rolloutEvents = [];
    this.#workflowEvents = [];
    this.#podEvents = [];
    this.#containerLogEvents = [];

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
        case ResourceKind.Pod:
          this.#podEvents.push(resourceEvent);
          continue;
        case ResourceKind.ContainerLog:
          this.#containerLogEvents.push(resourceEvent);
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

  hasPodEvents(): boolean {
    return this.#podEvents.length > 0;
  }

  hasContainerLogEvents(): boolean {
    return this.#containerLogEvents.length > 0;
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
   * Get the updated Map of resource T.
   * Where Map is a mapping from namespace to name to T
   */
  #getUpdatedResources<T extends Resource>(
    resources: Map<string, Map<string, T>> | null,
    resourceEvents: T[],
  ): Map<string, Map<string, T>> {
    const newResources = new Map(resources);
    const recreatedNamespaces = new Set();

    for (const resourceEvent of resourceEvents) {
      const { namespace, name } = resourceEvent.metadata;
      const namespaceResources = newResources.get(namespace);

      if (this.#isDeleteEvent(resourceEvent)) {
        if (namespaceResources == null) {
          // The namespace does not exist. Skip deletion
          continue;
        }

        const namespaceResource = namespaceResources.get(name);
        if (namespaceResource == null) {
          // The rollout does not exist. Skip deletion
          continue;
        }

        if (namespaceResources.size === 1) {
          // The namespace can be removed since it is the last entry
          newResources.delete(namespace);
        } else {
          // Get the updated namespace map. Ensures it is recreated if needed
          let newNamespaceResources;
          if (recreatedNamespaces.has(namespace)) {
            newNamespaceResources = namespaceResources;
          } else {
            newNamespaceResources = new Map(namespaceResources);
            newResources.set(namespace, newNamespaceResources);
            recreatedNamespaces.add(namespace);
          }

          newNamespaceResources.delete(name);
        }
      } else {
        // Get the updated namespace map. Ensures it is recreated if needed
        let newNamespaceResources;
        if (namespaceResources != null && recreatedNamespaces.has(namespace)) {
          newNamespaceResources = namespaceResources;
        } else {
          newNamespaceResources = new Map(namespaceResources);
          newResources.set(namespace, newNamespaceResources);
          recreatedNamespaces.add(namespace);
        }

        newNamespaceResources.set(name, resourceEvent);
      }
    }

    return newResources;
  }

  /**
   * Get the updated Map of rollouts.
   * Where Map is a mapping from namespace to name to Rollout
   */
  getUpdatedRollouts(
    rollouts: Map<string, Map<string, Rollout>> | null,
  ): Map<string, Map<string, Rollout>> {
    return this.#getUpdatedResources(rollouts, this.#rolloutEvents);
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

  /**
   * Get the updated Map of rollouts.
   * Where Map is a mapping from namespace to name to Rollout
   */
  getUpdatedPods(
    pods: Map<string, Map<string, Pod>> | null,
  ): Map<string, Map<string, Pod>> {
    return this.#getUpdatedResources(pods, this.#podEvents);
  }

  /**
   * Get the updated Map of container logs.
   * Where Map is a mapping from namespace to podName to containerName to Set of log lines
   *
   * A set is used to deduplicate logs in case the logs are requested multiple times
   */
  getUpdatedContainerLogs(
    containerLogs: Map<string, Map<string, Map<string, Set<string>>>> | null,
  ): Map<string, Map<string, Map<string, Set<string>>>> {
    const newContainerLogs = new Map(containerLogs);
    // Map from namespaces to set of pod names to track updates
    const recreatedNamespacePods = new Map();

    for (const containerLogEvent of this.#containerLogEvents) {
      const { namespace, name: podName } = containerLogEvent.metadata;
      const { containerName, logLines } = containerLogEvent.spec;
      const namespacePods = newContainerLogs.get(namespace);

      if (this.#isDeleteEvent(containerLogEvent)) {
        // Container logs are not typically deleted. The implementation
        // is likely not needed
        console.log("unhandled container log delete event");
        console.log(containerLogEvent);
      } else {
        // Get the updated namespace map. Ensures it is recreated if needed
        let newNamespacePods;
        let recreatedPodNames;
        if (namespacePods != null && recreatedNamespacePods.has(namespace)) {
          newNamespacePods = namespacePods;
          recreatedPodNames = recreatedNamespacePods.get(
            namespace,
          ) as Set<string>;
        } else {
          newNamespacePods = new Map(namespacePods);
          newContainerLogs.set(namespace, newNamespacePods);
          recreatedPodNames = new Set<string>();
          recreatedNamespacePods.set(namespace, recreatedPodNames);
        }

        const podContainers = newNamespacePods.get(podName);

        // Get the updated podNames map. Ensures it is recreated if needed
        let newPodContainers;
        if (podContainers != null && recreatedPodNames.has(podName)) {
          newPodContainers = podContainers;
        } else {
          newPodContainers = new Map(podContainers);
          newNamespacePods.set(podName, newPodContainers);
          recreatedPodNames.add(podName);
        }

        const existingLogLines = newPodContainers.get(containerName);
        if (existingLogLines == null) {
          newPodContainers.set(containerName, new Set(logLines));
        } else {
          let updatedLogLines = null;
          for (const logLine of logLines) {
            if (!existingLogLines.has(logLine)) {
              if (updatedLogLines == null) {
                updatedLogLines = new Set(existingLogLines);
              }
              updatedLogLines.add(logLine);
            }
          }

          if (updatedLogLines != null) {
            newPodContainers.set(containerName, updatedLogLines);
          }
        }
      }
    }
    return newContainerLogs;
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
