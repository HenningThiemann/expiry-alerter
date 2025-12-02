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
} from "@mui/material";
import { Navigation } from "@/components/Navigation";
import { CustomerDialog } from "@/components/CustomerDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Customer {
  id: string;
  name: string;
  webhookUrl: string;
  createdAt: string;
  _count: {
    secrets: number;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Customer | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch("/api/customers");
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setSnackbar({
        open: true,
        message: "Failed to fetch customers",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSave = async (customer: {
    id?: string;
    name: string;
    webhookUrl: string;
  }) => {
    try {
      if (customer.id) {
        await fetch(`/api/customers/${customer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customer),
        });
        setSnackbar({
          open: true,
          message: "Customer updated successfully",
          severity: "success",
        });
      } else {
        await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customer),
        });
        setSnackbar({
          open: true,
          message: "Customer created successfully",
          severity: "success",
        });
      }
      fetchCustomers();
    } catch (error) {
      console.error("Failed to save customer:", error);
      setSnackbar({
        open: true,
        message: "Failed to save customer",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/customers/${id}`, { method: "DELETE" });
      setSnackbar({
        open: true,
        message: "Customer deleted successfully",
        severity: "success",
      });
      fetchCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete customer",
        severity: "error",
      });
    }
    setDeleteConfirm(null);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setDialogOpen(true);
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
            Customers
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Customer
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : customers.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              No customers yet. Add your first customer to get started.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Webhook URL</TableCell>
                  <TableCell align="center">Secrets</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {customer.webhookUrl}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {customer._count.secrets}
                    </TableCell>
                    <TableCell>
                      {new Date(customer.createdAt).toLocaleDateString("de-DE")}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(customer)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => setDeleteConfirm(customer)}
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

        <CustomerDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
          customer={editingCustomer}
        />

        <ConfirmDialog
          open={!!deleteConfirm}
          title="Delete Customer"
          message={`Are you sure you want to delete "${deleteConfirm?.name}"? This will also delete all associated secrets.`}
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
