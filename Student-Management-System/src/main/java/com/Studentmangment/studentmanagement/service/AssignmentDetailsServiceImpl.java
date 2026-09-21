package com.Studentmangment.studentmanagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Studentmangment.studentmanagement.dao.AssignmentDetailsDao;
import com.Studentmangment.studentmanagement.entity.AssignmentDetails;

@Service
public class AssignmentDetailsServiceImpl implements AssignmentDetailsService {

    @Autowired
    private AssignmentDetailsDao studentCourseAssignmentDetailsDao;

    @Override
    @Transactional
    public AssignmentDetails findByAssignmentAndStudentCourseDetailsId(
            int assignmentId,
            int studentCourseDetailsId) {

        return studentCourseAssignmentDetailsDao
                .findByAssignmentAndStudentCourseDetailsId(
                        assignmentId,
                        studentCourseDetailsId);
    }

    @Override
    @Transactional
    public void save(AssignmentDetails studentCourseAssignmentDetails) {

        studentCourseAssignmentDetailsDao.save(
                studentCourseAssignmentDetails);
    }
}
