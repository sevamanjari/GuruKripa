import React, { useState, useEffect, useRef } from "react";
import { Calendar, AlertCircle } from "lucide-react";
import { formatToIndianDate, parseIndianDateToISO, isValidIndianDate } from "../../utils/dateFormatter.js";

/**
 * Indian Date Input Component (DD/MM/YYYY)
 * Formats dates strictly in Indian standard DD/MM/YYYY while preserving
 * standard ISO (YYYY-MM-DD) compatibility for backend payloads.
 * Features an integrated native calendar picker trigger.
 */
export default function IndianDateInput({
  value = "",
  onChange,
  name,
  id,
  required = false,
  disabled = false,
  placeholder = "DD/MM/YYYY (e.g. 15/10/2026)",
  className = "",
  style = {},
  helperText
}) {
  // textDisplay holds the Indian format DD/MM/YYYY
  const [textDisplay, setTextDisplay] = useState(() => formatToIndianDate(value));
  const hiddenDateRef = useRef(null);
  const textInputRef = useRef(null);

  // Sync internal display when prop value changes externally
  useEffect(() => {
    setTextDisplay(formatToIndianDate(value));
  }, [value]);

  // Handle typing with auto-masking for DD/MM/YYYY
  const handleTextChange = (e) => {
    const rawInput = e.target.value;

    // Filter only digits and slashes
    const digitsOnly = rawInput.replace(/\D/g, "").slice(0, 8); // max 8 digits (DDMMYYYY)

    let formatted = "";
    if (digitsOnly.length > 0) {
      if (digitsOnly.length <= 2) {
        formatted = digitsOnly;
      } else if (digitsOnly.length <= 4) {
        formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
      } else {
        formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4, 8)}`;
      }
    }

    setTextDisplay(formatted);

    // If complete date entered (10 chars: DD/MM/YYYY)
    if (formatted.length === 10) {
      if (isValidIndianDate(formatted)) {
        const iso = parseIndianDateToISO(formatted);
        if (onChange) {
          onChange({
            target: {
              name,
              value: iso,
              indianDate: formatted
            }
          });
        }
      }
    } else if (formatted.length === 0) {
      if (onChange) {
        onChange({
          target: {
            name,
            value: "",
            indianDate: ""
          }
        });
      }
    }
  };

  // Blur handler to validate or fire change if not already fired
  const handleBlur = () => {
    if (textDisplay.length === 10) {
      if (isValidIndianDate(textDisplay)) {
        const iso = parseIndianDateToISO(textDisplay);
        if (onChange) {
          onChange({
            target: {
              name,
              value: iso,
              indianDate: textDisplay
            }
          });
        }
      }
    }
  };

  // When date is chosen from calendar picker
  const handleNativePickerChange = (e) => {
    const isoVal = e.target.value; // YYYY-MM-DD
    if (!isoVal) return;
    const indian = formatToIndianDate(isoVal);
    setTextDisplay(indian);
    if (onChange) {
      onChange({
        target: {
          name,
          value: isoVal,
          indianDate: indian
        }
      });
    }
  };

  // Open calendar picker
  const handleOpenPicker = () => {
    if (disabled) return;
    if (hiddenDateRef.current) {
      try {
        if (typeof hiddenDateRef.current.showPicker === "function") {
          hiddenDateRef.current.showPicker();
        } else {
          hiddenDateRef.current.focus();
          hiddenDateRef.current.click();
        }
      } catch (err) {
        hiddenDateRef.current.focus();
        hiddenDateRef.current.click();
      }
    }
  };

  // Calculate ISO value for hidden input
  const currentIso = parseIndianDateToISO(textDisplay) || "";
  const isInvalid = textDisplay.length === 10 && !isValidIndianDate(textDisplay);

  return (
    <div style={{ position: "relative", width: "100%", ...style }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          width: "100%"
        }}
      >
        <input
          ref={textInputRef}
          type="text"
          id={id}
          name={name}
          required={required}
          disabled={disabled}
          value={textDisplay}
          onChange={handleTextChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={10}
          className={className}
          style={{
            width: "100%",
            padding: "9px 40px 9px 12px",
            borderRadius: "8px",
            border: isInvalid
              ? "1.5px solid #ef4444"
              : "1px solid var(--border-default, #cbd5e1)",
            fontSize: "0.9rem",
            background: disabled ? "var(--bg-muted, #f1f5f9)" : "#ffffff",
            color: "var(--text-primary, #0f172a)",
            fontWeight: 500,
            letterSpacing: textDisplay ? "0.02em" : "normal",
            outline: "none"
          }}
        />

        {/* Calendar Picker Trigger Icon */}
        <button
          type="button"
          onClick={handleOpenPicker}
          disabled={disabled}
          title="Open Calendar Picker (DD/MM/YYYY)"
          style={{
            position: "absolute",
            right: "8px",
            background: "none",
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            padding: "6px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--brand-primary, #1e3a8a)",
            opacity: disabled ? 0.4 : 0.85,
            transition: "all 0.15s ease"
          }}
          onMouseEnter={(e) => {
            if (!disabled) e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            if (!disabled) e.currentTarget.style.opacity = "0.85";
          }}
        >
          <Calendar size={18} />
        </button>

        {/* Hidden Native Date Input for popup picker */}
        <input
          ref={hiddenDateRef}
          type="date"
          tabIndex={-1}
          value={currentIso.match(/^\d{4}-\d{2}-\d{2}$/) ? currentIso : ""}
          onChange={handleNativePickerChange}
          style={{
            position: "absolute",
            right: "10px",
            bottom: "0px",
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none",
            border: "none",
            padding: 0,
            margin: 0
          }}
        />
      </div>

      {/* Validation Message or Helper */}
      {isInvalid ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.74rem",
            color: "#dc2626",
            marginTop: "4px",
            fontWeight: 500
          }}
        >
          <AlertCircle size={12} />
          <span>Invalid Indian date format. Please enter DD/MM/YYYY (e.g. 15/10/2026).</span>
        </div>
      ) : helperText ? (
        <div style={{ fontSize: "0.72rem", color: "var(--text-light, #94a3b8)", marginTop: "3px" }}>
          {helperText}
        </div>
      ) : null}
    </div>
  );
}
