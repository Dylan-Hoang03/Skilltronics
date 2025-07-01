import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const buttons = [
    { label: "Check Answer", onClick: () => navigate("/checkanswer") },
    { label: "Add User", onClick: () => navigate("/adduser") },
    { label: "Delete User", onClick: () => navigate("/deleteuser") },
    { label: "Add Test", onClick: () => navigate("/addquestion") },
    { label: "Add Lessons", onClick: () => navigate("/addlesson") },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-tr from-blue-600 to-white py-12 px-4">
      <h1 className="text-4xl font-bold text-white mb-10">
        Welcome to eLearning Portal (Admin)
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={btn.onClick}
            className="w-full rounded-lg bg-slate-800 py-4 px-6 text-white text-lg font-medium shadow hover:bg-slate-700 transition"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-10 w-full max-w-xl rounded-lg bg-red-600 py-4 px-6 text-white text-lg font-medium shadow hover:bg-red-500 transition"
      >
        Logout
      </button>
    </div>
  );
}
