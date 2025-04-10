import { type NextRequest, NextResponse } from "next/server";
import { getEmployeeById, updateEmployee, deleteEmployee } from "@/lib/db";
import { NewEmployee } from "@/db/schema";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<any> }
) {
    try {
        // Ensure params is awaited
        const { id } = await params;

        // Fetch employee using Drizzle
        const employee = await getEmployeeById(id);

        if (!employee) {
            return NextResponse.json(
                { error: "Employee not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(employee);
    } catch (error) {
        console.error("Error fetching employee:", error);
        return NextResponse.json(
            { error: "Failed to fetch employee" },
            { status: 500 }
        );
    }
}

// Update the PATCH handler to properly handle avatar updates and ensure valid JSON responses
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<any> }
) {
    try {
        // Ensure params is awaited
        const { id } = await params;
        const data = await request.json();

        console.log("Updating employee with data:", {
            id,
            ...data,
            avatar: data.avatar ? "Avatar URL exists" : "No avatar URL",
        });

        // Check if employee exists
        const existingEmployee = await getEmployeeById(id);

        if (!existingEmployee) {
            return NextResponse.json(
                { error: "Employee not found" },
                { status: 404 }
            );
        }

        // Prepare update data with explicit handling of all fields
        const updateData: Partial<NewEmployee> = {
            fullName: data.fullName,
            employeeType: data.employeeType,
            position: data.position,
            education: data.education,
            // Explicitly handle avatar field - don't use undefined
            avatar:
                data.avatar === undefined
                    ? existingEmployee.avatar
                    : data.avatar,
            birthday: data.birthday
                ? new Date(data.birthday)
                : existingEmployee.birthday,
            // New fields - preserve existing values if not provided
            email:
                data.email === undefined
                    ? existingEmployee.email
                    : data.email || null,
            mobileNumber:
                data.mobileNumber === undefined
                    ? existingEmployee.mobileNumber
                    : data.mobileNumber || null,
            biometricId:
                data.biometricId === undefined
                    ? existingEmployee.biometricId
                    : data.biometricId || null,
            designation:
                data.designation === undefined
                    ? existingEmployee.designation
                    : data.designation || null,
            // Update timestamp
            updatedAt: new Date(),
        };

        console.log("Final update data:", {
            ...updateData,
            avatar: updateData.avatar ? "Avatar URL exists" : "No avatar URL",
        });

        // Update employee in database using Drizzle
        const updatedEmployee = await updateEmployee(id, updateData);

        if (!updatedEmployee) {
            return NextResponse.json(
                { error: "Failed to update employee" },
                { status: 500 }
            );
        }

        // Ensure we return a valid JSON response
        return NextResponse.json({
            success: true,
            employee: updatedEmployee,
        });
    } catch (error) {
        console.error("Error updating employee:", error);
        // Ensure we return a valid JSON response even in error cases
        return NextResponse.json(
            {
                error: "Failed to update employee",
                message:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<any> }
) {
    try {
        // Ensure params is awaited
        const { id } = await params;

        // Check if employee exists
        const existingEmployee = await getEmployeeById(id);

        if (!existingEmployee) {
            return NextResponse.json(
                { error: "Employee not found" },
                { status: 404 }
            );
        }

        // Delete employee from database using Drizzle
        const success = await deleteEmployee(id);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to delete employee" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting employee:", error);
        return NextResponse.json(
            { error: "Failed to delete employee" },
            { status: 500 }
        );
    }
}
