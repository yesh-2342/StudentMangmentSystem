export const gradeService = {
  getLetterGrade: (score) => {
    if (score === null || score === undefined || score === -1) return '-';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  },

  calculateAverage: (g1, g2, g3) => {
    let sum = 0;
    let count = 0;
    if (g1 !== null && g1 !== undefined && g1 !== -1) { sum += g1; count++; }
    if (g2 !== null && g2 !== undefined && g2 !== -1) { sum += g2; count++; }
    if (g3 !== null && g3 !== undefined && g3 !== -1) { sum += g3; count++; }
    return count > 0 ? (sum / count).toFixed(1) : 'N/A';
  }
};

export default gradeService;
