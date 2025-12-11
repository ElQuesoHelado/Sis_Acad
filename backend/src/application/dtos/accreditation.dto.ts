export interface AccreditationDashboardDto {
  stats: {
    lowestAverage: number;
    highestAverage: number;
    classAverage: number;
    studentCount: number;
  };
  evaluations: {
    name: string;
    distribution: {
      label: string;
      count: number;
      color: string;
    }[];
  }[];
  evidence: {
    syllabusUrl?: string;
    lowUrl?: string;
    avgUrl?: string;
    highUrl?: string;
  };
}
