"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useState } from "react";

interface Customer {
  id?: string;
  name: string;
  webhookUrl: string;
}

interface CustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  customer?: Customer | null;
}

export function CustomerDialog({
  open,
  onClose,
  onSave,
  customer,
}: CustomerDialogProps) {
  const [name, setName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  const handleEnter = () => {
    if (customer) {
      setName(customer.name);
      setWebhookUrl(customer.webhookUrl);
    } else {
      setName("");
      setWebhookUrl("");
    }
  };

  const handleSave = () => {
    onSave({
      ...(customer?.id && { id: customer.id }),
      name,
      webhookUrl,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{ onEnter: handleEnter }}
    >
      <DialogTitle>{customer ? "Edit Customer" : "Add Customer"}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Customer Name"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="MS Teams Webhook URL"
          fullWidth
          variant="outlined"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          helperText="Enter the Microsoft Teams incoming webhook URL"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!name || !webhookUrl}
        >
          {customer ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
