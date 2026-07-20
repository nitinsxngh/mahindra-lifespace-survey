import { config as loadEnv } from "dotenv";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";
import mongoose from "mongoose";
import {
  buildInviteUrl,
  cellToPhone,
  cellToString,
  generateInviteToken,
} from "../src/lib/invite";

loadEnv({ path: path.resolve(process.cwd(), ".env") });
loadEnv({ path: path.resolve(process.cwd(), ".env.local"), override: true });

const MONGODB_URI = process.env.MONGODB_URI;
const BASE_URL = process.env.SURVEY_BASE_URL || "http://localhost:3000";

const INPUT_PATH =
  process.argv[2] ||
  path.resolve(process.cwd(), "Documents/Test-Demo-Survey.xlsx");

const OUTPUT_PATH =
  process.argv[3] ||
  path.resolve(process.cwd(), "Documents/Test-Demo-Survey-with-links.xlsx");

const InviteSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, index: true },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    tower: { type: String, default: "" },
    unitNumber: { type: String, required: true, index: true },
    sapCustomerCode: { type: String, default: "", index: true },
    bookingDate: { type: Date, default: null },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

InviteSchema.index(
  { sapCustomerCode: 1, unitNumber: 1, phone: 1 },
  { unique: true }
);

function parseBookingDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const asDate = new Date(String(value));
  return Number.isNaN(asDate.getTime()) ? null : asDate;
}

async function main() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in .env");
  }

  if (!fs.existsSync(INPUT_PATH)) {
    throw new Error(`Excel file not found: ${INPUT_PATH}`);
  }

  await mongoose.connect(MONGODB_URI);
  const Invite =
    mongoose.models.Invite || mongoose.model("Invite", InviteSchema);

  const workbook = XLSX.readFile(INPUT_PATH);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: true,
  });

  if (rows.length === 0) {
    throw new Error("Excel file has no data rows");
  }

  console.log(`Found ${rows.length} rows in "${sheetName}"`);
  console.log(`Base URL: ${BASE_URL}`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  const outputRows: Record<string, unknown>[] = [];

  for (const [index, row] of rows.entries()) {
    const phone = cellToPhone(row["Applicant Mobile"]);
    const unitNumber = cellToString(row["Unit Number"]);
    const sapCustomerCode = cellToString(row["SAP Customer Code"]);
    const name = cellToString(row["Primary Applicant Name"]);
    const email = cellToString(row["Applicant Email"]);
    const tower = cellToString(row["Tower"]);
    const bookingDate = parseBookingDate(row["Booking Date"]);

    if (!phone || phone.length !== 10 || !unitNumber) {
      skipped += 1;
      console.warn(
        `Row ${index + 2}: skipped (missing phone/unit). phone=${phone} unit=${unitNumber}`
      );
      outputRows.push({ ...row, Link: "" });
      continue;
    }

    const existing = await Invite.findOne({
      sapCustomerCode,
      unitNumber,
      phone,
    });

    let token = existing?.token as string | undefined;
    if (!existing) {
      token = generateInviteToken();
      await Invite.create({
        token,
        phone,
        name,
        email,
        tower,
        unitNumber,
        sapCustomerCode,
        bookingDate,
        completed: false,
        completedAt: null,
      });
      created += 1;
    } else {
      existing.name = name;
      existing.email = email;
      existing.tower = tower;
      existing.bookingDate = bookingDate;
      await existing.save();
      updated += 1;
    }

    const link = buildInviteUrl(token!, BASE_URL);
    outputRows.push({ ...row, Link: link });
  }

  const outSheet = XLSX.utils.json_to_sheet(outputRows);
  const outWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(outWorkbook, outSheet, sheetName);
  XLSX.writeFile(outWorkbook, OUTPUT_PATH);

  console.log(`\nDone.`);
  console.log(`  Created invites: ${created}`);
  console.log(`  Updated invites: ${updated}`);
  console.log(`  Skipped rows:    ${skipped}`);
  console.log(`  Output file:     ${OUTPUT_PATH}`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Link generation failed:", error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
