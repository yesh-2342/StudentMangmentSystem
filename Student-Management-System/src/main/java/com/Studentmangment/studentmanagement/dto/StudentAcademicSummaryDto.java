package com.Studentmangment.studentmanagement.dto;

import java.util.ArrayList;
import java.util.List;

public class StudentAcademicSummaryDto {
    private int studentId;
    private String studentName;
    private String email;
    private Double overallAttendancePercent;
    private Double overallMarksAverage;
    private int totalMissingAssignments;
    private String riskLevel; // HIGH, MEDIUM, LOW
    private List<String> riskReasons = new ArrayList<>();
    private boolean hasIncompleteData;
    private String incompleteDataNotice;
    private ParentContactDto guardian;
    private boolean isTestGuardianProfile;
    private List<CourseAcademicSummaryDto> courses = new ArrayList<>();
    private String suggestedCallScript;

    public StudentAcademicSummaryDto() {}

    public static class CourseAcademicSummaryDto {
        private int courseId;
        private String courseName;
        private String teacherName;
        private Double attendancePercent;
        private Double marksAverage;
        private String letterGrade;
        private int missingAssignments;
        private boolean lowAttendance;
        private boolean lowMarks;

        public CourseAcademicSummaryDto() {}

        public int getCourseId() { return courseId; }
        public void setCourseId(int courseId) { this.courseId = courseId; }

        public String getCourseName() { return courseName; }
        public void setCourseName(String courseName) { this.courseName = courseName; }

        public String getTeacherName() { return teacherName; }
        public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

        public Double getAttendancePercent() { return attendancePercent; }
        public void setAttendancePercent(Double attendancePercent) { this.attendancePercent = attendancePercent; }

        public Double getMarksAverage() { return marksAverage; }
        public void setMarksAverage(Double marksAverage) { this.marksAverage = marksAverage; }

        public String getLetterGrade() { return letterGrade; }
        public void setLetterGrade(String letterGrade) { this.letterGrade = letterGrade; }

        public int getMissingAssignments() { return missingAssignments; }
        public void setMissingAssignments(int missingAssignments) { this.missingAssignments = missingAssignments; }

        public boolean isLowAttendance() { return lowAttendance; }
        public void setLowAttendance(boolean lowAttendance) { this.lowAttendance = lowAttendance; }

        public boolean isLowMarks() { return lowMarks; }
        public void setLowMarks(boolean lowMarks) { this.lowMarks = lowMarks; }
    }

    // Getters and Setters
    public int getStudentId() { return studentId; }
    public void setStudentId(int studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Double getOverallAttendancePercent() { return overallAttendancePercent; }
    public void setOverallAttendancePercent(Double overallAttendancePercent) { this.overallAttendancePercent = overallAttendancePercent; }

    public Double getOverallMarksAverage() { return overallMarksAverage; }
    public void setOverallMarksAverage(Double overallMarksAverage) { this.overallMarksAverage = overallMarksAverage; }

    public int getTotalMissingAssignments() { return totalMissingAssignments; }
    public void setTotalMissingAssignments(int totalMissingAssignments) { this.totalMissingAssignments = totalMissingAssignments; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public List<String> getRiskReasons() { return riskReasons; }
    public void setRiskReasons(List<String> riskReasons) { this.riskReasons = riskReasons; }

    public boolean isHasIncompleteData() { return hasIncompleteData; }
    public void setHasIncompleteData(boolean hasIncompleteData) { this.hasIncompleteData = hasIncompleteData; }

    public String getIncompleteDataNotice() { return incompleteDataNotice; }
    public void setIncompleteDataNotice(String incompleteDataNotice) { this.incompleteDataNotice = incompleteDataNotice; }

    public ParentContactDto getGuardian() { return guardian; }
    public void setGuardian(ParentContactDto guardian) { this.guardian = guardian; }

    public boolean isTestGuardianProfile() { return isTestGuardianProfile; }
    public void setTestGuardianProfile(boolean testGuardianProfile) { isTestGuardianProfile = testGuardianProfile; }

    public List<CourseAcademicSummaryDto> getCourses() { return courses; }
    public void setCourses(List<CourseAcademicSummaryDto> courses) { this.courses = courses; }

    public String getSuggestedCallScript() { return suggestedCallScript; }
    public void setSuggestedCallScript(String suggestedCallScript) { this.suggestedCallScript = suggestedCallScript; }
}
