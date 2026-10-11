package com.Studentmangment.studentmanagement.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.persistence.EntityManager;
import javax.transaction.Transactional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import com.Studentmangment.studentmanagement.entity.AcademicNotification;
import com.Studentmangment.studentmanagement.entity.Assignment;
import com.Studentmangment.studentmanagement.entity.AssignmentDetails;
import com.Studentmangment.studentmanagement.entity.AttendanceRecord;
import com.Studentmangment.studentmanagement.entity.ConsultationRequest;
import com.Studentmangment.studentmanagement.entity.Course;
import com.Studentmangment.studentmanagement.entity.FacultyAttendance;
import com.Studentmangment.studentmanagement.entity.FacultyAvailability;
import com.Studentmangment.studentmanagement.entity.GradeDetails;
import com.Studentmangment.studentmanagement.entity.InterventionCase;
import com.Studentmangment.studentmanagement.entity.LearningResource;
import com.Studentmangment.studentmanagement.entity.LibraryBook;
import com.Studentmangment.studentmanagement.entity.Role;
import com.Studentmangment.studentmanagement.entity.Student;
import com.Studentmangment.studentmanagement.entity.StudentCourseDetails;
import com.Studentmangment.studentmanagement.entity.Teacher;

@Configuration
public class DevelopmentSeedDataConfig {

    public static final String TEST_PASSWORD = "Test@123";

    @Bean
    public CommandLineRunner seedDevelopmentData(EntityManager entityManager, BCryptPasswordEncoder passwordEncoder, PlatformTransactionManager transactionManager) {
        return args -> new TransactionTemplate(transactionManager).execute(status -> {
            seed(entityManager, passwordEncoder);
            return null;
        });
    }

