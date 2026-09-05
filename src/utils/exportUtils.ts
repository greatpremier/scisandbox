import { LabTrial, SimulationDataPoint } from "../types";

export function exportDataToCSV(data: SimulationDataPoint[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      if (typeof val === "string" && val.includes(",")) {
        return `"${val}"`;
      }
      return val ?? "";
    });
    csvRows.push(values.join(","));
  }

  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
  triggerDownload(csvContent, filename.endsWith(".csv") ? filename : `${filename}.csv`);
}

export function exportTrialsToJSON(trials: LabTrial[], filename: string) {
  const jsonContent =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(trials, null, 2));
  triggerDownload(jsonContent, filename.endsWith(".json") ? filename : `${filename}.json`);
}

function triggerDownload(contentUrl: string, filename: string) {
  const link = document.createElement("a");
  link.setAttribute("href", contentUrl);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
