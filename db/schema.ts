import { relations } from "drizzle-orm";
import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    uuid,
    pgEnum,
    boolean,
    numeric,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("users", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
});

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccountType>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => [
        {
            compoundKey: primaryKey({
                columns: [account.provider, account.providerAccountId],
            }),
        },
    ]
);

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const authenticators = pgTable(
    "authenticator",
    {
        credentialID: text("credentialID").notNull().unique(),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        providerAccountId: text("providerAccountId").notNull(),
        credentialPublicKey: text("credentialPublicKey").notNull(),
        counter: integer("counter").notNull(),
        credentialDeviceType: text("credentialDeviceType").notNull(),
        credentialBackedUp: boolean("credentialBackedUp").notNull(),
        transports: text("transports"),
    },
    (authenticator) => [
        {
            compositePK: primaryKey({
                columns: [authenticator.userId, authenticator.credentialID],
            }),
        },
    ]
);

// Document status enum
export const documentStatus = pgEnum("document_status", [
    "Active",
    "AboutToExpire",
    "Expired",
]);

// Employee type enum
export const employeeType = pgEnum("employee_type", [
    "Teaching",
    "NonTeaching",
    "cosTeaching",
    "cosNonTeaching",
]);

// Employee model - Updated with new fields
export const employees = pgTable("employees", {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    position: text("position").notNull(),
    employeeType: employeeType("employee_type").notNull().default("Teaching"),
    education: text("education").notNull(),
    avatar: text("avatar"),
    birthday: timestamp("birthday", { mode: "date" }).notNull(),
    // Other fields
    email: text("email"),
    biometricId: text("biometric_id"),
    designation: text("designation"),
    mobileNumber: text("mobile_number"),
    employmentDate: text("employmentDate"),

    // Timestamps
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Salary record reason enum
export const salaryChangeReason = pgEnum("salary_change_reason", [
    "Initial",
    "Annual",
    "Promotion",
    "Performance",
    "Adjustment",
    "Other",
]);

// Salary history table
export const salaries = pgTable("salaries", {
    id: uuid("id").defaultRandom().primaryKey(),
    employeeId: uuid("employee_id")
        .notNull()
        .references(() => employees.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    effectiveDate: timestamp("effective_date", { mode: "date" }).notNull(),
    reason: salaryChangeReason("reason").default("Initial").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    createdById: text("created_by_id").references(() => users.id),
});

export const documents = pgTable("documents", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    path: text("path").notNull(),
    fileKey: text("file_key").notNull().default(""),
    fileName: text("file_name").notNull().default(""),
    category: text("category").notNull(),
    status: documentStatus("status").default("Active").notNull(),
    documentType: text("document_type").notNull(),
    documentSize: text("document_size").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
    expirationDate: timestamp("expiration_date", { mode: "date" }),
    authorId: uuid("author_id")
        .notNull()
        .references(() => employees.id, { onDelete: "cascade" }),
});

// Relations
export const employeesRelations = relations(employees, ({ many }) => ({
    documents: many(documents),
    salaries: many(salaries),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
    author: one(employees, {
        fields: [documents.authorId],
        references: [employees.id],
    }),
}));

export const salariesRelations = relations(salaries, ({ one }) => ({
    employee: one(employees, {
        fields: [salaries.employeeId],
        references: [employees.id],
    }),
    createdBy: one(users, {
        fields: [salaries.createdById],
        references: [users.id],
    }),
}));

// Types
export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type Salary = typeof salaries.$inferSelect;
export type NewSalary = typeof salaries.$inferInsert;