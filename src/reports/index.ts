export type ReportFormat = 'PDF' | 'HTML' | 'DOCX';
export type ReportTemplate =
  | 'executive_summary'
  | 'technical_detailed'
  | 'compliance_report'
  | 'vulnerability_assessment';

export type ReportRequest = {
  format: ReportFormat;
  template: ReportTemplate;
  data: Record<string, unknown>;
};

export const generateReport = async (request: ReportRequest): Promise<Buffer> => {
  const payload = {
    generatedAt: new Date().toISOString(),
    request
  };
  return Buffer.from(JSON.stringify(payload, null, 2));
};
