package com.Studentmangment.studentmanagement.dto;

import java.util.List;

public class TeacherDashboardDto {
    private int teacherId;
    private String teacherName;
    private String firstName;
    private String lastName;
    private String email;
    private int totalCourses;
    private int totalStudents;
    private int totalAssignments;
    private int upcomingAssignments;
    private List<StudentCourseDto> courses;
    private List<StudentAssignmentDto> recentAssignments;

    public TeacherDashboardDto() {}

    public int getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(int teacherId) {
        this.teacherId = teacherId;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
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

    public int getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(int totalStudents) {
        this.totalStudents = totalStudents;
    }

    public int getTotalAssignments() {
        return totalAssignments;
    }

    public void setTotalAssignments(int totalAssignments) {
        this.totalAssignments = totalAssignments;
    }

    public int getUpcomingAssignments() {
        return upcomingAssignments;
    }

    public void setUpcomingAssignments(int upcomingAssignments) {
        this.upcomingAssignments = upcomingAssignments;
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
