from uuid import UUID

from sqlalchemy import text


def prepare_accepted_request(client, auth_as, owner_user, requester_user):
    auth_as(owner_user)

    create_listing_response = client.post(
        "/api/v1/listings",
        json={
            "title": "Pytest Integration Message Conversation",
            "category": "Furniture",
            "condition_level": "good",
            "origin_type": "donation",
            "city": "Amherst",
            "description": "Created by pytest message conversation test.",
            "pickup_type": "owner_meetup",
            "pickup_notes": "Message test.",
            "image_url": None,
            "latitude": None,
            "longitude": None,
            "address_line_1": "Pytest Street",
            "address_line_2": None,
            "state": "MA",
            "postal_code": "01002",
            "country": "US",
        },
    )

    assert create_listing_response.status_code == 201, create_listing_response.text
    listing_id = create_listing_response.json()["id"]

    auth_as(requester_user)

    request_response = client.post(
        f"/api/v1/listings/{listing_id}/request",
        json={"message": "Message test request."},
    )

    assert request_response.status_code == 200, request_response.text
    request_id = request_response.json()["id"]

    auth_as(owner_user)

    accept_response = client.patch(
        f"/api/v1/requests/{request_id}",
        json={"status": "accepted"},
    )

    assert accept_response.status_code == 200, accept_response.text
    assert accept_response.json()["status"] == "accepted"

    return listing_id, request_id


def test_send_message_and_get_conversation_marks_message_as_read(
    db,
    client,
    seeded_users,
    owner_user,
    requester_user,
    auth_as,
):
    listing_id, request_id = prepare_accepted_request(
        client,
        auth_as,
        owner_user,
        requester_user,
    )

    # Requester sends message to owner.
    auth_as(requester_user)

    send_response = client.post(
        "/api/v1/messages",
        json={
            "listing_id": listing_id,
            "recipient_user_id": owner_user["sub"],
            "content": "Hi, when can I pick it up?",
        },
    )

    assert send_response.status_code == 200, send_response.text
    send_body = send_response.json()

    message_id = send_body["id"]
    assert send_body["listing_id"] == listing_id
    assert send_body["sender_user_id"] == requester_user["sub"]
    assert send_body["recipient_user_id"] == owner_user["sub"]
    assert send_body["content"] == "Hi, when can I pick it up?"
    assert send_body["is_read"] == "false"

    # Owner receives new_message notification.
    notification = db.execute(
        text(
            """
            select id, type, listing_id, message_id, is_read
            from notifications
            where user_id = :owner_id
              and listing_id = cast(:listing_id as uuid)
              and message_id = cast(:message_id as uuid)
              and type = 'new_message'
            order by created_at desc
            limit 1
            """
        ),
        {
            "owner_id": UUID(owner_user["sub"]),
            "listing_id": listing_id,
            "message_id": message_id,
        },
    ).mappings().first()

    assert notification is not None
    assert notification["type"] == "new_message"
    assert str(notification["listing_id"]) == listing_id
    assert str(notification["message_id"]) == message_id
    assert notification["is_read"] is False

    # Owner opens conversation.
    auth_as(owner_user)

    conversation_response = client.get(f"/api/v1/messages/{listing_id}")

    assert conversation_response.status_code == 200, conversation_response.text
    conversation_body = conversation_response.json()

    assert conversation_body["listing_id"] == listing_id
    assert conversation_body["listing_title"] == "Pytest Integration Message Conversation"
    assert len(conversation_body["messages"]) >= 1

    message_items = [
        item for item in conversation_body["messages"] if item["id"] == message_id
    ]

    assert len(message_items) == 1
    assert message_items[0]["content"] == "Hi, when can I pick it up?"

    # DB message should now be read by owner opening conversation.
    message_row = db.execute(
        text(
            """
            select is_read
            from messages
            where id = :message_id
            """
        ),
        {"message_id": message_id},
    ).mappings().first()

    assert message_row is not None
    assert message_row["is_read"] == "true"