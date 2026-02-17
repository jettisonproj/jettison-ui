#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail


if [[ "$#" != 1 ]]; then
  echo "Usage: $0 <JETTISON_UI_BASE_URL>"
  exit 1
fi

JETTISON_UI_URL="$1"

# Create temp dir for test output
TEST_DIR="$(mktemp -d /tmp/jettison-ui-integration-test.XXXXXX)"
trap 'rm -rf "${TEST_DIR}"' EXIT

# Helper function for making requests
req() {
  curl \
    --silent \
    --show-error \
    --fail \
    "$@"
}

test_landing_page() {
  echo -n "Test landing page... "
  TEST_FILE="${TEST_DIR}/landing-page.html"

  if ! req "${JETTISON_UI_URL}" \
    | tee "${TEST_FILE}" \
    | grep --fixed-strings --line-regexp '<!doctype html>' \
    > /dev/null
  then
    echo "FAIL: Did not find html doctype declaration in landing page"
    echo "--> Full response:"
    cat "${TEST_FILE}"
    echo "<-- End response."
    echo
    return 1
  fi

  echo "PASS"
  return 0
}

echo "Running integration tests using URL: ${JETTISON_UI_URL}"
test_landing_page
