"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt = __importStar(require("bcryptjs"));
const client_1 = require("../src/generated/prisma/client");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    const specializationNames = ['Umum', 'Gigi', 'Anak', 'Penyakit Dalam', 'Kandungan'];
    for (const name of specializationNames) {
        await prisma.specialization.upsert({
            where: { name },
            update: {},
            create: { name, status: 'ACTIVE' },
        });
    }
    console.log(`✔ ${specializationNames.length} specializations siap.`);
    const adminEmail = 'admin@clinic.local';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingAdmin) {
        console.log('✔ Akun admin sudah ada, dilewati.');
        return;
    }
    const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
    await prisma.user.create({
        data: {
            username: 'admin',
            email: adminEmail,
            passwordHash,
            role: 'ADMIN',
            emailVerifiedAt: new Date(),
            profile: {
                create: { fullName: 'Administrator' },
            },
            admin: {
                create: {},
            },
        },
    });
    console.log(`✔ Akun admin dibuat -> email: ${adminEmail} | password: ChangeMe123!`);
    console.log('  Ganti password ini lewat change-password use-case setelah login pertama.');
}
main()
    .catch((error) => {
    console.error('Seed gagal:', error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map