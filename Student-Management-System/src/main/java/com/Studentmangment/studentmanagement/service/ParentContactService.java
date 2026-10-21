package com.Studentmangment.studentmanagement.service;

import java.util.List;
import com.Studentmangment.studentmanagement.dto.ParentContactDto;
import com.Studentmangment.studentmanagement.entity.ParentContact;

public interface ParentContactService {
    ParentContact getContactByStudentId(int studentId);
    ParentContactDto getContactDtoByStudentId(int studentId);
    List<ParentContactDto> getAllContacts();
    ParentContactDto saveOrUpdateContact(ParentContactDto dto);
    ParentContactDto recordOptOut(int studentId, String reason);
    ParentContactDto recordConsent(int studentId, String consentStatus);
    void updateLastContacted(int studentId);
}
