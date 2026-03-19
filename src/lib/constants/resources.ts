// Teaching Resources — Coach Dashboard
// Filtered by certification_level (1-5)

export interface TeachingResource {
  name: string;
  description: string;
  url: string;
  minCertLevel: number; // 1-5
}

export const TEACHING_RESOURCES: TeachingResource[] = [
  // L1 Foundation
  { name: 'White Belt Teaching Guide', description: 'Sequences #1-#5, water safety fundamentals', url: '#', minCertLevel: 1 },
  { name: 'Yellow Belt Teaching Guide', description: 'Sequences #6-#7, ocean awareness', url: '#', minCertLevel: 1 },
  // L2 Practitioner
  { name: 'Blue Belt Teaching Guide', description: 'Sequences #8-#13, wave riding foundations', url: '#', minCertLevel: 2 },
  // L3 Advanced
  { name: 'Brown Belt Teaching Guide', description: 'Sequences #18-#22, advanced maneuvers', url: '#', minCertLevel: 3 },
  { name: 'Mentoring Tools Pack', description: 'Resources for mentoring L1/L2 coaches', url: '#', minCertLevel: 3 },
  // L4 Master
  { name: 'Complete Methodology Manual', description: 'All levels comprehensive guide', url: '#', minCertLevel: 4 },
  { name: 'One Wave Book', description: 'Philosophy and methodology deep dive', url: '#', minCertLevel: 4 },
  // L5 Educator
  { name: 'Coach Certification Kit', description: 'Materials for certifying new coaches', url: '#', minCertLevel: 5 },
  { name: 'Assessment & Evaluation Guide', description: 'Official evaluation protocols', url: '#', minCertLevel: 5 },
];
