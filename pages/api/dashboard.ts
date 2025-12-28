export const config = {
  runtime: "nodejs",
};

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/app/lib/prisma";

// Calculate expected hours for a month (excluding Sundays)
function getExpectedHours(year: number, month: number) {
  let expected = 0;
  const date = new Date(year, month, 1);

  while (date.getMonth() === month) {
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday

    if (day >= 1 && day <= 5) {
      expected += 8.5; // Mon–Fri
    } else if (day === 6) {
      expected += 4; // Saturday
    }

    date.setDate(date.getDate() + 1);
  }

  return expected;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 🚫 Disable caching completely (fixes 304 issue)
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    const { employee, month } = req.query;

    if (!employee || !month) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const [year, mon] = (month as string).split("-").map(Number);

    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0, 23, 59, 59);

    const emp = await prisma.employee.findUnique({
      where: { name: employee as string },
    });

    if (!emp) {
      return res.status(200).json({
        employee,
        month,
        expectedHours: 0,
        totalWorkedHours: 0,
        leavesUsed: 0,
        maxLeaves: 2,
        productivity: 0,
        daily: [],
      });
    }

    const records = await prisma.attendance.findMany({
      where: {
        employeeId: emp.id,
        date: { gte: start, lte: end },
      },
      orderBy: { date: "asc" },
    });

    let totalWorkedHours = 0;
    let leavesUsed = 0;

    records.forEach(r => {
      const day = new Date(r.date).getDay();

      // Sunday → OFF, do not count
      if (day === 0) return;

      totalWorkedHours += r.workedHours;

      if (r.isLeave) leavesUsed += 1;
    });

    const expectedHours = getExpectedHours(year, mon - 1);

    const productivity =
      expectedHours === 0
        ? 0
        : Number(((totalWorkedHours / expectedHours) * 100).toFixed(2));

    return res.status(200).json({
      employee: emp.name,
      month,
      expectedHours,
      totalWorkedHours,
      leavesUsed,
      maxLeaves: 2,
      productivity,
      daily: records,
    });
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    return res.status(500).json({ error: "Dashboard failed" });
  }
}