    @Transactional
    public void seed(EntityManager entityManager, BCryptPasswordEncoder passwordEncoder) {
        Role studentRole = role(entityManager, "ROLE_STUDENT");
        Role teacherRole = role(entityManager, "ROLE_TEACHER");
        Role adminRole = role(entityManager, "ROLE_ADMIN");

        // 1. Teachers / Faculty Members (6 Teachers across Academic Departments)
        Teacher teacherOne = teacher(entityManager, passwordEncoder, teacherRole, "test.teacher01", "Anita", "Rao", "Computer Science");
        Teacher teacherTwo = teacher(entityManager, passwordEncoder, teacherRole, "test.teacher02", "Rahul", "Menon", "Data Analytics");
        Teacher teacherThree = teacher(entityManager, passwordEncoder, teacherRole, "test.teacher03", "Kavita", "Deshmukh", "Artificial Intelligence");
        Teacher teacherFour = teacher(entityManager, passwordEncoder, teacherRole, "test.teacher04", "Suresh", "Patil", "Software Engineering");
        Teacher teacherFive = teacher(entityManager, passwordEncoder, teacherRole, "test.teacher05", "Vikram", "Sethi", "Cyber Security");
        Teacher teacherSix = teacher(entityManager, passwordEncoder, teacherRole, "test.teacher06", "Sunita", "Nambiar", "Cloud Systems");

        // 2. 30 Distinct Test Students (Representing all performance tiers: High, Moderate, At-Risk)
        Student s1  = student(entityManager, passwordEncoder, studentRole, "test.student01", "Meera", "Kumar");
        Student s2  = student(entityManager, passwordEncoder, studentRole, "test.student02", "Arjun", "Nair");
        Student s3  = student(entityManager, passwordEncoder, studentRole, "test.student03", "Sara", "Iyer");
        Student s4  = student(entityManager, passwordEncoder, studentRole, "test.student04", "Rohan", "Varma");
        Student s5  = student(entityManager, passwordEncoder, studentRole, "test.student05", "Priya", "Sen");
        Student s6  = student(entityManager, passwordEncoder, studentRole, "test.student06", "Aarav", "Sharma");
        Student s7  = student(entityManager, passwordEncoder, studentRole, "test.student07", "Ananya", "Chopra");
        Student s8  = student(entityManager, passwordEncoder, studentRole, "test.student08", "Dev", "Patel");
        Student s9  = student(entityManager, passwordEncoder, studentRole, "test.student09", "Ishaan", "Bose");
        Student s10 = student(entityManager, passwordEncoder, studentRole, "test.student10", "Aditya", "Joshi");
        Student s11 = student(entityManager, passwordEncoder, studentRole, "test.student11", "Neha", "Gupta");
        Student s12 = student(entityManager, passwordEncoder, studentRole, "test.student12", "Varun", "Reddy");
        Student s13 = student(entityManager, passwordEncoder, studentRole, "test.student13", "Pooja", "Singhania");
        Student s14 = student(entityManager, passwordEncoder, studentRole, "test.student14", "Nikhil", "Aggarwal");
        Student s15 = student(entityManager, passwordEncoder, studentRole, "test.student15", "Ritu", "Bhatt");
        Student s16 = student(entityManager, passwordEncoder, studentRole, "test.student16", "Siddharth", "Malhotra");
        Student s17 = student(entityManager, passwordEncoder, studentRole, "test.student17", "Tanvi", "Hegde");
        Student s18 = student(entityManager, passwordEncoder, studentRole, "test.student18", "Karthik", "Sundaram");
        Student s19 = student(entityManager, passwordEncoder, studentRole, "test.student19", "Divya", "Pillai");
        Student s20 = student(entityManager, passwordEncoder, studentRole, "test.student20", "Aman", "Tripathi");
        Student s21 = student(entityManager, passwordEncoder, studentRole, "test.student21", "Manish", "Goyal");
        Student s22 = student(entityManager, passwordEncoder, studentRole, "test.student22", "Sneha", "Kulkarni");
        Student s23 = student(entityManager, passwordEncoder, studentRole, "test.student23", "Rajesh", "Nambisan");
        Student s24 = student(entityManager, passwordEncoder, studentRole, "test.student24", "Deepika", "Prabhu");
        Student s25 = student(entityManager, passwordEncoder, studentRole, "test.student25", "Harish", "Kapoor");
        Student s26 = student(entityManager, passwordEncoder, studentRole, "test.student26", "Tanya", "Saxena");
        Student s27 = student(entityManager, passwordEncoder, studentRole, "test.student27", "Sameer", "Khan");
        Student s28 = student(entityManager, passwordEncoder, studentRole, "test.student28", "Bhavna", "Raman");
        Student s29 = student(entityManager, passwordEncoder, studentRole, "test.student29", "Gaurav", "Mishra");
        Student s30 = student(entityManager, passwordEncoder, studentRole, "test.student30", "Swati", "Chawla");

        // 3. 12 Courses across 4 Major Programmes
        Course dataScience          = course(entityManager, "DAP-DS101", "Data Science Foundations", teacherOne);
        Course softwareEngineering  = course(entityManager, "DAP-SE201", "Software Engineering Studio", teacherOne);
        Course softwareEngineeringAdv = course(entityManager, "DAP-SE202", "Software Architecture & Design Patterns", teacherFour);
        Course dataScienceB         = course(entityManager, "DAP-DS102", "Advanced Statistical Modeling", teacherFour);
        Course institutionalAnalytics = course(entityManager, "DAP-IA301", "Institutional Analytics & BI", teacherTwo);
        Course cloudArchitecture    = course(entityManager, "DAP-CC401", "Cloud Computing Architecture", teacherTwo);
        Course cloudDevOps          = course(entityManager, "DAP-CC402", "Cloud Infrastructure & DevOps", teacherSix);
        Course distributedDB        = course(entityManager, "DAP-DB801", "Distributed Database Systems", teacherSix);
        Course machineLearning      = course(entityManager, "DAP-ML501", "Applied Machine Learning", teacherThree);
        Course algorithmEngineering = course(entityManager, "DAP-AE601", "Algorithm Engineering & Complexity", teacherThree);
        Course infoSecurity         = course(entityManager, "DAP-IS701", "Information Security & Governance", teacherFive);
        Course networkSecurity      = course(entityManager, "DAP-IS702", "Network Penetration & Cryptography", teacherFive);

        // 4. Student Course Enrolments, Grades, and Assignments
        // High Achievers Cohort (> 85% average)
        enroll(entityManager, s1,  dataScience, Arrays.asList(88, 92, 94), true);
        enroll(entityManager, s1,  softwareEngineering, Arrays.asList(84, 89, 91), true);
        enroll(entityManager, s1,  machineLearning, Arrays.asList(90, 93, 95), true);

        enroll(entityManager, s3,  softwareEngineering, Arrays.asList(92, 87, 95), true);
        enroll(entityManager, s3,  institutionalAnalytics, Arrays.asList(88, 91, 90), true);
        enroll(entityManager, s3,  machineLearning, Arrays.asList(94, 96, 92), true);

        enroll(entityManager, s10, softwareEngineeringAdv, Arrays.asList(89, 92, 94), true);
        enroll(entityManager, s10, infoSecurity, Arrays.asList(86, 90, 88), true);

        enroll(entityManager, s13, dataScience, Arrays.asList(91, 95, 94), true);
        enroll(entityManager, s13, distributedDB, Arrays.asList(88, 92, 90), true);

        enroll(entityManager, s17, machineLearning, Arrays.asList(93, 95, 96), true);
        enroll(entityManager, s17, algorithmEngineering, Arrays.asList(90, 92, 94), true);

        enroll(entityManager, s20, cloudArchitecture, Arrays.asList(89, 91, 93), true);
        enroll(entityManager, s20, infoSecurity, Arrays.asList(92, 94, 95), true);

        enroll(entityManager, s24, dataScienceB, Arrays.asList(90, 93, 92), true);
        enroll(entityManager, s24, networkSecurity, Arrays.asList(88, 91, 89), true);

        enroll(entityManager, s28, cloudDevOps, Arrays.asList(91, 94, 95), true);
        enroll(entityManager, s28, softwareEngineeringAdv, Arrays.asList(87, 90, 92), true);

        // At-Risk Cohort (Average < 60% and/or missing assignments)
        enroll(entityManager, s2,  dataScience, Arrays.asList(51, 57, 54), false);
        enroll(entityManager, s2,  institutionalAnalytics, Arrays.asList(58, 60, 56), true);
        enroll(entityManager, s2,  machineLearning, Arrays.asList(55, 59, 52), false);

        enroll(entityManager, s5,  softwareEngineering, Arrays.asList(56, 58, 54), false);
        enroll(entityManager, s5,  cloudArchitecture, Arrays.asList(48, 52, 50), false);
        enroll(entityManager, s5,  algorithmEngineering, Arrays.asList(54, 58, 52), false);

        enroll(entityManager, s11, algorithmEngineering, Arrays.asList(45, 52, 48), false);
        enroll(entityManager, s11, distributedDB, Arrays.asList(54, 58, 52), false);

        enroll(entityManager, s14, softwareEngineering, Arrays.asList(52, 55, 50), false);
        enroll(entityManager, s14, infoSecurity, Arrays.asList(56, 58, 54), false);

        enroll(entityManager, s16, cloudArchitecture, Arrays.asList(50, 54, 52), false);
        enroll(entityManager, s16, machineLearning, Arrays.asList(55, 58, 54), false);

        enroll(entityManager, s19, dataScience, Arrays.asList(52, 56, 51), false);
        enroll(entityManager, s19, institutionalAnalytics, Arrays.asList(54, 58, 52), false);

        enroll(entityManager, s22, networkSecurity, Arrays.asList(49, 53, 51), false);
        enroll(entityManager, s22, infoSecurity, Arrays.asList(52, 55, 50), false);

        enroll(entityManager, s27, dataScience, Arrays.asList(50, 54, 48), false);
        enroll(entityManager, s27, cloudDevOps, Arrays.asList(52, 56, 51), false);

        enroll(entityManager, s30, softwareEngineering, Arrays.asList(48, 52, 50), false);
        enroll(entityManager, s30, algorithmEngineering, Arrays.asList(51, 55, 49), false);

        // Moderate / Standard Cohort (~70-80% average)
        enroll(entityManager, s4,  dataScience, Arrays.asList(72, 76, 78), true);
        enroll(entityManager, s4,  cloudArchitecture, Arrays.asList(74, 78, 75), true);
        enroll(entityManager, s4,  algorithmEngineering, Arrays.asList(70, 72, 74), false);

        enroll(entityManager, s6,  dataScienceB, Arrays.asList(75, 78, 80), true);
        enroll(entityManager, s6,  softwareEngineeringAdv, Arrays.asList(79, 81, 83), true);

        enroll(entityManager, s7,  dataScienceB, Arrays.asList(72, 76, 75), true);
        enroll(entityManager, s7,  cloudArchitecture, Arrays.asList(70, 73, 71), false);

        enroll(entityManager, s8,  softwareEngineeringAdv, Arrays.asList(76, 79, 78), true);
        enroll(entityManager, s8,  distributedDB, Arrays.asList(74, 77, 75), true);

        enroll(entityManager, s9,  dataScienceB, Arrays.asList(71, 74, 73), true);
        enroll(entityManager, s9,  infoSecurity, Arrays.asList(75, 78, 76), true);

        enroll(entityManager, s12, institutionalAnalytics, Arrays.asList(73, 76, 75), true);
        enroll(entityManager, s12, distributedDB, Arrays.asList(70, 74, 72), true);

        enroll(entityManager, s15, softwareEngineering, Arrays.asList(76, 78, 80), true);
        enroll(entityManager, s15, algorithmEngineering, Arrays.asList(74, 77, 75), true);

        enroll(entityManager, s18, dataScienceB, Arrays.asList(77, 80, 79), true);
        enroll(entityManager, s18, machineLearning, Arrays.asList(75, 79, 78), true);

        enroll(entityManager, s21, cloudDevOps, Arrays.asList(74, 78, 76), true);
        enroll(entityManager, s21, distributedDB, Arrays.asList(72, 75, 74), true);

        enroll(entityManager, s23, networkSecurity, Arrays.asList(78, 80, 82), true);
        enroll(entityManager, s23, infoSecurity, Arrays.asList(75, 79, 77), true);

        enroll(entityManager, s25, dataScience, Arrays.asList(73, 77, 75), true);
        enroll(entityManager, s25, machineLearning, Arrays.asList(76, 78, 80), true);

        enroll(entityManager, s26, softwareEngineering, Arrays.asList(75, 78, 77), true);
        enroll(entityManager, s26, institutionalAnalytics, Arrays.asList(77, 80, 79), true);

        enroll(entityManager, s29, algorithmEngineering, Arrays.asList(72, 75, 74), true);
        enroll(entityManager, s29, softwareEngineeringAdv, Arrays.asList(76, 78, 80), true);

        // 5. Academic Interventions Across Statuses
        intervention(entityManager, s2, teacherOne, "Low assessment average in Data Science (54.0%)", "Weekly lab tutorial and diagnostic assignment checkpoint", "IN_PROGRESS", "Staff note: Student attending Monday office hours.");
        intervention(entityManager, s2, teacherOne, "Critical attendance drop below 75% in Data Science", "Mandatory bi-weekly attendance log and advisory check-in", "OPEN", "Staff note: Warning notification dispatched.");
        intervention(entityManager, s5, teacherOne, "Struggling with Software Engineering studio deliverables", "Pair programming mentor assigned from senior student cohort", "IN_PROGRESS", "Staff note: Milestone 1 deliverable submitted.");
        intervention(entityManager, s5, teacherTwo, "Low exam score in Cloud Architecture (50.0%)", "Bi-weekly 1-on-1 tutoring on distributed networking concepts", "OPEN", "Staff note: Practice test scheduled.");
        intervention(entityManager, s11, teacherThree, "Prerequisite gap in Discrete Mathematics & Algorithms", "Provide curated problem sets and guided walkthrough", "OPEN", "Staff note: Peer tutor matched.");
        intervention(entityManager, s14, teacherOne, "Missing milestone deliverables in Software Engineering", "Establish milestone schedule and weekly submission review", "FOLLOW_UP_REQUIRED", "Staff note: Review scheduled for next Friday.");
        intervention(entityManager, s16, teacherTwo, "Cloud architecture networking practical difficulty", "Hands-on virtual lab session on VPC and subnet configurations", "IN_PROGRESS", "Staff note: Virtual lab credentials verified.");
        intervention(entityManager, s19, teacherOne, "Attendance drop below 60% in Data Science", "Formal dean advisory notice and weekly attendance verification", "OPEN", "Staff note: Guardian meeting conducted.");
        intervention(entityManager, s22, teacherFive, "Information security cryptography lab gap", "Supplementary lab sessions on public key infrastructure", "OPEN", "Staff note: Additional practice worksheet assigned.");
        intervention(entityManager, s27, teacherOne, "Underperforming in Data Science assessments (50.7%)", "Assigned peer tutor and review of exploratory data analysis", "IN_PROGRESS", "Staff note: First quiz retake completed.");
        intervention(entityManager, s30, teacherOne, "Software Engineering foundation concepts review", "Code review workshop and supplementary design pattern study", "OPEN", "Staff note: Initial consultation completed.");
        intervention(entityManager, s1, teacherOne, "Capstone architecture milestone guidance", "Review system architecture during office hours", "RESOLVED", "Staff note: Capstone approved with distinction.");
        intervention(entityManager, s4, teacherThree, "Algorithm design prerequisite review", "Complete supplementary data structures practice problem set", "CLOSED", "Staff note: Practice set completed with 85% score.");

        // 6. Faculty Availability Slots
        availability(entityManager, teacherOne, "Block A / Faculty Cabin 12", "MONDAY", LocalTime.of(10, 0), LocalTime.of(12, 0), "DAP-SEED-AVAIL-1");
        availability(entityManager, teacherOne, "Block A / Faculty Cabin 12", "WEDNESDAY", LocalTime.of(14, 0), LocalTime.of(16, 0), "DAP-SEED-AVAIL-2");
        availability(entityManager, teacherTwo, "Analytics Lab Office / Cabin 3", "TUESDAY", LocalTime.of(11, 0), LocalTime.of(13, 0), "DAP-SEED-AVAIL-3");
        availability(entityManager, teacherTwo, "Analytics Lab Office / Cabin 3", "THURSDAY", LocalTime.of(15, 0), LocalTime.of(17, 0), "DAP-SEED-AVAIL-4");
        availability(entityManager, teacherThree, "Block B / AI Innovation Hub 108", "MONDAY", LocalTime.of(14, 0), LocalTime.of(16, 0), "DAP-SEED-AVAIL-5");
        availability(entityManager, teacherThree, "Block B / AI Innovation Hub 108", "FRIDAY", LocalTime.of(10, 0), LocalTime.of(12, 0), "DAP-SEED-AVAIL-6");
        availability(entityManager, teacherFour, "Block C / Faculty Cabin 04", "TUESDAY", LocalTime.of(14, 0), LocalTime.of(16, 0), "DAP-SEED-AVAIL-7");
        availability(entityManager, teacherFour, "Block C / Faculty Cabin 04", "THURSDAY", LocalTime.of(10, 0), LocalTime.of(12, 0), "DAP-SEED-AVAIL-8");
        availability(entityManager, teacherFive, "Cyber Security Lab / Room 204", "WEDNESDAY", LocalTime.of(11, 0), LocalTime.of(13, 0), "DAP-SEED-AVAIL-9");
        availability(entityManager, teacherFive, "Cyber Security Lab / Room 204", "FRIDAY", LocalTime.of(14, 0), LocalTime.of(16, 0), "DAP-SEED-AVAIL-10");
        availability(entityManager, teacherSix, "Cloud Data Center / Room 302", "MONDAY", LocalTime.of(11, 0), LocalTime.of(13, 0), "DAP-SEED-AVAIL-11");
        availability(entityManager, teacherSix, "Cloud Data Center / Room 302", "WEDNESDAY", LocalTime.of(15, 0), LocalTime.of(17, 0), "DAP-SEED-AVAIL-12");

        // 7. Consultation Requests
        consultation(entityManager, s1, teacherOne, LocalDateTime.of(2026, 10, 14, 10, 30), "PENDING", "Need guidance on semester capstone architecture", "DAP-SEED-CONSULT-1");
        consultation(entityManager, s1, teacherOne, LocalDateTime.of(2026, 10, 1, 10, 0), "COMPLETED", "Initial capstone scope and proposal discussion", "DAP-SEED-CONSULT-1B");
        consultation(entityManager, s2, teacherOne, LocalDateTime.of(2026, 10, 12, 11, 0), "CONFIRMED", "Discuss Data Science recovery plan", "DAP-SEED-CONSULT-2");
        consultation(entityManager, s3, teacherTwo, LocalDateTime.of(2026, 10, 8, 15, 0), "COMPLETED", "Review analytics assignment feedback rubric", "DAP-SEED-CONSULT-3");
        consultation(entityManager, s5, teacherTwo, LocalDateTime.of(2026, 10, 15, 15, 30), "CONFIRMED", "Cloud architecture tutoring session", "DAP-SEED-CONSULT-4");
        consultation(entityManager, s4, teacherThree, LocalDateTime.of(2026, 10, 9, 14, 0), "CANCELLED", "Algorithm practice question", "DAP-SEED-CONSULT-5");
        consultation(entityManager, s6, teacherFour, LocalDateTime.of(2026, 10, 16, 14, 30), "PENDING", "Section B lab consultation and course overview", "DAP-SEED-CONSULT-6");
        consultation(entityManager, s11, teacherThree, LocalDateTime.of(2026, 10, 19, 14, 0), "CONFIRMED", "Discrete mathematics and complexity revision", "DAP-SEED-CONSULT-7");
        consultation(entityManager, s14, teacherOne, LocalDateTime.of(2026, 10, 14, 11, 30), "PENDING", "Software studio milestone extension discussion", "DAP-SEED-CONSULT-8");
        consultation(entityManager, s16, teacherTwo, LocalDateTime.of(2026, 10, 20, 11, 30), "CONFIRMED", "VPC networking architecture guidance", "DAP-SEED-CONSULT-9");
        consultation(entityManager, s22, teacherFive, LocalDateTime.of(2026, 10, 21, 11, 30), "COMPLETED", "Cryptographic key management protocols", "DAP-SEED-CONSULT-10");
        consultation(entityManager, s27, teacherOne, LocalDateTime.of(2026, 10, 22, 10, 30), "PENDING", "Data science midterm performance review", "DAP-SEED-CONSULT-11");

        // 8. Library Books
        book(entityManager, "Introduction to Data Science", "Rachel Schutt", "Data Science", "9781491901423", 3, 5, "DAP-SEED-BOOK-1");
        book(entityManager, "Introduction to Data Science (2nd Edition)", "Rachel Schutt", "Data Science", "9781491901424", 2, 4, "DAP-SEED-BOOK-1B");
        book(entityManager, "Software Engineering at Google", "Titus Winters", "Software Engineering", "9781492082798", 2, 4, "DAP-SEED-BOOK-2");
        book(entityManager, "Software Engineering at Google (Companion Guide)", "Titus Winters", "Software Engineering", "9781492082799", 3, 3, "DAP-SEED-BOOK-2B");
        book(entityManager, "Storytelling with Data", "Cole Nussbaumer Knaflic", "Analytics", "9781119002253", 1, 3, "DAP-SEED-BOOK-3");
        book(entityManager, "Designing Data-Intensive Applications", "Martin Kleppmann", "Computer Science", "9781449373320", 4, 6, "DAP-SEED-BOOK-4");
        book(entityManager, "Deep Learning with Python", "François Chollet", "Artificial Intelligence", "9781617294433", 1, 3, "DAP-SEED-BOOK-5");
        book(entityManager, "Cloud Native Patterns", "Cornelia Davis", "Cloud Architecture", "9781617294297", 2, 2, "DAP-SEED-BOOK-6");
        book(entityManager, "Practical Malware Analysis", "Michael Sikorski", "Cyber Security", "9781593272906", 2, 3, "DAP-SEED-BOOK-7");
        book(entityManager, "Database Internals", "Alex Petrov", "Database Systems", "9781492040347", 3, 4, "DAP-SEED-BOOK-8");
        book(entityManager, "Computer Networking: A Top-Down Approach", "James Kurose", "Computer Science", "9780133594140", 4, 5, "DAP-SEED-BOOK-9");

        // 9. Course Learning Resources
        resource(entityManager, teacherOne, "DAP-DS101", "Data Science Lab Notebook & Clean Datasets", "Authorized course notebook, dataset clean-up notes, and exercises", "https://example.edu/resources/ds101", "DAP-SEED-RES-1");
        resource(entityManager, teacherFour, "DAP-DS102", "Advanced Statistical Modeling Lecture Notes", "Regression, hypothesis testing, and Bayesian analysis notes", "https://example.edu/resources/ds102", "DAP-SEED-RES-1B");
        resource(entityManager, teacherOne, "DAP-DS101", "Data Science Foundations - Cheat Sheet & Quick Reference", "Quick reference guide for Python, Pandas, and exploratory data analysis", "https://example.edu/resources/ds101-cheat", "DAP-SEED-RES-1C");
        resource(entityManager, teacherOne, "DAP-SE201", "Software Studio Rubric & Architecture Patterns", "Project studio marking rubric and system architecture guide", "https://example.edu/resources/se201", "DAP-SEED-RES-2");
        resource(entityManager, teacherTwo, "DAP-IA301", "Institutional Analytics KPI Pack", "Dashboard interpretation worksheet and statistical models", "https://example.edu/resources/ia301", "DAP-SEED-RES-3");
        resource(entityManager, teacherTwo, "DAP-CC401", "Distributed Cloud Infrastructure Primer", "Cloud architecture cheat sheet and container deployment guide", "https://example.edu/resources/cc401", "DAP-SEED-RES-4");
        resource(entityManager, teacherThree, "DAP-ML501", "Applied Machine Learning Baseline Workflows", "Supervised and unsupervised pipeline notes with code samples", "https://example.edu/resources/ml501", "DAP-SEED-RES-5");
        resource(entityManager, teacherFive, "DAP-IS701", "OWASP Security Verification Standards", "Comprehensive application security checklist and threat modeling guide", "https://example.edu/resources/is701", "DAP-SEED-RES-6");
        resource(entityManager, teacherSix, "DAP-DB801", "Distributed Consensus & Raft Protocol Guide", "Deep dive into distributed storage replication and partition tolerance", "https://example.edu/resources/db801", "DAP-SEED-RES-7");
        resource(entityManager, teacherSix, "DAP-CC402", "Kubernetes Production Setup Cheatsheet", "Deployment manifests, ingress routing, and secret management guide", "https://example.edu/resources/cc402", "DAP-SEED-RES-8");

        // 10. Student Attendance Records Across Dates
        // Student 1 (high attendance)
        attend(entityManager, s1, dataScience, LocalDate.of(2026, 10, 1), "PRESENT", teacherOne, "DAP-SEED-ATT-1");
        attend(entityManager, s1, dataScience, LocalDate.of(2026, 10, 3), "PRESENT", teacherOne, "DAP-SEED-ATT-2");
        attend(entityManager, s1, dataScience, LocalDate.of(2026, 10, 5), "PRESENT", teacherOne, "DAP-SEED-ATT-3");
        attend(entityManager, s1, dataScience, LocalDate.of(2026, 10, 7), "PRESENT", teacherOne, "DAP-SEED-ATT-3B");

        // Student 2 (low attendance - at risk)
        attend(entityManager, s2, dataScience, LocalDate.of(2026, 10, 1), "ABSENT", teacherOne, "DAP-SEED-ATT-4");
        attend(entityManager, s2, dataScience, LocalDate.of(2026, 10, 3), "ABSENT", teacherOne, "DAP-SEED-ATT-5");
        attend(entityManager, s2, dataScience, LocalDate.of(2026, 10, 5), "LATE", teacherOne, "DAP-SEED-ATT-6");
        attend(entityManager, s2, dataScience, LocalDate.of(2026, 10, 7), "ABSENT", teacherOne, "DAP-SEED-ATT-6B");
        attend(entityManager, s2, institutionalAnalytics, LocalDate.of(2026, 10, 2), "PRESENT", teacherTwo, "DAP-SEED-ATT-7");

        // Other students across courses
        attend(entityManager, s3, softwareEngineering, LocalDate.of(2026, 10, 1), "PRESENT", teacherOne, "DAP-SEED-ATT-8");
        attend(entityManager, s3, softwareEngineering, LocalDate.of(2026, 10, 3), "PRESENT", teacherOne, "DAP-SEED-ATT-9");
        attend(entityManager, s4, cloudArchitecture, LocalDate.of(2026, 10, 2), "PRESENT", teacherTwo, "DAP-SEED-ATT-10");
        attend(entityManager, s5, softwareEngineering, LocalDate.of(2026, 10, 1), "ABSENT", teacherOne, "DAP-SEED-ATT-11");
        attend(entityManager, s5, softwareEngineering, LocalDate.of(2026, 10, 3), "LATE", teacherOne, "DAP-SEED-ATT-12");
        attend(entityManager, s5, cloudArchitecture, LocalDate.of(2026, 10, 2), "ABSENT", teacherTwo, "DAP-SEED-ATT-12B");
        attend(entityManager, s5, cloudArchitecture, LocalDate.of(2026, 10, 4), "LATE", teacherTwo, "DAP-SEED-ATT-12C");

        attend(entityManager, s11, algorithmEngineering, LocalDate.of(2026, 10, 1), "ABSENT", teacherThree, "DAP-SEED-ATT-13");
        attend(entityManager, s11, algorithmEngineering, LocalDate.of(2026, 10, 5), "LATE", teacherThree, "DAP-SEED-ATT-14");
        attend(entityManager, s14, softwareEngineering, LocalDate.of(2026, 10, 1), "ABSENT", teacherOne, "DAP-SEED-ATT-15");
        attend(entityManager, s14, softwareEngineering, LocalDate.of(2026, 10, 3), "ABSENT", teacherOne, "DAP-SEED-ATT-16");
        attend(entityManager, s16, cloudArchitecture, LocalDate.of(2026, 10, 2), "LATE", teacherTwo, "DAP-SEED-ATT-17");
        attend(entityManager, s19, dataScience, LocalDate.of(2026, 10, 1), "ABSENT", teacherOne, "DAP-SEED-ATT-18");
        attend(entityManager, s19, dataScience, LocalDate.of(2026, 10, 3), "ABSENT", teacherOne, "DAP-SEED-ATT-19");
        attend(entityManager, s19, dataScience, LocalDate.of(2026, 10, 5), "ABSENT", teacherOne, "DAP-SEED-ATT-20");
        attend(entityManager, s22, networkSecurity, LocalDate.of(2026, 10, 2), "ABSENT", teacherFive, "DAP-SEED-ATT-21");
        attend(entityManager, s22, networkSecurity, LocalDate.of(2026, 10, 4), "LATE", teacherFive, "DAP-SEED-ATT-22");
        attend(entityManager, s27, dataScience, LocalDate.of(2026, 10, 1), "ABSENT", teacherOne, "DAP-SEED-ATT-23");
        attend(entityManager, s27, dataScience, LocalDate.of(2026, 10, 3), "ABSENT", teacherOne, "DAP-SEED-ATT-24");
        attend(entityManager, s30, softwareEngineering, LocalDate.of(2026, 10, 1), "ABSENT", teacherOne, "DAP-SEED-ATT-25");
        attend(entityManager, s30, softwareEngineering, LocalDate.of(2026, 10, 3), "LATE", teacherOne, "DAP-SEED-ATT-26");

        // 11. Faculty Attendance Records
        facultyAttend(entityManager, teacherOne, LocalDate.of(2026, 10, 1), "PRESENT", "Computer Science", "Conducted DS101 lecture on time", "System Administrator");
        facultyAttend(entityManager, teacherOne, LocalDate.of(2026, 10, 2), "PRESENT", "Computer Science", "Lab session supervision", "System Administrator");
        facultyAttend(entityManager, teacherOne, LocalDate.of(2026, 10, 3), "PRESENT", "Computer Science", "SE201 lecture session", "System Administrator");
        facultyAttend(entityManager, teacherTwo, LocalDate.of(2026, 10, 1), "PRESENT", "Data Analytics", "Analytics lecture on schedule", "System Administrator");
        facultyAttend(entityManager, teacherTwo, LocalDate.of(2026, 10, 2), "LATE", "Data Analytics", "Arrived 15 mins late due to faculty meeting", "System Administrator");
        facultyAttend(entityManager, teacherThree, LocalDate.of(2026, 10, 1), "PRESENT", "Artificial Intelligence", "Conducted ML501 session", "System Administrator");
        facultyAttend(entityManager, teacherThree, LocalDate.of(2026, 10, 2), "ON_LEAVE", "Artificial Intelligence", "Approved conference attendance leave", "System Administrator");
        facultyAttend(entityManager, teacherFour, LocalDate.of(2026, 10, 1), "PRESENT", "Software Engineering", "Conducted SE202 lecture", "System Administrator");
        facultyAttend(entityManager, teacherFive, LocalDate.of(2026, 10, 1), "PRESENT", "Cyber Security", "Conducted IS701 security lab", "System Administrator");
        facultyAttend(entityManager, teacherSix, LocalDate.of(2026, 10, 1), "PRESENT", "Cloud Systems", "Conducted DB801 session", "System Administrator");

        // 12. Academic Notifications & Announcements
        notification(entityManager, "STUDENT", s1.getId(), "Assignment deadline reminder", "Software Engineering Studio reflection is due 2026-11-15.", "ASSIGNMENT", "DAP-SEED-NOTE-1");
        notification(entityManager, "STUDENT", s2.getId(), "Attendance review warning", "Data Science attendance is currently below the 75% institutional threshold.", "ATTENDANCE", "DAP-SEED-NOTE-2");
        notification(entityManager, "STUDENT", s5.getId(), "Academic support plan update", "Your tutor has scheduled an office hours check-in for Cloud Computing Architecture.", "INTERVENTION", "DAP-SEED-NOTE-3");
        notification(entityManager, "STUDENT", s11.getId(), "Peer tutoring support allocated", "A peer tutor has been assigned to support you in Algorithm Engineering.", "INTERVENTION", "DAP-SEED-NOTE-3B");
        notification(entityManager, "STUDENT", s19.getId(), "Critical Attendance Hearing Scheduled", "Dean of Academic Affairs has requested an attendance hearing for DS101.", "ATTENDANCE", "DAP-SEED-NOTE-3C");
        notification(entityManager, "TEACHER", teacherOne.getId(), "New consultation appointment", "Meera Kumar requested an office-hour consultation session.", "CONSULTATION", "DAP-SEED-NOTE-4");
        notification(entityManager, "TEACHER", teacherTwo.getId(), "Student support case logged", "New intervention case registered for Priya Sen in Cloud Architecture.", "INTERVENTION", "DAP-SEED-NOTE-5");
        notification(entityManager, "TEACHER", teacherFive.getId(), "Security seminar registration open", "Faculty advisory on OWASP Top 10 curriculum integration.", "ANNOUNCEMENT", "DAP-SEED-NOTE-5B");
        notification(entityManager, "ALL", 0, "Odd Semester Examination Schedule Published", "The timetable for final examinations is now available in the academic portal.", "ANNOUNCEMENT", "DAP-SEED-NOTE-6");
        notification(entityManager, "ALL", 0, "Institutional Analytics Portal Update", "Project 577 academic monitoring tools and What-If simulator are live.", "ANNOUNCEMENT", "DAP-SEED-NOTE-7");
    }

