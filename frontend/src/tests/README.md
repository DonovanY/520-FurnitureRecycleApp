# Test Coverage
The frontend unit tests cover:

- `NotificationBell`
  - notification type-based navigation
  - unread notification display
  - mark notification as read
  - mark all notifications as read

- `ProfileView`
  - profile tab switching
  - posted items tab
  - requested items tab
  - opening the request modal from notification URL parameters

- `ListingDetailView`
  - item detail rendering
  - owner vs requester UI
  - opening chat from `?openChat=1`

- `RequestsModal`
  - loading listing requests
  - accepting requests
  - declining requests
  - opening chat with accepted requester

- `ChatModal`
  - loading conversations
  - displaying messages
  - sending messages
  - closing the chat modal

- API model functions
  - correct backend API paths
  - correct HTTP methods
  - correct request body
  - authorization header handling

# Install Frontend Dependencies

From the `frontend` directory:

```bash
npm install
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

# Run All Frontend Unit Tests
```bash
    cd frontend
    npm test -- --watchAll=false
```

# Run a Specific Frontend Test File
```bash
    cd frontend
    npm test -- NotificationBell.test.js --watchAll=false
```