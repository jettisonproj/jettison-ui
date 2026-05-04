import { expect, test } from "@playwright/test";

const REPO_ORG = "jettisonproj";
const REPO_NAME = "jettison-ui";
const YAML_URL_RE = new RegExp(
  `/api/v1/namespaces/${REPO_ORG}/workflows/${REPO_NAME}-`,
);
const WORKFLOW_UI_URL_RE = new RegExp(
  `https://argo\\.osoriano\\.com/workflows/${REPO_ORG}/${REPO_NAME}-`,
);
const PR_FLOW_RE = /PR Flow$/;
const VIEW_YAML_RE = /View YAML$/;
const VIEW_IN_WORKFLOW_UI_RE = /View in Workflow UI$/;
const SEE_WORKFLOW_DETAILS_RE = /See Details$/;

// Shorthand variable for enabling extact matching
const exact = true;

test("test", async ({ page }) => {
  await page.goto("/");

  // Test Home Page
  await expect(
    page.getByRole("heading", { name: "Home", exact }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Overview", exact }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recent Repos", exact }),
  ).toBeVisible();
  await expect(
    page.getByText("No recent repos found", { exact }),
  ).toBeVisible();
  await page.getByRole("link", { name: /^See All Repos/ }).click();

  // Test Repos Page
  await expect(
    page.getByRole("heading", { name: "Home⧸Repos", exact }),
  ).toBeVisible();

  const jettisonUiRepoLink = page.getByRole("link", {
    name: "jettison-ui",
    exact,
  });
  await expect(jettisonUiRepoLink).toBeVisible();
  await jettisonUiRepoLink.click();

  // Test Push Flow Page
  await expect(
    page.getByRole("heading", { name: `Home⧸Repos⧸${REPO_NAME}`, exact }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Push Flow$/ })).toBeVisible();
  const jettisonFlowPushGraphSvg = page.locator("svg");
  await expect(jettisonFlowPushGraphSvg).toHaveCount(1);
  await expect(jettisonFlowPushGraphSvg).toBeVisible();

  // Test Push Flow Page - Workflow Execution
  const firstPushWorkflowDetails = page
    .getByRole("link", { name: SEE_WORKFLOW_DETAILS_RE })
    .first();
  await expect(firstPushWorkflowDetails).toBeVisible();
  await firstPushWorkflowDetails.hover();
  await page.getByRole("button").click();

  const viewWorkflowPushYamlLink = page.getByRole("link", {
    name: VIEW_YAML_RE,
  });
  await expect(viewWorkflowPushYamlLink).toBeVisible();
  await expect(viewWorkflowPushYamlLink).toHaveAttribute("href", YAML_URL_RE);

  const viewPushWorkflowUiLink = page.getByRole("link", {
    name: VIEW_IN_WORKFLOW_UI_RE,
  });
  await expect(viewPushWorkflowUiLink).toBeVisible();
  await expect(viewPushWorkflowUiLink).toHaveAttribute(
    "href",
    WORKFLOW_UI_URL_RE,
  );

  await firstPushWorkflowDetails.click();
  await expect(
    page.getByRole("link", { name: "summary", exact }),
  ).toBeVisible();

  await page.getByRole("link", { name: PR_FLOW_RE }).click();

  // Test PR Flow Page
  await expect(
    page.getByRole("heading", { name: `Home⧸Repos⧸${REPO_NAME}`, exact }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: PR_FLOW_RE })).toBeVisible();
  const jettisonPrFlowGraphSvg = page.locator("svg");
  await expect(jettisonPrFlowGraphSvg).toHaveCount(1);
  await expect(jettisonPrFlowGraphSvg).toBeVisible();

  // Test PR Flow Page - Workflow Execution
  const firstPrWorkflowDetails = page
    .getByRole("link", { name: SEE_WORKFLOW_DETAILS_RE })
    .first();
  await expect(firstPrWorkflowDetails).toBeVisible();
  await firstPrWorkflowDetails.hover();
  await page.getByRole("button").click();

  const viewPrWorkflowYamlLink = page.getByRole("link", { name: VIEW_YAML_RE });
  await expect(viewPrWorkflowYamlLink).toBeVisible();
  await expect(viewPrWorkflowYamlLink).toHaveAttribute("href", YAML_URL_RE);

  const viewPrWorkflowUiLink = page.getByRole("link", {
    name: VIEW_IN_WORKFLOW_UI_RE,
  });
  await expect(viewPrWorkflowUiLink).toBeVisible();
  await expect(viewPrWorkflowUiLink).toHaveAttribute(
    "href",
    WORKFLOW_UI_URL_RE,
  );

  await firstPrWorkflowDetails.click();
  await expect(
    page.getByRole("link", { name: "summary", exact }),
  ).toBeVisible();

  await page.getByRole("link", { name: PR_FLOW_RE }).click();
});
