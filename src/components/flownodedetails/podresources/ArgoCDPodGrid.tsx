import type { JSX } from "react";
import { useContext, useEffect, useMemo } from "react";

import styles from "src/components/flownodedetails/podresources/ArgoCDPodGrid.module.css";
import type { ApplicationStatusResource } from "src/data/types/applicationTypes.ts";
import type { Pod } from "src/data/types/podTypes.ts";
import { PodPhases } from "src/data/types/podTypes.ts";
import {
  FlowMessageTypes,
  ResourceSubscriptionTypes,
} from "src/providers/flowWebSocket.ts";
import { FlowWebSocketContext, PodsContext } from "src/providers/provider.tsx";

const POD_APP_LABEL_KEY = "app";

interface ArgoCDPodGridProps {
  rolloutResource: ApplicationStatusResource | null;
}
function ArgoCDPodGrid({ rolloutResource }: ArgoCDPodGridProps): JSX.Element {
  const pods = useContext(PodsContext);
  const flowWebSocket = useContext(FlowWebSocketContext);

  useEffect(() => {
    if (rolloutResource == null) {
      return;
    }
    flowWebSocket.send({
      messageType: FlowMessageTypes.resourceSubscription,
      messageData: {
        subscriptionType: ResourceSubscriptionTypes.pod,
        namespace: rolloutResource.namespace,
        name: rolloutResource.name,
      },
    });
  }, [flowWebSocket, rolloutResource]);

  if (rolloutResource == null || pods == null) {
    return <div className={styles.podGridSkeleton} />;
  }

  return (
    <ArgoCDNamespacePodGrid
      rolloutResource={rolloutResource}
      namespacePods={pods.get(rolloutResource.namespace)}
    />
  );
}

interface ArgoCDNamespacePodGridProps {
  rolloutResource: ApplicationStatusResource;
  namespacePods: Map<string, Pod> | undefined;
}
function ArgoCDNamespacePodGrid({
  rolloutResource,
  namespacePods,
}: ArgoCDNamespacePodGridProps): JSX.Element {
  const rolloutPods = useMemo(() => {
    if (namespacePods == null) {
      return null;
    }
    return Array.from(namespacePods.values()).filter(
      (pod) =>
        pod.metadata.labels?.[POD_APP_LABEL_KEY] === rolloutResource.name,
    );
  }, [namespacePods, rolloutResource.name]);

  if (rolloutPods == null || rolloutPods.length === 0) {
    return (
      <div>
        No pods found for rollout: {rolloutResource.namespace}/
        {rolloutResource.name}
      </div>
    );
  }

  return (
    <div className={styles.podGrid}>
      {rolloutPods.map((pod) => (
        <ArgoCDPod key={pod.metadata.name} pod={pod} />
      ))}
    </div>
  );
}

interface ArgoCDPodProps {
  pod: Pod;
}
function ArgoCDPod({ pod }: ArgoCDPodProps): JSX.Element {
  const { namespace, name: podName } = pod.metadata;
  const { phase: podPhase, containerStatuses } = pod.status;
  const numContainers = containerStatuses?.length ?? "-";
  const readyContainers =
    containerStatuses?.reduce(
      (acc, containerStatus) => acc + (containerStatus.ready ? 1 : 0),
      0,
    ) ?? "-";

  let itemClassName;
  let iconComponent;

  switch (podPhase) {
    case PodPhases.Succeeded:
    case PodPhases.Running:
      itemClassName = `${styles.podGridItem} ${styles.podGridSuccess}`;
      iconComponent = (
        <i className={`nf nf-fa-circle_check ${styles.podGridIcon}`} />
      );
      break;
    case PodPhases.Failed:
      itemClassName = `${styles.podGridItem} ${styles.podGridDanger}`;
      iconComponent = (
        <i className={`nf nf-fa-circle_xmark ${styles.podGridIcon}`} />
      );
      break;
    case PodPhases.Pending:
      itemClassName = `${styles.podGridItem} ${styles.podGridPending}`;
      iconComponent = <i className={`nf nf-fa-clock ${styles.podGridIcon}`} />;
      break;
    default:
      podPhase satisfies never;
      console.log("unknown pod phase:");
      console.log(podPhase);
      throw new ArgoCDPodGridError(`unknown phase for pod: ${podName}`);
  }

  return (
    <a
      href={`/api/v1/namespaces/${namespace}/pods/${podName}`}
      target="_blank"
      rel="noreferrer"
      className={itemClassName}
    >
      <div className={styles.podGridText}>
        {iconComponent}
        <span className={styles.podGridNodeTitle}>{podName}</span>
        <span>
          ({readyContainers}/{numContainers})
        </span>
      </div>
    </a>
  );
}

class ArgoCDPodGridError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { ArgoCDPodGrid };
