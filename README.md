# Leave-productivity-analyzer
A full stack web application that analyzes employee attendance, leave usage, and productivity using Excel attendance data. The application processes uploaded Excel files, applies predefined business rules, and presents a monthly dashboard with productivity insights.

FEATURES:

Upload Excel attendance files in xlsx format

Parse employee attendance data

Calculate daily worked hours

Automatically mark leave days

Monthly productivity analysis

Dashboard showing expected hours, worked hours, leaves used, and productivity percentage

Daily attendance breakdown table


BUSINESS RULES IMPLEMENTED:

Working Hours on Monday to Friday: 8.5 hours per day from 10:00 AM to 6:30 PM

Working Hours on Saturday: 4 hours per day from 10:00 AM to 2:00 PM

Sunday: Off

Leave Policy

Each employee is allowed 2 leaves per month

Missing attendance on a working day is considered a leave


PRODUCTIVITY CALCULATION:

Productivity = (Actual Worked Hours / Expected Working Hours) × 100


TECH STACK:

Frontend: Next.js, TypeScript, Tailwind CSS

Backend: Next.js API Routes

Database: MongoDB

ORM: Prisma

Excel Parsing: xlsx


HOW TO RUN LOCALLY:

Clone the repository
git clone https://github.com/your-username/leave-productivity-analyzer.git
Install dependencies
npm install
Create a .env file and add the MongoDB connection string
DATABASE_URL=your_mongodb_connection_string
Push the Prisma schema to the database
npx prisma db push
Start the development server
npm run dev
Open the application in the browser

http://localhost:3000