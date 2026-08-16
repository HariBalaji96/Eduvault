package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.ExternalCodingProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExternalCodingProfileRepository extends JpaRepository<ExternalCodingProfile, Long> {
}
