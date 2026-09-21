package com.Studentmangment.studentmanagement.dto;

public class StudentGradeDto {
    private int courseId;
    private String courseCode;
    private String courseName;
    private String teacherName;
    private Integer gradeOne;
    private Integer gradeTwo;
    private Integer gradeThree;
    private String average;
    private String letterGrade;

    public StudentGradeDto() {}

    public int getCourseId() {
        return courseId;
    }

    public void setCourseId(int courseId) {
        this.courseId = courseId;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
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

    public String getAverage() {
        return average;
    }

    public void setAverage(String average) {
        this.average = average;
    }

    public String getLetterGrade() {
        return letterGrade;
    }

    public void setLetterGrade(String letterGrade) {
        this.letterGrade = letterGrade;
    }
}
