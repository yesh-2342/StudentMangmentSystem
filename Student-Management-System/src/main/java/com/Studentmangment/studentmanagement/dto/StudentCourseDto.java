package com.Studentmangment.studentmanagement.dto;

public class StudentCourseDto {
    private int id;
    private String code;
    private String name;
    private String teacherName;
    private int totalAssignments;
    private int completedAssignments;
    private Integer gradeOne;
    private Integer gradeTwo;
    private Integer gradeThree;
    private String averageGrade;
    private Integer totalSessions;
    private Integer attendedSessions;
    private Double attendanceRate;

    public StudentCourseDto() {}

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public int getTotalAssignments() {
        return totalAssignments;
    }

    public void setTotalAssignments(int totalAssignments) {
        this.totalAssignments = totalAssignments;
    }

    public int getCompletedAssignments() {
        return completedAssignments;
    }

    public void setCompletedAssignments(int completedAssignments) {
        this.completedAssignments = completedAssignments;
    }

    public Integer getGradeOne() {
        return gradeOne;
    }

    public void setGradeOne(Integer gradeOne) {
        this.gradeOne = gradeOne;
    }

    public Integer getGradeTwo() {
        return gradeTwo;
    }

    public void setGradeTwo(Integer gradeTwo) {
        this.gradeTwo = gradeTwo;
    }

    public Integer getGradeThree() {
        return gradeThree;
    }

    public void setGradeThree(Integer gradeThree) {
        this.gradeThree = gradeThree;
    }

    public String getAverageGrade() {
        return averageGrade;
    }

    public void setAverageGrade(String averageGrade) {
        this.averageGrade = averageGrade;
    }

    public Integer getTotalSessions() {
        return totalSessions;
    }

    public void setTotalSessions(Integer totalSessions) {
        this.totalSessions = totalSessions;
    }

    public Integer getAttendedSessions() {
        return attendedSessions;
    }

    public void setAttendedSessions(Integer attendedSessions) {
        this.attendedSessions = attendedSessions;
    }

    public Double getAttendanceRate() {
        return attendanceRate;
    }

    public void setAttendanceRate(Double attendanceRate) {
        this.attendanceRate = attendanceRate;
    }
}
