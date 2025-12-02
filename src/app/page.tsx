"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Box,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { Navigation } from "@/components/Navigation";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import WarningIcon from "@mui/icons-material/Warning";

interface Secret {
  id: string;
  name: string;
  description: string | null;
  expiryDate: string;
  customer: {
    id: string;
    name: string;
  };
}

export default function Home() {
  const [expiringSecrets, setExpiringSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fetchExpiringSecrets = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications");
      const data = await response.json();
      setExpiringSecrets(data.secrets || []);
    } catch (error) {
      console.error("Failed to fetch expiring secrets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpiringSecrets();
  }, [fetchExpiringSecrets]);

  const handleSendNotifications = async () => {
    setSending(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
      });
      const data = await response.json();
      setSnackbar({
        open: true,
        message: `Sent ${data.notificationsSent} notification(s) to ${data.totalCustomers} customer(s)`,
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to send notifications:", error);
      setSnackbar({
        open: true,
        message: "Failed to send notifications",
        severity: "error",
      });
    } finally {
      setSending(false);
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.ceil(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const getExpiryColor = (days: number) => {
    if (days <= 3) return "error";
    if (days <= 7) return "warning";
    return "info";
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
          <Box>
            <Typography variant="h4" component="h1">
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Automatic Notifications: Daily at 12:00 PM
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<NotificationsActiveIcon />}
            onClick={handleSendNotifications}
            disabled={sending || expiringSecrets.length === 0}
          >
            {sending ? "Sending..." : "Send Notifications Now"}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : expiringSecrets.length === 0 ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            No secrets expiring within the next 2 weeks!
          </Alert>
        ) : (
          <>
            <Alert severity="warning" sx={{ mb: 3 }} icon={<WarningIcon />}>
              {expiringSecrets.length} secret(s) expiring within the next 2
              weeks
            </Alert>
            <Grid container spacing={3}>
              {expiringSecrets.map((secret) => {
                const days = getDaysUntilExpiry(secret.expiryDate);
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={secret.id}>
                    <Card
                      sx={{
                        height: "100%",
                        borderLeft: 4,
                        borderColor: `${getExpiryColor(days)}.main`,
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {secret.name}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          variant="body2"
                          gutterBottom
                        >
                          {secret.customer.name}
                        </Typography>
                        {secret.description && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {secret.description}
                          </Typography>
                        )}
                        <Chip
                          label={`Expires in ${days} day${days === 1 ? "" : "s"}`}
                          color={getExpiryColor(days)}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mt: 1 }}
                        >
                          {new Date(secret.expiryDate).toLocaleDateString(
                            "en-GB"
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}

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
