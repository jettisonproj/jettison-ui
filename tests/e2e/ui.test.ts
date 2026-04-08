import { test, expect } from "@playwright/test";

const REPO_ORG = "jettisonproj";
const REPO_NAME = "jettison-ui";
const REPO_URL = `https://github.com//${REPO_ORG}/${REPO_NAME}`;
const YAML_URL_RE = new RegExp(
  `/api/v1/namespaces/${REPO_ORG}/workflows/${REPO_NAME}-`,
);
const WORKFLOW_UI_URL_RE = new RegExp(
  `https://argo\\.osoriano\\.com/workflows/${REPO_ORG}/${REPO_NAME}-`,
);

test("test", async ({ page }) => {
  await page.goto("/");

  // Test Home Page
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recent Repos" }),
  ).toBeVisible();
  await expect(page.getByText("No recent repos found")).toBeVisible();
  await page.getByRole("link", { name: "See All Repos" }).click();

  // Test Repos Page
  await expect(page.getByRole("heading", { name: "Home⧸Repos" })).toBeVisible();

  const jettisonUiRepoDiv = page.getByText(REPO_NAME);

  await expect(
    jettisonUiRepoDiv.locator(`a[href="${REPO_URL}"]`),
  ).toBeVisible();
  await jettisonUiRepoDiv.click();

  // Test Push Flow Page
  await expect(
    page.getByRole("heading", { name: `Home⧸Repos⧸${REPO_NAME}` }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Push Flow" })).toBeVisible();
  const jettisonFlowPushGraphSvg = page.locator("svg");
  await expect(jettisonFlowPushGraphSvg).toHaveCount(1);
  await expect(jettisonFlowPushGraphSvg).toBeVisible();

  // Test Push Flow Page - Workflow Execution
  const firstPushWorkflowDetails = page
    .getByRole("link", { name: "See Details" })
    .first();
  await expect(firstPushWorkflowDetails).toBeVisible();
  await firstPushWorkflowDetails.hover();
  await page.getByRole("button").click();

  const viewWorkflowPushYamlLink = page.getByRole("link", {
    name: "View YAML",
  });
  await expect(viewWorkflowPushYamlLink).toBeVisible();
  await expect(viewWorkflowPushYamlLink).toHaveAttribute("href", YAML_URL_RE);

  const viewPushWorkflowUiLink = page.getByRole("link", {
    name: "View in Workflow UI",
  });
  await expect(viewPushWorkflowUiLink).toBeVisible();
  await expect(viewPushWorkflowUiLink).toHaveAttribute(
    "href",
    WORKFLOW_UI_URL_RE,
  );

  await firstPushWorkflowDetails.click();
  await expect(page.getByRole("link", { name: "Summary" })).toBeVisible();

  await page.getByRole("link", { name: "PR Flow" }).click();

  // Test PR Flow Page
  await expect(
    page.getByRole("heading", { name: `Home⧸Repos⧸${REPO_NAME}` }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "PR Flow" })).toBeVisible();
  const jettisonPrFlowGraphSvg = page.locator("svg");
  await expect(jettisonPrFlowGraphSvg).toHaveCount(1);
  await expect(jettisonPrFlowGraphSvg).toBeVisible();

  // Test PR Flow Page - Workflow Execution
  const firstPrWorkflowDetails = page
    .getByRole("link", { name: "See Details" })
    .first();
  await expect(firstPrWorkflowDetails).toBeVisible();
  await firstPrWorkflowDetails.hover();
  await page.getByRole("button").click();

  const viewPrWorkflowYamlLink = page.getByRole("link", { name: "View YAML" });
  await expect(viewPrWorkflowYamlLink).toBeVisible();
  await expect(viewPrWorkflowYamlLink).toHaveAttribute("href", YAML_URL_RE);

  const viewPrWorkflowUiLink = page.getByRole("link", {
    name: "View in Workflow UI",
  });
  await expect(viewPrWorkflowUiLink).toBeVisible();
  await expect(viewPrWorkflowUiLink).toHaveAttribute(
    "href",
    WORKFLOW_UI_URL_RE,
  );

  await firstPrWorkflowDetails.click();
  await expect(page.getByRole("link", { name: "Summary" })).toBeVisible();

  await page.getByRole("link", { name: "PR Flow" }).click();
});
