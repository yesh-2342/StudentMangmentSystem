package com.Studentmangment.studentmanagement.dto.ai;

import java.io.Serializable;

public class AiSimulationRequestDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer studentId;
    private Integer courseId;
    private Double hypotheticalAttendanceRate;
    private Double hypotheticalInternalScore;
    private Double hypotheticalAssignmentCompletion;
    private Double hypotheticalAssignmentMarks;
    private Double additionalConsultations;

    public AiSimulationRequestDto() {}

    public Integer getStudentId() { return studentId; }
    public void setStudentId(Integer studentId) { this.studentId = studentId; }

    public Integer getCourseId() { return courseId; }
    public void setCourseId(Integer courseId) { this.courseId = courseId; }

    public Double getHypotheticalAttendanceRate() { return hypotheticalAttendanceRate; }
    public void setHypotheticalAttendanceRate(Double hypotheticalAttendanceRate) { this.hypotheticalAttendanceRate = hypotheticalAttendanceRate; }

    public Double getHypotheticalInternalScore() { return hypotheticalInternalScore; }
    public void setHypotheticalInternalScore(Double hypotheticalInternalScore) { this.hypotheticalInternalScore = hypotheticalInternalScore; }

    public Double getHypotheticalAssignmentCompletion() { return hypotheticalAssignmentCompletion; }
    public void setHypotheticalAssignmentCompletion(Double hypotheticalAssignmentCompletion) { this.hypotheticalAssignmentCompletion = hypotheticalAssignmentCompletion; }

    public Double getHypotheticalAssignmentMarks() { return hypotheticalAssignmentMarks; }
    public void setHypotheticalAssignmentMarks(Double hypotheticalAssignmentMarks) { this.hypotheticalAssignmentMarks = hypotheticalAssignmentMarks; }

    public Double getAdditionalConsultations() { return additionalConsultations; }
    public void setAdditionalConsultations(Double additionalConsultations) { this.additionalConsultations = additionalConsultations; }
}
