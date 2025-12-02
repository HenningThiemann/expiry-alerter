"use client";

import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Link from "next/link";
import SecurityIcon from "@mui/icons-material/Security";

export function Navigation() {
  return (
    <AppBar position="static">
      <Toolbar>
        <SecurityIcon sx={{ mr: 2 }} />
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{
            flexGrow: 1,
            textDecoration: "none",
            color: "inherit",
            cursor: "pointer",
            "&:hover": {
              opacity: 0.8,
            },
          }}
        >
          Expiry Alerter
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" component={Link} href="/">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} href="/customers">
            Customers
          </Button>
          <Button color="inherit" component={Link} href="/secrets">
            Secrets
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
