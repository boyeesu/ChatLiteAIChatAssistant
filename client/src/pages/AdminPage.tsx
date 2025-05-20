import React from 'react';
import AdminDashboard from '@/components/AdminDashboard';
import { Helmet } from 'react-helmet';

export default function AdminPage() {
  return (
    <>
      <Helmet>
        <title>Admin Dashboard | AI Chat Assistant</title>
        <meta name="description" content="Manage and configure your AI chat assistant, upload knowledge base documents, and view analytics." />
      </Helmet>
      <AdminDashboard />
    </>
  );
}
