package com.Studentmangment.studentmanagement.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.Studentmangment.studentmanagement.service.StudentService;
import com.Studentmangment.studentmanagement.service.TeacherService;

@Configuration
@EnableWebSecurity
public class DemoSecurityConfig extends WebSecurityConfigurerAdapter {
	
	@Autowired
	private StudentService studentService;
	
	@Autowired
	private TeacherService teacherService;
	
	
	@Autowired
	private CustomAuthenticationSuccessHandler customAuthenticationSuccessHandler;
	
	public org.springframework.security.authentication.dao.DaoAuthenticationProvider studentAuthenticationProvider() {
		org.springframework.security.authentication.dao.DaoAuthenticationProvider auth = new org.springframework.security.authentication.dao.DaoAuthenticationProvider();
		auth.setUserDetailsService(studentService);
		auth.setPasswordEncoder(passwordEncoder());
		return auth;
	}

	public org.springframework.security.authentication.dao.DaoAuthenticationProvider teacherAuthenticationProvider() {
		org.springframework.security.authentication.dao.DaoAuthenticationProvider auth = new org.springframework.security.authentication.dao.DaoAuthenticationProvider();
		auth.setUserDetailsService(teacherService);
		auth.setPasswordEncoder(passwordEncoder());
		return auth;
	}

	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		// Register student, teacher and in-memory admin authentication providers
		auth.authenticationProvider(studentAuthenticationProvider());
		auth.authenticationProvider(teacherAuthenticationProvider());
		
		auth.inMemoryAuthentication()
	        .withUser("admin")
	        .password(passwordEncoder().encode("1"))
	        .roles("ADMIN");
	}
	
	@Override
	@Bean
	public org.springframework.security.authentication.AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.cors().and()
			.csrf().ignoringAntMatchers("/api/**")
			.and()
			.authorizeRequests()
			.antMatchers(
				"/showLoginPage",
				"/login",
				"/authenticateTheUser",
				"/register/**",
				"/css/**",
				"/js/**",
				"/images/**",
				"/webjars/**",
				"/access-denied",
				"/api/auth/**"
			).permitAll()
			.antMatchers("/admin/**", "/api/admin/**").hasAnyAuthority("ROLE_ADMIN", "ADMIN")
			.antMatchers("/student/**", "/api/students/**").hasAnyAuthority("ROLE_STUDENT", "STUDENT", "ROLE_ADMIN", "ADMIN", "ROLE_TEACHER", "TEACHER")
			.antMatchers("/teacher/**", "/api/teachers/**").hasAnyAuthority("ROLE_TEACHER", "TEACHER", "ROLE_ADMIN", "ADMIN")
			.antMatchers("/api/courses/**").authenticated()
			.anyRequest().authenticated()
			.and()
			.formLogin()
				.loginPage("/showLoginPage")
				.loginProcessingUrl("/authenticateTheUser")
				.successHandler(customAuthenticationSuccessHandler)
				.permitAll()
			.and()
			.logout()
				.logoutUrl("/logout")
				.logoutSuccessUrl("/showLoginPage?logout")
				.permitAll()
			.and()
			.exceptionHandling()
				.defaultAuthenticationEntryPointFor(
					new org.springframework.security.web.authentication.HttpStatusEntryPoint(org.springframework.http.HttpStatus.UNAUTHORIZED),
					new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/api/**")
				)
				.accessDeniedPage("/access-denied");
	}
	
	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}


