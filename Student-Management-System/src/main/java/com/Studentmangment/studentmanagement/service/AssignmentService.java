package com.Studentmangment.studentmanagement.service;

import com.Studentmangment.studentmanagement.entity.Assignment;

public interface AssignmentService {

    void save(Assignment assignment);

    void deleteAssignmentById(int id);
}
