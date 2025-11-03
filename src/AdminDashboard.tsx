// src/AdminDashboard.tsx

// =================================================================================================
// --- 1. IMPORTS & SETUP ---
// This section contains all necessary imports from React, Firebase, and other libraries,
// as well as the initial registration for Chart.js.
// =================================================================================================

import React, { useState, useEffect, useMemo } from "react"; // Added useMemo for performance
import { db, auth } from "./firebase";
import {
  collection,
  getDocs,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Layout } from "./Layout";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// =================================================================================================
// --- 2. TYPE DEFINITIONS & UTILITY FUNCTIONS ---
// This section defines the TypeScript interfaces for our data structures and includes helper functions.
// =================================================================================================

type Theme = "light" | "dark";
interface Page {
  name:
    | "Dashboard"
    | "Patient Profiles"
    | "Appointment Management"
    | "Documents"
    | "Chat Management"
    | "Invoice Viewer"
    | "Settings";
  icon: string;
}
interface Patient {
  id: string;
  name: string;
  dob: string;
  lastVisit: string;
  vitals: { bloodPressure: string; pulse: number; weightKg: number };
}
interface Appointment {
  id: string;
  patientName: string;
  time: string;
  date: string;
  type: "Consultation" | "Treatment" | "Follow-up";
  status: "Confirmed" | "Completed" | "Cancelled" | "Pending";
}
interface Document {
  id: string;
  name: string;
  type: "PDF" | "Image" | "Lab Report";
  date: string;
  patientId: string;
}
interface Invoice {
  id: string;
  patientName: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
}

// Add these two missing interfaces
interface ChatThread {
  id: string;
  patientName: string;
  lastMessageText: string;
  lastMessageTimestamp: { seconds: number };
  unreadByAdmin: boolean;
}
interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: { seconds: number } | null;
}

const getStatusClasses = (status: string, theme: Theme) => {
  const isDark = theme === "dark";
  switch (status) {
    case "Confirmed":
    case "Completed":
    case "Paid":
      return isDark
        ? "bg-green-500/20 text-green-400 ring-1 ring-inset ring-green-500/30"
        : "bg-green-100 text-green-800 ring-1 ring-inset ring-green-200";
    case "Pending":
      return isDark
        ? "bg-yellow-500/20 text-yellow-400 ring-1 ring-inset ring-yellow-500/30"
        : "bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200";
    case "Cancelled":
    case "Overdue":
      return isDark
        ? "bg-red-500/20 text-red-400 ring-1 ring-inset ring-red-500/30"
        : "bg-red-100 text-red-800 ring-1 ring-inset ring-red-200";
    default:
      return isDark
        ? "bg-gray-500/20 text-gray-400 ring-1 ring-inset ring-gray-500/30"
        : "bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-200";
  }
};

// =================================================================================================
// --- 3. STANDALONE UI COMPONENTS (PRELOADER & LOGIN) ---
// These components are used outside the main dashboard layout, primarily for the auth flow.
// =================================================================================================

