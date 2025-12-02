"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { Navigation } from "@/components/Navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { CustomerDialog } from "@/components/CustomerDialog";
import { SecretDialog } from "@/components/SecretDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Secret {
  id: string;
  name: string;
  description: string | null;
  expiryDate: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  webhookUrl: string;
  createdAt: string;
  secrets: Secret[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [secretDialogOpen, setSecretDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "customer" | "secret";
    id: string;
    name: string;
  } | null>(null);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      if (!response.ok) {
        throw new Error("Customer not found");
      }
      const data = await response.json();
      setCustomer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const handleDeleteCustomer = async () => {
    try {
      await fetch(`/api/customers/${customerId}`, { method: "DELETE" });
      router.push("/customers");
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
    setDeleteConfirm(null);
  };

  const handleDeleteSecret = async (secretId: string) => {
    try {
      await fetch(`/api/secrets/${secretId}`, { method: "DELETE" });
      fetchCustomer();
    } catch (error) {
      console.error("Failed to delete secret:", error);
    }
    setDeleteConfirm(null);
  };

  const handleSaveCustomer = async (updatedCustomer: {
    id?: string;
    name: string;
    webhookUrl: string;
  }) => {
    try {
      await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCustomer),
      });
      fetchCustomer();
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update customer:", error);
    }
  };

  const handleSaveSecret = async (secret: {
    id?: string;
    name: string;
    description?: string | null;
    expiryDate: string;
    customerId: string;
  }) => {
    try {
      await fetch("/api/secrets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...secret, customerId }),
      });
      fetchCustomer();
      setSecretDialogOpen(false);
    } catch (error) {
      console.error("Failed to create secret:", error);
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    return Math.ceil(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
  };

  const getExpiryColor = (days: number) => {
    if (days < 0) return "error";
    if (days <= 3) return "error";
    if (days <= 7) return "warning";
    if (days <= 14) return "info";
    return "success";
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  if (error || !customer) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error || "Customer not found"}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/customers")}
            sx={{ mt: 2 }}
          >
            Back to Customers
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/customers")}
          sx={{ mb: 2 }}
        >
          Back to Customers
        </Button>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h4" gutterBottom>
                {customer.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Customer ID: {customer.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created:{" "}
                {new Date(customer.createdAt).toLocaleDateString("en-GB")}
              </Typography>
            </Box>
            <Box>
              <IconButton
                color="primary"
                onClick={() => setEditDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                color="error"
                onClick={() =>
                  setDeleteConfirm({
                    type: "customer",
                    id: customer.id,
                    name: customer.name,
                  })
                }
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Webhook URL
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ wordBreak: "break-all", mt: 1 }}
                  >
                    {customer.webhookUrl}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5">
            Secrets ({customer.secrets.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setSecretDialogOpen(true)}
          >
            Add Secret
          </Button>
        </Box>

        {customer.secrets.length === 0 ? (
          <Alert severity="info">
            No secrets assigned to this customer yet.
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customer.secrets.map((secret) => {
                  const days = getDaysUntilExpiry(secret.expiryDate);
                  return (
                    <TableRow key={secret.id}>
                      <TableCell>{secret.name}</TableCell>
                      <TableCell>{secret.description || "-"}</TableCell>
                      <TableCell>
                        {new Date(secret.expiryDate).toLocaleDateString(
                          "en-GB"
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            days < 0
                              ? "Expired"
                              : `${days} day${days === 1 ? "" : "s"}`
                          }
                          color={getExpiryColor(days)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/secrets/${secret.id}`)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setDeleteConfirm({
                              type: "secret",
                              id: secret.id,
                              name: secret.name,
                            })
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {editDialogOpen && (
          <CustomerDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            onSave={handleSaveCustomer}
            customer={customer}
          />
        )}

        {secretDialogOpen && (
          <SecretDialog
            open={secretDialogOpen}
            onClose={() => setSecretDialogOpen(false)}
            onSave={handleSaveSecret}
            customers={[customer]}
            preselectedCustomerId={customerId}
          />
        )}

        {deleteConfirm && (
          <ConfirmDialog
            open={true}
            title={`Delete ${deleteConfirm.type === "customer" ? "Customer" : "Secret"}`}
            message={`Are you sure you want to delete "${deleteConfirm.name}"?${deleteConfirm.type === "customer" ? " This will also delete all associated secrets." : ""}`}
            onConfirm={() => {
              if (deleteConfirm.type === "customer") {
                handleDeleteCustomer();
              } else {
                handleDeleteSecret(deleteConfirm.id);
              }
            }}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
      </Container>
    </>
  );
}
