"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { ShoppingCart, AccountCircle, Search } from "@mui/icons-material";
import { useState } from "react";

export function Header() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar>
        {/* Logo */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          E-Shop
        </Typography>

        {/* Search Bar */}
        <div style={{ position: "relative", marginRight: "16px" }}>
          <Search
            style={{
              position: "absolute",
              top: "50%",
              left: "8px",
              transform: "translateY(-50%)",
            }}
          />
          <InputBase
            placeholder="Search products…"
            style={{
              color: "white",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              paddingLeft: "32px",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* Navigation Icons */}
        <IconButton color="inherit" href="/client/cart">
          <ShoppingCart />
        </IconButton>
        <IconButton color="inherit" onClick={handleMenu}>
          <AccountCircle />
        </IconButton>

        {/* User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose} component="a" href="/auth/login">
            Login
          </MenuItem>
          <MenuItem onClick={handleClose} component="a" href="/auth/register">
            Register
          </MenuItem>
          <MenuItem onClick={handleClose} component="a" href="/client/settings">
            Profile
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
