"use client";

import { useId, useState } from "react";
import { dxClass } from "@/lib/dx-theme";
import { OTHER_OPTION } from "@/lib/onboarding/resolve-select-value";

type SelectWithOtherProps = {
  label: string;
  name: string;
  otherName: string;
  options: string[];
  helper?: string;
  otherPlaceholder?: string;
  otherLabel?: string;
};

export function SelectWithOther({
  label,
  name,
  otherName,
  options,
  helper,
  otherPlaceholder,
  otherLabel = "Please specify",
}: SelectWithOtherProps) {
  const [selected, setSelected] = useState("");
  const otherFieldId = useId();
  const showOther = selected === OTHER_OPTION;

  return (
    <div className="block">
      <label htmlFor={name} className="block">
        <span className={dxClass.label}>{label}</span>
        <select
          id={name}
          name={name}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className={`${dxClass.input} mt-1.5`}
        >
          <option value="" disabled>
            Select…
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      {helper ? (
        <p className="mt-1.5 text-[13px] font-light leading-snug text-[#6B7280]">{helper}</p>
      ) : null}
      {showOther ? (
        <label htmlFor={otherFieldId} className="mt-3 block">
          <span className={dxClass.label}>{otherLabel}</span>
          <input
            id={otherFieldId}
            name={otherName}
            required
            maxLength={120}
            placeholder={otherPlaceholder}
            className={`${dxClass.input} mt-1.5`}
          />
        </label>
      ) : null}
    </div>
  );
}
