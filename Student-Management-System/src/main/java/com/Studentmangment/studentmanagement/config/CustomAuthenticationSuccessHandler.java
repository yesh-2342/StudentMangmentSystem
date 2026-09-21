package com.Studentmangment.studentmanagement.config;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.entity.Teacher;
import com.Studentmangment.studentmanagement.service.StudentService;
import com.Studentmangment.studentmanagement.service.TeacherService;

@Component
public class CustomAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
	
	@Autowired
	private StudentService studentService;
	
	@Autowired
	private TeacherService teacherService;
	
	
	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication auth) throws IOException, ServletException {
		
		
		boolean isStudent = auth.getAuthorities().stream()
				.anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT") || a.getAuthority().equals("STUDENT"));
		boolean isTeacher = auth.getAuthorities().stream()
				.anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER") || a.getAuthority().equals("TEACHER"));
		boolean isAdmin = auth.getAuthorities().stream()
				.anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));

		//redirecting the user to proper url depending on the authority
		if (isStudent) {
			String userName = auth.getName();
			Student theStudent = studentService.findByStudentName(userName);
			HttpSession session = request.getSession();
			if (theStudent != null) {
				session.setAttribute("user", theStudent);
				response.sendRedirect(request.getContextPath() + "/student/" + theStudent.getId() + "/courses");
			} else {
				response.sendRedirect(request.getContextPath() + "/student/dashboard");
			}
		} else if (isTeacher) {
			String userName = auth.getName();
			Teacher theTeacher = teacherService.findByTeacherName(userName);
			HttpSession session = request.getSession();
			if (theTeacher != null) {
				session.setAttribute("user", theTeacher);
				response.sendRedirect(request.getContextPath() + "/teacher/" + theTeacher.getId() + "/courses");
			} else {
				response.sendRedirect(request.getContextPath() + "/teacher/dashboard");
			}
		} else if (isAdmin) {
			response.sendRedirect(request.getContextPath() + "/admin/adminPanel");
		} else {
			response.sendRedirect(request.getContextPath() + "/access-denied");
		}

	}

}

