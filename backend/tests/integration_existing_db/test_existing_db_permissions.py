from sqlalchemy import text


def create_test_listing(client, auth_as, owner_user, title):
    auth_as(owner_user)

    response = client.post(
        "/api/v1/listings",
        json={
            "title": title,
            "category": "Furniture",
            "condition_level": "good",
            "origin_type": "donation",
            "city": "Amherst",
            "description": "Created by pytest permission test.",
            "pickup_type": "owner_meetup",
            "pickup_notes": "Permission test.",
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

    assert response.status_code == 201, response.text
    return response.json()["id"]


def create_test_request(client, auth_as, requester_user, listing_id):
    auth_as(requester_user)

    response = client.post(
        f"/api/v1/listings/{listing_id}/request",
        json={"message": "Permission test request."},
    )

    assert response.status_code == 200, response.text
    return response.json()["id"]


def test_non_owner_cannot_view_listing_requests(
    db,
    client,
    seeded_users,
    owner_user,
    requester_user,
    auth_as,
):
    listing_id = create_test_listing(
        client,
        auth_as,
        owner_user,
        "Pytest Integration Permission View Requests",
    )

    create_test_request(client, auth_as, requester_user, listing_id)

    # Requester is not listing owner, so they cannot view all requests.
    auth_as(requester_user)

    response = client.get(f"/api/v1/listings/{listing_id}/requests")

    assert response.status_code == 403
    assert "Only the poster can view requests" in response.text


def test_non_owner_cannot_accept_or_decline_request(
    db,
    client,
    seeded_users,
    owner_user,
    requester_user,
    auth_as,
):
    listing_id = create_test_listing(
        client,
        auth_as,
        owner_user,
        "Pytest Integration Permission Accept Request",
    )

    request_id = create_test_request(client, auth_as, requester_user, listing_id)

    # Requester tries to accept their own request.
    auth_as(requester_user)

    response = client.patch(
        f"/api/v1/requests/{request_id}",
        json={"status": "accepted"},
    )

    assert response.status_code == 403
    assert "Only the listing owner" in response.text

    # Status should remain pending.
    row = db.execute(
        text(
            """
            select status
            from item_requests
            where id = :request_id
            """
        ),
        {"request_id": request_id},
    ).mappings().first()

    assert row is not None
    assert row["status"] == "pending"