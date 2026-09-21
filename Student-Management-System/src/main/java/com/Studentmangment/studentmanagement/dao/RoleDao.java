package com.Studentmangment.studentmanagement.dao;

import com.Studentmangment.studentmanagement.entity.Role;

public interface RoleDao {
	
	public Role findRoleByName(String theRoleName);
}
