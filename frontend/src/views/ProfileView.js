import Navbar from "../components/Navbar";
import useProfile from "../controllers/useProfile";

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-transparent focus:ring-2 focus:ring-green-500";

const selectClass = `${inputClass} cursor-pointer appearance-none pr-9`;

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

function SelectField({ label, options }) {
  return (
    <FieldGroup label={label}>
      <div className="relative">
        <select className={selectClass} defaultValue="">
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

function ProfileIdentityHeader({ loading }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
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
        <div className="text-lg font-semibold text-gray-900">Alexa Rawles</div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full shrink-0 rounded-lg bg-green-600 px-7 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-green-700 sm:w-auto"
      >
        {loading ? "Saving..." : "Edit"}
      </button>
    </div>
  );
}

function ProfileView() {
  const {
    email,
    setEmail,
    newPassword,
    setNewPassword,
    loading,
    error,
    success,
    handleEditProfile,
  } = useProfile();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-1 text-gray-500">Manage your user and account detais</p>
        </div>

        <form onSubmit={handleEditProfile}>
          <ProfileIdentityHeader loading={loading} />

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          {success && !error && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
              Profile updated successfully.
            </div>
          )}

          <div className="mb-8 grid grid-cols-2 items-stretch gap-4 sm:gap-8">
            {/* Left block: full name → nick name → gender */}
            <section
              className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
              aria-labelledby="profile-block-personal-heading"
            >
              <h2 id="profile-block-personal-heading" className="sr-only">
                Personal details
              </h2>
              <div className="flex flex-col gap-5">
                <TextField
                  id="profile-full-name"
                  label="Full Name"
                  placeholder="Input full name"
                  autoComplete="name"
                />
                <TextField
                  id="profile-nick-name"
                  label="Nick Name"
                  placeholder="Input nick name"
                  autoComplete="nickname"
                />
                <SelectField
                  label="Gender"
                  options={["Male", "Female", "Non-binary", "Prefer not to say"]}
                />
              </div>
            </section>

            {/* Right block: Gmail → password */}
            <section
              className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
              aria-labelledby="profile-block-account-heading"
            >
              <h2 id="profile-block-account-heading" className="sr-only">
                Account
              </h2>
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
        </form>
      </main>
    </div>
  );
}

export default ProfileView;
