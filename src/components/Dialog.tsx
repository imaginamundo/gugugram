"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Close from "pixelarticons/svg/close.svg";
import * as React from "react";

import Button from "@/components/Button";
import cn from "@/utils/cn";

import styles from "./Dialog.module.css";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(className, styles.overlay)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(className, styles.dialogContent, "border-radius")}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(className, styles.dialogHeader)} {...props}>
    <div>{children}</div>
    <DialogPrimitive.Close asChild>
      <Button className={styles.dialogClose} variant="link" title="Fechar">
        <Close />
      </Button>
    </DialogPrimitive.Close>
  </div>
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(className, styles.dialogFooter)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(className, styles.dialogTitle)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(className, styles.dialogDescription)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogMain = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn(styles.dialogMain, className)} {...props}>
      {children}
    </div>
  );
};
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMain,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
