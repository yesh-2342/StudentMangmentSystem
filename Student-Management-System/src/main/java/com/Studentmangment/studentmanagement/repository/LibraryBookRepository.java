package com.Studentmangment.studentmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Studentmangment.studentmanagement.entity.LibraryBook;

public interface LibraryBookRepository extends JpaRepository<LibraryBook, Integer> {
    List<LibraryBook> findAllByOrderByTitleAsc();
    Optional<LibraryBook> findBySeedKey(String seedKey);
}
