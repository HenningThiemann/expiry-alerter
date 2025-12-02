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
  IconButton,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import { Navigation } from "@/components/Navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import { SecretDialog } from "@/components/SecretDialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Customer {
  id: string;
  name: string;
  webhookUrl: string;
}

interface Secret {
  id: string;
  name: string;
  description: string | null;
  expiryDate: string;
  createdAt: string;
  customerId: string;
  customer: Customer;
}

export default function SecretDetailPage() {
  const params = useParams();
  const router = useRouter();
  const secretId = params.id as string;

  const [secret, setSecret] = useState<Secret | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetchSecret = async () => {
    try {
      const response = await fetch(`/api/secrets/${secretId}`);
      if (!response.ok) {
        throw new Error("Secret not found");
      }
      const data = await response.json();
      setSecret(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load secret");
    } finally {
      setLoading(false);
    }
  };

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
    fetchSecret();
    fetchCustomers();
  }, [secretId]);

  const handleDelete = async () => {
    try {
      await fetch(`/api/secrets/${secretId}`, { method: "DELETE" });
      router.push("/secrets");
    } catch (error) {
      console.error("Failed to delete secret:", error);
    }
    setDeleteConfirm(false);
  };

  const handleSave = async (updatedSecret: {
    id?: string;
    name: string;
    description?: string | null;
    expiryDate: string;
    customerId: string;
  }) => {
    try {
      await fetch(`/api/secrets/${secretId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSecret),
      });
      fetchSecret();
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update secret:", error);
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

  const getExpiryStatus = (days: number) => {
    if (days < 0) return "Expired";
    if (days === 0) return "Expires Today";
    if (days === 1) return "Expires Tomorrow";
    return `Expires in ${days} days`;
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

  if (error || !secret) {
    return (
      <>
        <Navigation />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">{error || "Secret not found"}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/secrets")}
            sx={{ mt: 2 }}
          >
            Back to Secrets
          </Button>
        </Container>
      </>
    );
  }

  const daysUntilExpiry = getDaysUntilExpiry(secret.expiryDate);

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/secrets")}
          sx={{ mb: 2 }}
        >
          Back to Secrets
        </Button>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h4" gutterBottom>
                {secret.name}
              </Typography>
              <Chip
                label={getExpiryStatus(daysUntilExpiry)}
                color={getExpiryColor(daysUntilExpiry)}
                sx={{ mt: 1 }}
              />
            </Box>
            <Box>
              <IconButton
                color="primary"
                onClick={() => setEditDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => setDeleteConfirm(true)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
              mt: 3,
            }}
          >
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Customer
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom>
                  {secret.customer.name}
                </Typography>
                <Button
                  size="small"
                  onClick={() =>
                    router.push(`/customers/${secret.customer.id}`)
                  }
                >
                  View Customer Details
                </Button>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <CalendarTodayIcon sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Expiry Date
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom>
                  {new Date(secret.expiryDate).toLocaleDateString("en-GB", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {daysUntilExpiry >= 0
                    ? `${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"} remaining`
                    : `Expired ${Math.abs(daysUntilExpiry)} day${Math.abs(daysUntilExpiry) === 1 ? "" : "s"} ago`}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {secret.description && (
            <Box sx={{ mt: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <DescriptionIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                  </Box>
                  <Typography variant="body1">{secret.description}</Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Metadata
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Secret ID: {secret.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created:{" "}
                    {new Date(secret.createdAt).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Paper>

        {editDialogOpen && (
          <SecretDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            onSave={handleSave}
            secret={secret}
            customers={customers}
          />
        )}

        {deleteConfirm && (
          <ConfirmDialog
            open={true}
            title="Delete Secret"
            message={`Are you sure you want to delete "${secret.name}"?`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteConfirm(false)}
          />
        )}
      </Container>
    </>
  );
}
