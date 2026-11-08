package com.queryx.user;

/**
 * Roles assignable to internal QueryX system users.
 * Stored as a PostgreSQL ENUM type {@code user_role}.
 */
public enum UserRole {
    ADMIN,
    SUPPORT,
    INVESTIGATOR
}
