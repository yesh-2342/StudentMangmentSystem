package com.Studentmangment.studentmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Studentmangment.studentmanagement.entity.LearningResource;

public interface LearningResourceRepository extends JpaRepository<LearningResource, Integer> {
    List<LearningResource> findAllByOrderByTitleAsc();
    List<LearningResource> findByTeacherIdOrderByTitleAsc(int teacherId);
    List<LearningResource> findByCourseCodeIn(List<String> courseCodes);
    Optional<LearningResource> findBySeedKey(String seedKey);
}
