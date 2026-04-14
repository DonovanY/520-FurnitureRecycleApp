from sqlalchemy.orm import Session
from app.models.profile import Profile


def get_profile_by_id(db: Session, profile_id: str):
    return db.query(Profile).filter(Profile.id == profile_id).first()


def create_profile(db: Session, profile: Profile):
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile