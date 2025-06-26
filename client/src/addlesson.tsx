import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

/* ------------------------------------------------------------------ */
/* Adjust to whatever shape your backend returns after upload.        */
interface UploadResponse {
  lessonID: number;
  message: string;
}
/* ------------------------------------------------------------------ */

export default function AddLesson() {
  const [courseName, setCourseName] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ---------- file chooser ---------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const ok =
      f.type === "video/mp4" ||
      f.name.toLowerCase().endsWith(".ppt") ||
      f.name.toLowerCase().endsWith(".pptx");

    if (!ok) {
      alert("Please select an MP4 video or a PowerPoint (.ppt/.pptx) file.");
      e.target.value = ""; // reset
      return;
    }
    setFile(f);
  };

  /* ---------- submit ---------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      alert("Please choose a file first.");
      return;
    }

    try {
      setLoading(true);

      /* Build multipart payload */
      const form = new FormData();
      form.append("file", file);
      form.append("courseName", courseName.trim());
      form.append("lessonTitle", lessonTitle.trim());

      const res = await fetch("http://localhost:5000/lessons", {
        method: "POST",
        body: form,
      });

      /* could be JSON or plain text—handle both */
      let data: UploadResponse | { error: string } | undefined;
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        data = (await res.json()) as UploadResponse | { error: string };
      } else {
        const text = await res.text();
        data = { message: text } as UploadResponse;
      }

      if (!res.ok) {
        alert((data as any).error || "Upload failed.");
        setLoading(false);
        return;
      }

      /* reset form */
      setCourseName("");
      setLessonTitle("");
      setFile(null);
      setLoading(false);
      navigate("/landing"); // or wherever you list lessons
    } catch (err) {
      console.error("Upload error:", err);
      alert("Network or server error while uploading.");
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center bg-gradient-to-tr from-blue-600 to-white">
      {/* logo / brand */}
      <img
        src={logo}
        alt="Logo"
        className="absolute top-4 right-4 h-8 w-auto"
      />
      <h1 className="absolute top-4 left-4 text-2xl font-bold text-blue-800">
        
eLearning Portal
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 p-8 rounded-xl shadow-xl w-full max-w-3xl space-y-6"
      >
        {/* course name */}
        <label className="block">
          <span className="font-medium">Course&nbsp;Name</span>
          <input
            className="mt-2 p-2 border rounded w-full"
            placeholder="e.g. EMS Orientation"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
          />
        </label>

        {/* lesson title */}
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

        {/* file select */}
        <label className="block">
          <span className="font-medium">Upload File (MP4 / PPT / PPTX)</span>
          <input
            className="mt-2 block w-full text-sm text-gray-700
                       file:mr-4 file:py-2 file:px-4
                       file:rounded file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
            type="file"
            accept=".mp4,.ppt,.pptx"
            onChange={handleFileChange}
            required
          />
          {file && (
            <p className="mt-1 text-sm text-gray-600">
              Selected: <strong>{file.name}</strong>
            </p>
          )}
        </label>

        {/* submit */}
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
