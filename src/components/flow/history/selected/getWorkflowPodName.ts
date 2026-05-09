import type { WorkflowStatusNode } from "src/data/types/workflowTypes.ts";
import { NodeTypes } from "src/data/types/workflowTypes.ts";

const maxK8sResourceNameLength = 253;
const k8sNamingHashLength = 10;
const maxPrefixLength = maxK8sResourceNameLength - k8sNamingHashLength;

// getWorkflowPodName returns a deterministic pod name
// In case templateName is not defined or that version is explicitly set to  POD_NAME_V1, it will return the nodeID (v1)
// In other cases it will return a combination of workflow name, template name, and a hash (v2)
// note: this is intended to be equivalent to the server-side Go code in workflow/util/pod_name.go#GeneratePodName
// SOT: https://github.com/argoproj/argo-workflows/blob/main/ui/src/shared/pod-name.ts
function getWorkflowPodName(
  workflowName: string,
  node: WorkflowStatusNode,
): string {
  // convert containerSet node name to its corresponding pod node name by removing the ".<containerName>" postfix
  // this part is from workflow/controller/container_set_template.go#executeContainerSet; the inverse never happens in the back-end, so is unique to the front-end
  const podNodeName =
    node.type == NodeTypes.Container
      ? node.name.replace(/\.[^/.]+$/, "")
      : node.name;
  if (workflowName === podNodeName) {
    return workflowName;
  }

  const templateName = getTemplateNameFromNode(node);
  let prefix = workflowName;
  if (templateName != null) {
    prefix += `-${templateName}`;
  }
  prefix = ensurePodNamePrefixLength(prefix);

  const hash = createFNVHash(podNodeName);
  return `${prefix}-${hash}`;
}

function ensurePodNamePrefixLength(prefix: string): string {
  if (prefix.length > maxPrefixLength - 1) {
    return prefix.substring(0, maxPrefixLength - 1);
  }

  return prefix;
}

function createFNVHash(input: string): number {
  let hashint = 2166136261;

  for (let i = 0; i < input.length; i++) {
    const character = input.charCodeAt(i);
    hashint = hashint ^ character;
    hashint +=
      (hashint << 1) +
      (hashint << 4) +
      (hashint << 7) +
      (hashint << 8) +
      (hashint << 24);
  }

  return hashint >>> 0;
}

function getTemplateNameFromNode(node: WorkflowStatusNode): string | undefined {
  // fall back to v1 pod names if no templateName or templateRef defined
  return node.templateName ?? node.templateRef?.template;
}

export { getWorkflowPodName };