const CreativePreloader: React.FC = () => {
  /* This component remains unchanged */ const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.5 },
    },
  };
  const iconVariants: Variants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 10 },
    },
  };
  const textVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut", delay: 1.5 },
    },
  };
  const icons = [
    "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  ];
  return (
    <div className="flex items-center justify-center h-screen bg-brand-teal">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center flex flex-col items-center"
      >
        <motion.div className="flex justify-center items-center space-x-6">
          <motion.div variants={iconVariants}>
            <svg
              className="w-12 h-12 text-brand-yellow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d={icons[0]}
              />
            </svg>
          </motion.div>
          <motion.div variants={iconVariants}>
            <svg
              className="w-16 h-16 text-brand-yellow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d={icons[1]}
              />
            </svg>
          </motion.div>
          <motion.div variants={iconVariants}>
            <svg
              className="w-12 h-12 text-brand-yellow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d={icons[2]}
              />
            </svg>
          </motion.div>
        </motion.div>
        <motion.div variants={textVariants}>
          <h1 className="text-4xl font-bold text-brand-yellow mt-8 tracking-wider">
            Admin Portal
          </h1>
          <p className="text-white/70">Initializing Services...</p>
        </motion.div>
      </motion.div>
    </div>
  );
};
const LoginPage: React.FC<{
  handleLogin: (e: React.FormEvent<HTMLFormElement>) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  loginError: string;
}> = ({ handleLogin, setEmail, setPassword, loginError }) => {
  /* This component's code is unchanged */ return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-4xl h-[550px] overflow-hidden bg-gray-800 rounded-2xl shadow-2xl border border-white/10"
      >
        <div className="hidden md:block md:w-1/2 bg-brand-teal p-12 text-white flex flex-col justify-center items-center text-center">
          <h2 className="text-4xl font-bold text-brand-yellow">Admin Portal</h2>
          <p className="mt-4 opacity-80 max-w-xs">
            Manage appointments, patient profiles, and invoices with ease.
          </p>
        </div>
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-4">Welcome Back</h2>
          <p className="text-gray-400 mb-8">Please sign in to continue.</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="email"
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              required
            />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              required
            />
            {loginError && (
              <p className="text-red-400 text-sm text-center">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 font-bold text-gray-900 bg-brand-yellow rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow focus:ring-offset-gray-800 transition-all transform hover:scale-105"
            >
              Sign In
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// =================================================================================================
// --- 4. VIEW COMPONENTS (EACH PAGE OF THE DASHBOARD) ---
// Each component here represents a distinct page within the authenticated part of the application.
// =================================================================================================

// --- 4.1 DASHBOARD VIEW ---
const DashboardView = ({
  appointments,
  patients,
  invoices,
  theme,
}: {
  appointments: Appointment[];
  patients: Patient[];
  invoices: Invoice[];
  theme: Theme;
}) => {
  /* This component is now theme-aware */ const [chartView, setChartView] =
    useState<"upcoming" | "past">("upcoming");
  const isDark = theme === "dark";
  const chartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: isDark ? "#e5e7eb" : "#374151" } } },
    scales: {
      y: {
        ticks: { color: isDark ? "#d1d5db" : "#4b5563", beginAtZero: true },
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        ticks: { color: isDark ? "#d1d5db" : "#4b5563" },
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.0)" : "rgba(0, 0, 0, 0.0)",
        },
      },
    },
  };
  const appointmentChartData = {
    labels:
      chartView === "upcoming"
        ? [...Array(7)].map((_, i) =>
            new Date(Date.now() + i * 864e5).toLocaleDateString("en-US", {
              weekday: "short",
            })
          )
        : [...Array(7)].map((_, i) =>
            new Date(Date.now() - (6 - i) * 864e5).toLocaleDateString("en-US", {
              weekday: "short",
            })
          ),
    datasets: [
      {
        label: "Appointments",
        data:
          chartView === "upcoming"
            ? [...Array(7)].map(
                (_, i) =>
                  appointments.filter(
                    (a) =>
                      a.date ===
                      new Date(Date.now() + i * 864e5)
                        .toISOString()
                        .split("T")[0]
                  ).length
              )
            : [...Array(7)].map(
                (_, i) =>
                  appointments.filter(
                    (a) =>
                      a.date ===
                      new Date(Date.now() - (6 - i) * 864e5)
                        .toISOString()
                        .split("T")[0]
                  ).length
              ),
        backgroundColor: isDark
          ? "rgba(244, 228, 142, 0.6)"
          : "rgba(164, 137, 82, 0.6)",
        borderColor: isDark ? "#F4E48E" : "#A48952",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };
  const invoiceStatusCounts = {
    Paid: invoices.filter((i) => i.status === "Paid").length,
    Pending: invoices.filter((i) => i.status === "Pending").length,
    Overdue: invoices.filter((i) => i.status === "Overdue").length,
  };
  const invoiceChartData = {
    labels: ["Paid", "Pending", "Overdue"],
    datasets: [
      {
        data: [
          invoiceStatusCounts.Paid,
          invoiceStatusCounts.Pending,
          invoiceStatusCounts.Overdue,
        ],
        backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
        borderColor: isDark ? "#1f2937" : "#fff",
      },
    ],
  };
  const todayAppointments = appointments.filter(
    (a) =>
      a.date === new Date().toISOString().split("T")[0] &&
      a.status === "Confirmed"
  );
  const cardClasses = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white shadow-md border border-gray-200";
  const textMuted = isDark ? "text-gray-400" : "text-gray-500";
  const textHeader = isDark ? "text-white" : "text-gray-800";
  const scheduleRow = isDark
    ? "bg-gray-700/50"
    : "bg-gray-50 border border-gray-200";
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl ${cardClasses}`}>
          <h3 className={`text-sm font-medium ${textMuted}`}>
            Appointments Today
          </h3>
          <p className={`mt-2 text-3xl font-bold ${textHeader}`}>
            {todayAppointments.length}
          </p>
        </div>
        <div className={`p-6 rounded-xl ${cardClasses}`}>
          <h3 className={`text-sm font-medium ${textMuted}`}>Total Patients</h3>
          <p className={`mt-2 text-3xl font-bold ${textHeader}`}>
            {patients.length}
          </p>
        </div>
        <div className={`p-6 rounded-xl ${cardClasses}`}>
          <h3 className={`text-sm font-medium ${textMuted}`}>
            Pending Invoices
          </h3>
          <p className="mt-2 text-3xl font-bold text-yellow-400">
            {invoiceStatusCounts.Pending}
          </p>
        </div>
        <div className={`p-6 rounded-xl ${cardClasses}`}>
          <h3 className={`text-sm font-medium ${textMuted}`}>
            Overdue Invoices
          </h3>
          <p className="mt-2 text-3xl font-bold text-red-500">
            {invoiceStatusCounts.Overdue}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 p-6 rounded-xl ${cardClasses}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${textHeader}`}>
              Appointments
            </h3>
            <div
              className={`flex space-x-1 p-1 rounded-lg ${
                isDark ? "bg-gray-900/50" : "bg-gray-100"
              }`}
            >
              <button
                onClick={() => setChartView("past")}
                className={`px-3 py-1 text-sm rounded-md transition ${
                  chartView === "past"
                    ? isDark
                      ? "bg-brand-yellow text-gray-900 font-semibold"
                      : "bg-brand-gold text-white shadow"
                    : `${textMuted} hover:bg-gray-700`
                }`}
              >
                Past 7 Days
              </button>
              <button
                onClick={() => setChartView("upcoming")}
                className={`px-3 py-1 text-sm rounded-md transition ${
                  chartView === "upcoming"
                    ? isDark
                      ? "bg-brand-yellow text-gray-900 font-semibold"
                      : "bg-brand-gold text-white shadow"
                    : `${textMuted} hover:bg-gray-700`
                }`}
              >
                Upcoming
              </button>
            </div>
          </div>
          <div className="h-[300px]">
            <Bar data={appointmentChartData} options={chartOptions} />
          </div>
        </div>
        <div
          className={`p-6 rounded-xl flex flex-col items-center ${cardClasses}`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${textHeader}`}>
            Invoice Status
          </h3>
          <div className="h-[300px] w-full">
            <Doughnut
              data={invoiceChartData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: isDark ? "#e5e7eb" : "#374151" } },
                },
              }}
            />
          </div>
        </div>
      </div>
      <div className={`p-6 rounded-xl ${cardClasses}`}>
        <h3 className={`text-xl font-bold mb-4 ${textHeader}`}>
          Today's Schedule
        </h3>
        {todayAppointments.length > 0 ? (
          todayAppointments.map((app) => (
            <div
              key={app.id}
              className={`flex justify-between items-center p-3 my-2 rounded-lg ${scheduleRow}`}
            >
              <div>
                <p
                  className={`font-semibold ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {app.time} - {app.patientName}
                </p>
                <p className={`text-sm ${textMuted}`}>{app.type}</p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClasses(
                  app.status,
                  theme
                )}`}
              >
                {app.status}
              </span>
            </div>
          ))
        ) : (
          <p className={`${textMuted} italic`}>
            No confirmed appointments for today.
          </p>
        )}
      </div>
    </div>
  );
};

// --- 4.2 PATIENT PROFILES VIEW ---
const PatientProfilesView = ({
  patients,
  theme,
}: {
  patients: Patient[];
  theme: Theme;
}) => {
  /* This component is now theme-aware */ const isDark = theme === "dark";
  const cardClasses = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white shadow-md border border-gray-200";
  const headingClasses = isDark ? "text-brand-yellow" : "text-brand-gold";
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {patients.map((patient) => (
        <div
          key={patient.id}
          className={`${cardClasses} p-6 rounded-xl transition-transform hover:-translate-y-1`}
        >
          <h3 className={`text-xl font-bold mb-2 ${headingClasses}`}>
            {patient.name}
          </h3>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            DOB: {patient.dob}
          </p>
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Last Visit: {patient.lastVisit}
          </p>
          <div
            className={`mt-4 pt-4 ${
              isDark ? "border-t border-gray-700" : "border-t border-gray-200"
            }`}
          >
            <h4
              className={`font-semibold ${
                isDark ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Vitals
            </h4>
            <ul
              className={`text-sm list-disc list-inside ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <li>BP: {patient.vitals.bloodPressure}</li>
              <li>Pulse: {patient.vitals.pulse} bpm</li>
              <li>Weight: {patient.vitals.weightKg} kg</li>
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- 4.3 APPOINTMENT MANAGEMENT VIEW  ---
const AppointmentManagementView = ({
  appointments,
  theme,
}: {
  appointments: Appointment[];
  theme: Theme;
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((app) => {
      const dateKey = app.date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)?.push(app);
    });
    return map;
  }, [appointments]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const daysInMonth: Date[] = [];

  for (let i = firstDayOfMonth.getDay(); i > 0; i--) {
    const prevDate = new Date(firstDayOfMonth);
    prevDate.setDate(prevDate.getDate() - i);
    daysInMonth.push(prevDate);
  }
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    daysInMonth.push(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
    );
  }
  while (daysInMonth.length % 7 !== 0) {
    const nextDate = new Date(daysInMonth[daysInMonth.length - 1].getTime());
    nextDate.setDate(nextDate.getDate() + 1);
    daysInMonth.push(nextDate);
  }

  const changeMonth = (offset: number) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );
  };

  const isDark = theme === "dark";
  const cardClasses = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white shadow-md border border-gray-200";
  const textHeader = isDark ? "text-white" : "text-gray-800";
  const headingClasses = isDark ? "text-brand-yellow" : "text-brand-gold";
  const buttonClasses = isDark
    ? "bg-gray-700/50 hover:bg-gray-600/50"
    : "bg-gray-200 hover:bg-gray-300";

  return (
    <div className="space-y-6">
      <div
        className={`p-4 rounded-xl flex justify-between items-center ${cardClasses}`}
      >
        <h2 className={`text-2xl font-bold ${headingClasses}`}>
          Appointment Manager
        </h2>
        <div
          className={`flex space-x-1 p-1 rounded-lg ${
            isDark ? "bg-gray-900/50" : "bg-gray-100"
          }`}
        >
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 text-sm rounded-md transition font-semibold ${
              viewMode === "calendar"
                ? isDark
                  ? "bg-brand-yellow text-gray-900"
                  : "bg-brand-gold text-white shadow"
                : isDark
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 text-sm rounded-md transition font-semibold ${
              viewMode === "list"
                ? isDark
                  ? "bg-brand-yellow text-gray-900"
                  : "bg-brand-gold text-white shadow"
                : isDark
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-6 rounded-xl ${cardClasses}`}>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => changeMonth(-1)}
                className={`px-4 py-2 rounded-md ${buttonClasses}`}
              >
                &larr; Prev
              </button>
              <h3 className={`text-xl font-bold ${textHeader}`}>
                {currentDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                onClick={() => changeMonth(1)}
                className={`px-4 py-2 rounded-md ${buttonClasses}`}
              >
                Next &rarr;
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm text-gray-400 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((day, index) => {
                const dateKey = day.toISOString().split("T")[0];
                const appointmentsForDay =
                  appointmentsByDate.get(dateKey) || [];
                const isCurrentMonth =
                  day.getMonth() === currentDate.getMonth();
                const isToday = day.getTime() === today.getTime();
                const isSelected =
                  selectedDate && day.getTime() === selectedDate.getTime();
                return (
                  <div
                    key={index}
                    onClick={() => {
                      isCurrentMonth && setSelectedDate(day);
                    }}
                    className={`h-24 p-2 rounded-md flex flex-col justify-between transition-colors ${
                      isCurrentMonth
                        ? isSelected
                          ? isDark
                            ? "bg-brand-yellow text-gray-900"
                            : "bg-brand-gold text-white"
                          : isDark
                          ? "bg-gray-700/50 hover:bg-gray-600/50"
                          : "bg-gray-100 hover:bg-gray-200"
                        : isDark
                        ? "bg-gray-800/20 text-gray-600"
                        : "bg-gray-50 text-gray-400"
                    } ${isCurrentMonth ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <span
                      className={`font-bold ${
                        isToday && !isSelected
                          ? isDark
                            ? "text-brand-yellow"
                            : "text-brand-gold"
                          : ""
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {appointmentsForDay.length > 0 && (
                      <div className="flex justify-center space-x-1">
                        {appointmentsForDay.slice(0, 3).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              isSelected
                                ? isDark
                                  ? "bg-gray-800"
                                  : "bg-white"
                                : "bg-blue-400"
                            }`}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className={`p-6 rounded-xl ${cardClasses}`}>
            <h3 className={`text-xl font-bold mb-4 ${textHeader}`}>
              {selectedDate
                ? selectedDate.toLocaleDateString("default", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : "Select a day"}
            </h3>
            <AnimatePresence>
              {selectedDate &&
              (
                appointmentsByDate.get(
                  selectedDate.toISOString().split("T")[0]
                ) || []
              ).length > 0 ? (
                (
                  appointmentsByDate.get(
                    selectedDate.toISOString().split("T")[0]
                  ) || []
                ).map((app) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 my-2 rounded-lg ${
                      isDark ? "bg-gray-700/50" : "bg-gray-100"
                    }`}
                  >
                    <p className="font-semibold">
                      {app.time} - {app.patientName}
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {app.type}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p className={isDark ? "text-gray-500" : "text-gray-400"}>
                  No appointments for this day.
                </p>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <AllAppointmentsList appointments={appointments} theme={theme} />
      )}
    </div>
  );
};

// --- 4.4 DOCUMENTS VIEW ---
const DocumentsView = ({
  documents,
  patients,
  theme,
}: {
  documents: Document[];
  patients: Patient[];
  theme: Theme;
}) => {
  const isDark = theme === "dark";
  const cardClasses = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white shadow-md border border-gray-200";
  const rowClasses = isDark
    ? "bg-gray-700/50"
    : "bg-gray-100 border border-gray-200";
  const textClasses = isDark ? "text-gray-200" : "text-gray-800";
  const subtextClasses = isDark ? "text-gray-400" : "text-gray-500";
  const linkClasses = isDark ? "text-brand-yellow" : "text-brand-gold";

  return (
    <div className={`p-6 rounded-xl ${cardClasses}`}>
      {documents.map((doc) => {
        const patient = patients.find((p) => p.id === doc.patientId);
        return (
          <div
            key={doc.id}
            className={`flex justify-between items-center p-3 my-2 rounded-lg ${rowClasses}`}
          >
            <div>
              <p className={`font-semibold ${textClasses}`}>{doc.name}</p>
              <p className={`text-sm ${subtextClasses}`}>
                Patient: {patient?.name || "Unknown"} | Date: {doc.date}
              </p>
            </div>
            <a
              href="#"
              className={`text-sm font-medium hover:underline ${linkClasses}`}
            >
              Download
            </a>
          </div>
        );
      })}
    </div>
  );
};

// --- 4.5 INVOICE VIEWER ---
const InvoiceView = ({
  invoices,
  theme,
}: {
  invoices: Invoice[];
  theme: Theme;
}) => {
  const isDark = theme === "dark";
  const cardClasses = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white shadow-md border border-gray-200";
  const headerClasses = isDark ? "bg-gray-700/50" : "bg-gray-50";
  const textClasses = isDark ? "text-gray-300" : "text-gray-700";
  const headerTextClasses = isDark ? "text-gray-300" : "text-gray-500";
  const rowHoverClasses = isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50";
  const divideClasses = isDark ? "divide-gray-800" : "divide-gray-200";

  return (
    <div className={`p-6 rounded-xl overflow-x-auto ${cardClasses}`}>
      <table className={`min-w-full divide-y ${divideClasses}`}>
        <thead className={headerClasses}>
          <tr>
            <th
              className={`px-6 py-3 text-left text-xs font-medium uppercase ${headerTextClasses}`}
            >
              Patient
            </th>
            <th
              className={`px-6 py-3 text-left text-xs font-medium uppercase ${headerTextClasses}`}
            >
              Amount
            </th>
            <th
              className={`px-6 py-3 text-left text-xs font-medium uppercase ${headerTextClasses}`}
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${divideClasses}`}>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className={rowHoverClasses}>
              <td className={`px-6 py-4 whitespace-nowrap ${textClasses}`}>
                {invoice.patientName}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap ${textClasses}`}>
                R {invoice.amount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getStatusClasses(
                    invoice.status,
                    theme
                  )}`}
                >
                  {invoice.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- 4.6.1 SUB-COMPONENT FOR APPOINTMENT LIST VIEW ---
const AllAppointmentsList = ({
  appointments,
  theme,
}: {
  appointments: Appointment[];
  theme: Theme;
}) => {
  type SortKeys = keyof Appointment;
  const [sortConfig, setSortConfig] = useState<{
    key: SortKeys;
    direction: "ascending" | "descending";
  } | null>({ key: "date", direction: "descending" });

  const sortedAppointments = useMemo(() => {
    let sortableItems = [...appointments];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [appointments, sortConfig]);

  const requestSort = (key: SortKeys) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const isDark = theme === "dark";
  const cardClasses = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white shadow-md border border-gray-200";
  const headerClasses = isDark ? "bg-gray-700/50" : "bg-gray-100";

  return (
    <div className={`p-6 rounded-xl overflow-x-auto ${cardClasses}`}>
      <table className="min-w-full divide-y divide-gray-700">
        <thead className={headerClasses}>
          <tr>
            {["date", "time", "patientName", "status"].map((key) => (
              <th
                key={key}
                className="px-6 py-3 text-left text-xs font-medium uppercase cursor-pointer"
                onClick={() => requestSort(key as SortKeys)}
              >
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
                {sortConfig?.key === key && (
                  <span>
                    {sortConfig.direction === "ascending" ? " ▲" : " ▼"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className={`divide-y ${
            isDark ? "divide-gray-800" : "divide-gray-200"
          }`}
        >
          {sortedAppointments.map((app) => (
            <tr
              key={app.id}
              className={isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}
            >
              <td className="px-6 py-4 whitespace-nowrap">{app.date}</td>
              <td className="px-6 py-4 whitespace-nowrap">{app.time}</td>
              <td className="px-6 py-4 whitespace-nowrap">{app.patientName}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getStatusClasses(
                    app.status,
                    theme
                  )}`}
                >
                  {app.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- 4.7 CHAT MANAGEMENT VIEW (NEW) ---
const ChatManagementView = ({
  theme,
  user,
}: {
  theme: Theme;
  user: User | null;
}) => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Fetch all chat threads on component mount
  useEffect(() => {
    const q = query(
      collection(db, "chats"),
      orderBy("lastMessageTimestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatThreadsData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as ChatThread)
      );
      setThreads(chatThreadsData);
      setIsLoadingThreads(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch messages for the selected thread whenever it changes
  useEffect(() => {
    if (!selectedThreadId) {
      setMessages([]);
      return;
    }
    setIsLoadingMessages(true);
    const messagesQuery = query(
      collection(db, "chats", selectedThreadId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as ChatMessage)
      );
      setMessages(messagesData);
      setIsLoadingMessages(false);
    });
    return () => unsubscribe();
  }, [selectedThreadId]);

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !selectedThreadId || !user) return;

    const messageData = {
      text: newMessage,
      senderId: "admin", // Or use user.uid if admin has a specific UID
      timestamp: serverTimestamp(),
    };

    // Add the new message to the subcollection
    const messagesColRef = collection(
      db,
      "chats",
      selectedThreadId,
      "messages"
    );
    await addDoc(messagesColRef, messageData);

    // Update the last message on the parent chat thread document
    const chatDocRef = doc(db, "chats", selectedThreadId);
    await updateDoc(chatDocRef, {
      lastMessageText: newMessage,
      lastMessageTimestamp: serverTimestamp(),
      unreadByAdmin: false,
    });

    setNewMessage("");
  };

  const isDark = theme === "dark";
  const cardClasses = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white shadow-md border border-gray-200";
  const headingClasses = isDark ? "text-brand-yellow" : "text-brand-gold";
  const inputClasses = isDark
    ? "bg-gray-900 border-gray-700"
    : "bg-gray-100 border-gray-200";

  return (
    <div className={`rounded-xl flex h-[75vh] ${cardClasses}`}>
      {/* Left Panel: Conversation List */}
      <div
        className={`w-1/3 border-r ${
          isDark ? "border-white/10" : "border-gray-200"
        } flex flex-col`}
      >
        <div className="p-4 border-b border-inherit">
          <h2 className={`text-xl font-bold ${headingClasses}`}>
            Conversations
          </h2>
        </div>
        <div className="overflow-y-auto">
          {isLoadingThreads ? (
            <p className="p-4 text-gray-400">Loading chats...</p>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => setSelectedThreadId(thread.id)}
                className={`p-4 cursor-pointer border-b border-inherit ${
                  selectedThreadId === thread.id
                    ? isDark
                      ? "bg-brand-yellow/10"
                      : "bg-brand-gold/10"
                    : ""
                } ${isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-100"}`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-bold">{thread.patientName}</p>
                  {thread.unreadByAdmin && (
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  )}
                </div>
                <p className="text-sm text-gray-400 truncate">
                  {thread.lastMessageText}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel: Message View */}
      <div className="w-2/3 flex flex-col">
        {selectedThreadId ? (
          <>
            <div
              className={`p-4 border-b ${
                isDark ? "border-white/10" : "border-gray-200"
              } font-bold`}
            >
              {threads.find((t) => t.id === selectedThreadId)?.patientName}
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {isLoadingMessages ? (
                <p>Loading messages...</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === "admin" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-lg max-w-xs lg:max-w-md ${
                        msg.senderId === "admin"
                          ? isDark
                            ? "bg-brand-yellow text-gray-900"
                            : "bg-brand-gold text-white"
                          : isDark
                          ? "bg-gray-700"
                          : "bg-gray-200"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>
            <form
              onSubmit={handleSendMessage}
              className={`p-4 border-t ${
                isDark ? "border-white/10" : "border-gray-200"
              } flex gap-4`}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className={`flex-1 p-2 rounded-md ${inputClasses}`}
              />
              <button
                type="submit"
                className={`px-6 py-2 rounded-md font-semibold ${
                  isDark
                    ? "bg-brand-yellow text-gray-900"
                    : "bg-brand-gold text-white"
                }`}
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

// --- 4.8 SETTINGS VIEW (HIGHLY UPGRADED) ---
const SettingsView = ({
  user,
  theme,
  setTheme,
}: {
  user: User | null;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}) => {
  /* This component has been significantly upgraded */
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isDirty, setIsDirty] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [notificationPrefs, setNotificationPrefs] = useState({
    appointments: true,
    messages: false,
  });
  const [systemStatus, setSystemStatus] = useState({
    db: "checking",
    api: "checking",
  });

  useEffect(() => {
    setIsDirty(displayName !== (user?.displayName || ""));
  }, [displayName, user]);

  useEffect(() => {
    const timer1 = setTimeout(
      () => setSystemStatus((s) => ({ ...s, db: "operational" })),
      1000
    );
    const timer2 = setTimeout(
      () => setSystemStatus((s) => ({ ...s, api: "operational" })),
      1500
    );
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDirty && auth.currentUser) {
      try {
        await updateProfile(auth.currentUser, { displayName });
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setIsDirty(false);
      } catch (error: any) {
        setMessage({ type: "error", text: `Error: ${error.message}` });
      }
    }
  };

  const handlePasswordReset = async () => {
    if (user?.email) {
      try {
        await sendPasswordResetEmail(auth, user.email);
        setMessage({ type: "success", text: "Password reset email sent." });
      } catch (error: any) {
        setMessage({ type: "error", text: `Error: ${error.message}` });
      }
    }
  };

  const handleExportData = () => {
    const userData = {
      uid: user?.uid,
      email: user?.email,
      displayName: user?.displayName,
      emailVerified: user?.emailVerified,
      metadata: user?.metadata,
    };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(userData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "user_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setMessage({ type: "success", text: "User data export started." });
  };

  const handleDeleteAccount = () => {
    console.log("Account deletion initiated for:", user?.email);
    setIsDeleteModalOpen(false);
    alert("In a real application, your account would now be deleted.");
  };

  const handleCopyToClipboard = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setMessage({ type: "info", text: "Email copied to clipboard!" });
    }
  };

  const isDark = theme === "dark";
  const cardClasses = isDark
    ? "bg-white/5 border-white/10 text-white"
    : "bg-white shadow-md border border-gray-200 text-gray-800";
  const inputClasses = isDark
    ? "bg-gray-700 border-gray-600 text-gray-200"
    : "bg-gray-100 border-gray-300 text-gray-800";
  const labelClasses = isDark ? "text-gray-300" : "text-gray-600";
  const buttonClasses = isDark
    ? "bg-brand-yellow text-gray-900 font-semibold"
    : "bg-brand-gold text-white";
  const headingClasses = isDark ? "text-brand-yellow" : "text-brand-gold";

  return (
    <>
      <div
        className={`p-6 rounded-xl max-w-4xl mx-auto space-y-8 ${cardClasses}`}
      >
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-md text-center font-semibold ${
                message.type === "success"
                  ? "bg-green-500/20 text-green-300"
                  : message.type === "error"
                  ? "bg-red-500/20 text-red-300"
                  : "bg-blue-500/20 text-blue-300"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <h3 className={`text-xl font-bold ${headingClasses}`}>Profile</h3>

              <div>
                <label className={`block text-sm font-medium ${labelClasses}`}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`mt-1 block w-full rounded-md py-2 px-3 ${inputClasses}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${labelClasses}`}>
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    readOnly
                    value={user?.email || ""}
                    className={`mt-1 block w-full rounded-md py-2 px-3 opacity-60 cursor-not-allowed ${inputClasses}`}
                  />
                  <button
                    type="button"
                    onClick={handleCopyToClipboard}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-brand-yellow"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isDirty}
                className={`w-full py-2 px-4 rounded-md ${buttonClasses} disabled:bg-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed`}
              >
                Save Changes
              </button>
            </form>

            <div className="space-y-2 p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
              <h3 className="text-xl font-bold text-red-400">Danger Zone</h3>
              <p className="text-sm text-red-300/80">
                Manage your account data or permanently delete it.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={handleExportData}
                  className="w-full py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-500"
                >
                  Export My Data
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className={`text-xl font-bold ${headingClasses}`}>
                Appearance
              </h3>
              <div
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isDark ? "bg-gray-700/50" : "bg-gray-100"
                }`}
              >
                <label className="font-semibold">Theme</label>
                <div className="flex items-center gap-4">
                  <span
                    className={
                      !isDark ? `font-bold ${headingClasses}` : "text-gray-400"
                    }
                  >
                    Light
                  </span>
                  <button
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDark ? "bg-brand-yellow" : "bg-brand-gold"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDark ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span
                    className={
                      isDark ? `font-bold ${headingClasses}` : "text-gray-400"
                    }
                  >
                    Dark
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className={`text-xl font-bold ${headingClasses}`}>
                System Status
              </h3>
              <div
                className={`p-3 space-y-3 rounded-lg ${
                  isDark ? "bg-gray-700/50" : "bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p>Database Connection</p>
                  {systemStatus.db === "checking" ? (
                    <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p>API Services</p>
                  {systemStatus.api === "checking" ? (
                    <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className={`text-xl font-bold ${headingClasses}`}>
                Security
              </h3>
              <button
                onClick={handlePasswordReset}
                className="w-full py-2 px-4 rounded-md bg-gray-600 hover:bg-gray-500"
              >
                Send Password Reset Email
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/10"
            >
              <h2 className="text-2xl font-bold text-red-400">
                Are you absolutely sure?
              </h2>
              <p className="text-gray-300 mt-2">
                To confirm, please type{" "}
                <strong className="text-red-400">DELETE</strong> in the box
                below.
              </p>

              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full bg-gray-900 border-gray-600 text-white p-2 rounded-md mt-4 focus:ring-2 focus:ring-red-500"
              />

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-2 rounded-md bg-gray-600 hover:bg-gray-500"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmationText !== "DELETE"}
                  className="w-full py-2 rounded-md bg-red-600 text-white font-semibold disabled:bg-red-800/50 disabled:cursor-not-allowed"
                >
                  Delete My Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// =================================================================================================
// --- 5. CORE ADMIN DASHBOARD COMPONENT ---
// This is the main component that orchestrates state, authentication, and page rendering.
// =================================================================================================

const AdminDashboard: React.FC = () => {
  // --- 5.1 STATE MANAGEMENT (NOW INCLUDES THEME) ---
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "dark"
  );
  const [isAppReady, setIsAppReady] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page["name"]>("Dashboard");
  const [user, setUser] = useState<User | null>(null);
  const [authIsReady, setAuthIsReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // --- 5.2 EFFECTS (LIFECYCLE) ---
  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);
  useEffect(() => {
    const timer = setTimeout(() => setIsAppReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthIsReady(true);
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const fetchCollection = async <T,>(name: string): Promise<T[]> =>
          (await getDocs(collection(db, name))).docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as T)
          );
        const [p, a, d, i] = await Promise.all([
          fetchCollection<Patient>("patients"),
          fetchCollection<Appointment>("appointments"),
          fetchCollection<Document>("documents"),
          fetchCollection<Invoice>("invoices"),
        ]);
        setPatients(p);
        setAppointments(a);
        setDocuments(d);
        setInvoices(i);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [user]);

  // --- 5.3 HANDLER FUNCTIONS ---
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setLoginError(
        error.code === "auth/invalid-credential"
          ? "Incorrect email or password."
          : "Login failed."
      );
    }
  };
  const handleLogout = async () => {
    await signOut(auth);
  };

  // --- 5.4 PAGE & NAVIGATION DATA ---
  const pages: Page[] = [
    { name: "Dashboard", icon: "M3 10h18M3 6h18M3 14h18M3 18h18" },
    {
      name: "Patient Profiles",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
    {
      name: "Appointment Management",
      icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      name: "Documents",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    {
      name: "Chat Management",
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    },
    {
      name: "Invoice Viewer",
      icon: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
    },
    {
      name: "Settings",
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
    },
  ];

  // --- 5.5 RENDER LOGIC (PASSES THEME TO ALL COMPONENTS) ---
  const renderPage = () => {
    if (isLoadingData) {
      return (
        <div className="text-gray-400 text-center text-2xl animate-pulse">
          Loading Clinic Data...
        </div>
      );
    }
    switch (currentPage) {
      case "Dashboard":
        return (
          <DashboardView
            appointments={appointments}
            patients={patients}
            invoices={invoices}
            theme={theme}
          />
        );
      case "Patient Profiles":
        return <PatientProfilesView patients={patients} theme={theme} />;
      case "Appointment Management":
        return (
          <AppointmentManagementView
            appointments={appointments}
            theme={theme}
          />
        );
      case "Documents":
        return (
          <DocumentsView
            documents={documents}
            patients={patients}
            theme={theme}
          />
        );
      case "Invoice Viewer":
        return <InvoiceView invoices={invoices} theme={theme} />;
      // This is the corrected line for Chat Management
      case "Chat Management":
        return <ChatManagementView theme={theme} user={user} />;
      case "Settings":
        return <SettingsView user={user} theme={theme} setTheme={setTheme} />;
      default:
        return (
          <div className="text-center text-red-500">Error: Page not found.</div>
        );
    }
  };

  if (!isAppReady) return <CreativePreloader />;
  if (!authIsReady)
    return (
      <div className="bg-gray-900 h-screen flex items-center justify-center text-white text-2xl">
        Initializing...
      </div>
    );
  if (!user)
    return (
      <LoginPage
        handleLogin={handleLogin}
        setEmail={setEmail}
        setPassword={setPassword}
        loginError={loginError}
      />
    );

  return (
    <Layout
      pages={pages}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      handleLogout={handleLogout}
      userEmail={user?.displayName || user?.email}
      theme={theme}
    >
      {renderPage()}
    </Layout>
  );
};

// =================================================================================================
// --- 6. EXPORT ---
// =================================================================================================
export default AdminDashboard;
