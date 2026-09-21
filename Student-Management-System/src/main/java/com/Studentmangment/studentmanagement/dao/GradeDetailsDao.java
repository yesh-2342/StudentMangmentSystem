package com.Studentmangment.studentmanagement.dao;

import com.Studentmangment.studentmanagement.entity.GradeDetails;

public interface GradeDetailsDao {
	
	public void save(GradeDetails gradeDetails);
	
	public GradeDetails findById(int id);
	
	public void deleteById(int id);
}
