package com.Studentmangment.studentmanagement.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class CourseCreateDto {
    @NotBlank(message = "Code is required")
    @Size(min = 1, message = "Code cannot be empty")
    private String code;

    @NotBlank(message = "Name is required")
    @Size(min = 1, message = "Name cannot be empty")
    private String name;

    @NotNull(message = "Teacher ID is required")
    private Integer teacherId;

    public CourseCreateDto() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getTeacherId() { return teacherId; }
    public void setTeacherId(Integer teacherId) { this.teacherId = teacherId; }
}
