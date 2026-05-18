import type { Params } from "react-router";

const routes = {
  flows: "/flows",
  home: "/",
} as const;

type TriggerRoute = "push" | "pr";
const pushTriggerRoute: TriggerRoute = "push";
const prTriggerRoute: TriggerRoute = "pr";

function getTriggerRoute(isPrFlow: boolean): TriggerRoute {
  if (isPrFlow) {
    return prTriggerRoute;
  }
  return pushTriggerRoute;
}

function isTriggerRouteForPrFlow(triggerRoute: TriggerRoute): boolean {
  return triggerRoute === prTriggerRoute;
}

function getRequiredParam(
  routerParams: Readonly<Params>,
  paramName: string,
): string {
  const requiredParam = routerParams[paramName];
  if (requiredParam == null) {
    throw new RoutesError(`Route parameter cannot be empty: ${paramName}`);
  }
  return requiredParam;
}

function getTriggerRouteParam(routerParams: Readonly<Params>): TriggerRoute {
  const triggerRoute = getRequiredParam(routerParams, "triggerRoute");
  if (triggerRoute !== pushTriggerRoute && triggerRoute !== prTriggerRoute) {
    throw new RoutesError(
      `invalid path parameter triggerRoute=${triggerRoute}`,
    );
  }
  return triggerRoute;
}

class RoutesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export {
  getRequiredParam,
  getTriggerRoute,
  getTriggerRouteParam,
  isTriggerRouteForPrFlow,
  prTriggerRoute,
  pushTriggerRoute,
  routes,
};
