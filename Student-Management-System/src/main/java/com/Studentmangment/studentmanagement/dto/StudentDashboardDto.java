package com.Studentmangment.studentmanagement.dto;

import java.util.List;

public class StudentDashboardDto {
    private int studentId;
    private String studentName;
    private String firstName;
    private String lastName;
    private String email;
    private int totalCourses;
    private int totalAssignments;
    private int completedAssignments;
    private int pendingAssignments;
    private String averageGrade;
    private List<StudentCourseDto> courses;
    private List<StudentAssignmentDto> recentAssignments;

    public StudentDashboardDto() {}

    public int getStudentId() {
        return studentId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getTotalCourses() {
        return totalCourses;
    }

    public void setTotalCourses(int totalCourses) {
        this.totalCourses = totalCourses;
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

    public int getPendingAssignments() {
        return pendingAssignments;
    }

    public void setPendingAssignments(int pendingAssignments) {
        this.pendingAssignments = pendingAssignments;
    }

    public String getAverageGrade() {
        return averageGrade;
    }

    public void setAverageGrade(String averageGrade) {
        this.averageGrade = averageGrade;
    }

    public List<StudentCourseDto> getCourses() {
        return courses;
    }

    public void setCourses(List<StudentCourseDto> courses) {
        this.courses = courses;
    }

    public List<StudentAssignmentDto> getRecentAssignments() {
        return recentAssignments;
    }

    public void setRecentAssignments(List<StudentAssignmentDto> recentAssignments) {
        this.recentAssignments = recentAssignments;
    }
}
