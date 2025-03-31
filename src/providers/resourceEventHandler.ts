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

  getUpdatedNamespaces(
    namespaces: Record<string, Namespace> | null,
  ): Record<string, Namespace> {
    const newNamespaces = { ...namespaces };
    for (const namespaceEvent of this.#namespaceEvents) {
      if (this.#isDeleteEvent(namespaceEvent)) {
        // eslint-disable-next-line
        delete newNamespaces[namespaceEvent.metadata.name];
      } else {
        newNamespaces[namespaceEvent.metadata.name] = namespaceEvent;
      }
    }

    return newNamespaces;
  }

  getUpdatedFlows(
    flows: Record<string, Record<string, Flow>> | null,
  ): Record<string, Record<string, Flow>> {
    const newFlows = { ...flows };

    for (const flowEvent of this.#flowEvents) {
      const { namespace, name } = flowEvent.metadata;

      if (this.#isDeleteEvent(flowEvent)) {
        const namespaceFlows = newFlows[namespace];
        if (namespaceFlows == null) {
          // The namespace does not exist. Skip deletion
          continue;
        }

        const namespaceFlow = namespaceFlows[name];
        if (!namespaceFlow) {
          // The flow does not exist. Skip deletion
          continue;
        }

        // eslint-disable-next-line
        const { [name]: _, ...newNamespaceFlows } = namespaceFlows;

        if (Object.keys(newNamespaceFlows).length === 0) {
          // eslint-disable-next-line
          delete newFlows[namespace];
        } else {
          newFlows[namespace] = newNamespaceFlows;
        }
      } else {
        const newNamespaceFlows = { ...newFlows[namespace] };
        newFlows[namespace] = newNamespaceFlows;
        newNamespaceFlows[name] = flowEvent;
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
