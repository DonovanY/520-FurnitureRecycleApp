from uuid import UUID

from sqlalchemy import text


def create_listing_and_request(client, auth_as, owner_user, requester_user):
    auth_as(owner_user)

    create_response = client.post(
        "/api/v1/listings",
        json={
            "title": "Pytest Integration Notification API",
            "category": "Furniture",
            "condition_level": "good",
            "origin_type": "donation",
            "city": "Amherst",
            "description": "Created by pytest notification API test.",
            "pickup_type": "owner_meetup",
            "pickup_notes": "Notification API test.",
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

    assert create_response.status_code == 201, create_response.text
    listing_id = create_response.json()["id"]

    auth_as(requester_user)

    request_response = client.post(
        f"/api/v1/listings/{listing_id}/request",
        json={"message": "Notification API test request."},
    )

    assert request_response.status_code == 200, request_response.text
    request_id = request_response.json()["id"]

    return listing_id, request_id


def get_owner_new_request_notification(db, owner_user, listing_id, request_id):
    return db.execute(
        text(
            """
            select id, type, listing_id, request_id, is_read
            from notifications
            where user_id = :owner_id
              and listing_id = cast(:listing_id as uuid)
              and request_id = cast(:request_id as uuid)
              and type = 'new_request'
            order by created_at desc
            limit 1
            """
        ),
        {
            "owner_id": UUID(owner_user["sub"]),
            "listing_id": listing_id,
            "request_id": request_id,
        },
    ).mappings().first()


def test_list_notifications_and_mark_single_notification_as_read(
    db,
    client,
    seeded_users,
    owner_user,
    requester_user,
    auth_as,
):
    listing_id, request_id = create_listing_and_request(
        client,
        auth_as,
        owner_user,
        requester_user,
    )

    notification = get_owner_new_request_notification(
        db,
        owner_user,
        listing_id,
        request_id,
    )

    assert notification is not None
    assert notification["is_read"] is False

    notification_id = str(notification["id"])

    # Owner can list their notifications.
    auth_as(owner_user)

    list_response = client.get("/api/v1/notifications?page=1&page_size=10")

    assert list_response.status_code == 200, list_response.text
    list_body = list_response.json()

    assert "items" in list_body
    assert "unread_count" in list_body
    assert any(item["id"] == notification_id for item in list_body["items"])

    # Requester cannot mark owner's notification as read.
    auth_as(requester_user)

    forbidden_response = client.patch(f"/api/v1/notifications/{notification_id}/read")

    assert forbidden_response.status_code == 403

    # Owner can mark their own notification as read.
    auth_as(owner_user)

    mark_response = client.patch(f"/api/v1/notifications/{notification_id}/read")

    assert mark_response.status_code == 200, mark_response.text
    assert mark_response.json()["is_read"] is True

    # DB should reflect read status.
    row = db.execute(
        text(
            """
            select is_read
            from notifications
            where id = cast(:notification_id as uuid)
            """
        ),
        {"notification_id": notification_id},
    ).mappings().first()

    assert row is not None
    assert row["is_read"] is True