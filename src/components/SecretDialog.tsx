"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useState } from "react";

interface Customer {
  id: string;
  name: string;
}

interface Secret {
  id?: string;
  name: string;
  description?: string | null;
  expiryDate: string;
  customerId: string;
}

interface SecretDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (secret: Secret) => void;
  secret?: Secret | null;
  customers: Customer[];
  preselectedCustomerId?: string;
}

export function SecretDialog({
  open,
  onClose,
  onSave,
  secret,
  customers,
  preselectedCustomerId,
}: SecretDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [customerId, setCustomerId] = useState("");

  const handleEnter = () => {
    if (secret) {
      setName(secret.name);
      setDescription(secret.description || "");
      setExpiryDate(new Date(secret.expiryDate).toISOString().split("T")[0]);
      setCustomerId(secret.customerId);
    } else {
      setName("");
      setDescription("");
      setExpiryDate("");
      setCustomerId(preselectedCustomerId || "");
    }
  };

  const handleSave = () => {
    onSave({
      ...(secret?.id && { id: secret.id }),
      name,
      description: description || null,
      expiryDate,
      customerId,
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
      <DialogTitle>{secret ? "Edit Secret" : "Add Secret"}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
          <InputLabel>Customer</InputLabel>
          <Select
            value={customerId}
            label="Customer"
            onChange={(e) => setCustomerId(e.target.value)}
          >
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          margin="dense"
          label="Secret Name"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Expiry Date"
          type="date"
          fullWidth
          variant="outlined"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!name || !expiryDate || !customerId}
        >
          {secret ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
