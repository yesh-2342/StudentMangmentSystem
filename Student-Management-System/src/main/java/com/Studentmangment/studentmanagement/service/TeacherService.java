package com.Studentmangment.studentmanagement.service;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetailsService;

import com.Studentmangment.studentmanagement.entity.Teacher;
import com.Studentmangment.studentmanagement.user.UserDto;

public interface TeacherService extends UserDetailsService {
	
	public Teacher findByTeacherName(String userName);
	
	public Teacher findByTeacherId(int id);

	public void save(UserDto userDto);
	
	public void save(Teacher teacher);
	
	public List<Teacher> findAllTeachers();
	
	public void deleteTeacherById(int id);
}
