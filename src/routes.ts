const routes = {
  flows: "/flows",
  home: "/",
};

const pushTriggerRoute = "push";
const prTriggerRoute = "pr";

function getTriggerRoute(isPrFlow: boolean) {
  if (isPrFlow) {
    return prTriggerRoute;
  }
  return pushTriggerRoute;
}

export { routes, pushTriggerRoute, prTriggerRoute, getTriggerRoute };
