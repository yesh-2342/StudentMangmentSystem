package com.Studentmangment.studentmanagement.service;

import com.Studentmangment.studentmanagement.entity.ParentContact;

public interface CallConsentService {
    CallEligibilityCheck checkEligibility(int studentId);

    class CallEligibilityCheck {
        private final boolean eligible;
        private final String reason;
        private final ParentContact contact;

        public CallEligibilityCheck(boolean eligible, String reason, ParentContact contact) {
            this.eligible = eligible;
            this.reason = reason;
            this.contact = contact;
        }

        public static CallEligibilityCheck ok(ParentContact contact) {
            return new CallEligibilityCheck(true, "Eligible for parent contact", contact);
        }

        public static CallEligibilityCheck blocked(String reason, ParentContact contact) {
            return new CallEligibilityCheck(false, reason, contact);
        }

        public boolean isEligible() { return eligible; }
        public String getReason() { return reason; }
        public ParentContact getContact() { return contact; }
    }
}
