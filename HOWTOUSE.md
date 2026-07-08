# How to Use Content Memory AI

This guide explains how to run, configure, and use the **Content Memory AI** application.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Local Setup & Configuration](#-local-setup--configuration)
3. [Running the Application](#-running-the-application)
4. [Using the App Features](#-using-the-app-features)
5. [Database Customization](#-database-customization)

---

## ⚙️ Prerequisites

Before starting, ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Optional, only needed if you want to host Supabase locally instead of using the Neon database)

---

## 🛠️ Local Setup & Configuration

All environment configurations are managed inside the [`.env.local`](file:///c:/Users/svssw/Downloads/teunprojet/.env.local) file:

1.  **Neon Database Connection:**
    Configure the `DATABASE_URL` with your Neon PostgreSQL connection string:
    ```env
    DATABASE_URL=postgresql://neondb_owner:npg_QOIuZ1cEV6Pb@ep-restless-mountain-atszny7d.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require
    ```
2.  **API Keys:**
    Save your Google Gemini API Key in the `OPENAI_API_KEY` slot:
    ```env
    OPENAI_API_KEY=AIzaSyBu-wNdX-4tQxghC95XbHpjEF--X9TYseg
    ```
3.  **Local Inngest Mode:**
    Ensure Inngest local development mode is turned on:
    ```env
    INNGEST_DEV=1
    ```
4.  **Encryption Key:**
    A secure key used to encrypt API credentials in the database:
    ```env
    ENCRYPTION_KEY=69242b48a75c77efdb6a6381062db62e0b7aac00ec4696f04b5c6749fe840a95
    ```

---

## 🚀 Running the Application

To run the full stack (Next.js server + Inngest Background Runner), you need two terminal windows:

### Terminal 1: Start Next.js Development Server
```bash
npm run dev -- -p 3004
```
*   Your app will start and be accessible at: **[http://localhost:3004](http://localhost:3004)**

### Terminal 2: Start Inngest Background Runner
Run this command to process the document queues in the background:
```bash
npx inngest-cli@latest dev -u http://localhost:3004/api/inngest
```
*   Your background worker will start and be visible at: **[http://localhost:8288](http://localhost:8288)**

---

## 🌟 Using the App Features

### 1. View Dashboard & Index Statistics
Open **[http://localhost:3004/](http://localhost:3004/)**. 
*   Here you will see the overview stats (Total Indexed Files, Vectorized Chunks, Pipeline Health status).
*   The **Recently Indexed** feed shows the latest documents synced from your Google Drive and Slack.

### 2. Connect Mock Integrations
Open **[http://localhost:3004/settings](http://localhost:3004/settings)**.
*   Under **Google Drive**, click **Connect Google Drive** to load mock files.
*   Under **Slack**, fill in a bot token and team name to link Slack.
*   Once clicked, Inngest triggers the background processing pipeline to download, analyze, slice, embed, and store document data in Neon.

### 3. Query the Knowledge Base (Semantic Search)
Open **[http://localhost:3004/search](http://localhost:3004/search)**.
*   Ask any question about your connected files (e.g., *"What are our startup hooks?"* or *"What is our Q3 target ARR?"*).
*   **How it works:** The app embeds your query, uses Neon's vector similarity matching to fetch the most relevant text chunks, and sends them to Gemini.
*   **Result:** You get a conversational answer with direct citations (names of the files used to construct the answer).

---

## 🗄️ Database Customization

If you want to view, delete, or modify tables directly:
*   Log into your [Neon Console](https://console.neon.tech).
*   Use the SQL editor to execute queries on the `documents`, `document_chunks`, or `integrations` tables.
