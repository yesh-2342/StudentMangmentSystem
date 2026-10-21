package com.Studentmangment.studentmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Studentmangment.studentmanagement.entity.ResourceBookmark;

@Repository
public interface ResourceBookmarkRepository extends JpaRepository<ResourceBookmark, Integer> {
    List<ResourceBookmark> findByUserIdAndUserRole(int userId, String userRole);
    Optional<ResourceBookmark> findByUserIdAndUserRoleAndResourceId(int userId, String userRole, int resourceId);
    boolean existsByUserIdAndUserRoleAndResourceId(int userId, String userRole, int resourceId);
    void deleteByUserIdAndUserRoleAndResourceId(int userId, String userRole, int resourceId);
}
