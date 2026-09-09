from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from .base import Base
import datetime

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    scenarios = relationship("FinancialScenario", back_populates="user")
    checklists = relationship("VerificationChecklist", back_populates="user")

class FinancialScenario(Base):
    __tablename__ = 'financial_scenarios'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    capital = Column(Float)
    project_cost = Column(Float)
    loan_amount = Column(Float)
    scheme_id = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship("User", back_populates="scenarios")

class VerificationChecklist(Base):
    __tablename__ = 'verification_checklists'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    opportunity_id = Column(String)
    status = Column(String, default="not_started") # not_started, in_progress, verified
    items = Column(JSON) # e.g. {"visit_location": True, "verify_documents": False}
    user = relationship("User", back_populates="checklists")
