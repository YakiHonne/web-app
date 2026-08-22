import Icon from "@/Components/Icon";
import Spinner from "@/Components/Spinner";
import React, { useMemo } from "react";

export default function Button({
  label,
  type = "primary",
  size = "m",
  full,
  disabled,
  loading,
  onClick,
  leftIcon,
  rightIcon,
  iconTransform,
  className = "",
  style = {},
}) {
  const buttonClass = useMemo(() => {
    const typeClass = type === "primary" ? "btn-normal" : `btn-${type}`;
    return `btn ${typeClass} btn-${size} ${full ? "btn-full" : ""} ${
      disabled || loading ? "btn-disabled" : ""
    } ${className}`;
  }, [type, size, full, disabled, loading, className]);

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
    >
      {loading && <Spinner size={size === "s" ? 14 : 18} />}
      {!loading && leftIcon && (
        <Icon name={leftIcon} size={size === "s" ? 16 : 20} transform={iconTransform} />
      )}
      {label}
      {!loading && rightIcon && (
        <Icon name={rightIcon} size={size === "s" ? 16 : 20} transform={iconTransform} />
      )}
    </button>
  );
}