    private Role role(EntityManager entityManager, String name) {
        List<Role> roles = entityManager
            .createQuery("from Role where name=:name", Role.class)
            .setParameter("name", name)
            .getResultList();
        if (!roles.isEmpty()) {
            return roles.get(0);
        }
        Role role = new Role(name);
        entityManager.persist(role);
        return role;
    }

    private Teacher teacher(EntityManager entityManager, BCryptPasswordEncoder passwordEncoder, Role role, String username, String firstName, String lastName, String department) {
        List<Teacher> teachers = entityManager
            .createQuery("from Teacher where userName=:username", Teacher.class)
            .setParameter("username", username)
            .getResultList();
        if (!teachers.isEmpty()) {
            return teachers.get(0);
        }
        Teacher teacher = new Teacher();
        teacher.setUserName(username);
        teacher.setPassword(passwordEncoder.encode(TEST_PASSWORD));
        teacher.setFirstName(firstName);
        teacher.setLastName(lastName);
        teacher.setEmail(username + "@example.edu");
        teacher.setRole(role);
        entityManager.persist(teacher);
        return teacher;
    }

    private Student student(EntityManager entityManager, BCryptPasswordEncoder passwordEncoder, Role role, String username, String firstName, String lastName) {
        List<Student> students = entityManager
            .createQuery("from Student where userName=:username", Student.class)
            .setParameter("username", username)
            .getResultList();
        if (!students.isEmpty()) {
            return students.get(0);
        }
        Student student = new Student();
        student.setUserName(username);
        student.setPassword(passwordEncoder.encode(TEST_PASSWORD));
        student.setFirstName(firstName);
        student.setLastName(lastName);
        student.setEmail(username + "@example.edu");
        student.setRole(role);
        student.setCourses(new ArrayList<>());
        entityManager.persist(student);
        return student;
    }

