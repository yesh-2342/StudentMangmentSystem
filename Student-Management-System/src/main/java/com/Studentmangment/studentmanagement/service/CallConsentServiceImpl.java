package com.Studentmangment.studentmanagement.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Studentmangment.studentmanagement.entity.ParentContact;
import com.Studentmangment.studentmanagement.repository.ParentContactRepository;

@Service
public class CallConsentServiceImpl implements CallConsentService {

    @Autowired
    private ParentContactRepository parentContactRepository;

    @Override
    public CallEligibilityCheck checkEligibility(int studentId) {
        Optional<ParentContact> optContact = parentContactRepository.findByStudentId(studentId);
        if (!optContact.isPresent()) {
            return CallEligibilityCheck.blocked("No guardian contact details registered for student ID: " + studentId, null);
        }

        ParentContact contact = optContact.get();

        if (contact.getPhoneNumber() == null || contact.getPhoneNumber().trim().length() < 10) {
            return CallEligibilityCheck.blocked("Guardian phone number is invalid or missing.", contact);
        }

        if ("OPTED_OUT".equalsIgnoreCase(contact.getConsentStatus())) {
            return CallEligibilityCheck.blocked("Guardian has opted out of automated academic phone calls.", contact);
        }

        if (contact.getLastContactedAt() != null) {
            LocalDateTime cooldownLimit = LocalDateTime.now().minusHours(24);
            if (contact.getLastContactedAt().isAfter(cooldownLimit)) {
                return CallEligibilityCheck.blocked("Cooldown active: Guardian was contacted in the past 24 hours (" +
                        contact.getLastContactedAt().toString().replace("T", " ") + ").", contact);
            }
        }

        return CallEligibilityCheck.ok(contact);
    }
}
