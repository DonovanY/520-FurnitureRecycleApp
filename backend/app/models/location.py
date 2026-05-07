from sqlalchemy import Column, String, DateTime, Numeric, Text, func
from app.database.session import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(String, primary_key=True)
    region_id = Column(String, nullable=True)
    latitude = Column(Numeric, nullable=True)
    longitude = Column(Numeric, nullable=True)
    address_line_1 = Column(Text, nullable=True)
    address_line_2 = Column(Text, nullable=True)
    city = Column(Text, nullable=True)
    state = Column(Text, nullable=True)
    postal_code = Column(Text, nullable=True)
    country = Column(Text, nullable=True)
    location_label = Column(Text, nullable=True)
    virtual_location_code = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