    private Course course(EntityManager entityManager, String code, String name, Teacher teacher) {
        List<Course> courses = entityManager
            .createQuery("from Course where code=:code", Course.class)
            .setParameter("code", code)
            .getResultList();
        if (!courses.isEmpty()) {
            return courses.get(0);
        }
        Course course = new Course();
        course.setCode(code);
        course.setName(name);
        course.setTeacher(teacher);
        course.setStudents(new ArrayList<>());
        entityManager.persist(course);
        return course;
    }

    private void enroll(EntityManager entityManager, Student student, Course course, List<Integer> grades, boolean completeFirstAssignment) {
        List<StudentCourseDetails> existing = entityManager
            .createQuery("from student_course_details where studentId=:studentId and courseId=:courseId", StudentCourseDetails.class)
            .setParameter("studentId", student.getId())
            .setParameter("courseId", course.getId())
            .getResultList();

        StudentCourseDetails details;
        if (existing.isEmpty()) {
            GradeDetails gradeDetails = new GradeDetails();
            gradeDetails.setGradeOne(grades.get(0));
            gradeDetails.setGradeTwo(grades.get(1));
            gradeDetails.setGradeThree(grades.get(2));
            details = new StudentCourseDetails(student.getId(), course.getId(), new ArrayList<>(), gradeDetails);
            entityManager.persist(details);
        } else {
            details = existing.get(0);
        }

        assignment(entityManager, details, course.getCode() + " Diagnostic Assessment", "Initial diagnostic assessment for " + course.getName(), "2026-10-20", completeFirstAssignment);
        assignment(entityManager, details, course.getCode() + " Project Milestone 1", "Hands-on project deliverable and design reflection", "2026-11-15", false);
    }

