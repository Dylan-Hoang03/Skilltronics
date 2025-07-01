import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Lesson {
  LessonID: number;
  LessonTitle: string;
  MimeType: string;
  FileName: string;
  CourseID: number;
  Viewed: boolean;
}

export default function CourseLessons() {
  const { courseId } = useParams<{ courseId: string }>();
  const courseID = courseId;
  const navigate = useNavigate();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/lessons?courseID=${courseID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load lessons");
        const data: { lessons: Lesson[] } | Lesson[] = await res.json();
        const list = Array.isArray(data) ? data : data.lessons;
        const filtered = list.filter((l) => l.CourseID === Number(courseID));
        setLessons(filtered);
        setSelected(filtered[0] ?? null);
      } catch (err: any) {
        setError(err.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseID]);

  useEffect(() => {
    if (!selected) return;
    const token = localStorage.getItem("token");
   fetch("http://localhost:5000/course/view", {
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
    console.error("Failed to mark lesson as viewed");
    return;
  }

  // Update lessons state manually
  setLessons((prev) =>
    prev.map((lesson) =>
      lesson.LessonID === selected.LessonID
        ? { ...lesson, Viewed: true }
        : lesson
    )
  );
});

  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/course/enter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        courseID: selected.CourseID,
        lessonID: selected.LessonID,
      }),
    });

    const handleExit = () => {
      fetch("http://localhost:5000/course/exit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseID: selected.CourseID,
          lessonID: selected.LessonID,
        }),
      });
    };

    window.addEventListener("beforeunload", handleExit);
    return () => {
      handleExit();
      window.removeEventListener("beforeunload", handleExit);
    };
  }, [selected]);

  const fileURL = (id: number) => `http://localhost:5000/lessons/${id}/file`;

const renderViewer = (lesson: Lesson) => {
  const isVideo = lesson.MimeType === "video/mp4";
  const isPowerPoint =
    lesson.MimeType.includes("powerpoint") ||
    lesson.FileName.toLowerCase().endsWith(".ppt") ||
    lesson.FileName.toLowerCase().endsWith(".pptx");

  const isPDF = lesson.FileName.toLowerCase().endsWith(".pdf");

  if (isVideo) {
    return (
      <video
        key={lesson.LessonID}
        src={fileURL(lesson.LessonID)}
        controls
        className="w-full max-h-[80vh] bg-black rounded"
      />
    );
  }

  if (isPowerPoint || isPDF) {
    return (
      <iframe
        key={lesson.LessonID}
        src={`http://localhost:5000/lessons/${lesson.LessonID}/pdf`}
        className="w-full h-[80vh] border rounded"
        title={lesson.LessonTitle}
      />
    );
  }

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


  const viewedCount = lessons.filter((l) => l.Viewed).length;
  const progress = lessons.length > 0 ? Math.round((viewedCount / lessons.length) * 100) : 0;

  if (loading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (lessons.length === 0) return <p className="p-4">No lessons for this course.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-600 to-white flex flex-col">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center px-6 py-4 bg-blue-800 text-white shadow">
        <h1 className="text-xl font-bold">eLearning Portal</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-white text-blue-800 font-semibold px-4 py-2 rounded hover:bg-gray-100 shadow"
        >
          ← Back
        </button>
      </div>

      {/* Page Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 border-r overflow-y-auto bg-gray-50 flex flex-col">
          <h2 className="p-4 font-bold text-lg border-b">Lessons</h2>

          {/* Progress Bar */}
          <div className="px-4 mb-2">
            <div className="text-sm font-medium text-gray-600 mb-1">
              Progress: {progress}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Lesson List */}
          <ul className="flex-grow">
            {lessons.map((l) => (
              <li key={l.LessonID}>
               <button
  className={`w-full text-left px-4 py-2 flex justify-between items-center hover:bg-blue-100 ${
    selected?.LessonID === l.LessonID && l.Viewed
      ? "bg-gray-400 font-semibold"
      : selected?.LessonID === l.LessonID
      ? "bg-blue-200 font-semibold"
      : l.Viewed
      ? "bg-gray-200"
      : ""
  }`}
  onClick={() => setSelected(l)}
>
  <span>{l.LessonTitle}</span>
  {l.Viewed && <span className="text-green-600 text-sm">✔</span>}
</button>

              </li>
            ))}
          </ul>
        </aside>

        {/* Main Viewer */}
        <main className="flex-1 p-6 overflow-auto bg-white">
          <h1 className="text-2xl font-bold mb-4">{selected?.LessonTitle}</h1>
          {selected && renderViewer(selected)}
        </main>
      </div>
    </div>
  );
}
