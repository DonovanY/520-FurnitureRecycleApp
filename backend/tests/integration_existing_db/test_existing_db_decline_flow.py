from uuid import UUID

from sqlalchemy import text


def get_notification_for_request(db, user_id, listing_id, request_id, notification_type):
    return db.execute(
        text(
            """
            select id, type, title, message, listing_id, request_id, is_read
            from notifications
            where user_id = :user_id
              and listing_id = cast(:listing_id as uuid)
              and request_id = cast(:request_id as uuid)
              and type = :notification_type
            order by created_at desc
            limit 1
            """
        ),
        {
            "user_id": UUID(user_id),
            "listing_id": listing_id,
            "request_id": request_id,
            "notification_type": notification_type,
        },
    ).mappings().first()


def test_existing_db_decline_request_creates_rejected_notification(
    db,
    client,
    seeded_users,
    owner_user,
    requester_user,
    auth_as,
):
    # 1. Owner creates listing.
    auth_as(owner_user)

    create_response = client.post(
        "/api/v1/listings",
        json={
            "title": "Pytest Integration Decline Chair",
            "category": "Furniture",
            "condition_level": "good",
            "origin_type": "donation",
            "city": "Amherst",
            "description": "Created by pytest decline-flow test.",
            "pickup_type": "owner_meetup",
            "pickup_notes": "Test pickup notes.",
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

    # 2. Requester requests listing.
    auth_as(requester_user)

    request_response = client.post(
        f"/api/v1/listings/{listing_id}/request",
        json={"message": "Can I pick this up?"},
    )

    assert request_response.status_code == 200, request_response.text
    request_id = request_response.json()["id"]

    # 3. Owner declines request.
    auth_as(owner_user)

    decline_response = client.patch(
        f"/api/v1/requests/{request_id}",
        json={"status": "rejected"},
    )

    assert decline_response.status_code == 200, decline_response.text
    decline_body = decline_response.json()

    assert decline_body["id"] == request_id
    assert decline_body["listing_id"] == listing_id
    assert decline_body["requester_user_id"] == requester_user["sub"]
    assert decline_body["status"] == "rejected"

    # 4. DB request status should be rejected.
    request_row = db.execute(
        text(
            """
            select id, status
            from item_requests
            where id = :request_id
            """
        ),
        {"request_id": request_id},
    ).mappings().first()

    assert request_row is not None
    assert request_row["status"] == "rejected"

    # 5. Requester should receive request_rejected notification.
    rejected_notification = get_notification_for_request(
        db=db,
        user_id=requester_user["sub"],
        listing_id=listing_id,
        request_id=request_id,
        notification_type="request_rejected",
    )

    assert rejected_notification is not None
    assert rejected_notification["type"] == "request_rejected"
    assert str(rejected_notification["listing_id"]) == listing_id
    assert str(rejected_notification["request_id"]) == request_id
    assert rejected_notification["is_read"] is False