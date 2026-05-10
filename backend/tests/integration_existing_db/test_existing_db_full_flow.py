from uuid import UUID

from sqlalchemy import text



def get_latest_notification(db, user_id, notification_type):
    row = db.execute(
        text(
            """
            select id, type, title, message, listing_id, request_id, message_id, is_read
            from notifications
            where user_id = :user_id
              and type = :notification_type
            order by created_at desc
            limit 1
            """
        ),
        {
            "user_id": UUID(user_id),
            "notification_type": notification_type,
        },
    ).mappings().first()

    return row


def test_existing_db_full_request_accept_message_notification_flow(
    db,
    client,
    seeded_users,
    owner_user,
    requester_user,
    auth_as
):
    # 1. Owner creates a listing.
    auth_as(owner_user)

    create_listing_payload = {
        "title": "Pytest Integration Chair",
        "category": "Furniture",
        "condition_level": "good",
        "origin_type": "donation",
        "city": "Amherst",
        "description": "Created by pytest. Safe to delete.",
        "pickup_type": "owner_meetup",
        "pickup_notes": "Meet near lobby.",
        "image_url": None,
        "latitude": None,
        "longitude": None,
        "address_line_1": "Pytest Street",
        "address_line_2": None,
        "state": "MA",
        "postal_code": "01002",
        "country": "US",
    }

    create_listing_response = client.post(
        "/api/v1/listings",
        json=create_listing_payload,
    )

    assert create_listing_response.status_code == 201, create_listing_response.text
    listing_id = create_listing_response.json()["id"]

    # 2. Requester requests this listing.
    auth_as(requester_user)

    request_response = client.post(
        f"/api/v1/listings/{listing_id}/request",
        json={"message": "I would like to pick this up."},
    )

    assert request_response.status_code == 200, request_response.text
    request_body = request_response.json()

    request_id = request_body["id"]
    assert request_body["listing_id"] == listing_id
    assert request_body["status"] == "pending"

    # 3. Owner should receive new_request notification.
    new_request_notification = get_latest_notification(
        db,
        owner_user["sub"],
        "new_request",
    )

    assert new_request_notification is not None
    assert new_request_notification["type"] == "new_request"
    assert str(new_request_notification["listing_id"]) == listing_id
    assert str(new_request_notification["request_id"]) == request_id
    assert new_request_notification["is_read"] is False

    # 4. Owner accepts the request.
    auth_as(owner_user)

    accept_response = client.patch(
        f"/api/v1/requests/{request_id}",
        json={"status": "accepted"},
    )

    assert accept_response.status_code == 200, accept_response.text
    accept_body = accept_response.json()

    assert accept_body["id"] == request_id
    assert accept_body["listing_id"] == listing_id
    assert accept_body["requester_user_id"] == requester_user["sub"]
    assert accept_body["status"] == "accepted"

    # 5. Requester should receive request_accepted notification.
    request_accepted_notification = get_latest_notification(
        db,
        requester_user["sub"],
        "request_accepted",
    )

    assert request_accepted_notification is not None
    assert request_accepted_notification["type"] == "request_accepted"
    assert str(request_accepted_notification["listing_id"]) == listing_id
    assert str(request_accepted_notification["request_id"]) == request_id
    assert request_accepted_notification["is_read"] is False

    # 6. Requester sends a message to owner.
    auth_as(requester_user)

    message_response = client.post(
        "/api/v1/messages",
        json={
            "listing_id": listing_id,
            "recipient_user_id": owner_user["sub"],
            "content": "Hi, when can I pick it up?",
        },
    )

    assert message_response.status_code == 200, message_response.text
    message_body = message_response.json()

    message_id = message_body["id"]
    assert message_body["listing_id"] == listing_id
    assert message_body["sender_user_id"] == requester_user["sub"]
    assert message_body["recipient_user_id"] == owner_user["sub"]
    assert message_body["content"] == "Hi, when can I pick it up?"

    # 7. Owner should receive new_message notification.
    new_message_notification = get_latest_notification(
        db,
        owner_user["sub"],
        "new_message",
    )

    assert new_message_notification is not None
    assert new_message_notification["type"] == "new_message"
    assert str(new_message_notification["listing_id"]) == listing_id
    assert str(new_message_notification["message_id"]) == message_id
    assert new_message_notification["is_read"] is False

    # 8. Owner lists notifications via API.
    auth_as(owner_user)

    list_notifications_response = client.get(
        "/api/v1/notifications?page=1&page_size=10"
    )

    assert list_notifications_response.status_code == 200, list_notifications_response.text

    notifications_body = list_notifications_response.json()
    assert notifications_body["unread_count"] >= 1
    assert any(item["type"] == "new_request" for item in notifications_body["items"])
    assert any(item["type"] == "new_message" for item in notifications_body["items"])

    # 9. Owner marks message notification as read.
    notification_id = str(new_message_notification["id"])

    mark_read_response = client.patch(
        f"/api/v1/notifications/{notification_id}/read"
    )

    assert mark_read_response.status_code == 200, mark_read_response.text
    assert mark_read_response.json()["is_read"] is True