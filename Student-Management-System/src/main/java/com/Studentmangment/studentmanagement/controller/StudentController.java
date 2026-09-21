package com.Studentmangment.studentmanagement.controller;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import com.Studentmangment.studentmanagement.entity.Assignment;
import com.Studentmangment.studentmanagement.entity.Course;
import com.Studentmangment.studentmanagement.entity.GradeDetails;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.entity.AssignmentDetails;
import com.Studentmangment.studentmanagement.entity.StudentCourseDetails;
import com.Studentmangment.studentmanagement.service.CourseService;
import com.Studentmangment.studentmanagement.service.AssignmentDetailsService;
import com.Studentmangment.studentmanagement.service.StudentCourseDetailsService;
import com.Studentmangment.studentmanagement.service.StudentService;


@Controller
@RequestMapping("/student")
public class StudentController {
	
	@Autowired
	private StudentService studentService;
	
	@Autowired
	private CourseService courseService;
	
	
	@Autowired
	private StudentCourseDetailsService studentCourseDetailsService;
	
	@Autowired
	private AssignmentDetailsService assignmentDetailsService;
	
	@GetMapping("/dashboard")
	public String showStudentDashboard(javax.servlet.http.HttpSession session, java.security.Principal principal) {
		Student student = (Student) session.getAttribute("user");
		if (student == null && principal != null) {
			student = studentService.findByStudentName(principal.getName());
			if (student != null) {
				session.setAttribute("user", student);
			}
		}
		if (student != null) {
			return "redirect:/student/" + student.getId() + "/courses";
		}
		return "redirect:/showLoginPage";
	}

	@GetMapping("/{studentId}/courses")
	public String showStudentPanel(@PathVariable("studentId") int studentId, Model theModel) {
		Student student = studentService.findByStudentId(studentId); //accessing student logged in
		List<Course> courses = student != null ? student.getCourses() : new java.util.ArrayList<>();
		
		int totalCourses = courses != null ? courses.size() : 0;
		int totalAssignments = 0;
		int completedAssignments = 0;
		int pendingAssignments = 0;
		double gradeSum = 0;
		int gradeCount = 0;
		
		java.util.List<java.util.Map<String, Object>> studentAssignmentsList = new java.util.ArrayList<>();
		
		List<StudentCourseDetails> scdList = studentCourseDetailsService.findByStudentId(studentId);
		if (scdList != null) {
			for (StudentCourseDetails scd : scdList) {
				Course course = courseService.findCourseById(scd.getCourseId());
				String courseName = course != null ? course.getName() : "Course #" + scd.getCourseId();
				String courseCode = course != null ? course.getCode() : "";
				
				List<Assignment> assignments = scd.getAssignments();
				if (assignments != null) {
					for (Assignment assignment : assignments) {
						totalAssignments++;
						int daysRemaining = findDayDifference(assignment);
						assignment.setDaysRemaining(daysRemaining);
						
						AssignmentDetails ad = assignmentDetailsService.findByAssignmentAndStudentCourseDetailsId(assignment.getId(), scd.getId());
						int isDone = (ad != null) ? ad.getIsDone() : 0;
						if (isDone == 1) {
							completedAssignments++;
						} else {
							pendingAssignments++;
						}
						
						java.util.Map<String, Object> map = new java.util.HashMap<>();
						map.put("assignment", assignment);
						map.put("courseId", scd.getCourseId());
						map.put("courseName", courseName);
						map.put("courseCode", courseCode);
						map.put("isDone", isDone);
						studentAssignmentsList.add(map);
					}
				}
				
				GradeDetails gd = scd.getGradeDetails();
				if (gd != null) {
					if (gd.getGradeOne() != -1) {
						gradeSum += gd.getGradeOne();
						gradeCount++;
					}
					if (gd.getGradeTwo() != -1) {
						gradeSum += gd.getGradeTwo();
						gradeCount++;
					}
					if (gd.getGradeThree() != -1) {
						gradeSum += gd.getGradeThree();
						gradeCount++;
					}
				}
			}
		}
		
		String averageGrade = gradeCount > 0 ? String.format("%.1f", gradeSum / gradeCount) : "N/A";
		
		theModel.addAttribute("student", student);
		theModel.addAttribute("courses", courses);
		theModel.addAttribute("totalCourses", totalCourses);
		theModel.addAttribute("totalAssignments", totalAssignments);
		theModel.addAttribute("completedAssignments", completedAssignments);
		theModel.addAttribute("pendingAssignments", pendingAssignments);
		theModel.addAttribute("averageGrade", averageGrade);
		theModel.addAttribute("studentAssignmentsList", studentAssignmentsList);
		
		return "student/dashboard";
	}
	