    private void assignment(EntityManager entityManager, StudentCourseDetails details, String name, String description, String dueDate, boolean done) {
        List<Assignment> assignments = entityManager
            .createQuery("from Assignment where name=:name", Assignment.class)
            .setParameter("name", name)
            .getResultList();

        Assignment assignment;
        if (assignments.isEmpty()) {
            assignment = new Assignment();
            assignment.setName(name);
            assignment.setDescription(description);
            assignment.setDueDate(dueDate);
            assignment.setDaysRemaining(7);
            entityManager.persist(assignment);
        } else {
            assignment = assignments.get(0);
        }

        if (details.getAssignments() == null) {
            details.setAssignments(new ArrayList<>());
        }
        if (!details.getAssignments().contains(assignment)) {
            details.getAssignments().add(assignment);
        }

        List<AssignmentDetails> existing = entityManager
            .createQuery("from assignment_details where assignmentId=:assignmentId and studentCourseDetailsId=:detailsId", AssignmentDetails.class)
            .setParameter("assignmentId", assignment.getId())
            .setParameter("detailsId", details.getId())
            .getResultList();
        if (existing.isEmpty()) {
            AssignmentDetails assignmentDetails = new AssignmentDetails();
            assignmentDetails.setAssignmentId(assignment.getId());
            assignmentDetails.setStudentCourseDetailsId(details.getId());
            assignmentDetails.setIsDone(done ? 1 : 0);
            entityManager.persist(assignmentDetails);
        } else {
            existing.get(0).setIsDone(done ? 1 : 0);
        }
    }

    private void intervention(EntityManager entityManager, Student student, Teacher teacher, String reason, String plan, String status, String notes) {
        List<InterventionCase> existing = entityManager
            .createQuery("from InterventionCase where studentId=:studentId and reason=:reason", InterventionCase.class)
            .setParameter("studentId", student.getId())
            .setParameter("reason", reason)
            .getResultList();
        if (!existing.isEmpty()) {
            return;
        }
        InterventionCase interventionCase = new InterventionCase();
        interventionCase.setStudentId(student.getId());
        interventionCase.setTeacherId(teacher.getId());
        interventionCase.setReason(reason);
        interventionCase.setActionPlan(plan);
        interventionCase.setStatus(status);
        interventionCase.setStaffNotes(notes);
        entityManager.persist(interventionCase);
    }

    private void availability(EntityManager entityManager, Teacher teacher, String officeLocation, String dayOfWeek, LocalTime startTime, LocalTime endTime, String seedKey) {
        List<FacultyAvailability> existing = entityManager
            .createQuery("from FacultyAvailability where seedKey=:seedKey", FacultyAvailability.class)
            .setParameter("seedKey", seedKey)
            .getResultList();
        if (!existing.isEmpty()) {
            return;
        }
        FacultyAvailability fa = new FacultyAvailability();
        fa.setTeacherId(teacher.getId());
        fa.setOfficeLocation(officeLocation);
        fa.setDayOfWeek(dayOfWeek);
        fa.setStartTime(startTime);
        fa.setEndTime(endTime);
        fa.setNotes("Office hours & consultation availability");
        fa.setSeedKey(seedKey);
        entityManager.persist(fa);
    }

