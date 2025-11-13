package com.example.iam_service.specification;

import com.example.iam_service.model.User;
import com.example.shared.enums.Gender;
import com.example.shared.enums.UserStatus;
import jakarta.persistence.criteria.Expression;
import lombok.experimental.UtilityClass;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

@UtilityClass
public class UserSpecification {

    private static final boolean USE_UNACCENT = false; // set true only if your DB has unaccent()

    private static String escapeLike(String input) {
        if (input == null) return null;
        // first replace backslash, then % and _, so resulting backslashes kept correctly
        return input.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    public static Specification<User> hasEmail(String email) {
        if (StringUtils.isBlank(email)) return null;
        String normalized = "%" + escapeLike(email.trim()).toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("email")), normalized);
    }

    public static Specification<User> hasPhoneNumber(String phoneNumber) {
        if (StringUtils.isBlank(phoneNumber)) return null;
        String p = "%" + escapeLike(phoneNumber.trim()) + "%";
        // phone matching usually case-insensitive not needed; keep as is
        return (root, query, cb) -> cb.like(root.get("phoneNumber"), p);
    }

    public static Specification<User> hasStudentId(String studentId) {
        if (StringUtils.isBlank(studentId)) return null;
        String p = "%" + escapeLike(studentId.trim()).toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("studentId")), p);
    }

    public static Specification<User> hasEmailExact(String email) {
        if (StringUtils.isBlank(email)) return null;
        return (root, query, cb) -> cb.equal(cb.lower(root.get("email")), email.trim().toLowerCase());
    }

    public static Specification<User> hasFullName(String fullName) {
        if (StringUtils.isBlank(fullName)) return null;
        String term = fullName.trim();
        boolean hasAccent = !term.equals(StringUtils.stripAccents(term));
        String pattern = "%" + escapeLike((hasAccent ? term : StringUtils.stripAccents(term)).toLowerCase()) + "%";

        return (root, query, cb) -> {
            Expression<String> columnExpr;
            if (hasAccent) {
                columnExpr = cb.lower(root.get("fullName"));
            } else {
                if (USE_UNACCENT) {
                    // only use this if your DB has unaccent()
                    columnExpr = cb.function("unaccent", String.class, cb.lower(root.get("fullName")));
                } else {
                    // fallback to comparing lower-case without unaccent
                    columnExpr = cb.lower(root.get("fullName"));
                }
            }
            return cb.like(columnExpr, pattern);
        };
    }

    public static Specification<User> hasRole(String role) {
        return (root, query, cb) -> cb.equal(root.get("role"), role);
    }

    public static Specification<User> hasGender(Gender gender) {
        return (root, query, cb) -> cb.equal(root.get("gender"), gender);
    }

    public static Specification<User> hasStatus(UserStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }


    public static Specification<User> isDeleted(Boolean isDeleted) {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), isDeleted);
    }
}
