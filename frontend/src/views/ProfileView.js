import { useState } from "react";
import Navbar from "../components/Navbar";
import useProfile from "../controllers/useProfile";

// ─── Shared input styles ───────────────────────────────────────────────────────
const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-transparent focus:ring-2 focus:ring-green-500";

const selectClass = `${inputClass} cursor-pointer appearance-none pr-9`;

// ─── Small reusable components ─────────────────────────────────────────────────
function ChevronIcon({ className }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FieldGroup({ label, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function SelectField({ label, options }) {
  return (
    <FieldGroup label={label}>
      <div className="relative">
        <select className={selectClass} defaultValue="">
          <option value="" disabled>Select {label}</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      </div>
    </FieldGroup>
  );
}

function TextField({ label, placeholder, type = "text", defaultValue, value, onChange, autoComplete, id, spellCheck }) {
  const controlled = value !== undefined && onChange !== undefined;
  return (
    <FieldGroup label={label} htmlFor={id}>
      <input
        id={id}
        className={inputClass}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        spellCheck={spellCheck}
        {...(controlled ? { value, onChange } : { defaultValue })}
      />
    </FieldGroup>
  );
}

// ─── Tab: Profile Settings ─────────────────────────────────────────────────────
function ProfileSettingsTab({ email, setEmail, newPassword, setNewPassword, loading, error, success, handleEditProfile }) {
  return (
    <form onSubmit={handleEditProfile}>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      {success && !error && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
          Profile updated successfully.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
        {/* Personal details */}
        <section className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="personal-heading">
          <h3 id="personal-heading" className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Personal Details</h3>
          <div className="flex flex-col gap-5">
            <TextField id="profile-full-name" label="Full Name" placeholder="Input full name" autoComplete="name" />
            <TextField id="profile-nick-name" label="Nick Name" placeholder="Input nick name" autoComplete="nickname" />
            <SelectField label="Gender" options={["Male", "Female", "Non-binary", "Prefer not to say"]} />
          </div>
        </section>

        {/* Account */}
        <section className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="account-heading">
          <h3 id="account-heading" className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Account</h3>
          <div className="flex flex-col gap-5">
            <TextField
              id="profile-gmail"
              label="Gmail"
              type="email"
              placeholder="you@gmail.com"
              value={email ?? ""}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <TextField
              id="profile-password"
              label={newPassword.length > 0 ? "New password" : "Password"}
              type="text"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              spellCheck={false}
            />
          </div>
        </section>
      </div>

      {/* Save button — full width row, aligned to the right */}
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-green-600 px-8 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

// ─── Tab: Posted Items ─────────────────────────────────────────────────────────
const MOCK_POSTED = [
  { id: 1, title: "Blue Mountain Bike", category: "Sports", date: "2024-03-10", status: "Active" },
  { id: 2, title: "Vintage Leather Sofa", category: "Furniture", date: "2024-02-22", status: "Active" },
  { id: 3, title: "Canon DSLR Camera", category: "Electronics", date: "2024-01-15", status: "Closed" },
];

function StatusBadge({ status }) {
  const isActive = status === "Active";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function PostedItemsTab() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {["Title", "Category", "Date Posted", "Status", ""].map((h) => (
              <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {MOCK_POSTED.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
              <td className="px-6 py-4 text-gray-500">{item.category}</td>
              <td className="px-6 py-4 text-gray-500">{item.date}</td>
              <td className="px-6 py-4"><StatusBadge status={item.status} /></td>
              <td className="px-6 py-4 text-right">
                <button className="text-xs font-medium text-green-600 hover:text-green-800">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {MOCK_POSTED.length === 0 && (
        <p className="px-6 py-12 text-center text-sm text-gray-400">No posted items yet.</p>
      )}
    </div>
  );
}

// ─── Tab: Requested Items ──────────────────────────────────────────────────────
const MOCK_REQUESTED = [
  { id: 1, title: "Road Bicycle", category: "Sports", date: "2024-03-18", status: "Pending" },
  { id: 2, title: "Standing Desk", category: "Furniture", date: "2024-03-05", status: "Fulfilled" },
];

function RequestedItemsTab() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {["Title", "Category", "Date Requested", "Status", ""].map((h) => (
              <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {MOCK_REQUESTED.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
              <td className="px-6 py-4 text-gray-500">{item.category}</td>
              <td className="px-6 py-4 text-gray-500">{item.date}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.status === "Fulfilled" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-xs font-medium text-green-600 hover:text-green-800">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {MOCK_REQUESTED.length === 0 && (
        <p className="px-6 py-12 text-center text-sm text-gray-400">No requested items yet.</p>
      )}
    </div>
  );
}

// ─── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
   {
    key: "settings",
    label: "Profile Settings",
    description: "Manage your personal details and account credentials.",
  },
  {
    key: "posted",
    label: "Posted Items",
    description: "All items you have listed for others.",
  },
  {
    key: "requested",
    label: "Requested Items",
    description: "Items you have requested from others.",
  }
];

// ─── Main ProfileView ──────────────────────────────────────────────────────────
function ProfileView() {
  const [activeTab, setActiveTab] = useState("settings");
  const {
    email, setEmail,
    newPassword, setNewPassword,
    loading, error, success,
    handleEditProfile,
  } = useProfile();

  const currentTab = TABS.find((t) => t.key === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Page header ── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-6">
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-300">
              <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" width="72" height="72" aria-hidden>
                <rect width="72" height="72" fill="#d1d5db" />
                <circle cx="36" cy="28" r="13" fill="#e5e7eb" />
                <ellipse cx="36" cy="62" rx="22" ry="14" fill="#e5e7eb" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">Alexa Rawles</div>
            </div>
          </div>

          {/* ── Tab bar ── */}
          <nav className="-mb-px flex gap-6" aria-label="Profile tabs">
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-green-600 text-green-600"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ── Sub-page content ── */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Sub-page header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{currentTab.label}</h2>
          <p className="mt-1 text-sm text-gray-500">{currentTab.description}</p>
        </div>

        {/* Tab content */}
        {activeTab === "posted" && <PostedItemsTab />}
        {activeTab === "requested" && <RequestedItemsTab />}
        {activeTab === "settings" && (
          <ProfileSettingsTab
            email={email}
            setEmail={setEmail}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            loading={loading}
            error={error}
            success={success}
            handleEditProfile={handleEditProfile}
          />
        )}
      </main>
    </div>
  );
}

export default ProfileView;
