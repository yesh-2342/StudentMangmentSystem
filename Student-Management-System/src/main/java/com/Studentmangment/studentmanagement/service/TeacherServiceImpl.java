package com.Studentmangment.studentmanagement.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Studentmangment.studentmanagement.dao.RoleDao;
import com.Studentmangment.studentmanagement.dao.TeacherDao;
import com.Studentmangment.studentmanagement.entity.Role;
import com.Studentmangment.studentmanagement.entity.Teacher;
import com.Studentmangment.studentmanagement.user.UserDto;

@Service
public class TeacherServiceImpl implements TeacherService {
	
	@Autowired
	private TeacherDao teacherDao;
	
	@Autowired 
	private RoleDao roleDao;
	
	
	@Override
	@Transactional
	public Teacher findByTeacherName(String teacherName) {
		return teacherDao.findByTeacherName(teacherName);
	}

	@Override
	@Transactional
	public void save(UserDto userDto) {
		Teacher teacher = new Teacher();
		teacher.setUserName(userDto.getUserName());
		teacher.setPassword(new BCryptPasswordEncoder().encode(userDto.getPassword()));
		teacher.setFirstName(userDto.getFirstName());
		teacher.setLastName(userDto.getLastName());
		teacher.setEmail(userDto.getEmail());		
		teacher.setRole(userDto.getRole());	
		
		teacherDao.save(teacher);
	}
	
	@Override
	@Transactional
	public void save(Teacher teacher) {
		teacherDao.save(teacher);	
	}
	
	
	@Override
	@Transactional
	public List<Teacher> findAllTeachers() {
		return teacherDao.findAllTeachers();
	}
	
	
	@Override
	@Transactional
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		Teacher teacher = teacherDao.findByTeacherName(username);
		if (teacher == null) {
			throw new UsernameNotFoundException("Invalid username or password.");
		}
		Collection<Role> role = new ArrayList<>();
		if (teacher.getRole() != null) {
			role.add(teacher.getRole());
		}
		return new org.springframework.security.core.userdetails.User(teacher.getUserName(), teacher.getPassword(),
				mapRolesToAuthorities(role));
	}
	
	private Collection<? extends GrantedAuthority> mapRolesToAuthorities(Collection<Role> roles) {
		List<GrantedAuthority> authorities = new ArrayList<>();
		for (Role role : roles) {
			if (role != null && role.getName() != null) {
				String roleName = role.getName().trim();
				authorities.add(new SimpleGrantedAuthority(roleName));
				if (!roleName.startsWith("ROLE_")) {
					authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName));
				} else if (roleName.length() > 5) {
					authorities.add(new SimpleGrantedAuthority(roleName.substring(5)));
				}
			}
		}
		if (authorities.isEmpty()) {
			authorities.add(new SimpleGrantedAuthority("ROLE_TEACHER"));
			authorities.add(new SimpleGrantedAuthority("TEACHER"));
		}
		return authorities;
	}

	@Override
	@Transactional
	public Teacher findByTeacherId(int id) {
		return teacherDao.findByTeacherId(id);
	}

	@Override
	@Transactional
	public void deleteTeacherById(int id) {
		teacherDao.deleteTeacherById(id);	
	}

	

	

}
