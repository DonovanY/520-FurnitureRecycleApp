import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import useProfile from "../controllers/useProfile";
import SearchBar from "../components/SearchBar";
import ItemGrid from "../components/ItemGrid";
import useProfileListing from "../controllers/useProfileListing";
import { useAuth } from "../context/AuthContext";

// ─── Shared input styles ───────────────────────────────────────────────────────
const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-transparent focus:ring-2 focus:ring-green-500";

const selectClass = `${inputClass} cursor-pointer appearance-none pr-9`;

// ─── Small reusable components ─────────────────────────────────────────────────
function ChevronIcon({ className }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3 5l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FieldGroup({ label, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectField({ label, options, value, onChange }) {
  return (
    <FieldGroup label={label}>
      <div className="relative">
        <select className={selectClass} value={value} onChange={onChange}>
          <option value="" disabled>
            Select {label}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      </div>
    </FieldGroup>
  );
}

function TextField({
  label,
  placeholder,
  type = "text",
  defaultValue,
  value,
  onChange,
  autoComplete,
  id,
  spellCheck,
}) {
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
function ProfileSettingsTab({
  fullName,
  setFullName,
  gender,
  setGender,
  email,
  setEmail,
  newPassword,
  setNewPassword,
  loading,
  error,
  success,
  handleEditProfile,
}) {
  return (
    <form onSubmit={handleEditProfile}>
      {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {success && !error && (
        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
          Profile updated successfully.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
        {/* Personal details */}
        <section
          className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
          aria-labelledby="personal-heading"
        >
          <h3
            id="personal-heading"
            className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide"
          >
            Personal Details
          </h3>
          <div className="flex flex-col gap-5">
            <TextField
              id="profile-full-name"
              label="Full Name"
              placeholder="Input full name"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <SelectField
              label="Gender"
              options={["Male", "Female", "Non-binary", "Prefer not to say"]}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            />
          </div>
        </section>

        {/* Account */}
        <section
          className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
          aria-labelledby="account-heading"
        >
          <h3
            id="account-heading"
            className="mb-4 text-sm font-semibold text-gray-700 uppercase tracking-wide"
          >
            Account
          </h3>
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
function PostedItemsTab() {
  const navigate = useNavigate();
  const {
    listings,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    page,
    total,
    totalPages,
    goToPrevPage,
    goToNextPage,
  } = useProfileListing();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex w-full items-center justify-between gap-4">
        <div className="flex-1 max-w-lg">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <button
          onClick={() => navigate("/post")}
          className="shrink-0 flex items-center gap-2 rounded-lg border border-green-600 bg-white px-5 py-2.5 text-sm font-semibold text-green-600 shadow-sm hover:bg-green-50 transition-all active:scale-95"
        >
          <span className="text-lg">+</span> Add New Item
        </button>
      </div>

      {error && <div className="text-red-600 text-center py-8">{error}</div>}

      {!error && loading && <div className="text-center py-16 text-gray-400">Loading...</div>}

      {!error && !loading && (
        <>
          <div className="min-h-[400px]">
            <ItemGrid listings={listings} />
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-gray-200 pt-8 sm:flex-row">
            <div className="text-sm text-gray-500">
              Page {page} of {totalPages} · {total} items
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPrevPage}
                  disabled={page <= 1}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <span className="flex items-center px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-md py-2">
                  {page} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={goToNextPage}
                  disabled={page >= totalPages}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

// ─── Tab: Requested Items ──────────────────────────────────────────────────────
function RequestedItemsTab() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-12">
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <svg
          className="h-16 w-16 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-base font-medium text-gray-900">No requested items yet</p>
        <p className="text-sm text-gray-500 max-w-sm">
          When you request items from other users, they will appear here.
        </p>
      </div>
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
  },
];

// ─── Main ProfileView ──────────────────────────────────────────────────────────
function ProfileView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("settings");
  const {
    fullName,
    setFullName,
    gender,
    setGender,
    email,
    setEmail,
    newPassword,
    setNewPassword,
    loading,
    error,
    success,
    handleEditProfile,
  } = useProfile();

  const currentTab = TABS.find((t) => t.key === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Page header ── */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl border-b border-gray-200 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-6">
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-300">
              <svg
                viewBox="0 0 72 72"
                xmlns="http://www.w3.org/2000/svg"
                width="72"
                height="72"
                aria-hidden
              >
                <rect width="72" height="72" fill="#d1d5db" />
                <circle cx="36" cy="28" r="13" fill="#e5e7eb" />
                <ellipse cx="36" cy="62" rx="22" ry="14" fill="#e5e7eb" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {user?.user_metadata?.full_name || user?.email}
              </div>
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
            fullName={fullName}
            setFullName={setFullName}
            gender={gender}
            setGender={setGender}
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
