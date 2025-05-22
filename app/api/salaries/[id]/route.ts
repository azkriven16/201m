import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { salaries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

// Get a specific salary record
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<any> }
) {
    try {
        // Verify authentication
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Find the salary record
        const [salaryRecord] = await db
            .select()
            .from(salaries)
            .where(eq(salaries.id, id));

        if (!salaryRecord) {
            return NextResponse.json(
                { error: "Salary record not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(salaryRecord);
    } catch (error) {
        console.error("Error fetching salary record:", error);
        return NextResponse.json(
            { error: "Failed to fetch salary record" },
            { status: 500 }
        );
    }
}

// Update a salary record
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<any> }
) {
    try {
        // Verify authentication
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { amount, effectiveDate, reason, notes } = body;

        // Validate required fields
        if (!amount && !effectiveDate && !reason) {
            return NextResponse.json(
                { error: "At least one field must be provided" },
                { status: 400 }
            );
        }

        // Find the salary record first to make sure it exists
        const [existingSalary] = await db
            .select()
            .from(salaries)
            .where(eq(salaries.id, id));

        if (!existingSalary) {
            return NextResponse.json(
                { error: "Salary record not found" },
                { status: 404 }
            );
        }

        // Build update object
        const updateData: Record<string, any> = {};
        if (amount !== undefined) updateData.amount = amount;
        if (effectiveDate !== undefined)
            updateData.effectiveDate = new Date(effectiveDate);
        if (reason !== undefined) updateData.reason = reason;
        if (notes !== undefined) updateData.notes = notes;

        // Update the salary record
        const [updatedSalary] = await db
            .update(salaries)
            .set(updateData)
            .where(eq(salaries.id, id))
            .returning();

        return NextResponse.json(updatedSalary);
    } catch (error) {
        console.error("Error updating salary record:", error);
        return NextResponse.json(
            { error: "Failed to update salary record" },
            { status: 500 }
        );
    }
}

// Delete a salary record
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<any> }
) {
    try {
        // Verify authentication
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Delete the salary record
        const [deletedSalary] = await db
            .delete(salaries)
            .where(eq(salaries.id, id))
            .returning();

        if (!deletedSalary) {
            return NextResponse.json(
                { error: "Salary record not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting salary record:", error);
        return NextResponse.json(
            { error: "Failed to delete salary record" },
            { status: 500 }
        );
    }
}
