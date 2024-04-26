import WarningBox from "pixelarticons/svg/warning-box.svg";
import React from "react";

import cn from "@/utils/cn";

import styles from "./Input.module.css";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <>
        <input
          type={type}
          className={cn(styles.input, className)}
          ref={ref}
          {...props}
        />
        {props.error && (
          <span className={styles.error}>
            <WarningBox />
            {props.error}
          </span>
        )}
      </>
    );
  },
);

Input.displayName = "Input";

export default Input;
