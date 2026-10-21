package com.Studentmangment.studentmanagement.dao;

import java.util.List;

import javax.persistence.EntityManager;

import org.hibernate.Session;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.Studentmangment.studentmanagement.entity.AssignmentDetails;
import com.Studentmangment.studentmanagement.entity.StudentCourseDetails;

@Repository
public class AssignmentDetailsDaoImpl implements AssignmentDetailsDao {
	
	@Autowired
	private EntityManager entityManager;
	
	@Override
	public AssignmentDetails findByAssignmentAndStudentCourseDetailsId(int assignmentId,
			int studentCourseDetailsId) {
		Session session = entityManager.unwrap(Session.class);
		Query<AssignmentDetails> query = session
				.createQuery("from assignment_details where assignmentId=:assignmentId AND studentCourseDetailsId=:detailsId", 
				AssignmentDetails.class);
		query.setParameter("assignmentId", assignmentId);
		query.setParameter("detailsId", studentCourseDetailsId);
		
		
		List<AssignmentDetails> results = query.getResultList();
		return results.isEmpty() ? null : results.get(0);
	}

	@Override
	public void save(AssignmentDetails studentCourseAssignmentDetails) {
		Session session = entityManager.unwrap(Session.class);
		session.saveOrUpdate(studentCourseAssignmentDetails);
	}

}
