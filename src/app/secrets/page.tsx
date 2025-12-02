"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Navigation } from "@/components/Navigation";
import { SecretDialog } from "@/components/SecretDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Customer {
  id: string;
  name: string;
}

interface Secret {
  id: string;
  name: string;
  description: string | null;
  expiryDate: string;
  customerId: string;
  customer: Customer;
  createdAt: string;
}

export default function SecretsPage() {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Secret | null>(null);
  const [filterCustomerId, setFilterCustomerId] = useState<string>("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fetchSecrets = useCallback(async () => {
    try {
      const url = filterCustomerId
        ? `/api/secrets?customerId=${filterCustomerId}`
        : "/api/secrets";
      const response = await fetch(url);
      const data = await response.json();
      setSecrets(data);
    } catch (error) {
      console.error("Failed to fetch secrets:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch secrets",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [filterCustomerId]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  const handleSave = async (secret: {
    id?: string;
    name: string;
    description?: string | null;
    expiryDate: string;
    customerId: string;
  }) => {
    try {
      if (secret.id) {
        await fetch(`/api/secrets/${secret.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(secret),
        });
        setSnackbar({
          open: true,
          message: "Secret updated successfully",
          severity: "success",
        });
      } else {
        await fetch("/api/secrets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(secret),
        });
        setSnackbar({
          open: true,
          message: "Secret created successfully",
          severity: "success",
        });
      }
      fetchSecrets();
    } catch (error) {
      console.error("Failed to save secret:", error);
      setSnackbar({
        open: true,
        message: "Failed to save secret",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/secrets/${id}`, { method: "DELETE" });
      setSnackbar({
        open: true,
        message: "Secret deleted successfully",
        severity: "success",
      });
      fetchSecrets();
    } catch (error) {
      console.error("Failed to delete secret:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete secret",
        severity: "error",
      });
    }
    setDeleteConfirm(null);
  };

  const handleEdit = (secret: Secret) => {
    setEditingSecret(secret);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingSecret(null);
    setDialogOpen(true);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.ceil(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const getExpiryChip = (expiryDate: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    if (days <= 3) {
      return (
        <Chip
          label={`${days} day${days === 1 ? "" : "s"}`}
          color="error"
          size="small"
        />
      );
    }
    if (days <= 14) {
      return <Chip label={`${days} days`} color="warning" size="small" />;
    }
    return <Chip label={`${days} days`} color="success" size="small" />;
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1">
            Secrets
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Filter by Customer</InputLabel>
              <Select
                value={filterCustomerId}
                label="Filter by Customer"
                onChange={(e) => setFilterCustomerId(e.target.value)}
              >
                <MenuItem value="">All Customers</MenuItem>
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={customers.length === 0}
            >
              Add Secret
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : customers.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              You need to create a customer before adding secrets.
            </Typography>
          </Paper>
        ) : secrets.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              No secrets yet. Add your first secret to start tracking expiry
              dates.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  <TableCell>Time Left</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {secrets.map((secret) => (
                  <TableRow key={secret.id}>
                    <TableCell>{secret.name}</TableCell>
                    <TableCell>{secret.customer.name}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {secret.description || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(secret.expiryDate).toLocaleDateString("de-DE")}
                    </TableCell>
                    <TableCell>{getExpiryChip(secret.expiryDate)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(secret)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => setDeleteConfirm(secret)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <SecretDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
          secret={
            editingSecret
              ? {
                  id: editingSecret.id,
                  name: editingSecret.name,
                  description: editingSecret.description,
                  expiryDate: editingSecret.expiryDate,
                  customerId: editingSecret.customerId,
                }
              : null
          }
          customers={customers}
          preselectedCustomerId={filterCustomerId}
        />

        <ConfirmDialog
          open={!!deleteConfirm}
          title="Delete Secret"
          message={`Are you sure you want to delete "${deleteConfirm?.name}"?`}
          onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}
