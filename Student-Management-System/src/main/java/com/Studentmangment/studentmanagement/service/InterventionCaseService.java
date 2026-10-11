package com.Studentmangment.studentmanagement.service;

import java.util.List;

import com.Studentmangment.studentmanagement.dto.InterventionCaseDto;
import com.Studentmangment.studentmanagement.dto.InterventionCaseRequestDto;

public interface InterventionCaseService {

    List<InterventionCaseDto> findVisibleCases();

    InterventionCaseDto createCase(InterventionCaseRequestDto request);

    InterventionCaseDto updateCase(int id, InterventionCaseRequestDto request);
}
