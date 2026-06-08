# Cross-Border Invoice Intelligence Pipeline

[![Azure Functions](https://img.shields.io/badge/Azure%20Functions-Consumption%20Plan-0089D6?logo=azure-functions)](https://azure.microsoft.com/en-us/products/functions)
[![Azure AI Vision](https://img.shields.io/badge/Azure%20AI%20Vision-OCR-0078D4?logo=microsoft-azure)](https://azure.microsoft.com/en-us/products/ai-services/ai-vision)
[![Cosmos DB](https://img.shields.io/badge/Cosmos%20DB-NoSQL-4BA83C?logo=microsoft-azure)](https://azure.microsoft.com/en-us/products/cosmos-db)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🚀 Live Demo

**API Endpoint:** (Update with your deployed function URL after deployment)



## 📋 Problem Statement

Chinese suppliers send invoices in various formats to Australian buyers. Finance teams manually extract key information (invoice numbers, amounts, dates, supplier names) and re-enter them into payment systems. This takes **15-30 minutes per international invoice** and introduces data entry errors.

## 💡 Solution

A serverless document intelligence pipeline that automates the entire extraction process:

1. **Upload** – User uploads an invoice image (JPG, PNG, or PDF)
2. **OCR** – Azure AI Vision extracts all text (supports Chinese + English)
3. **Extract** – Identifies key fields: invoice number, amount, date, supplier
4. **Translate** – Converts extracted fields to English for Australian systems
5. **Store** – Saves structured JSON to Cosmos DB for audit trail

## 🏗️ Architecture




## 🛠️ Technologies Used

| Service | Purpose | Plan/Tier |
| :--- | :--- | :--- |
| **Azure Functions** | Serverless compute for processing logic | Consumption Plan (1M free executions/month) |
| **Azure AI Vision** | OCR for Chinese + English text extraction | S0 tier (pay as you go) |
| **Azure Cosmos DB** | NoSQL database for audit trail | Free tier (1000 RU/s, 25GB) |
| **Azure Blob Storage** | Raw image storage | Hot tier, Standard |
| **Azure Static Web Apps** | Frontend upload UI (optional) | Free tier |
| **Azure Translator** | Chinese → English field translation | Pay-as-you-go |

## 📂 Project Structure



## 🔧 Local Development Setup

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [VS Code](https://code.visualstudio.com/) with Azure Functions extension

### Clone and Install

```bash
git clone https://github.com/hanxiangz/Cross-Border-Invoice-Intelligence-Pipeline.git
cd Cross-Border-Invoice-Intelligence-Pipeline
npm install