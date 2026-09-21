package com.Studentmangment.studentmanagement.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class AssignmentCreateDto {
    @NotBlank(message = "Name is required")
    @Size(min = 1, message = "Name cannot be empty")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Due date is required")
    private String dueDate; // yyyy-MM-dd

    public AssignmentCreateDto() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }
}
