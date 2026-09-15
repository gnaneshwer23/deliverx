"use client";

import { useCallback, useEffect, useState } from "react";
import { scheduleEffectWork } from "@/lib/react/schedule-effect-work";
import { CoachingSubmitView } from "@/components/pi-coaching/coaching-submit-view";
import type { ProgrammeWithExercises } from "@/lib/coaching-evidence/store";
import type {
  CoachingIntakeMethod,
  CoachingSubmissionRow,
} from "@/lib/coaching-evidence/types";

type FormState = {
  programmeId: string;
  exerciseId: string;
  title: string;
  intakeMethod: CoachingIntakeMethod;
  body: string;
  selfConfidence: number | null;
  aiAssisted: boolean;
};

const EMPTY_FORM: FormState = {
  programmeId: "",
  exerciseId: "",
  title: "",
  intakeMethod: "text",
  body: "",
  selfConfidence: null,
  aiAssisted: false,
};

export function CoachingSubmitApp() {
  const [programmes, setProgrammes] = useState<ProgrammeWithExercises[]>([]);
  const [submissions, setSubmissions] = useState<CoachingSubmissionRow[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const loadSubmissions = useCallback(async () => {
    const res = await fetch("/api/pi/coaching/submissions");
    if (res.ok) {
      const json = await res.json();
      setSubmissions((json.data ?? []) as CoachingSubmissionRow[]);
    }
  }, []);

  useEffect(
    () =>
      scheduleEffectWork(() => {
        void (async () => {
          const res = await fetch("/api/pi/coaching/programmes");
          if (res.ok) {
            const json = await res.json();
            const list = (json.data ?? []) as ProgrammeWithExercises[];
            setProgrammes(list);
            if (list[0]) {
              setForm((f) => ({
                ...f,
                programmeId: list[0].id,
                exerciseId: list[0].exercises[0]?.id ?? "",
              }));
            }
          }
          await loadSubmissions();
        })();
      }),
    [loadSubmissions],
  );

  const onSubmit = useCallback(async () => {
    setBusy(true);
    setNotice("");
    try {
      const res = await fetch("/api/pi/coaching/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programmeId: form.programmeId,
          exerciseId: form.exerciseId,
          title: form.title,
          intakeMethod: form.intakeMethod,
          content: { body: form.body },
          selfConfidence: form.selfConfidence,
          aiAssisted: form.aiAssisted,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setNotice(json.error ?? "Could not submit.");
      } else {
        setNotice("Submitted. A coach will review it — no evidence is recorded until they confirm.");
        setForm((f) => ({ ...f, title: "", body: "", selfConfidence: null, aiAssisted: false }));
        await loadSubmissions();
      }
    } finally {
      setBusy(false);
    }
  }, [form, loadSubmissions]);

  return (
    <CoachingSubmitView
      programmes={programmes}
      submissions={submissions}
      form={form}
      busy={busy}
      notice={notice}
      onFormChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
      onSubmit={onSubmit}
    />
  );
}
