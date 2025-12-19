"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any>(null);
  const [month, setMonth] = useState("2024-01");

  async function uploadFile() {
    if (!file) return alert("Select a file");

    const form = new FormData();
    form.append("file", file);

    await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    alert("Excel uploaded successfully");
    loadDashboard();
  }

  async function loadDashboard() {
    const res = await fetch(
      `/api/dashboard?employee=John Doe&month=${month}`
    );
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    loadDashboard();
  }, [month]);

  return (
    <main className="p-10 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-10 text-center text-gray-900">
        Leave & Productivity Analyzer
      </h1>

      {/* ================= Upload Section ================= */}
      <div className="border border-gray-300 rounded-xl p-6 mb-12 bg-white shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Upload Attendance Excel
        </h2>

        <input
          id="excel-upload"
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={e => setFile(e.target.files?.[0] || null)}
        />

        <label
          htmlFor="excel-upload"
          className="underline text-blue-700 cursor-pointer font-medium"
        >
          Choose file
        </label>

        {file && (
          <span className="ml-3 text-gray-700 font-medium">
            {file.name}
          </span>
        )}

        <div className="mt-4">
          <button
            onClick={uploadFile}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Upload Excel
          </button>
        </div>
      </div>

      {/* ================= Dashboard Section ================= */}
      {data && (
        <div className="border border-gray-300 rounded-xl p-8 bg-gray-100 shadow-lg">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Monthly Dashboard
            </h2>

            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="border border-gray-400 rounded-md px-3 py-1 bg-white text-gray-900"
            />
          </div>

          {/* ================= Summary Cards ================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="p-5 bg-slate-50 border border-gray-300 rounded-lg shadow text-center">
              <p className="text-sm text-gray-700 font-medium">
                Expected Hours
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {data.expectedHours}
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-gray-300 rounded-lg shadow text-center">
              <p className="text-sm text-gray-700 font-medium">
                Worked Hours
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {data.totalWorkedHours}
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-gray-300 rounded-lg shadow text-center">
              <p className="text-sm text-gray-700 font-medium">
                Leaves Used
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {data.leavesUsed} / {data.maxLeaves}
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-gray-300 rounded-lg shadow text-center">
              <p className="text-sm text-gray-700 font-medium">
                Productivity
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {data.productivity}%
              </p>
            </div>
          </div>

          {/* ================= Attendance Table ================= */}
          <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white">
            <table className="w-full text-gray-900">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-3">Date</th>
                  <th className="border p-3">In</th>
                  <th className="border p-3">Out</th>
                  <th className="border p-3">Hours</th>
                  <th className="border p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.daily.map((d: any) => (
                  <tr
                    key={d.id}
                    className="text-center hover:bg-gray-50"
                  >
                    <td className="border p-3">
                      {new Date(d.date).toDateString()}
                    </td>
                    <td className="border p-3">{d.inTime || "-"}</td>
                    <td className="border p-3">{d.outTime || "-"}</td>
                    <td className="border p-3">{d.workedHours}</td>
                    <td className="border p-3">
                      {d.isLeave ? (
                        <span className="text-red-700 font-semibold">
                          Leave
                        </span>
                      ) : (
                        <span className="text-green-700 font-semibold">
                          Present
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
