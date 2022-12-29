import {
  Alert,
  AlertsMetrics as AlertsMetricsType,
  CodeScanningAlert,
  DependencyOrCodeAlert,
  ghasFeatures,
  reportFrequency,
} from "../types/common/main";
import { AlertsMetrics, createUrlLink, GetCommitDate } from "../utils";
import { Feature } from "./Feature";
import { CodeScanningAlerts } from "../github/CodeScanningAlerts";

export class CodeScanning implements Feature {
  name: ghasFeatures = "code-scanning";
  prettyName = "Code Scanning";
  metrics: AlertsMetricsType;
  attributes: string[] = [
    "Vulnerability",
    "Severity",
    "Tool",
    "Vulnerable file",
    "Link",
  ];

  async alerts(org: string, repo: string): Promise<CodeScanningAlert[]> {
    return await CodeScanningAlerts(org, repo);
  }

  async alertsMetrics(
    frequency: reportFrequency,
    alerts: DependencyOrCodeAlert[],
    org: string,
    repo: string
  ): Promise<AlertsMetricsType> {
    await GetCommitDate(org, repo, alerts, "most_recent_instance.commit_sha");

    this.metrics = AlertsMetrics(
      alerts,
      frequency,
      "fixed_at",
      "fixed",
      true,
      "commitDate",
      "created_at"
    );

    return this.metrics;
  }

  summaryTop10(): string[][] {
    return this.metrics.top10.map((a: CodeScanningAlert) => [
      a.rule?.name || "",
      a.rule?.severity || "",
      a.tool?.name || "",
      a.most_recent_instance?.location.path || "",
      createUrlLink(a.html_url, "Link"),
    ]);
  }

  printable(): { prettyName: string; metrics: AlertsMetricsType } {
    return {
      prettyName: this.prettyName,
      metrics: this.metrics,
    };
  }
}
