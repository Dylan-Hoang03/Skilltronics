import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface UploadResponse {
  lessonID: number;
  message: string;
}

export default function AddLesson() {
  const [courseName, setCourseName] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [allCourses, setAllCourses] = useState<string[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("http://localhost:5000/all-courses");
        const data = await res.json();
        if (Array.isArray(data.courses)) {
          setAllCourses(data.courses);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCourseName(value);
    const matches = allCourses.filter((c) =>
      c.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCourses(matches);
    setShowDropdown(true);
  };

  const handleSelectCourse = (selected: string) => {
    setCourseName(selected);
    setShowDropdown(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const ok =
      f.type === "video/mp4" ||
      f.name.toLowerCase().endsWith(".ppt") ||
      f.name.toLowerCase().endsWith(".pptx") ||
      f.name.toLowerCase().endsWith(".pdf");

    if (!ok) {
      alert("Please select an MP4 video or a PowerPoint/PDF file.");
      e.target.value = "";
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      alert("Please choose a file first.");
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();
      form.append("file", file);
      form.append("courseName", courseName.trim());
      form.append("lessonTitle", lessonTitle.trim());

      const res = await fetch("http://localhost:5000/lessons", {
        method: "POST",
        body: form,
      });

      const contentType = res.headers.get("content-type") ?? "";
      let data: UploadResponse | { error: string };
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { message: text } as UploadResponse;
      }

      if (!res.ok) {
        alert((data as any).error || "Upload failed.");
        setLoading(false);
        return;
      }

      setCourseName("");
      setLessonTitle("");
      setFile(null);
      setLoading(false);
      navigate("/landing");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Network or server error while uploading.");
      setLoading(false);
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
        className="bg-gray-100 p-8 rounded-xl shadow-xl w-full max-w-3xl space-y-6 relative"
      >
        {/* Course Name with Autocomplete */}
        <label className="block relative">
          <span className="font-medium">Course&nbsp;Name</span>
          <input
            className="mt-2 p-2 border rounded w-full"
            placeholder="e.g. EMS Orientation"
            value={courseName}
            onChange={handleCourseChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            required
          />
          {showDropdown && filteredCourses.length > 0 && (
            <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow-md max-h-40 overflow-y-auto">
              {filteredCourses.map((c, i) => (
                <li
                  key={i}
                  onClick={() => handleSelectCourse(c)}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                >
                  {c}
                </li>
              ))}
            </ul>
          )}
        </label>

        {/* Lesson Title */}
        <label className="block">
          <span className="font-medium">Lesson&nbsp;Title</span>
          <input
            className="mt-2 p-2 border rounded w-full"
            placeholder="e.g. Trash Can Guid Video"
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            required
          />
        </label>

        {/* File Upload */}
        <label className="block">
          <span className="font-medium">Upload File (MP4 / PPT / PPTX / PDF)</span>
          <input
            className="mt-2 block w-full text-sm text-gray-700
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            type="file"
            accept=".mp4,.ppt,.pptx,.pdf"
            onChange={handleFileChange}
            required
          />
          {file && (
            <p className="mt-1 text-sm text-gray-600">
              Selected: <strong>{file.name}</strong>
            </p>
          )}
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "Uploading…" : "Add Lesson"}
        </button>
      </form>
    </div>
  );
}
