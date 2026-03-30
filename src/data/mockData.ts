export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "video" | "notes";
  subject: string;
  uploadedAt: string;
  fileUrl?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  course: string;
  attendance: number;
  testMarks: { testName: string; marks: number; total: number }[];
}

export const mockContent: ContentItem[] = [
  { id: "1", title: "Physics – Mechanics Notes", description: "Complete notes covering Newton's Laws, Work-Energy theorem, and Rotational Motion.", type: "pdf", subject: "Physics", uploadedAt: "2026-03-25" },
  { id: "2", title: "Chemistry – Organic Reactions", description: "Summary of all important organic chemistry reaction mechanisms.", type: "notes", subject: "Chemistry", uploadedAt: "2026-03-22" },
  { id: "3", title: "Mathematics – Calculus Lecture", description: "Video lecture covering integration techniques and applications.", type: "video", subject: "Mathematics", uploadedAt: "2026-03-20" },
  { id: "4", title: "Physics – Electrostatics PDF", description: "Detailed chapter-wise PDF for Coulomb's law, Electric field and potential.", type: "pdf", subject: "Physics", uploadedAt: "2026-03-18" },
  { id: "5", title: "Biology – Cell Division Notes", description: "Comprehensive notes on Mitosis, Meiosis, and Cell Cycle regulation.", type: "notes", subject: "Biology", uploadedAt: "2026-03-15" },
  { id: "6", title: "Math – Probability & Statistics", description: "Video series on probability distributions, Bayes theorem, and statistics.", type: "video", subject: "Mathematics", uploadedAt: "2026-03-12" },
];

export const mockStudents: Student[] = [
  {
    id: "1", name: "Rahul Sharma", email: "rahul@test.com", course: "JEE Advanced",
    attendance: 92,
    testMarks: [
      { testName: "Weekly Test 1", marks: 78, total: 100 },
      { testName: "Weekly Test 2", marks: 85, total: 100 },
      { testName: "Monthly Exam", marks: 156, total: 200 },
    ],
  },
  {
    id: "2", name: "Ananya Gupta", email: "ananya@test.com", course: "NEET",
    attendance: 88,
    testMarks: [
      { testName: "Weekly Test 1", marks: 82, total: 100 },
      { testName: "Weekly Test 2", marks: 91, total: 100 },
      { testName: "Monthly Exam", marks: 172, total: 200 },
    ],
  },
  {
    id: "3", name: "Vikram Patel", email: "vikram@test.com", course: "JEE Advanced",
    attendance: 76,
    testMarks: [
      { testName: "Weekly Test 1", marks: 65, total: 100 },
      { testName: "Weekly Test 2", marks: 72, total: 100 },
      { testName: "Monthly Exam", marks: 130, total: 200 },
    ],
  },
  {
    id: "4", name: "Sneha Reddy", email: "sneha@test.com", course: "NEET",
    attendance: 95,
    testMarks: [
      { testName: "Weekly Test 1", marks: 90, total: 100 },
      { testName: "Weekly Test 2", marks: 88, total: 100 },
      { testName: "Monthly Exam", marks: 185, total: 200 },
    ],
  },
  {
    id: "5", name: "Arjun Mehta", email: "arjun@test.com", course: "Foundation",
    attendance: 84,
    testMarks: [
      { testName: "Weekly Test 1", marks: 70, total: 100 },
      { testName: "Weekly Test 2", marks: 76, total: 100 },
      { testName: "Monthly Exam", marks: 145, total: 200 },
    ],
  },
];
