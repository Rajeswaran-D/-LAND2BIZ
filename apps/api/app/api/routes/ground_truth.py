from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.domain import VerificationChecklist

router = APIRouter()

class ChecklistUpdate(BaseModel):
    items: Dict[str, bool]

DEFAULT_ITEMS = {
    "visit_location": False,
    "talk_to_residents": False,
    "visit_competitors": False,
    "verify_land_docs": False,
    "search_google": False,
    "check_scheme_portal": False
}

@router.get("/{opportunity_id}")
def get_checklist(opportunity_id: str, db: Session = Depends(get_db)):
    checklist = db.query(VerificationChecklist).filter(VerificationChecklist.opportunity_id == opportunity_id).first()
    if not checklist:
        checklist = VerificationChecklist(
            opportunity_id=opportunity_id,
            status="not_started",
            items=DEFAULT_ITEMS
        )
        db.add(checklist)
        db.commit()
        db.refresh(checklist)
    
    return {
        "opportunity_id": checklist.opportunity_id,
        "status": checklist.status,
        "items": checklist.items
    }

@router.post("/{opportunity_id}/verify")
def verify_checklist(opportunity_id: str, update: ChecklistUpdate, db: Session = Depends(get_db)):
    checklist = db.query(VerificationChecklist).filter(VerificationChecklist.opportunity_id == opportunity_id).first()
    if not checklist:
        # Create it if it doesn't exist
        checklist = VerificationChecklist(
            opportunity_id=opportunity_id,
            status="not_started",
            items=DEFAULT_ITEMS
        )
        db.add(checklist)
        db.commit()
        db.refresh(checklist)
    
    # Update items
    current_items = checklist.items or {}
    current_items.update(update.items)
    checklist.items = current_items
    
    all_verified = all(current_items.values())
    checklist.status = "verified" if all_verified else "in_progress"
    
    # Since JSON column updates might not be automatically tracked, reassign to flag as modified
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(checklist, "items")
    
    db.commit()
    db.refresh(checklist)
    
    return {
        "opportunity_id": checklist.opportunity_id,
        "status": checklist.status,
        "items": checklist.items
    }
