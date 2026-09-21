package com.Studentmangment.studentmanagement.dao;

import com.Studentmangment.studentmanagement.entity.Assignment;

public interface AssignmentDao {
	
	public void save(Assignment assignment);
	
	public void deleteAssignmentById(int id);
}
