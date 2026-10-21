package com.Studentmangment.studentmanagement.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Studentmangment.studentmanagement.dto.ParentContactDto;
import com.Studentmangment.studentmanagement.entity.ParentContact;
import com.Studentmangment.studentmanagement.repository.ParentContactRepository;

@Service
public class ParentContactServiceImpl implements ParentContactService {

    @Autowired
    private ParentContactRepository parentContactRepository;

    @Override
    public ParentContact getContactByStudentId(int studentId) {
        return parentContactRepository.findByStudentId(studentId).orElse(null);
    }

    @Override
    public ParentContactDto getContactDtoByStudentId(int studentId) {
        ParentContact contact = getContactByStudentId(studentId);
        return contact != null ? toDto(contact) : null;
    }

    @Override
    public List<ParentContactDto> getAllContacts() {
        List<ParentContact> list = parentContactRepository.findAll();
        List<ParentContactDto> dtos = new ArrayList<>();
        for (ParentContact c : list) {
            dtos.add(toDto(c));
        }
        return dtos;
    }

    @Override
    @Transactional
    public ParentContactDto saveOrUpdateContact(ParentContactDto dto) {
        ParentContact contact;
        Optional<ParentContact> existing = parentContactRepository.findByStudentId(dto.getStudentId());
        if (existing.isPresent()) {
            contact = existing.get();
        } else {
            contact = new ParentContact();
            contact.setStudentId(dto.getStudentId());
        }

        contact.setGuardianName(dto.getGuardianName());
        contact.setRelationship(dto.getRelationship() != null ? dto.getRelationship() : "GUARDIAN");
        contact.setPhoneNumber(dto.getPhoneNumber());
        contact.setEmail(dto.getEmail());
        if (dto.getPreferredLanguage() != null) {
            contact.setPreferredLanguage(dto.getPreferredLanguage());
        }
        if (dto.getConsentStatus() != null) {
            contact.setConsentStatus(dto.getConsentStatus());
        }
        contact.setNotes(dto.getNotes());

        ParentContact saved = parentContactRepository.save(contact);
        return toDto(saved);
    }

    @Override
    @Transactional
    public ParentContactDto recordOptOut(int studentId, String reason) {
        ParentContact contact = parentContactRepository.findByStudentId(studentId).orElseGet(() -> {
            ParentContact c = new ParentContact();
            c.setStudentId(studentId);
            c.setGuardianName("Guardian of Student #" + studentId);
            c.setRelationship("GUARDIAN");
            c.setPhoneNumber("");
            return c;
        });

        contact.setConsentStatus("OPTED_OUT");
        contact.setOptOutDate(LocalDateTime.now());
        contact.setNotes(reason != null ? reason : "Guardian requested opt-out during call.");
        ParentContact saved = parentContactRepository.save(contact);
        return toDto(saved);
    }

    @Override
    @Transactional
    public ParentContactDto recordConsent(int studentId, String consentStatus) {
        ParentContact contact = parentContactRepository.findByStudentId(studentId).orElse(null);
        if (contact != null) {
            contact.setConsentStatus(consentStatus);
            if (!"OPTED_OUT".equalsIgnoreCase(consentStatus)) {
                contact.setOptOutDate(null);
            }
            ParentContact saved = parentContactRepository.save(contact);
            return toDto(saved);
        }
        return null;
    }

    @Override
    @Transactional
    public void updateLastContacted(int studentId) {
        Optional<ParentContact> opt = parentContactRepository.findByStudentId(studentId);
        if (opt.isPresent()) {
            ParentContact c = opt.get();
            c.setLastContactedAt(LocalDateTime.now());
            parentContactRepository.save(c);
        }
    }

    private ParentContactDto toDto(ParentContact entity) {
        ParentContactDto dto = new ParentContactDto();
        dto.setId(entity.getId());
        dto.setStudentId(entity.getStudentId());
        dto.setGuardianName(entity.getGuardianName());
        dto.setRelationship(entity.getRelationship());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setEmail(entity.getEmail());
        dto.setPreferredLanguage(entity.getPreferredLanguage());
        dto.setConsentStatus(entity.getConsentStatus());
        dto.setOptOutDate(entity.getOptOutDate());
        dto.setLastContactedAt(entity.getLastContactedAt());
        dto.setNotes(entity.getNotes());
        return dto;
    }
}
