import { Box, Typography, Link } from "@mui/material";

export function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: "primary.main", color: "white", py: 2, textAlign: "center" }}>
      <Typography variant="body2">
        © {new Date().getFullYear()} E-Shop. All rights reserved.
      </Typography>
      <Box sx={{ mt: 1 }}>
        <Link href="/about" color="inherit" underline="hover" sx={{ mx: 1 }}>
          About Us
        </Link>
        <Link href="/privacy" color="inherit" underline="hover" sx={{ mx: 1 }}>
          Privacy Policy
        </Link>
        <Link href="/contact" color="inherit" underline="hover" sx={{ mx: 1 }}>
          Contact Us
        </Link>
      </Box>
    </Box>
  );
}
