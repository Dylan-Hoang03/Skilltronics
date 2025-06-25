/* --------------------------------------------------------------------- */
/*  CourseLessons.tsx                                                    */
/* --------------------------------------------------------------------- */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Lesson {
  LessonID:     number;
  LessonTitle:  string;
  MimeType:     string;
  FileName:     string;
  CourseID:     number;
}

export default function CourseLessons() {
  const { courseId } = useParams<{ courseId: string }>();
  const courseID = courseId; // alias for consistent naming
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---- fetch lessons for this course -------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:5000/lessons?courseID=${encodeURIComponent(courseID ?? "")}`
        );
        if (!res.ok) throw new Error("Failed to load lessons");

        const data: { lessons: Lesson[] } | Lesson[] = await res.json();
        const list = Array.isArray(data) ? data : data.lessons;
        console.log("courseID from URL:", courseID);
        console.log("lessons from backend:", list);

        // Only keep lessons that match the current course ID
        const filtered = list.filter(
          (lesson) => lesson.CourseID === Number(courseID)
        );

        setLessons(filtered);
        setSelected(filtered[0] ?? null);
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseID]);

  /* ---- update progress when lesson is viewed ------------------------ */
  useEffect(() => {
    if (!selected) return;

    const token = localStorage.getItem("token");
    console.log("Progress payload", {
  courseID: selected.CourseID,
  lessonID: selected.LessonID,
});


    fetch("http://localhost:5000/progress/view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        courseID: selected.CourseID,
        lessonID: selected.LessonID,
      }),
    }).then((res) => {
      if (!res.ok) {
        console.error("Failed to mark progress");
      } else {
        console.log(`Marked lesson ${selected.LessonID} as viewed`);
      }
    });
  }, [selected]);

  /* ---- helpers ------------------------------------------------------- */
  const fileURL = (id: number) =>
    `http://localhost:5000/lessons/${id}/file`;

const renderViewer = (lesson: Lesson) => {
  if (lesson.MimeType === "video/mp4") {
    return (
      <video
        key={lesson.LessonID}
        src={fileURL(lesson.LessonID)}
        controls
        className="w-full max-h-[80vh] bg-black rounded"
      />
    );
  }

  // ✅ Use converted PDF instead of Office viewer
  if (
    lesson.MimeType.includes("powerpoint") ||
    lesson.FileName.toLowerCase().endsWith(".ppt") ||
    lesson.FileName.toLowerCase().endsWith(".pptx")
  ) {
    return (
      <iframe
        key={lesson.LessonID}
        src={`http://localhost:5000/lessons/${lesson.LessonID}/pdf`}
        className="w-full h-[80vh] border rounded"
        title={lesson.LessonTitle}
      />
    );
  }

  // Fallback
  return (
    <div className="p-6">
      <p>
        Preview not supported.{" "}
        <a
          href={fileURL(lesson.LessonID)}
          className="text-blue-600 underline"
          target="_blank"
          rel="noreferrer"
        >
          Download&nbsp;{lesson.FileName}
        </a>
      </p>
    </div>
  );
};


  /* ---- UI ------------------------------------------------------------ */
  if (loading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (lessons.length === 0)
    return <p className="p-4">No lessons for this course.</p>;

  return (
    <div className="flex h-screen">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-60 shrink-0 border-r overflow-y-auto bg-gray-50">
        <h2 className="p-4 font-bold text-lg border-b">Lessons</h2>
        <ul>
          {lessons.map((l) => (
            <li key={l.LessonID}>
              <button
                className={`w-full text-left px-4 py-2 hover:bg-blue-100 ${
                  selected?.LessonID === l.LessonID
                    ? "bg-blue-200 font-semibold"
                    : ""
                }`}
                onClick={() => setSelected(l)}
              >
                {l.LessonTitle}
              </button>
            </li>
          ))}
        </ul>
        <button
          className="m-4 text-sm text-blue-600 hover:underline"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </aside>

      {/* ── Main viewer ─────────────────────────────────────── */}
      <main className="flex-1 p-4 overflow-auto bg-white">
        <h1 className="text-2xl font-bold mb-4">{selected?.LessonTitle}</h1>
        {selected && renderViewer(selected)}
      </main>
    </div>
  );
}
