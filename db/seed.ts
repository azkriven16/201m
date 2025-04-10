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
        const facultyData = [
            {
                name: "NEMIA M. BORJA, RGen.",
                academicRank: "",
                designation: "",
            },
            {
                name: "JOEY L. OBOS ABREY, AS Philo",
                academicRank: "",
                designation: "",
            },
            {
                name: "JENNIFER D. DIGNADICE, AMEd",
                academicRank: "",
                designation: "",
            },
            { name: "JENETA R. BISMONTE", academicRank: "", designation: "" },
            {
                name: "LAWTON JOHN S. CABRAN, MSF",
                academicRank: "",
                designation: "",
            },
            {
                name: "HAMILTON R. LA CRUZADA, BSGCS",
                academicRank: "",
                designation: "",
            },
            {
                name: "JOCELYN Q. TOLENTINO, BSCom",
                academicRank: "",
                designation: "",
            },
            { name: "ABEL R. TACLANO", academicRank: "", designation: "" },
            {
                name: "JEROME Z. TACLANO, GCSS",
                academicRank: "",
                designation: "",
            },
            { name: "DANNIER C. DIAZ, BST", academicRank: "", designation: "" },
            {
                name: "BOBBY D. GERARDO, RME, REE, D.ENG.",
                academicRank: "Professor VI",
                designation: "University President",
            },
            {
                name: "EDUARDO B. ABONG JR., MAEd",
                academicRank: "Associate Professor I",
                designation: "Chairperson, BSIT Drafting Technology Department",
            },
            {
                name: "MICHAEL M. ACHAS, Ed. D",
                academicRank: "Associate Professor V",
                designation: "",
            },
            {
                name: "ACAL, Hernan B.",
                academicRank: "Associate Professor IV",
                designation: "",
            },
            {
                name: "AGUPITAN, Jason T.",
                academicRank: "Instructor II",
                designation: "",
            },
            {
                name: "ALABAN, Leovigildo Rey S. Ed. D",
                academicRank: "Instructor I",
                designation: "Dean, College of Fisheries and Allied Sciences",
            },
            {
                name: "ARANETA, JONNAS L.",
                academicRank: "Instructor I",
                designation: "",
            },
            {
                name: "ARABIA, JULIE ANNE S.",
                academicRank: "Instructor I",
                designation: "",
            },
            {
                name: "ANATING, LK GIN P.",
                academicRank: "Instructor I",
                designation: "",
            },
            {
                name: "AROCE, JOHN PAUL C.",
                academicRank: "Instructor I",
                designation: "",
            },
            {
                name: "ELIZABETH G. ALINDOG, Ed.D.",
                academicRank: "Associate Professor IV",
                designation: "",
            },
            {
                name: "BELLA GERTRUDE D. ALPASAN, MAT, MIT",
                academicRank: "Associate Professor IV",
                designation: "Chairperson, BS Civil Engineering",
            },
            {
                name: "CRISPAL M. MRMJE, ME.",
                academicRank: "Associate Professor IV",
                designation: "",
            },
            {
                name: "JAN CARLO T. ARROYO, DIT",
                academicRank: "Assistant Professor II",
                designation: "Director, Scientific Publication",
            },
            {
                name: "MARGAREC G. ASTRONOMIA, ME",
                academicRank: "Associate Professor I",
                designation: "",
            },
            {
                name: "RAELY E. ASTRONOMIA, ME",
                academicRank: "Assistant Professor I",
                designation: "",
            },
            {
                name: "RODEL B. ANTON, MAEd",
                academicRank: "Assistant Professor IV",
                designation: "",
            },
            {
                name: "FARREH G. BACABAC, MBM",
                academicRank: "Assistant Professor IV",
                designation: "",
            },
            {
                name: "CRISTY MAE H. BALCAGAN, MAEd",
                academicRank: "Assistant Professor III",
                designation: "",
            },
            {
                name: "MICHELLE B. BACO, DPA",
                academicRank: "Assistant Professor II",
                designation: "",
            },
            {
                name: "JENNIFER B. DIGNADICE, MAEd",
                academicRank: "Instructor I",
                designation: "",
            },
            {
                name: "CHRYST T. BACOS, MPA",
                academicRank: "Instructor I",
                designation: "",
            },
            {
                name: "ELYMAR L. BACQUAINO, ME",
                academicRank: "Instructor III",
                designation: "",
            },
            {
                name: "NOEL B. BALLARA, Ed.D",
                academicRank: "Associate Professor IV",
                designation: "Director, Management Information System",
            },
            {
                name: "ARNEW J. BALONTONG, MSCS",
                academicRank: "Assistant Professor IV",
                designation: "",
            },
            {
                name: "HARLY ISRAEL G. BANDUJADO, MAEd",
                academicRank: "Assistant Professor III",
                designation: "",
            },
            {
                name: "MARIBEL B. BANDUJO, MPA",
                academicRank: "Assistant Professor III",
                designation: "Chairperson, BS Computer Science",
            },
            {
                name: "JOSEPH T. BANEHIT, MAEd",
                academicRank: "Assistant Professor II",
                designation: "",
            },
            {
                name: "ARNOLD B. BANES, MAT, MIT",
                academicRank: "Assistant Professor II",
                designation: "",
            },
            {
                name: "JESSIE S. BANES, Ph.D",
                academicRank: "Associate Professor I",
                designation: "",
            },
            {
                name: "ANDREA MONICA R. BARBASA",
                academicRank: "Assistant Professor I",
                designation: "",
            },
            {
                name: "JUVY A. BARCELONA, BSE",
                academicRank: "Instructor I",
                designation: "",
            },
            {
                name: "IRENE A. BARGO, MAT, Ed.D",
                academicRank: "Associate Professor I",
                designation: "",
            },
            {
                name: "LOVELI O. BARIA, DIT",
                academicRank: "Assistant Professor I",
                designation: "",
            },
            {
                name: "GLENN GRACE B. BAYHON, MAT",
                academicRank: "Instructor I",
                designation: "",
            },
            {
                name: "REGINA S. BAYHON, Ed.D.",
                academicRank: "Professor I",
                designation: "",
            },
            {
                name: "VANESSA ROSE M. BAYONA, MPA",
                academicRank: "Instructor I",
                designation: "",
            },
            {
                name: "PORTIA T. BEGASO, MPA",
                academicRank: "Assistant Professor IV",
                designation: "",
            },
            {
                name: "MA. FE B. BELASOTO, Ed.D.",
                academicRank: "Associate Professor I",
                designation:
                    "Director, Extension Services, OIC Chairperson of MPA",
            },
            {
                name: "RENE JUN B. BELGICA, MPA",
                academicRank: "Assistant Professor III",
                designation: "",
            },
            {
                name: "MARK JOHN A. BELLEZA, MAEd",
                academicRank: "Assistant Professor I",
                designation: "",
            },
            {
                name: "MARIETH FLOR M. BERNARDEZ, MAT",
                academicRank: "Assistant Professor II",
                designation: "",
            },
        ];

        console.log(`Generating ${facultyData.length} employees...`);

        function transformFacultyData(faculty: any[]) {
            return faculty.map((item) => ({
                id: crypto.randomUUID(),
                fullName: item.name,
                position: `${item.academicRank}, ${item.designation}`,
                education: "",
                avatar: null,
                birthday: new Date(), // Provide a default date
                email: "", // Provide a default email
                mobileNumber: "", // Provide a default mobile number
                biometricId: "", // Provide a default biometricId
                designation: item.designation,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));
        }

        const employeeData = transformFacultyData(facultyData);

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
