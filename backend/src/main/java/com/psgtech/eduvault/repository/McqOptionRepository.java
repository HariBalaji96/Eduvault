package com.psgtech.eduvault.repository;

import com.psgtech.eduvault.entity.McqOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface McqOptionRepository extends JpaRepository<McqOption, Long> {
}
