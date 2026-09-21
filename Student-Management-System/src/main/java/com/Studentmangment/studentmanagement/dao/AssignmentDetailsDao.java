package com.Studentmangment.studentmanagement.dao;

import com.Studentmangment.studentmanagement.entity.AssignmentDetails;

public interface AssignmentDetailsDao {
	
	public AssignmentDetails findByAssignmentAndStudentCourseDetailsId(int assignmentId, int studentCourseDetailsId);
	
	public void save(AssignmentDetails studentCourseAssignmentDetails);
}
