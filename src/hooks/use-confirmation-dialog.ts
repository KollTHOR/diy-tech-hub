"use client";

import { useState } from "react";

interface UseConfirmationDialogProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function useConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<UseConfirmationDialogProps | null>(null);
  const [onConfirmCallback, setOnConfirmCallback] = useState<
    (() => void) | null
  >(null);

  const confirm = (props: UseConfirmationDialogProps): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfig(props);
      setOnConfirmCallback(() => () => {
        resolve(true);
        setIsOpen(false);
      });
      setIsOpen(true);

      // Handle cancel/close
      const handleCancel = () => {
        resolve(false);
        setIsOpen(false);
      };

      // Store cancel handler for later use
      setOnConfirmCallback(() => () => {
        resolve(true);
        setIsOpen(false);
      });
    });
  };

  return {
    confirm,
    dialogProps: config
      ? {
          open: isOpen,
          onOpenChange: (open: boolean) => {
            if (!open) {
              setIsOpen(false);
            }
          },
          title: config.title,
          description: config.description,
          confirmText: config.confirmText,
          cancelText: config.cancelText,
          variant: config.variant,
          onConfirm: onConfirmCallback || (() => {}),
        }
      : null,
  };
}
