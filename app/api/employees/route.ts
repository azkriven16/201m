import { type NextRequest, NextResponse } from "next/server";
import { createEmployee, getAllEmployees } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Create employee in database using Drizzle
        const employee = await createEmployee({
            fullName: data.fullName,
            position: data.position,
            education: data.education,
            avatar: data.avatar || null,
            birthday: new Date(data.birthday),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json({ success: true, employee });
    } catch (error) {
        console.error("Error creating employee:", error);
        return NextResponse.json(
            { error: "Failed to create employee" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Fetch employees using Drizzle
        const employees = await getAllEmployees();

        return NextResponse.json(employees);
    } catch (error) {
        console.error("Error fetching employees:", error);
        return NextResponse.json(
            { error: "Failed to fetch employees" },
            { status: 500 }
        );
    }
}
