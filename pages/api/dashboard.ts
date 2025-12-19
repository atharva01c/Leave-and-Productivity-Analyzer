export const config = {
  runtime: "nodejs",
};

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/app/lib/prisma";

function getExpectedHours(year: number, month: number) {
  let expected = 0;
  const date = new Date(year, month, 1);

  while (date.getMonth() === month) {
    const day = date.getDay(); // 0 = Sun, 6 = Sat

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
      return res.status(404).json({ error: "Employee not found" });
    }

    const records = await prisma.attendance.findMany({
      where: {
        employeeId: emp.id,
        date: { gte: start, lte: end },
      },
      orderBy: { date: "asc" },
    });

    const totalWorked = records.reduce(
      (sum, r) => sum + r.workedHours,
      0
    );

    const leavesUsed = records.filter(r => r.isLeave).length;
    const expectedHours = getExpectedHours(year, mon - 1);

    const productivity =
      expectedHours === 0
        ? 0
        : Math.round((totalWorked / expectedHours) * 100);

    return res.status(200).json({
      employee: emp.name,
      month,
      expectedHours,
      totalWorkedHours: totalWorked,
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
