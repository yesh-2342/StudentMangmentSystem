package com.Studentmangment.studentmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Studentmangment.studentmanagement.entity.AcademicTodo;

@Repository
public interface AcademicTodoRepository extends JpaRepository<AcademicTodo, Integer> {
    List<AcademicTodo> findByStudentIdOrderByDueDateAscCreatedAtDesc(int studentId);
    List<AcademicTodo> findByStudentIdAndCompletedOrderByDueDateAsc(int studentId, boolean completed);
}
