import { NextResponse } from "next/server";
import { db } from "../db";
import {
    documents,
    employees,
    salaries,
    Salary,
    type Document,
    type Employee,
    type NewDocument,
    type NewEmployee,
} from "../db/schema";
import { eq, desc, asc } from "drizzle-orm";

// Define a type for documents with authors included
export interface DocumentWithAuthor extends Document {
    author: Employee | null;
}

// Employee functions
export async function getAllEmployees(): Promise<Employee[]> {
    return db.select().from(employees).orderBy(asc(employees.fullName));
}

export async function getEmployeeById(
    id: string
): Promise<Employee | undefined> {
    const results = await db
        .select()
        .from(employees)
        .where(eq(employees.id, id));
    return results[0];
}

export async function createEmployee(data: NewEmployee): Promise<Employee> {
    const result = await db.insert(employees).values(data).returning();
    return result[0];
}

// Update the updateEmployee function to properly handle avatar updates
export async function updateEmployee(
    id: string,
    data: Partial<NewEmployee>
): Promise<Employee | undefined> {
    console.log("Updating employee in database:", {
        id,
        ...data,
        avatar: data.avatar ? "Avatar URL exists" : "No avatar URL",
    });

    try {
        const result = await db
            .update(employees)
            .set(data)
            .where(eq(employees.id, id))
            .returning();

        console.log(
            "Update result:",
            result.length > 0
                ? "Employee updated successfully"
                : "No employee updated"
        );
        return result[0];
    } catch (error) {
        console.error("Database error updating employee:", error);
        throw error;
    }
}

export async function deleteEmployee(id: string): Promise<boolean> {
    const result = await db
        .delete(employees)
        .where(eq(employees.id, id))
        .returning({ id: employees.id });
    return result.length > 0;
}

// Document functions
// Update the getAllDocuments function to return DocumentWithAuthor[]
export async function getAllDocuments(): Promise<DocumentWithAuthor[]> {
    const results = await db
        .select({
            document: documents,
            employee: employees,
        })
        .from(documents)
        .leftJoin(employees, eq(documents.authorId, employees.id))
        .orderBy(desc(documents.createdAt));

    // Transform the results to include the author property
    return results.map((row) => ({
        ...row.document,
        author: row.employee,
    }));
}

export async function getDocumentById(
    id: string
): Promise<DocumentWithAuthor | undefined> {
    const results = await db
        .select({
            document: documents,
            employee: employees,
        })
        .from(documents)
        .leftJoin(employees, eq(documents.authorId, employees.id))
        .where(eq(documents.id, id));

    if (results.length === 0) return undefined;

    // Transform the result to include the author property
    return {
        ...results[0].document,
        author: results[0].employee,
    };
}

export async function getDocumentsByEmployeeId(
    employeeId: string
): Promise<Document[]> {
    return db
        .select()
        .from(documents)
        .where(eq(documents.authorId, employeeId))
        .orderBy(desc(documents.createdAt));
}

export async function createDocument(data: NewDocument): Promise<Document> {
    const result = await db.insert(documents).values(data).returning();
    return result[0];
}

export async function updateDocument(
    id: string,
    data: Partial<NewDocument>
): Promise<Document | undefined> {
    const result = await db
        .update(documents)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(documents.id, id))
        .returning();
    return result[0];
}

export async function deleteDocument(id: string): Promise<boolean> {
    const result = await db
        .delete(documents)
        .where(eq(documents.id, id))
        .returning({ id: documents.id });
    return result.length > 0;
}

// Additional utility functions
export async function getDocumentCountByStatus(): Promise<{
    active: number;
    expiringSoon: number;
    expired: number;
}> {
    const allDocuments = await db.select().from(documents);

    return {
        active: allDocuments.filter((doc) => doc.status === "Active").length,
        expiringSoon: allDocuments.filter(
            (doc) => doc.status === "AboutToExpire"
        ).length,
        expired: allDocuments.filter((doc) => doc.status === "Expired").length,
    };
}

export async function getEmployeeCountByPosition(): Promise<
    Record<string, number>
> {
    const allEmployees = await db.select().from(employees);

    return allEmployees.reduce((acc, employee) => {
        const position = employee.position;
        acc[position] = (acc[position] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
}

export async function getDocumentCountByCategory(): Promise<
    Record<string, number>
> {
    const allDocuments = await db.select().from(documents);

    return allDocuments.reduce((acc, document) => {
        const category = document.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
}

export async function getRecentDocuments(
    limit = 10
): Promise<DocumentWithAuthor[]> {
    const results = await db
        .select({
            document: documents,
            employee: employees,
        })
        .from(documents)
        .leftJoin(employees, eq(documents.authorId, employees.id))
        .orderBy(desc(documents.createdAt))
        .limit(limit);

    // Transform the results to include the author property
    return results.map((row) => ({
        ...row.document,
        author: row.employee,
    }));
}

export async function getSalaryHistoryByEmployeeId(
    employeeId: string
): Promise<NextResponse | Salary[]> {
    const salaryRecords = await db
        .select()
        .from(salaries)
        .where(eq(salaries.employeeId, employeeId))
        .orderBy(desc(salaries.effectiveDate));

    return salaryRecords;
}
