import { type NextRequest, NextResponse } from "next/server";
import { createEmployee, getAllEmployees } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        console.log("Creating employee with data:", {
            ...data,
            avatar: data.avatar ? "Avatar URL exists" : "No avatar URL",
        });

        // Create employee in database using Drizzle
        const employee = await createEmployee({
            fullName: data.fullName,
            employeeType: data.employeeType,
            position: data.position,
            education: data.education,
            avatar: data.avatar || null,
            birthday: new Date(data.birthday),
            // New fields
            email: data.email || null,
            mobileNumber: data.mobileNumber || null,
            biometricId: data.biometricId || null,
            designation: data.designation || null,
            // Timestamps
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
