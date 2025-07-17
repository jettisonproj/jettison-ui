//
// Contains functions to get workflow or workflow node parameters
// Should be kept in sync with:
//   https://github.com/jettisonproj/jettison-controller/blob/main/internal/controller/sensor/sensor_trigger_parameters.go
//
function getWorkflowRepo(parameterMap: Record<string, string>) {
  return getWorkflowParameter(parameterMap, "repo");
}

function getWorkflowRevision(parameterMap: Record<string, string>) {
  return getWorkflowParameter(parameterMap, "revision");
}

function getWorkflowRevisionRef(parameterMap: Record<string, string>) {
  return getWorkflowParameter(parameterMap, "revision-ref");
}

function getWorkflowRevisionTitle(parameterMap: Record<string, string>) {
  return getWorkflowParameter(parameterMap, "revision-title");
}

function getWorkflowRevisionAuthor(parameterMap: Record<string, string>) {
  return getWorkflowParameter(parameterMap, "revision-author");
}

// PR parameter
function getWorkflowRevisionNumber(parameterMap: Record<string, string>) {
  return getWorkflowParameter(parameterMap, "revision-number");
}

// Workflow node parameters
function getNodeDockerfilePath(parameterMap: Record<string, string>) {
  return getWorkflowParameter(parameterMap, "dockerfile-path");
}

function getWorkflowParameter(
  parameterMap: Record<string, string>,
  parameterKey: string,
) {
  const parameterValue = parameterMap[parameterKey];
  if (parameterValue == null) {
    throw new FlowGraphNodeError(
      `did not find ${parameterKey} in workflow parameters`,
    );
  }
  return parameterValue;
}

class FlowGraphNodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export {
  getWorkflowRepo,
  getWorkflowRevision,
  getWorkflowRevisionRef,
  getWorkflowRevisionTitle,
  getWorkflowRevisionAuthor,
  getWorkflowRevisionNumber,
  getNodeDockerfilePath,
};
