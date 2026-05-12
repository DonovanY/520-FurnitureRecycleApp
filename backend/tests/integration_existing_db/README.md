# Test Coverage
The integration tests cover the main backend workflows of the furniture recycling application.

They verify that the backend can connect to the existing Supabase database and that required tables are available.

They also test the complete item request workflow. In the main flow, one existing user acts as the listing owner and another existing user acts as the requester. The owner creates a listing, the requester submits a request, the owner receives a `new_request` notification, the owner accepts the request, and the requester receives a `request_accepted` notification.

The decline flow is also tested. In that flow, the owner declines a request, the request status is updated to `rejected`, and the requester receives a `request_rejected` notification.

The tests also cover permission checks. A requester should not be able to view all requests for someone else's listing, and a requester should not be able to accept or decline their own request. Only the listing owner should be allowed to manage requests for that listing.

Notification APIs are tested as well. The tests verify that users can retrieve their own notifications, that unread counts are returned, that users can mark their own notifications as read, and that users cannot mark another user's notification as read.

The messaging workflow is also covered. After a request is accepted, the requester can send a message to the owner. The backend stores the message, creates a `new_message` notification for the owner, returns the conversation correctly, and marks messages as read when the recipient opens the conversation.

# Install Dependencies

From the `backend` directory, install the required Python dependencies:

```bash
pip install pytest httpx sqlalchemy psycopg2-binary
```

If the project has a requirements file, install from it:

```bash
pip install -r requirements.txt
```

# Running the Tests on Windows PowerShell

Open PowerShell and go to the backend directory:

```powershell
cd backend
```

Set the Supabase database connection string:

```powershell
$env:DATABASE_URL="your-supabase-postgres-connection-string"
```

Run all integration tests:

```powershell
pytest -q tests/integration_existing_db
```

# Running the Tests on macOS or Linux

Open a terminal and go to the backend directory:

```bash
cd backend
```

Set the Supabase database connection string:

```bash
export DATABASE_URL="your-supabase-postgres-connection-string"
```

Run all integration tests:

```bash
pytest -q tests/integration_existing_db
```

# Running a Single Test File

To run only the database connection tests:

```bash
pytest -q tests/integration_existing_db/test_existing_db_connection.py
```