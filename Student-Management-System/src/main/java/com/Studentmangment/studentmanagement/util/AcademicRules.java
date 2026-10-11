package com.Studentmangment.studentmanagement.util;

public final class AcademicRules {

    private AcademicRules() {}

    public static String letterGrade(Double average) {
        if (average == null) {
            return null;
        }
        if (average >= 90) return "A";
        if (average >= 80) return "B";
        if (average >= 70) return "C";
        if (average >= 60) return "D";
        return "F";
    }

    public static boolean isAtRiskAverage(Double average) {
        return average != null && average < 60;
    }

    public static boolean isLowAttendance(Double attendancePercent) {
        return attendancePercent != null && attendancePercent < 75;
    }

    public static double estimateOutcome(Double currentAverage, Double hypotheticalAverage, Double attendancePercent) {
        double marks = hypotheticalAverage != null ? hypotheticalAverage : (currentAverage != null ? currentAverage : 0);
        if (attendancePercent != null && attendancePercent < 75) {
            marks = marks * (attendancePercent / 75.0);
        }
        return Math.max(0, Math.min(100, marks));
    }
}
