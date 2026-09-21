package com.Studentmangment.studentmanagement.dto;

import java.util.List;

public class TeacherCourseDetailDto {
    private int courseId;
    private String courseCode;
    private String courseName;
    private int teacherId;
    private String teacherName;
    private List<StudentEnrollmentDto> students;
    private List<StudentAssignmentDto> assignments;

    public static class StudentEnrollmentDto {
        private int studentId;
        private String userName;
        private String firstName;
        private String lastName;
        private String email;
        private int gradeDetailsId;
        private Integer gradeOne;
        private Integer gradeTwo;
        private Integer gradeThree;
        private String average;

        public StudentEnrollmentDto() {}

        public int getStudentId() {
            return studentId;
        }

        public void setStudentId(int studentId) {
            this.studentId = studentId;
        }

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
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

        public int getGradeDetailsId() {
            return gradeDetailsId;
        }

        public void setGradeDetailsId(int gradeDetailsId) {
            this.gradeDetailsId = gradeDetailsId;
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
    }

    public TeacherCourseDetailDto() {}

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

    public List<StudentEnrollmentDto> getStudents() {
        return students;
    }

    public void setStudents(List<StudentEnrollmentDto> students) {
        this.students = students;
    }

    public List<StudentAssignmentDto> getAssignments() {
        return assignments;
    }

    public void setAssignments(List<StudentAssignmentDto> assignments) {
        this.assignments = assignments;
    }
}