	@GetMapping("/{studentId}/courses/{courseId}")
	public String showStudentCourse(@PathVariable("studentId") int studentId, @PathVariable("courseId") int courseId, Model theModel) {
		Student student = studentService.findByStudentId(studentId);
		List<Course> courses = student.getCourses();
		Course course = courseService.findCourseById(courseId);
		StudentCourseDetails studentCourseDetails = studentCourseDetailsService.findByStudentAndCourseId(studentId, courseId);
		List<Assignment> assignments = studentCourseDetails.getAssignments();
		
		for(Assignment assignment : assignments) { //updating days remaining using helper method defined below
			int daysRemaining = findDayDifference(assignment);
			assignment.setDaysRemaining(daysRemaining);
		}
		
		
		GradeDetails gradeDetails = studentCourseDetails.getGradeDetails();
		
		theModel.addAttribute("assignments", assignments);
		theModel.addAttribute("course", course);
		theModel.addAttribute("courses", courses);
		theModel.addAttribute("student", student);
		theModel.addAttribute("gradeDetails", gradeDetails);
		
		return "student/student-course-detail";
	}
	
	@GetMapping("/{studentId}/courses/{courseId}/assignment/{assignmentId}")
	public String showStudentAssignment(@PathVariable("studentId") int studentId, @PathVariable("courseId") int courseId, 
			@PathVariable("assignmentId") int assignmentId, Model theModel) {
		Student student = studentService.findByStudentId(studentId);
		List<Course> courses = student.getCourses();
		Course course = courseService.findCourseById(courseId);
		StudentCourseDetails studentCourseDetails = studentCourseDetailsService.findByStudentAndCourseId(studentId, courseId);
		Assignment assignment = studentCourseDetails.getAssignmentById(assignmentId);
		AssignmentDetails assignmentDetails = assignmentDetailsService.findByAssignmentAndStudentCourseDetailsId(assignmentId, studentCourseDetails.getId());
		
		theModel.addAttribute("assignment", assignment);
		theModel.addAttribute("assignmentDetails", assignmentDetails);
		theModel.addAttribute("course", course);
		theModel.addAttribute("courses", courses);
		theModel.addAttribute("student", student);
		
		return "student/student-assignment-detail";
	}
	
	
	@GetMapping("/{studentId}/courses/{courseId}/markAsCompleted/{assignmentId}")
	public String markAsCompleted(@PathVariable("studentId") int studentId, @PathVariable("courseId") int courseId,
									@PathVariable("assignmentId") int assignmentId, Model theModel) {
		//Student student = studentService.findByStudentId(studentId);
		//Course course = courseService.findCourseById(courseId);
		StudentCourseDetails studentCourseDetails = studentCourseDetailsService.findByStudentAndCourseId(studentId, courseId);
		AssignmentDetails assignmentDetails = assignmentDetailsService
													.findByAssignmentAndStudentCourseDetailsId(assignmentId, studentCourseDetails.getId());
		assignmentDetails.setIsDone(1); //assignment is completed
		assignmentDetailsService.save(assignmentDetails);
		return "redirect:/student/" + studentId + "/courses/" + courseId + "/assignment/" + assignmentId;
	}
	
	//helper method to find day difference between assignment due date and today
	private int findDayDifference(Assignment assignment) {
		String dateString = assignment.getDueDate();
		DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		try {
			LocalDate dueDate = LocalDate.parse(dateString, dtf);
			LocalDate today = LocalDate.now();
			int dayDiff = (int) Duration.between(today.atStartOfDay(), dueDate.atStartOfDay()).toDays();
			
			return dayDiff;	
			
		} catch (Exception e) {
			e.printStackTrace();			
		}
		
		return -1;
	}

}
