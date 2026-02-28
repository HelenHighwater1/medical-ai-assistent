export interface SampleDoc {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "email";
  fileUrl: string;
  content: string;
}

export const SAMPLE_DOCS: SampleDoc[] = [
  {
    id: "als-clinical-report",
    title: "ALS Clinical Report",
    description: "Detailed clinical assessment and care plan",
    type: "pdf",
    fileUrl: "/ALS_Clinical_Report_Sample.pdf",
    content: "",
  },
  {
    id: "ctnnb1-genetic-report",
    title: "CTNNB1 Genetic Report",
    description: "Sample genetic test report",
    type: "pdf",
    fileUrl: "/CTNNB1_Genetic_Report_Sample.pdf",
    content: "",
  },
  {
    id: "specialist-email",
    title: "Specialist Follow-Up Email",
    description: "Post-visit summary from a neurologist",
    type: "email",
    fileUrl: "/ALS_Doctor_Email_Sample.eml",
    content: "",
  },
];
