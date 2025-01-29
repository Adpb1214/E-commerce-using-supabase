"use client";

import React from 'react';
import { Button, Grid, Typography, Box, Card, CardContent, CardMedia } from '@mui/material';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();
  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-text">
          <Typography variant="h3" color="white">Welcome to Our E-Commerce Store</Typography>
          <Typography variant="h6" color="white">Find the best deals, offers, and exclusive products</Typography>
          <div className="auth-buttons">
            <Button onClick={() => router.push("/auth/login")} variant="contained" color="primary" className="auth-button">
              Login
            </Button>
            <Button onClick={() => router.push("/auth/register")} variant="outlined" color="secondary" className="auth-button">
              Sign Up
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <Box className="features-section">
        <Typography variant="h4" align="center" gutterBottom>Features</Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Card className="feature-card">
              <CardMedia
                component="img"
                alt="Fast Delivery"
                height="140"
                image="https://tse3.mm.bing.net/th?id=OIP.wfOmHeSidU4FzESc6GrFZwHaE8&pid=Api&P=0&h=180"
              />
              <CardContent>
                <Typography variant="h6">Fast Delivery</Typography>
                <Typography variant="body2">Get your products delivered to your doorstep in no time.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="feature-card">
              <CardMedia
                component="img"
                alt="Best Prices"
                height="140"
                image="https://www.psdstamps.com/wp-content/uploads/2019/11/grunge-best-price-label-png.png"
              />
              <CardContent>
                <Typography variant="h6">Best Prices</Typography>
                <Typography variant="body2">Enjoy amazing discounts on a wide range of products.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="feature-card">
              <CardMedia
                component="img"
                alt="Customer Support"
                height="140"
                image="https://tse1.mm.bing.net/th?id=OIP.QG1cG5LhtBxcIhdIFLQj2wHaE7&pid=Api&P=0&h=180"
              />
              <CardContent>
                <Typography variant="h6">24/7 Support</Typography>
                <Typography variant="body2">Our customer service is available round the clock to assist you.</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className="feature-card">
              <CardMedia
                component="img"
                alt="Secure Payment"
                height="140"
                image="https://tse2.mm.bing.net/th?id=OIP.2mCf8AsYHmJ4aKsNE8ZBZQHaD1&pid=Api&P=0&h=180"
              />
              <CardContent>
                <Typography variant="h6">Secure Payment</Typography>
                <Typography variant="body2">We offer safe and secure payment options for your convenience.</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Offers Section */}
      <div className="offers-section">
        <Typography variant="h4" align="center" gutterBottom>Today's Exclusive Offers</Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <div className="offer-card">
              <img src="https://tse4.mm.bing.net/th?id=OIP.QJFbMYl1nVnfw8abjrC6AgHaDu&pid=Api&P=0&h=180" alt="Offer 1" className="offer-image" />
              <Typography variant="h5">50% Off on Electronics</Typography>
              <Typography variant="body2">Hurry, limited time offer!</Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <div className="offer-card">
              <img src="https://cdn5.vectorstock.com/i/1000x1000/45/64/buy-one-get-one-50-off-sign-horizontal-vector-22854564.jpg" alt="Offer 2" className="offer-image" />
              <Typography variant="h5">Buy 1 Get 1 Free</Typography>
              <Typography variant="body2">Shop now and enjoy amazing discounts.</Typography>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default HomePage;
