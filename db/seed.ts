import { db } from "../db";
import { employees } from "../db/schema";

// Function to generate a random date within a range
function randomDate(start: Date, end: Date): Date {
    return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
}

// Function to generate a random phone number
function randomPhoneNumber(): string {
    const prefixes = ["+63", "+1", "+44", "+61", "+65"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 10000000000)
        .toString()
        .padStart(10, "0");
    return `${prefix}${number}`;
}

// Function to generate a random biometric ID
function randomBiometricId(): string {
    const prefix = "BIO";
    const number = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
    return `${prefix}${number}`;
}

// Sample data for generating employees
const firstNames = [
    "John",
    "Maria",
    "Carlos",
    "Anna",
    "David",
    "Sofia",
    "Miguel",
    "Elena",
    "James",
    "Isabella",
    "Luis",
    "Sophia",
    "Antonio",
    "Olivia",
    "Jose",
    "Emma",
    "Francisco",
    "Ava",
    "Pedro",
    "Mia",
    "Alejandro",
    "Amelia",
    "Gabriel",
    "Charlotte",
    "Manuel",
    "Abigail",
    "Ricardo",
    "Emily",
    "Fernando",
    "Elizabeth",
];

const lastNames = [
    "Santos",
    "Garcia",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Perez",
    "Sanchez",
    "Ramirez",
    "Torres",
    "Flores",
    "Rivera",
    "Gomez",
    "Diaz",
    "Reyes",
    "Cruz",
    "Morales",
    "Ortiz",
    "Gutierrez",
    "Chavez",
    "Ramos",
    "Ruiz",
    "Alvarez",
    "Mendoza",
    "Vasquez",
    "Castillo",
    "Jimenez",
    "Moreno",
    "Romero",
];

const academicRanks = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Instructor",
    "Lecturer",
    "Adjunct Professor",
    "Research Professor",
    "Clinical Professor",
    "Visiting Professor",
    "Professor Emeritus",
];

const departments = [
    "Computer Science",
    "Engineering",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Business Administration",
    "Economics",
    "Psychology",
    "Sociology",
    "History",
    "English",
    "Philosophy",
    "Political Science",
    "Education",
];

const educationalAttainments = [
    "Ph.D. in Computer Science",
    "Ph.D. in Engineering",
    "Ph.D. in Mathematics",
    "Ph.D. in Physics",
    "Ph.D. in Chemistry",
    "Master's in Business Administration",
    "Master's in Economics",
    "Master's in Psychology",
    "Master's in Education",
    "Master's in Public Health",
    "Bachelor's in Computer Science",
    "Bachelor's in Engineering",
    "Bachelor's in Mathematics",
    "Bachelor's in Business",
    "Bachelor's in Education",
];

const designations = [
    "Department Chair",
    "Program Director",
    "Dean",
    "Associate Dean",
    "Research Coordinator",
    "Curriculum Coordinator",
    "Faculty Senate Chair",
    "Graduate Program Director",
    "Undergraduate Advisor",
    "Committee Chair",
    "Lab Director",
    "Center Director",
    "Institute Director",
    "Project Lead",
    "Faculty Development Coordinator",
];

// Generate a random employee
function generateEmployee() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@university.edu`;

    const department =
        departments[Math.floor(Math.random() * departments.length)];
    const academicRank =
        academicRanks[Math.floor(Math.random() * academicRanks.length)];
    const position = `${academicRank}, ${department}`;

    const education =
        educationalAttainments[
            Math.floor(Math.random() * educationalAttainments.length)
        ];
    const designation =
        Math.random() > 0.3
            ? designations[Math.floor(Math.random() * designations.length)]
            : null;

    // 80% chance of having a mobile number
    const mobileNumber = Math.random() > 0.2 ? randomPhoneNumber() : null;

    // 70% chance of having a biometric ID
    const biometricId = Math.random() > 0.3 ? randomBiometricId() : null;

    // Generate a birthday between 25 and 70 years ago
    const now = new Date();
    const minBirthYear = now.getFullYear() - 70;
    const maxBirthYear = now.getFullYear() - 25;
    const birthday = randomDate(
        new Date(minBirthYear, 0, 1),
        new Date(maxBirthYear, 11, 31)
    );

    // Generate a join date between 1 and 20 years ago
    const minJoinYear = now.getFullYear() - 20;
    const maxJoinYear = now.getFullYear() - 1;
    const createdAt = randomDate(
        new Date(minJoinYear, 0, 1),
        new Date(maxJoinYear, 11, 31)
    );

    return {
        id: crypto.randomUUID(),
        fullName,
        position,
        education,
        avatar: null, // No avatar for seed data
        birthday,
        email,
        mobileNumber,
        biometricId,
        designation,
        createdAt,
        updatedAt: createdAt,
    };
}

async function seed() {
    console.log("🌱 Starting seed process...");

    try {
        // Generate 50 employees
        const employeeCount = 50;
        const employeeData = Array.from(
            { length: employeeCount },
            generateEmployee
        );

        console.log(`Generating ${employeeCount} employees...`);

        // Insert employees in batches of 10
        const batchSize = 10;
        for (let i = 0; i < employeeData.length; i += batchSize) {
            const batch = employeeData.slice(i, i + batchSize);
            await db.insert(employees).values(batch);
            console.log(
                `Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
                    employeeData.length / batchSize
                )}`
            );
        }

        console.log("✅ Seed completed successfully!");
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Run the seed function
seed();
