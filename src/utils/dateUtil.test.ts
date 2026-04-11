import { assert, describe, it } from "vitest";

import {
  DAY,
  formatDurationFromMs,
  formatDurationFromSeconds,
  formatTimestamp,
  getNextTickSeconds,
  HOUR,
  MINUTE,
  MONTH,
  YEAR,
} from "src/utils/dateUtil.ts";

describe("formatDurationFromSeconds", () => {
  it("formats seconds only", () => {
    assert.strictEqual(formatDurationFromSeconds(5), "5s");
  });

  it("formats minutes and seconds", () => {
    assert.strictEqual(formatDurationFromSeconds(90), "1m 30s");
  });

  it("formats hours, minutes, and seconds", () => {
    assert.strictEqual(
      formatDurationFromSeconds(HOUR + MINUTE + 1),
      "1h 1m 1s",
    );
  });

  it("includes zero minutes when hours are present", () => {
    assert.strictEqual(formatDurationFromSeconds(HOUR), "1h 0m 0s");
  });

  it("includes zero seconds when minutes are present", () => {
    assert.strictEqual(formatDurationFromSeconds(2 * MINUTE), "2m 0s");
  });
});

describe("formatDurationFromMs", () => {
  it("converts milliseconds and formats correctly", () => {
    assert.strictEqual(formatDurationFromMs(5_000), "5s");
  });

  it("formats minutes and seconds from milliseconds", () => {
    assert.strictEqual(formatDurationFromMs(90_000), "1m 30s");
  });
});

describe("formatTimestamp", () => {
  it("uses seconds for durations under a minute", () => {
    assert.match(formatTimestamp(2), /second/);
  });

  it("uses minutes for durations under an hour", () => {
    assert.match(formatTimestamp(2 * MINUTE), /minute/);
  });

  it("uses hours for durations under a day", () => {
    assert.match(formatTimestamp(2 * HOUR), /hour/);
  });

  it("uses days for durations under a month", () => {
    assert.match(formatTimestamp(2 * DAY), /day/);
  });

  it("uses months for durations under a year", () => {
    assert.match(formatTimestamp(2 * MONTH), /month/);
  });

  it("uses years for durations of a year or more", () => {
    assert.match(formatTimestamp(2 * YEAR), /year/);
  });
});

describe("getNextTickSeconds", () => {
  it("returns 1 for durations under a minute", () => {
    assert.strictEqual(getNextTickSeconds(0), 1);
    assert.strictEqual(getNextTickSeconds(59), 1);
  });

  it("returns 60 for durations between a minute and a day", () => {
    assert.strictEqual(getNextTickSeconds(MINUTE), MINUTE);
    assert.strictEqual(getNextTickSeconds(DAY - 1), 60);
  });

  it("returns -1 for durations of a day or more", () => {
    assert.strictEqual(getNextTickSeconds(DAY), -1);
  });
});
