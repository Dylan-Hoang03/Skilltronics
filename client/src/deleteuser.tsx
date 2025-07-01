import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function DeleteUser() {
  const [email, setEmail] = useState("");
  const [allEmails, setAllEmails] = useState<string[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all valid user emails
    const fetchEmails = async () => {
      try {
        const res = await fetch("http://localhost:5000/all-users");
        const data = await res.json();
        if (Array.isArray(data.emails)) {
          setAllEmails(data.emails);
        }
      } catch (err) {
        console.error("Failed to fetch emails:", err);
      }
    };
    fetchEmails();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    const normalized = value.toLowerCase().trim();
    const matches = allEmails.filter((em) =>
      em.toLowerCase().includes(normalized)
    );
    setFilteredEmails(matches);
    setShowDropdown(true);
  };

  const handleSelect = (selected: string) => {
    setEmail(selected);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail.endsWith("@spartronics.com")) {
      alert("Email must end with @spartronics.com");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Deletion failed, no account found");
        return;
      }

      alert(data.message || "Account deleted");
      setEmail("");
      navigate("/");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Network or server error during deletion.");
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 to-white">
      <button
        onClick={() => navigate("/landing")}
        className="text-white bg-blue-800 hover:bg-blue-900 px-4 rounded shadow absolute top-4 right-4 h-8 w-auto"
      >
        ← Back
      </button>

      <h1 className="absolute top-4 left-4 text-2xl font-bold text-blue-800">
        eLearning Portal
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 p-8 rounded-xl shadow-xl w-full max-w-2xl relative"
      >
        <div className="mb-6">
          <label className="block font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />

          {showDropdown && filteredEmails.length > 0 && (
            <ul className="absolute z-10 bg-white border w-full max-w-2xl mt-1 rounded shadow-md max-h-40 overflow-y-auto">
              {filteredEmails.map((em, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelect(em)}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                >
                  {em}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Delete Account
        </button>
      </form>
    </div>
  );
}
