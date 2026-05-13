/**
 * Commit-message rules for `@imlunahey/react-echarts`. Inherits the
 * standard conventional-commits ruleset but turns off the line-length
 * caps on commit bodies and footers — release-please bot opens release
 * PRs whose generated bodies and footers contain long URLs and
 * changelog entries that blow the default 100-char limit and fail CI
 * even though they're perfectly valid conventional commits.
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-max-line-length": [0, "always"],
    "footer-max-line-length": [0, "always"],
  },
};