    private void consultation(EntityManager entityManager, Student student, Teacher teacher, LocalDateTime requestedAt, String status, String notes, String seedKey) {
        List<ConsultationRequest> existing = entityManager
            .createQuery("from ConsultationRequest where seedKey=:seedKey", ConsultationRequest.class)
            .setParameter("seedKey", seedKey)
            .getResultList();
        if (!existing.isEmpty()) {
            return;
        }
        ConsultationRequest cr = new ConsultationRequest();
        cr.setStudentId(student.getId());
        cr.setTeacherId(teacher.getId());
        cr.setRequestedAt(requestedAt);
        cr.setStatus(status);
        cr.setStudentNotes(notes);
        cr.setInstructions("CONFIRMED".equals(status) ? "Confirmed. Please meet at faculty cabin." : null);
        cr.setSeedKey(seedKey);
        entityManager.persist(cr);
    }

    private void book(EntityManager entityManager, String title, String author, String category, String isbn, int availableCopies, int totalCopies, String seedKey) {
        List<LibraryBook> existing = entityManager
            .createQuery("from LibraryBook where seedKey=:seedKey", LibraryBook.class)
            .setParameter("seedKey", seedKey)
            .getResultList();
        if (!existing.isEmpty()) {
            return;
        }
        LibraryBook lb = new LibraryBook();
        lb.setTitle(title);
        lb.setAuthor(author);
        lb.setCategory(category);
        lb.setIsbn(isbn);
        lb.setAvailableCopies(availableCopies);
        lb.setTotalCopies(totalCopies);
        lb.setSeedKey(seedKey);
        entityManager.persist(lb);
    }

