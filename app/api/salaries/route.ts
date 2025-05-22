import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { salaries } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
    try {
        // Verify authentication
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await req.json();
        const {
            employeeId,
            amount,
            effectiveDate,
            reason,
            notes,
            createdById,
        } = body;

        // Validate required fields
        if (!employeeId || !amount || !effectiveDate || !reason) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create salary record
        const [newSalary] = await db
            .insert(salaries)
            .values({
                employeeId,
                amount,
                effectiveDate: new Date(effectiveDate),
                reason,
                notes,
                createdById: createdById || session.user.id,
            })
            .returning();
        return NextResponse.json(newSalary);
    } catch (error) {
        console.error("Error creating salary record:", error);
        return NextResponse.json(
            { error: "Failed to create salary record" },
            { status: 500 }
        );
    }
}

// Get all salary records for an employee
export async function GET(req: NextRequest) {
    try {
        // Verify authentication
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get employeeId from query params
        const { searchParams } = new URL(req.url);
        const employeeId = searchParams.get("employeeId");

        if (!employeeId) {
            return NextResponse.json(
                { error: "Employee ID is required" },
                { status: 400 }
            );
        }

        // Get all salary records for the employee, ordered by effective date
        const salaryRecords = await db
            .select()
            .from(salaries)
            .where(eq(salaries.employeeId, employeeId))
            .orderBy(desc(salaries.effectiveDate));

        return NextResponse.json(salaryRecords);
    } catch (error) {
        console.error("Error fetching salary records:", error);
        return NextResponse.json(
            { error: "Failed to fetch salary records" },
            { status: 500 }
        );
    }
}


