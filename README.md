# Expiry Alerter

A Next.js application for tracking and managing secret and license expiry dates with MS Teams webhook notifications.

## Features

- **Customer Management**: Create, update, and delete customers with unique MS Teams webhook URLs
- **Secret/License Tracking**: Track expiry dates for secrets and licenses per customer
- **Automatic Daily Notifications**: Automatic webhook notifications sent daily at 12:00 PM CET to MS Teams when secrets are within 2 weeks of expiry
- **Manual Notifications**: Option to manually trigger notifications via the dashboard
- **Material Design UI**: Modern, responsive interface using Material-UI
- **PostgreSQL Database**: Persistent storage with Prisma ORM

## Automatic Notifications

The application automatically sends notifications daily at 12:00 PM (CET) for all secrets expiring within the next 2 weeks.

- Notifications continue daily until the secret is either deleted or the expiry date is more than 2 weeks away
- No configuration needed - notifications start automatically when the application starts
- Manual notifications can also be triggered via the "Send Notifications Now" button on the dashboard

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- MS Teams webhook URLs for notifications

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy the environment example file and configure your database:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` in `.env` with your PostgreSQL connection string.

3. Run database migrations:

```bash
npx prisma migrate dev
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Docker Deployment

### Quick Start with Docker Compose

The easiest way to run the application is using Docker Compose:

```bash
# Start the application and database
docker-compose up -d

# Run database migrations (first time only)
docker-compose run --rm migrate

# View logs
docker-compose logs -f app
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Building the Docker Image

To build the Docker image manually:

```bash
docker build -t expiry-alerter .
```

### Running with External Database

If you have an existing PostgreSQL database:

```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public" \
  expiry-alerter
```

### Environment Variables

| Variable       | Description                  | Default  |
| -------------- | ---------------------------- | -------- |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT`         | Application port             | `3000`   |

## API Endpoints

### Customers

- `GET /api/customers` - List all customers
- `POST /api/customers` - Create a new customer
- `GET /api/customers/:id` - Get a specific customer with secrets
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer (cascades to secrets)

### Secrets

- `GET /api/secrets` - List all secrets (optional `?customerId=` filter)
- `POST /api/secrets` - Create a new secret
- `GET /api/secrets/:id` - Get a specific secret
- `PUT /api/secrets/:id` - Update a secret
- `DELETE /api/secrets/:id` - Delete a secret

### Notifications

- `GET /api/notifications` - Preview secrets expiring within 2 weeks
- `POST /api/notifications` - Trigger MS Teams notifications for expiring secrets

## Triggering Daily Notifications

Set up a cron job or scheduled task to call the notifications endpoint daily:

```bash
curl -X POST https://your-domain.com/api/notifications
```

This will send MS Teams webhook messages to all customers with secrets expiring within 2 weeks.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Material-UI (MUI)
- **Language**: TypeScript
- **Containerization**: Docker & Docker Compose

## License

MIT
