import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import * as XLSX from "xlsx";
import prisma from "@/app/lib/prisma";
import {
  calculateWorkedHours,
  excelTimeToString,
} from "@/app/lib/time";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
  runtime: "nodejs",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({ keepExtensions: true });

    const { files } = await new Promise<any>((resolve, reject) => {
      form.parse(req, (err, _fields, files) => {
        if (err) reject(err);
        resolve({ files });
      });
    });

    const uploadedFile = files.file;
    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = Array.isArray(uploadedFile)
      ? uploadedFile[0].filepath
      : uploadedFile.filepath;

    const buffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any>(sheet);

    for (const row of rows) {
      const name = row["Employee Name"];
      const rawDate = row["Date"];
      const rawInTime = row["In-Time"];
      const rawOutTime = row["Out-Time"];

      if (!name || !rawDate) continue;

      const date =
        typeof rawDate === "number"
          ? new Date((rawDate - 25569) * 86400 * 1000)
          : new Date(rawDate);

      if (isNaN(date.getTime())) continue;

      const day = date.getDay();

      const employee = await prisma.employee.upsert({
        where: { name },
        update: {},
        create: { name },
      });

      // Delete existing record for same day (prevents duplicates)
      await prisma.attendance.deleteMany({
        where: {
          employeeId: employee.id,
          date,
        },
      });

      const inTime = excelTimeToString(rawInTime);
      const outTime = excelTimeToString(rawOutTime);

      let workedHours = 0;
      let isLeave = false;

      // Sunday → OFF
      if (day !== 0) {
        if (!inTime || !outTime) {
          isLeave = true;
        } else {
          workedHours = calculateWorkedHours(rawInTime, rawOutTime);
        }
      }

      await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          date,
          inTime,
          outTime,
          workedHours,
          isLeave,
        },
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return res.status(500).json({
      error: "Upload failed",
      detail: String(error),
    });
  }
}
