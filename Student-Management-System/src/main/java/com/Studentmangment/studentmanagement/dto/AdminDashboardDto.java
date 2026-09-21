package com.Studentmangment.studentmanagement.dto;

import java.util.List;

public class AdminDashboardDto {
    private int totalStudents;
    private int totalTeachers;
    private int totalCourses;
    private List<StudentItemDto> recentStudents;
    private List<TeacherItemDto> recentTeachers;
    private List<CourseItemDto> recentCourses;

    public static class StudentItemDto {
        private int id;
        private String userName;
        private String firstName;
        private String lastName;
        private String email;
        private int courseCount;

        public StudentItemDto() {}

        public StudentItemDto(int id, String userName, String firstName, String lastName, String email, int courseCount) {
            this.id = id;
            this.userName = userName;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.courseCount = courseCount;
        }

        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public int getCourseCount() { return courseCount; }
        public void setCourseCount(int courseCount) { this.courseCount = courseCount; }
    }

    public static class TeacherItemDto {
        private int id;
        private String userName;
        private String firstName;
        private String lastName;
        private String email;
        private int courseCount;

        public TeacherItemDto() {}

        public TeacherItemDto(int id, String userName, String firstName, String lastName, String email, int courseCount) {
            this.id = id;
            this.userName = userName;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.courseCount = courseCount;
        }

        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public int getCourseCount() { return courseCount; }
        public void setCourseCount(int courseCount) { this.courseCount = courseCount; }
    }

    public static class CourseItemDto {
        private int id;
        private String code;
        private String name;
        private int teacherId;
        private String teacherName;
        private int studentCount;

        public CourseItemDto() {}

        public CourseItemDto(int id, String code, String name, int teacherId, String teacherName, int studentCount) {
            this.id = id;
            this.code = code;
            this.name = name;
            this.teacherId = teacherId;
            this.teacherName = teacherName;
            this.studentCount = studentCount;
        }

        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getTeacherId() { return teacherId; }
        public void setTeacherId(int teacherId) { this.teacherId = teacherId; }
        public String getTeacherName() { return teacherName; }
        public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
        public int getStudentCount() { return studentCount; }
        public void setStudentCount(int studentCount) { this.studentCount = studentCount; }
    }

    public AdminDashboardDto() {}

    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }
    public int getTotalTeachers() { return totalTeachers; }
    public void setTotalTeachers(int totalTeachers) { this.totalTeachers = totalTeachers; }
    public int getTotalCourses() { return totalCourses; }
    public void setTotalCourses(int totalCourses) { this.totalCourses = totalCourses; }
    public List<StudentItemDto> getRecentStudents() { return recentStudents; }
    public void setRecentStudents(List<StudentItemDto> recentStudents) { this.recentStudents = recentStudents; }
    public List<TeacherItemDto> getRecentTeachers() { return recentTeachers; }
    public void setRecentTeachers(List<TeacherItemDto> recentTeachers) { this.recentTeachers = recentTeachers; }
    public List<CourseItemDto> getRecentCourses() { return recentCourses; }
    public void setRecentCourses(List<CourseItemDto> recentCourses) { this.recentCourses = recentCourses; }
}
