package com.Studentmangment.studentmanagement.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityRoles {

    private SecurityRoles() {}

    public static Authentication current() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    public static boolean isAuthenticated(Authentication authentication) {
        return authentication != null && authentication.isAuthenticated();
    }

    public static boolean isStudent(Authentication authentication) {
        return has(authentication, "ROLE_STUDENT") || has(authentication, "STUDENT");
    }

    public static boolean isTeacher(Authentication authentication) {
        return has(authentication, "ROLE_TEACHER") || has(authentication, "TEACHER");
    }

    public static boolean isAdmin(Authentication authentication) {
        return has(authentication, "ROLE_ADMIN") || has(authentication, "ADMIN");
    }

    public static String canonicalRole(Authentication authentication) {
        if (isAdmin(authentication)) return "ADMIN";
        if (isTeacher(authentication)) return "TEACHER";
        if (isStudent(authentication)) return "STUDENT";
        return null;
    }

    public static boolean matchesExpected(String expectedRole, String actualRole) {
        if (expectedRole == null || expectedRole.trim().isEmpty()) {
            return true;
        }
        return normalize(expectedRole).equals(normalize(actualRole));
    }

    public static String normalize(String role) {
        if (role == null) {
            return "";
        }
        String value = role.trim().toUpperCase().replace("ROLE_", "");
        if ("FACULTY".equals(value) || "TEACHER".equals(value)) {
            return "TEACHER";
        }
        return value;
    }

    private static boolean has(Authentication authentication, String authority) {
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
            .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals(authority));
    }
}
