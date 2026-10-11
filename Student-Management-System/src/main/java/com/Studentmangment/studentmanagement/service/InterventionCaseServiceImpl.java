package com.Studentmangment.studentmanagement.service;

import java.util.ArrayList;
import java.util.List;

import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.Studentmangment.studentmanagement.dto.InterventionCaseDto;
import com.Studentmangment.studentmanagement.dto.InterventionCaseRequestDto;
import com.Studentmangment.studentmanagement.entity.Course;
import com.Studentmangment.studentmanagement.entity.InterventionCase;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.entity.Teacher;
import com.Studentmangment.studentmanagement.repository.InterventionCaseRepository;

@Service
public class InterventionCaseServiceImpl implements InterventionCaseService {

    @Autowired
    private InterventionCaseRepository interventionCaseRepository;

    @Autowired
    private StudentService studentService;

    @Autowired
    private TeacherService teacherService;

    @Override
    public List<InterventionCaseDto> findVisibleCases() {
        Authentication authentication = currentAuthentication();
        List<InterventionCase> cases;

        if (isAdmin(authentication)) {
            cases = interventionCaseRepository.findAllByOrderByUpdatedAtDesc();
        } else if (isTeacher(authentication)) {
            Teacher teacher = currentTeacher(authentication);
            cases = interventionCaseRepository.findByTeacherIdOrderByUpdatedAtDesc(teacher.getId());
        } else if (isStudent(authentication)) {
            Student student = currentStudent(authentication);
            cases = interventionCaseRepository.findByStudentIdOrderByUpdatedAtDesc(student.getId());
        } else {
            throw new AccessDeniedException("Intervention records are not available for this role");
        }

        List<InterventionCaseDto> dtos = new ArrayList<>();
        for (InterventionCase interventionCase : cases) {
            dtos.add(toDto(interventionCase, !isStudent(authentication)));
        }
        return dtos;
    }

    @Override
    @Transactional
    public InterventionCaseDto createCase(InterventionCaseRequestDto request) {
        Authentication authentication = currentAuthentication();
        if (!(isAdmin(authentication) || isTeacher(authentication))) {
            throw new AccessDeniedException("Only faculty or administrators can create intervention cases");
        }

        Student student = studentService.findByStudentId(request.getStudentId());
        if (student == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student not found");
        }

        Integer teacherId = resolveTeacherIdForWrite(authentication, request);
        if (!isAdmin(authentication) && !teacherTeachesStudent(teacherId, student.getId())) {
            throw new AccessDeniedException("Teacher is not assigned to this student");
        }
        if (teacherId != null && teacherService.findByTeacherId(teacherId) == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Teacher not found");
        }

        InterventionCase interventionCase = new InterventionCase();
        applyRequest(interventionCase, request, teacherId);
        interventionCase.setStudentId(student.getId());

        return toDto(interventionCaseRepository.save(interventionCase), true);
    }

    @Override
    @Transactional
    public InterventionCaseDto updateCase(int id, InterventionCaseRequestDto request) {
        Authentication authentication = currentAuthentication();
        if (!(isAdmin(authentication) || isTeacher(authentication))) {
            throw new AccessDeniedException("Only faculty or administrators can update intervention cases");
        }

        InterventionCase interventionCase = interventionCaseRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Intervention case not found"));

        if (isTeacher(authentication)) {
            Teacher teacher = currentTeacher(authentication);
            if (interventionCase.getTeacherId() == null || interventionCase.getTeacherId() != teacher.getId()) {
                throw new AccessDeniedException("Teacher is not assigned to this intervention case");
            }
        }

        Student student = studentService.findByStudentId(request.getStudentId());
        if (student == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student not found");
        }

        Integer teacherId = resolveTeacherIdForWrite(authentication, request);
        if (!isAdmin(authentication) && !teacherTeachesStudent(teacherId, student.getId())) {
            throw new AccessDeniedException("Teacher is not assigned to this student");
        }
        if (teacherId != null && teacherService.findByTeacherId(teacherId) == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Teacher not found");
        }

        interventionCase.setStudentId(student.getId());
        applyRequest(interventionCase, request, teacherId);

        return toDto(interventionCaseRepository.save(interventionCase), true);
    }

