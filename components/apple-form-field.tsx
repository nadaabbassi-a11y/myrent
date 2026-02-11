"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface AppleFormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  inputMode?: "text" | "numeric" | "tel" | "email" | "url" | "search";
  pattern?: string;
}

export function AppleFormField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  error,
  helperText,
  className,
  inputMode,
  pattern,
}: AppleFormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  return (
    <div className={cn("relative mb-8", className)}>
      <div className="relative">
        <Label
          htmlFor={id}
          className={cn(
            "absolute left-0 transition-all duration-300 pointer-events-none font-light",
            isFocused || hasValue
              ? "top-0 text-xs text-neutral-600"
              : "top-4 text-base text-neutral-400"
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setHasValue(!!e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ""}
          inputMode={inputMode}
          pattern={pattern}
          required={required}
          className={cn(
            "pt-6 pb-3 px-0 border-0 border-b-2 rounded-none bg-transparent font-light text-lg text-neutral-900 transition-all duration-300",
            "focus:outline-none focus:ring-0 focus:border-neutral-900",
            error
              ? "border-red-500 focus:border-red-500"
              : isFocused
              ? "border-neutral-900"
              : "border-neutral-200",
            "placeholder:text-neutral-400"
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 left-0 h-0.5 bg-neutral-900 transition-all duration-300 origin-left",
            isFocused ? "w-full" : "w-0"
          )}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 font-light animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-2 text-xs text-neutral-500 font-light">
          {helperText}
        </p>
      )}
    </div>
  );
}

