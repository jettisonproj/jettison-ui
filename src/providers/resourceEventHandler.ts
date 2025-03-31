import type { Namespace } from "src/data/types/namespace.ts";
import type { Flow } from "src/data/types/flowTypes.ts";
import type { Resource, ResourceList } from "src/data/types/resourceTypes.ts";
import { ResourceKind } from "src/data/types/baseResourceTypes.ts";

const DELETE_EVENT_ANNOTATION =
  "workflows.jettisonproj.io/v1alpha1/watcher-event-type";

class ResourceEventHandler {
  #namespaceEvents: Namespace[];
  #flowEvents: Flow[];

  constructor(resourceList: ResourceList) {
    this.#namespaceEvents = [];
    this.#flowEvents = [];

    for (const resourceEvent of resourceList.items) {
      switch (resourceEvent.kind) {
        case ResourceKind.Namespace:
          this.#namespaceEvents.push(resourceEvent);
          continue;
        case ResourceKind.Flow:
          this.#flowEvents.push(resourceEvent);
          continue;
        default:
          resourceEvent satisfies never;
          console.log("unknown event resource");
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

  getUpdatedFlows(
    flows: Map<string, Map<string, Flow>> | null,
  ): Map<string, Map<string, Flow>> {
    const newFlows = new Map(flows);

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
          const newNamespaceFlows = new Map(namespaceFlows);
          newNamespaceFlows.delete(name);

          newFlows.set(namespace, newNamespaceFlows);
        }
      } else {
        const newNamespaceFlows = new Map(namespaceFlows);
        newNamespaceFlows.set(name, flowEvent);
        newFlows.set(namespace, newNamespaceFlows);
      }
    }

    return newFlows;
  }

  #isDeleteEvent(resourceEvent: Resource): boolean {
    const { annotations } = resourceEvent.metadata;
    return annotations?.[DELETE_EVENT_ANNOTATION] === "delete";
  }
}

export { ResourceEventHandler };