    private void applyRequest(InterventionCase interventionCase, InterventionCaseRequestDto request, Integer teacherId) {
        interventionCase.setTeacherId(teacherId);
        interventionCase.setReason(request.getReason().trim());
        interventionCase.setActionPlan(request.getActionPlan().trim());
        interventionCase.setStatus(normalizeStatus(request.getStatus()));
        interventionCase.setFollowUpDate(request.getFollowUpDate());
        interventionCase.setOutcome(blankToNull(request.getOutcome()));
        interventionCase.setStaffNotes(blankToNull(request.getStaffNotes()));
    }

    private Integer resolveTeacherIdForWrite(Authentication authentication, InterventionCaseRequestDto request) {
        if (isTeacher(authentication)) {
            return currentTeacher(authentication).getId();
        }
        return request.getTeacherId();
    }

    private boolean teacherTeachesStudent(Integer teacherId, int studentId) {
        if (teacherId == null) {
            return false;
        }
        Teacher teacher = teacherService.findByTeacherId(teacherId);
        if (teacher == null || teacher.getCourses() == null) {
            return false;
        }
        for (Course course : teacher.getCourses()) {
            if (course.getStudents() == null) {
                continue;
            }
            for (Student student : course.getStudents()) {
                if (student.getId() == studentId) {
                    return true;
                }
            }
        }
        return false;
    }

    private InterventionCaseDto toDto(InterventionCase interventionCase, boolean includeStaffNotes) {
        InterventionCaseDto dto = new InterventionCaseDto();
        dto.setId(interventionCase.getId());
        dto.setStudentId(interventionCase.getStudentId());
        dto.setTeacherId(interventionCase.getTeacherId());
        dto.setReason(interventionCase.getReason());
        dto.setActionPlan(interventionCase.getActionPlan());
        dto.setStatus(interventionCase.getStatus());
        dto.setFollowUpDate(interventionCase.getFollowUpDate());
        dto.setOutcome(interventionCase.getOutcome());
        dto.setStaffNotes(includeStaffNotes ? interventionCase.getStaffNotes() : null);
        dto.setCreatedAt(interventionCase.getCreatedAt());
        dto.setUpdatedAt(interventionCase.getUpdatedAt());

        Student student = studentService.findByStudentId(interventionCase.getStudentId());
        if (student != null) {
            dto.setStudentName(student.getFirstName() + " " + student.getLastName());
        }
        if (interventionCase.getTeacherId() != null) {
            Teacher teacher = teacherService.findByTeacherId(interventionCase.getTeacherId());
            if (teacher != null) {
                dto.setTeacherName(teacher.getFirstName() + " " + teacher.getLastName());
            }
        }
        return dto;
    }

    private Authentication currentAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required");
        }
        return authentication;
    }

    private Student currentStudent(Authentication authentication) {
        Student student = studentService.findByStudentName(authentication.getName());
        if (student == null) {
            throw new AccessDeniedException("Student profile not found");
        }
        return student;
    }

    private Teacher currentTeacher(Authentication authentication) {
        Teacher teacher = teacherService.findByTeacherName(authentication.getName());
        if (teacher == null) {
            throw new AccessDeniedException("Teacher profile not found");
        }
        return teacher;
    }

    private boolean isStudent(Authentication authentication) {
        return hasAuthority(authentication, "ROLE_STUDENT") || hasAuthority(authentication, "STUDENT");
    }

    private boolean isTeacher(Authentication authentication) {
        return hasAuthority(authentication, "ROLE_TEACHER") || hasAuthority(authentication, "TEACHER");
    }

    private boolean isAdmin(Authentication authentication) {
        return hasAuthority(authentication, "ROLE_ADMIN") || hasAuthority(authentication, "ADMIN");
    }

    private boolean hasAuthority(Authentication authentication, String authority) {
        return authentication.getAuthorities().stream()
            .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals(authority));
    }

    private String normalizeStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return "OPEN";
        }
        return status.trim().toUpperCase();
    }

    private String blankToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
