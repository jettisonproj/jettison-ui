import type {
  Application,
  ApplicationStatusResource,
} from "src/data/types/applicationTypes.ts";
import { ResourceKinds } from "src/data/types/baseResourceTypes.ts";

function getRolloutResource(
  application?: Application,
): ApplicationStatusResource | null {
  if (application == null) {
    return null;
  }

  const rolloutResources = application.status.resources.filter(
    (resource) => resource.kind === ResourceKinds.Rollout,
  );
  if (rolloutResources.length !== 1) {
    const { namespace, name } = application.metadata;
    throw new ApplicationUtilError(
      "Expected a single rollout in application " +
        `namespace=${namespace} name=${name}`,
    );
  }
  const rolloutResource = rolloutResources[0];
  if (rolloutResource == null) {
    const { namespace, name } = application.metadata;
    throw new ApplicationUtilError(
      "Expected a single rollout in application " +
        `namespace=${namespace} name=${name}`,
    );
  }
  return rolloutResource;
}

class ApplicationUtilError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { getRolloutResource };
