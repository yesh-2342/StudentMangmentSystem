package com.Studentmangment.studentmanagement.dto.ai;

import java.io.Serializable;
import com.fasterxml.jackson.annotation.JsonProperty;

public class PythonAiPredictPayload implements Serializable {
    private static final long serialVersionUID = 1L;

    @JsonProperty("student_id")
    private Integer studentId;

    @JsonProperty("course_id")
    private Integer courseId;

    @JsonProperty("student_name")
    private String studentName;

    @JsonProperty("course_name")
    private String courseName;

    @JsonProperty("attendance_rate")
    private Double attendanceRate;

    @JsonProperty("internal_assessment_avg")
    private Double internalAssessmentAvg;

    @JsonProperty("assignment_completion_rate")
    private Double assignmentCompletionRate;

    @JsonProperty("assignment_average_mark")
    private Double assignmentAverageMark;

    @JsonProperty("previous_course_avg")
    private Double previousCourseAvg;

    @JsonProperty("missing_assignments_count")
    private Double missingAssignmentsCount;

    @JsonProperty("consultation_engagement")
    private Double consultationEngagement;

    public PythonAiPredictPayload() {}

    public Integer getStudentId() { return studentId; }
    public void setStudentId(Integer studentId) { this.studentId = studentId; }

    public Integer getCourseId() { return courseId; }
    public void setCourseId(Integer courseId) { this.courseId = courseId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public Double getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(Double attendanceRate) { this.attendanceRate = attendanceRate; }

    public Double getInternalAssessmentAvg() { return internalAssessmentAvg; }
    public void setInternalAssessmentAvg(Double internalAssessmentAvg) { this.internalAssessmentAvg = internalAssessmentAvg; }

    public Double getAssignmentCompletionRate() { return assignmentCompletionRate; }
    public void setAssignmentCompletionRate(Double assignmentCompletionRate) { this.assignmentCompletionRate = assignmentCompletionRate; }

    public Double getAssignmentAverageMark() { return assignmentAverageMark; }
    public void setAssignmentAverageMark(Double assignmentAverageMark) { this.assignmentAverageMark = assignmentAverageMark; }

    public Double getPreviousCourseAvg() { return previousCourseAvg; }
    public void setPreviousCourseAvg(Double previousCourseAvg) { this.previousCourseAvg = previousCourseAvg; }

    public Double getMissingAssignmentsCount() { return missingAssignmentsCount; }
    public void setMissingAssignmentsCount(Double missingAssignmentsCount) { this.missingAssignmentsCount = missingAssignmentsCount; }

    public Double getConsultationEngagement() { return consultationEngagement; }
    public void setConsultationEngagement(Double consultationEngagement) { this.consultationEngagement = consultationEngagement; }
}
