from sqlalchemy import text


def test_existing_supabase_connection(db):
    result = db.execute(text("select 1 as ok")).mappings().first()

    assert result is not None
    assert result["ok"] == 1


def test_existing_tables_exist(db):
    required_tables = [
        "profiles",
        "listings",
        "item_requests",
        "messages",
        "notifications",
    ]

    for table_name in required_tables:
        result = db.execute(
            text(
                """
                select to_regclass(:table_name) as table_exists
                """
            ),
            {"table_name": f"public.{table_name}"},
        ).mappings().first()

        assert result["table_exists"] in {table_name, f"public.{table_name}"}