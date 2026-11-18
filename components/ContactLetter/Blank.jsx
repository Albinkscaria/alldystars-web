"use client";

import { forwardRef, useLayoutEffect, useRef, useState } from "react";

/**
 * A "fill in the blank" field written on the letter.
 *
 * The real <input>/<textarea> sits on top of a mirror that shows the text as ink.
 * The mirror sizes the field (it grows with what is typed), shows the newest
 * character as wet ink that dries, and shows the placeholder or a red-pen note.
 * The field's own text is transparent, so the caret, selection, IME, autofill
 * and screen readers all still work on the real element.
 */
const Blank = forwardRef(function Blank(
  {
    id,
    name,
    value,
    onChange,
    onBlur,
    label,
    placeholder,
    note,
    multiline = false,
    minWidth,
    className = "",
    ...rest
  },
  ref
) {
  const mirrorRef = useRef(null);
  const [wet, setWet] = useState(false); // last change appended exactly one character
  const [overflow, setOverflow] = useState(false); // single-line value wider than the line

  const handle = (e) => {
    const next = e.target.value;
    setWet(next.length === value.length + 1 && next.startsWith(value));
    onChange(next);
  };

  // A very long single-line value can't grow past the line: fall back to the native text.
  useLayoutEffect(() => {
    if (multiline) return;
    const m = mirrorRef.current;
    if (m) setOverflow(m.scrollWidth > m.clientWidth + 1);
  }, [value, multiline]);

  const empty = value.length === 0;
  const showNoteInside = Boolean(note) && empty;
  const noteId = note ? `${id}-note` : undefined;

  let ink;
  if (empty) {
    ink = <span className={showNoteInside ? "cl-pen" : "cl-ph"} key={showNoteInside ? note : "ph"}>{showNoteInside ? note : placeholder}</span>;
  } else if (wet) {
    ink = (
      <>
        {value.slice(0, -1)}
        <span className="cl-wet" key={value.length}>
          {value.slice(-1)}
        </span>
      </>
    );
  } else {
    ink = value;
  }

  const Field = multiline ? "textarea" : "input";
  const classes = [
    "cl-blank",
    multiline ? "is-multi" : "",
    note ? "is-invalid" : "",
    overflow ? "is-overflow" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} style={minWidth ? { "--min": minWidth } : undefined}>
      <span className="cl-mirror" ref={mirrorRef} aria-hidden="true">
        {ink}
        {multiline && "​"}
      </span>
      <Field
        ref={ref}
        id={id}
        name={name}
        value={value}
        onChange={handle}
        onBlur={onBlur}
        aria-label={label}
        aria-invalid={note ? "true" : undefined}
        aria-describedby={noteId}
        placeholder={placeholder}
        rows={multiline ? 1 : undefined}
        size={multiline ? undefined : 1}
        spellCheck={multiline ? true : false}
        {...rest}
      />
      {note && !empty && (
        <span className="cl-pen cl-pen-below" aria-hidden="true" key={note}>
          {note}
        </span>
      )}
      {note && (
        <span className="cl-sr" id={noteId}>
          {note.replace(/^[←↑↓→]\s*/, "")}
        </span>
      )}
    </span>
  );
});

export default Blank;