    private void resource(EntityManager entityManager, Teacher teacher, String courseCode, String title, String description, String resourceUrl, String seedKey) {
        List<LearningResource> existing = entityManager
            .createQuery("from LearningResource where seedKey=:seedKey", LearningResource.class)
            .setParameter("seedKey", seedKey)
            .getResultList();
        if (!existing.isEmpty()) {
            return;
        }
        LearningResource lr = new LearningResource();
        lr.setTeacherId(teacher.getId());
        lr.setCourseCode(courseCode);
        lr.setTitle(title);
        lr.setDescription(description);
        lr.setResourceUrl(resourceUrl);
        lr.setSeedKey(seedKey);
        entityManager.persist(lr);
    }

    private void attend(EntityManager entityManager, Student student, Course course, LocalDate sessionDate, String status, Teacher teacher, String seedKey) {
        List<AttendanceRecord> existing = entityManager
            .createQuery("from AttendanceRecord where (studentId=:studentId and courseId=:courseId and sessionDate=:sessionDate) or seedKey=:seedKey", AttendanceRecord.class)
            .setParameter("studentId", student.getId())
            .setParameter("courseId", course.getId())
            .setParameter("sessionDate", sessionDate)
            .setParameter("seedKey", seedKey)
            .getResultList();
        if (!existing.isEmpty()) {
            AttendanceRecord ar = existing.get(0);
            ar.setStatus(status);
            ar.setRecordedByTeacherId(teacher.getId());
            ar.setSeedKey(seedKey);
            entityManager.merge(ar);
            return;
        }
        AttendanceRecord ar = new AttendanceRecord();
        ar.setStudentId(student.getId());
        ar.setCourseId(course.getId());
        ar.setSessionDate(sessionDate);
        ar.setStatus(status);
        ar.setRecordedByTeacherId(teacher.getId());
        ar.setSeedKey(seedKey);
        entityManager.persist(ar);
    }

    private void facultyAttend(EntityManager entityManager, Teacher teacher, LocalDate sessionDate, String status, String department, String notes, String recordedBy) {
        List<FacultyAttendance> existing = entityManager
            .createQuery("from FacultyAttendance where teacherId=:teacherId and sessionDate=:sessionDate", FacultyAttendance.class)
            .setParameter("teacherId", teacher.getId())
            .setParameter("sessionDate", sessionDate)
            .getResultList();
        if (!existing.isEmpty()) {
            FacultyAttendance fa = existing.get(0);
            fa.setStatus(status);
            fa.setDepartment(department);
            fa.setNotes(notes);
            fa.setRecordedBy(recordedBy);
            entityManager.merge(fa);
            return;
        }
        FacultyAttendance fa = new FacultyAttendance(teacher.getId(), sessionDate, status, department, notes, recordedBy);
        entityManager.persist(fa);
    }

    private void notification(EntityManager entityManager, String recipientRole, int recipientUserId, String title, String message, String notificationType, String seedKey) {
        List<AcademicNotification> existing = entityManager
            .createQuery("from AcademicNotification where seedKey=:seedKey", AcademicNotification.class)
            .setParameter("seedKey", seedKey)
            .getResultList();
        if (!existing.isEmpty()) {
            return;
        }
        AcademicNotification an = new AcademicNotification();
        an.setRecipientRole(recipientRole);
        an.setRecipientUserId(recipientUserId);
        an.setTitle(title);
        an.setMessage(message);
        an.setNotificationType(notificationType);
        an.setRead(false);
        an.setSeedKey(seedKey);
        entityManager.persist(an);
    }
}
