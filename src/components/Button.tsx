import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import cn from "@/utils/cn";

import styles from "./Button.module.css";

const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      default: [styles.buttonDefault, styles.pixelCorners],
      destructive: [styles.buttonDestructive, styles.pixelCorners],
      link: styles.buttonLink,
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export default Button;
