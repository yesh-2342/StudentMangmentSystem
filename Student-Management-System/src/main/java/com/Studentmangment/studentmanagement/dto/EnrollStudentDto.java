package com.Studentmangment.studentmanagement.dto;

public class EnrollStudentDto {
    private Integer studentId;
    private Integer courseId;

    public EnrollStudentDto() {}

    public Integer getStudentId() { return studentId; }
    public void setStudentId(Integer studentId) { this.studentId = studentId; }
    public Integer getCourseId() { return courseId; }
    public void setCourseId(Integer courseId) { this.courseId = courseId; }
}
