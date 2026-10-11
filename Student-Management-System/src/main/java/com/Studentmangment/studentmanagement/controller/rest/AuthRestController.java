package com.Studentmangment.studentmanagement.controller.rest;

import java.security.Principal;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Studentmangment.studentmanagement.dao.RoleDao;
import com.Studentmangment.studentmanagement.dto.AuthResponseDto;
import com.Studentmangment.studentmanagement.dto.LoginRequestDto;
import com.Studentmangment.studentmanagement.dto.RegisterRequestDto;
import com.Studentmangment.studentmanagement.entity.Role;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.entity.Teacher;
import com.Studentmangment.studentmanagement.service.StudentService;
import com.Studentmangment.studentmanagement.service.TeacherService;
import com.Studentmangment.studentmanagement.user.UserDto;
import com.Studentmangment.studentmanagement.util.SecurityRoles;

@RestController
@RequestMapping("/api/auth")
public class AuthRestController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private StudentService studentService;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private RoleDao roleDao;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto loginRequest, HttpServletRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            HttpSession session = request.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext());

            String username = authentication.getName();
            boolean isStudent = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT") || a.getAuthority().equals("STUDENT"));
            boolean isTeacher = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER") || a.getAuthority().equals("TEACHER"));
            boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));

            String actualRole = isAdmin ? "ADMIN" : (isTeacher ? "TEACHER" : (isStudent ? "STUDENT" : null));
            if (actualRole == null || !SecurityRoles.matchesExpected(loginRequest.getExpectedRole(), actualRole)) {
                session.invalidate();
                SecurityContextHolder.clearContext();
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new AuthResponseDto(
                    0, "", "", "", "", "", "These credentials do not match the selected " + SecurityRoles.normalize(loginRequest.getExpectedRole()) + " login. Sign in with the portal that matches your account role."
                ));
            }

            if (isStudent) {
                Student student = studentService.findByStudentName(username);
                if (student != null) {
                    session.setAttribute("user", student);
                    return ResponseEntity.ok(new AuthResponseDto(
                        student.getId(), student.getUserName(), student.getFirstName(), student.getLastName(), student.getEmail(), "STUDENT", "Login successful"
                    ));
                }
            } else if (isTeacher) {
                Teacher teacher = teacherService.findByTeacherName(username);
                if (teacher != null) {
                    session.setAttribute("user", teacher);
                    return ResponseEntity.ok(new AuthResponseDto(
                        teacher.getId(), teacher.getUserName(), teacher.getFirstName(), teacher.getLastName(), teacher.getEmail(), "TEACHER", "Login successful"
                    ));
                }
            } else if (isAdmin) {
                return ResponseEntity.ok(new AuthResponseDto(
                    0, username, "System", "Admin", "admin@erp.edu", "ADMIN", "Login successful"
                ));
            }

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponseDto(0, "", "", "", "", "", "Invalid role credentials"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponseDto(0, "", "", "", "", "", "Invalid username or password"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal, HttpServletRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        String username = auth.getName();
        boolean isStudent = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT") || a.getAuthority().equals("STUDENT"));
        boolean isTeacher = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER") || a.getAuthority().equals("TEACHER"));
        boolean isAdmin = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));

        if (isStudent) {
            Student student = studentService.findByStudentName(username);
            if (student != null) {
                return ResponseEntity.ok(new AuthResponseDto(
                    student.getId(), student.getUserName(), student.getFirstName(), student.getLastName(), student.getEmail(), "STUDENT", "Active session"
                ));
            }
        } else if (isTeacher) {
            Teacher teacher = teacherService.findByTeacherName(username);
            if (teacher != null) {
                return ResponseEntity.ok(new AuthResponseDto(
                    teacher.getId(), teacher.getUserName(), teacher.getFirstName(), teacher.getLastName(), teacher.getEmail(), "TEACHER", "Active session"
                ));
            }
        } else if (isAdmin) {
            return ResponseEntity.ok(new AuthResponseDto(
                0, username, "System", "Admin", "admin@erp.edu", "ADMIN", "Active session"
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponseDto(0, "", "", "", "", "", "Session expired or user not found"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("{\"message\": \"Logged out successfully\"}");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDto dto) {
        String roleName = dto.getRole();
        if (roleName == null || (!roleName.equals("ROLE_STUDENT") && !roleName.equals("ROLE_TEACHER"))) {
            roleName = "ROLE_STUDENT";
        }

        String userName = dto.getUserName();

        if (roleName.equals("ROLE_STUDENT")) {
            if (studentService.findByStudentName(userName) != null) {
                return ResponseEntity.badRequest().body("{\"error\": \"Username already exists!\"}");
            }
            Role role = roleDao.findRoleByName("ROLE_STUDENT");
            if (role == null) {
                role = roleDao.findRoleByName("STUDENT");
            }
            if (role == null) {
                role = new Role("ROLE_STUDENT");
            }
            UserDto userDto = new UserDto();
            userDto.setUserName(dto.getUserName());
            userDto.setPassword(dto.getPassword());
            userDto.setFirstName(dto.getFirstName());
            userDto.setLastName(dto.getLastName());
            userDto.setEmail(dto.getEmail());
            userDto.setRole(role);
            studentService.save(userDto);
        } else {
            if (teacherService.findByTeacherName(userName) != null) {
                return ResponseEntity.badRequest().body("{\"error\": \"Username already exists!\"}");
            }
            Role role = roleDao.findRoleByName("ROLE_TEACHER");
            if (role == null) {
                role = roleDao.findRoleByName("TEACHER");
            }
            if (role == null) {
                role = new Role("ROLE_TEACHER");
            }
            UserDto userDto = new UserDto();
            userDto.setUserName(dto.getUserName());
            userDto.setPassword(dto.getPassword());
            userDto.setFirstName(dto.getFirstName());
            userDto.setLastName(dto.getLastName());
            userDto.setEmail(dto.getEmail());
            userDto.setRole(role);
            teacherService.save(userDto);
        }

        return ResponseEntity.ok("{\"message\": \"Registration successful! Please login.\"}");
    }
}
